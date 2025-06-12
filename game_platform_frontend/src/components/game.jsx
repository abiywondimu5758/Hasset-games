/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  declareBingo,
  markNumber,
  getMarkedListById,
  toggleAutoPlay,
  getGameById,
} from "../services/bingoServices";
import { fetchProfile } from "../services/userServices";
import { FaHome, FaWallet } from "react-icons/fa";
import { userStore } from "../stores/userStore";
import { Alert, message } from "antd";
import Spinner from "./Spinner";
import transformTo2DArray from "../helper/transformTo2dArray";
import Confetti from "react-confetti";
import "./css/Modal.css";
import { socket } from "../helper/Api";
import Footerx from "./Footerx";
import Nav from "./Nav";

const Game = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [autoPlayCards, setAutoPlayCards] = useState([]);
  const [markedNumbers, setMarkedNumbers] = useState([100]);
  const [gameData, setGameData] = useState(location.state.game);
  const [cardId, setCardId] = useState(null);
  const [winnersId, setWinnersId] = useState(null);
  const [possibleWin, setPossiblewin] = useState(null);
  const [winners, setWinners] = useState(null);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(location.state.userId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [player, setPlayer] = useState([]);
  const [gameId, setGameId] = useState(location.state.game.id);

  const [messageApi, contextHolder] = message.useMessage();

  const bingoNumbers = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
    [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75],
  ];

  // const [player, setPlayer] = useState(null);
  const showError = (error) => {
    messageApi.open({
      type: "error",
      content: error,
    });
  };
  const showSuccess = (success) => {
    messageApi.open({
      type: "success",
      content: success,
    });
  };

  const getGamesById = async (id) => {
    try {
      setLoading(true);

      const { game } = await getGameById(id);

      setGameData(game);
      const currentPlayer = game.players.find(
        (player) => player.userId === userId
      );
      setPlayer(currentPlayer);
      getMarkedListById(gameData.id, currentPlayer.cardId).then((data) =>
        setMarkedNumbers(data)
      );
      setAutoPlayCards(currentPlayer.bingoCard.numbers.split(",").map(Number)),
        setPlayerCards(
          transformTo2DArray(
            currentPlayer.bingoCard.numbers.split(",").map(Number)
          )
        );
      setCardId(currentPlayer.cardId);
    } catch (error) {
      const errMsg = error.response?.data?.error || "An error occurred";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const game = location.state.game;
    const userId = location.state.userId;

    setUserId(userId);
    getGamesById(game.id);
    setGameId(game.id);

    socket.emit("joinGame", gameId);
    socket.emit("acceptUserInfo", userId);
    socket.on("newNumberDrawn", (drawnNumbers) => {
      const latestNumber =
        drawnNumbers.drawnNumbers[drawnNumbers.drawnNumbers.length - 1];
      setCurrentNumber(latestNumber);
      setDrawnNumbers(drawnNumbers.drawnNumbers);
      playSound(latestNumber);
    });

    socket.on("markedNumbers", (markedNumbers) => {
      setMarkedNumbers(markedNumbers);
    });

    socket.on("gameOver", (gameOver) => {
      // Extract the userId from each winner object in the winners array
      const winnerIds = gameOver.winners.map((winner) => winner.userId);
      setWinnersId(winnerIds);
      setWinners(gameOver.winners);
      // Set the modal open condition and possible win as before
      setIsModalOpen(gameOver.winners.length <= 1);
      setPossiblewin(gameOver.winningsPerWinner);
    });

    socket.on("bingoStatusUpdate", (status) => {
      if (status.winners[0]) {
        alert(`Player ${status.winners[0]} declared Bingo!`);
      }
    });

    return () => {
      socket.off("newNumberDrawn");
      socket.off("markedNumbers");
      socket.off("gameOver");
      socket.off("bingoStatusUpdate");
    };
  }, [location]);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        userStore.setLoading(true);
        const profile = await fetchProfile();
        userStore.setUserProfile(profile);
      } catch (error) {
        const errMsg = error.response?.data?.error || "An error occurred";
        userStore.setError(errMsg);
        setError(errMsg);
      } finally {
        userStore.setLoading(false);
        setLoading(false);
      }
    };

    if (!userStore.userProfile) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [navigate]);
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);
  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
    }
  }, [successMessage]);
  // Separate useEffect to handle auto-play
  useEffect(() => {
    if (player?.autoPlay && currentNumber !== null && winnersId === null) {
      if (autoPlayCards.includes(currentNumber)) {
        handleMarkNumber(currentNumber, gameData.id, cardId);
      }
    }
  }, [currentNumber, player, winnersId, autoPlayCards, gameData, cardId]);

  const handleMarkNumber = async (num, gameId, cardId) => {
    markNumber(num, gameId, cardId);
  };
  const handleBingo = async () => {
    try {
      await declareBingo(gameData.id);
    } catch (error) {
      setError(error?.response?.data?.error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/bingo");
  };

  const handlAutoPlay = async (gameId, cardId, autoPlay) => {
    try {
      const response = await toggleAutoPlay(gameId, cardId, autoPlay);
      if (response.success) {
        getGamesById(gameId);
        setSuccessMessage(response.message);
      }
    } catch (error) {
      setError(error?.response?.data?.error);
    }
  };

  const playSound = (number) => {
    const soundPath = `/assets/sound/F${number}.mp3`;
    const audio = new Audio(soundPath);
    audio.play();
  };
  const getLetterForNumber = (number) => {
    if (number >= 1 && number <= 15) return "B";
    if (number >= 16 && number <= 30) return "I";
    if (number >= 31 && number <= 45) return "N";
    if (number >= 46 && number <= 60) return "G";
    if (number >= 61 && number <= 75) return "O";
    return "";
  };
  const previousNumbers = drawnNumbers.slice(-6, -1);
  return (
    <>
      {contextHolder}
      <div className="min-h-screen  pb-20 bg-text/75 w-full">
      <Nav />

        {userStore.error && (
          <div className="w-full flex justify-center items-center">
            <div className="w-1/2 flex items-start justify-start p-2">
              <Alert
                message={userStore.error.toString()}
                type="error"
                showIcon
                className="font-bold text-text text-lg w-full"
              />
            </div>
          </div>
        )}
        <div className="flex flex-col w-full items-center text-text px-2 ss:px-5 sss:px-6">
        <div className="bg-bg w-full sm:w-fit 638px:w-[300px] sm:p-2 p-1 h-fit rounded-b-lg rounded-t-xl">
          <div className="px-2 sm:py-2 py-1 bg-text flex-col justify-end rounded-lg items-end">
            <div className="flex w-full items-center justify-between  mb-2">
              <div className="flex space-x-1 sm:space-x-4  justify-center text-white items-center ">
                <div className="flex flex-col items-center bg-bg  text-text px-2 py-1 rounded-lg shadow-lg">
                  <div className="font-bold text-[10px] es:text-xs sm:text-sm">Stake</div>
                  <div className="text-xs font-semibold">
                    {gameData?.stake.amount}
                  </div>
                </div>
                <div className="flex flex-col items-center bg-bg  text-text px-2 py-1 rounded-lg shadow-lg">
                  <div className="font-bold text-[10px] es:text-xs sm:text-sm">Players</div>
                  <div className="text-xs font-semibold">
                    {gameData?.players.length}
                  </div>
                </div>
                <div className="flex flex-col items-center bg-bg  text-text px-2 py-1 rounded-lg shadow-lg">
                  <div className="font-bold text-[10px] es:text-xs sm:text-sm">win</div>
                  <div className="text-xs font-semibold">
                    {gameData?.possibleWin}
                  </div>
                </div>
                <div className="flex flex-col items-center bg-bg  text-text px-2 py-1 rounded-lg shadow-lg">
                  <div className="font-bold text-[10px] es:text-xs sm:text-sm">Call</div>
                  <div className="text-xs font-semibold">
                    {drawnNumbers.length}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 cursor-pointer items-center justify-center">
                <span className="font-bold text-xs es:text-sm text-white">Auto play</span>
                <button
                  onClick={() =>
                    handlAutoPlay(gameData?.id, cardId, !player?.autoPlay)
                  }
                  className={`${
                    player?.autoPlay
                      ? "bg-green-300 text-[#263238]"
                      : "bg-red-500 text-white"
                  } px-2 py-1 es:px-3 es:py-2 font-bold text-[10px] es:text-xs sm:text-xs sm:py-2 sm:px-4 rounded-md es:rounded-lg  cursor-pointer`}
                >
                  {player?.autoPlay ? "On" : "Off"}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:items-center items-between h-fit pb-2 text-white bg-bg w-full px-2 sm:px-2 rounded">
              {/* Top Info Panel */}

              <div className="flex flex-row  space-x-1 sm:space-y-0 sm:flex-row mt-2 sm:space-x-1 justify-between">
                {/* Bingo Drawn */}
                <div className="bg-text  rounded-lg shadow-lg w-fit h-fit">
                  <div className="flex flex-col items-center p-1 sm:p-4 w-fit px-2 bg-text rounded-lg shadow-lg ">
                    {/* Render Bingo numbers */}
                    <div className="grid grid-cols-5 gap-1 sm:gap-2">
                      {["B", "I", "N", "G", "O"].map((letter, idx) => (
                        <div
                          key={letter}
                          className="flex flex-col items-center"
                        >
                          {/* Column Header */}
                          <div className="font-bold text-lg es:text-xl mb-2">
                            {letter}
                          </div>

                          {/* Number ranges */}
                          {bingoNumbers[idx].map((number, numberIdx) => (
                            <div
                              key={`${idx}-${numberIdx}`}
                              className={`w-4 h-4 text-[10px] es:w-6 es:h-6 es:text-xs sm:w-6 mb-1  sm:h-6 sm:text-[13px]  rounded-full flex items-center justify-center ${
                                currentNumber === number
                                  ? "bg-primary text-white"
                                  : drawnNumbers.includes(number)
                                  ? "bg-red-500 text-white"
                                  : "bg-white text-[#263238]"
                              }`}
                            >
                              {number}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col  items-center space-y-2 pt-10 sm:space-x-4">
                  <div className="flex flex-col items-center mx-8">
                    <div className="bg-text sm:p-4 rounded-full flex flex-col items-center justify-center shadow-lg w-20 h-20 sm:h-20 sm:w-20">
                      <div className="text-white text-xl font-bold">
                        {/* Display the current number with corresponding letter */}
                        {currentNumber
                          ? `${getLetterForNumber(
                              currentNumber
                            )}-${currentNumber}`
                          : "--"}
                      </div>
                    </div>
                  </div>
                  {/* Display the last 5 drawn numbers */}
                  <div className="flex">
                    <div className="flex space-x-1">
                      {previousNumbers.map((num, idx) => (
                        <span
                          key={idx}
                          className="bg-red-500 p-2 rounded-full flex flex-col items-center justify-center text-sm sm:text-base font-semibold shadow-lg w-8 h-8 sm:w-8 sm:h-8"
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 items-center mt-4">
                    <div className="grid grid-cols-5 gap-1 bg-text sm:p-3 p-2 rounded w-fit">
                      {playerCards.length > 0 &&
                        playerCards[0].map((_, colIndex) =>
                          playerCards.map((row, rowIndex) => (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className={`sm:w-[26px] sm:h-[26px] h-6 w-6 ees:h-8 ees:w-8 text-xs sm:text-sm flex items-center justify-center font-bold text-[#263238] rounded relative cursor-pointer ${
                                markedNumbers.includes(row[colIndex])
                                  ? "bg-primary text-white"
                                  : "bg-white"
                              }`}
                              onClick={() =>
                                handleMarkNumber(
                                  row[colIndex],
                                  gameData.id,
                                  cardId
                                )
                              }
                            >
                              <span>
                                {row[colIndex] === 100 ? "F" : row[colIndex]}
                              </span>
                            </div>
                          ))
                        )}
                    </div>
                    <button
                      className="w-full px-2 py-2 text-white rounded text-sm font-semibold bg-primary"
                      onClick={() => handleBingo()}
                    >
                      Bingo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        winnersId={winnersId}
        winners={winners}
        possibleWin={possibleWin}
        userId={userId}
      />
      <Footerx />
    </>
  );
};

export default Game;
const Modal = ({
  isOpen,
  onClose,
  winnersId,
  possibleWin,
  userId,
  winners,
}) => {
  if (!isOpen) return null;

  const isMultipleWinners = winnersId.length > 1;
  const isUserWinner = winnersId.includes(userId);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-text bg-opacity-75 px-10">
      {isUserWinner && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}

      <div className="bg-bg py-12 sm:p-12 w-full sm:w-[320px] rounded-lg shadow-lg text-text flex flex-col items-center justify-center space-y-4">
        {isUserWinner ? (
          isMultipleWinners ? (
            <h1 className="sm:text-lg text-lg font-semibold  mb-2">
              Split decision! Your share is {possibleWin} birr!
            </h1>
          ) : (
            <h1 className="sm:text-lg text-lg font-semibold  mb-2">
              You have won {possibleWin} birr!
            </h1>
          )
        ) : (
          <h1 className="sm:text-lg text-lg font-semibold  mb-2 animate-shake">
            You lose.
          </h1>
        )}

        {winners.map((winner, index) => {
          const bingoCardNumbers = winner.bingoCardNumbers.split(",");
          const markedNumbers = winner.markedNumbers.split(",");

          // Convert bingoCardNumbers to a 5x5 grid
          const bingoGrid = [];
          for (let i = 0; i < bingoCardNumbers.length; i += 5) {
            bingoGrid.push(bingoCardNumbers.slice(i, i + 5));
          }

            return (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 bg-text p-4 rounded"
            >
              <h2 className="text-lg font-bold text-white mb-2">
              {isMultipleWinners
                ? `Winner ${index + 1} card`
                : `Winner's card`}
              </h2>

              <div className="grid grid-cols-5 gap-1">
              {bingoGrid[0].map((_, colIndex) =>
                bingoGrid.map((row, rowIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`sm:w-[26px] sm:h-[26px] h-8 w-8 text-xs sm:text-sm flex items-center justify-center font-bold text-[#263238] rounded relative cursor-pointer ${
                  markedNumbers.includes(row[colIndex])
                    ? "bg-primary text-white"
                    : "bg-white"
                  }`}
                >
                  <span>{row[colIndex] === "100" ? "F" : row[colIndex]}</span>
                </div>
                ))
              )}
              </div>
            </div>
            );
        })}

        <button
          className="w-28 py-2 text-white rounded text-sm font-semibold bg-primary hover:bg-primary/80"
          onClick={onClose}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
