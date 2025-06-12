/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchBingoCards,
  leaveGame,
  changeCard,
} from "../services/bingoServices";
import { checkIfPlayerInGame } from "../services/bingoServices";
import { fetchProfile } from "../services/userServices";
import { useQuery } from "@tanstack/react-query";
import { message, Alert } from "antd";
import decodeJWT from "../helper/decodeJwt";
import { userStore } from "../stores/userStore";
import { authStore } from "../stores/AuthStore";
import { FaHome, FaWallet } from "react-icons/fa";
import { FaShuffle } from "react-icons/fa6";
import Spinner from "./Spinner";
import CountdownTimer from "./Timer";
import convertStringToArray from "../helper/convertStringToArray";
import {socket} from "../helper/Api"
import Footerx from "./Footerx";
import Nav from "./Nav";

const WaitingRoom = () => {
  const [bingoCards, setBingoCards] = useState([]);
  const [gameStatuses, setGameStatuses] = useState({});
  const [gameCounter, setGameCounter] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const location = useLocation();
  const [gameData, setGameData] = useState(location.state.game);
  const [messageApi, contextHolder] = message.useMessage();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const token = authStore.accessToken;
  const userId = decodeJWT(token).id;
  const navigate = useNavigate();

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

  // Fetch bingo cards
  const { data: cardsData, error: cardsError, isPending: isCardsLoading } = useQuery({queryKey:["bingoCards"], queryFn:fetchBingoCards});

  // Fetch user profile
  const { data: profileData, error: profileError, isPending: isProfileLoading } = useQuery({queryKey:["userProfile"], queryFn:fetchProfile});

  useEffect(() => {
    if (cardsData) setBingoCards(cardsData);
    if (cardsError) setError(cardsError?.response?.data?.error || "Failed to load bingo cards.");
  }, [cardsData, cardsError]);

  useEffect(() => {
    if (profileData) userStore.setUserProfile(profileData);
    if (profileError) {
      const errMsg = profileError?.response?.data?.error || "Failed to load profile.";
      userStore.setError(errMsg);
      setError(errMsg);
    }
  }, [profileData, profileError]);

  useEffect(() => {
    socket.emit("requestGameStatus");

    socket.on("gameStatusUpdate", (data) => {
      setGameStatuses((prevStatuses) => ({
        ...prevStatuses,
        [data.stakeId]: data.gameStatus,
      }));
    });

    socket.on("gameCountdownUpdate", (data) => {
      setGameCounter((prevCounters) => ({
        ...prevCounters,
        [data.stakeId]: data.timeInSeconds,
      }));
    });

    socket.emit("joinGame", gameData.id);

    socket.on("gameupdated", (updatedGame) => {
      setGameData(updatedGame);
    });

    return () => {
      socket.off("gameStatusUpdate");
      socket.off("gameCountdownUpdate");
      socket.off("gameupdated");
    };
  }, [gameData]);

  useEffect(() => {
    if (gameStatuses[gameData.stakeId] === "Playing") {
      navigate("/game", { state: { game: gameData, userId: userId } });
    }
  }, [gameStatuses, gameData, navigate, userId]);

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

  const QuitGame = async (stakeId) => {
    try {
      const result = await leaveGame(stakeId);
      setSuccessMessage(result.message);
      if (result.success) {
        navigate("/bingo");
        checkIfPlayerInGame();
      }
    } catch (err) {
      setError(err?.response?.data?.error);
    }
  };

  const openModal = (bingoCard) => {
    setSelectedCard(bingoCard);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getCardColor = (bingoCard) => {
    const currentPlayer = gameData.players.find(
      (player) => player.cardId === bingoCard.id
    );
    if (currentPlayer) {
      return currentPlayer.userId === userId
        ? "bg-text text-white border-text"
        : "bg-red-500 text-white border-red-500";
    }
    return "bg-white border-text";
  };


  return (
    <>
      {contextHolder}
      <div className="min-h-screen  pb-20 bg-text/75 w-full">
      <Nav />
        {error || userStore.error && (
          <div className="w-full flex justify-center items-center">
            <div className="w-1/2 flex items-start justify-start p-2">
              <Alert
                message={error || userStore.error.toString()}
                type="error"
                showIcon
                className="font-bold text-text text-lg w-full"
              />
            </div>
          </div>
        )}
        <div className="flex flex-col w-full items-center text-text px-5">
        <div className="bg-bg/60 w-full sm:w-2/3 h-fit rounded-b-lg rounded-t-xl">
          <div className="px-2 py-1 bg-text flex-col justify-end rounded-t-lg rounded-b-lg items-end">
            <div className="flex w-full items-center justify-between">
              <div className="sm:text-lg text-lg font-bold py-2 text-white">
                {gameData.stake?.amount} Birr Per Card
              </div>
              <div className="flex space-x-2 cursor-pointer">
                <div className="py-2 px-4 h-min bg-white rounded-lg text-lg">
                  <FaShuffle />
                </div>
                <button
                  onClick={() => QuitGame(gameData.stakeId)}
                  className="bg-red-500 px-4 py-2 text-white text-sm sm:text-base sm:py-2 sm:px-4 rounded-lg cursor-pointer"
                >
                  Quit
                </button>
              </div>
            </div>
            <div className="items-center font-bold flex justify-center h-12 text-white">
              <span>
                {gameStatuses[gameData.stakeId] === "Countdown" ? (
                  <CountdownTimer
                    time={gameCounter[gameData.stakeId]}
                    initialTime={45}
                    color='#fffff'
                  />
                ) : (
                  gameStatuses[gameData.stakeId]
                )}
              </span>
            </div>
          </div>
          <div className="scroll-auto overflow-y-auto">
            {isCardsLoading && <div className='mt-2'><Spinner color={'#263238'}/></div>}
            <div className="grid grid-cols-7 es:grid-cols-8  md:grid-cols-9 lg:grid-cols-12 gap-2 p-3 overflow-y-auto">
              {bingoCards.map((bingoCard, index) => (
                <button
                  key={bingoCard.id}
                  className={`w-10 h-8 sm:w-[36px] sm:h-10 md:w-12 md:h-12 text-black rounded-lg flex items-center justify-center text-sm sm:text-sm font-bold border-2 border-[#1c6758] cursor-pointer shadow-md ${getCardColor(
                    bingoCard
                  )}`}
                  onClick={() => openModal(bingoCard)}
                  disabled={getCardColor(bingoCard) === "bg-red-500"}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        cardData={selectedCard || { id: "", numbers: [] }}
        gameId={gameData.id}
      />
      <Footerx />
    </>
  );
};


const Modal = ({ isOpen, onClose, cardData, gameId }) => {
  if (!isOpen) return null;

  const bingoNumbers = convertStringToArray(cardData?.numbers);

  const updateGame = (gameId, cardId) => {
    changeCard(gameId, cardId);
    onClose();
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-text bg-opacity-45 px-10">
      <div className="bg-bg p-12 w-full sm:w-[320px] rounded-lg shadow-lg text-white flex flex-col items-center justify-center space-y-4">
        
        <h2 className=" text-2xl mb-2 font-bold text-text">
          BINGO CARD {cardData.id}
        </h2>

        <div className="grid grid-cols-5 gap-1 mb-5">
  {bingoNumbers[0].map((_, colIndex) => (
    bingoNumbers.map((row, rowIndex) => (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`w-10 h-10 flex items-center justify-center font-bold rounded relative ${
          row[colIndex] === 100 ? "bg-primary" : "bg-text"
        }`}
      >
        {rowIndex === 0 && colIndex === 0 ? (
          <span className="absolute top-1 left-1 text-yellow-400 text-xs">
            ⭐
          </span>
        ) : null}
        <span>{row[colIndex] === 100 ? "F" : row[colIndex]}</span>
      </div>
    ))
  ))}
</div>


        <div className="flex space-x-2">
        <button
          className="w-full py-1 px-3 text-white rounded text-sm md:text-base font-semibold bg-primary hover:bg-primary/80"
          onClick={() => updateGame(gameId, cardData.id)}
        >
          Choose
        </button>
        <button
          className="w-full py-1 px-3 flex justify-center items-center border-text text-sm font-semibold sm:text-base border-[1px] rounded-md hover:bg-text hover:text-white text-text"
          onClick={() => onClose()}
        >
          Cancel
        </button>
        </div>
      </div>
      
    </div>
  );
};
export default WaitingRoom;
