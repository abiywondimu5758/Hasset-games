/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useQuery } from "@tanstack/react-query";
import { fetchStakes, joinGame, leaveGame, checkIfPlayerInGame } from "../services/bingoServices"; 
import Spinner from "./Spinner";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";
import { message} from "antd";
import { FaArrowRightLong } from "react-icons/fa6";
import CountdownTimer from "./Timer";
import {socket} from "../helper/Api";
import Footerx from "./Footerx";

const BingoLobby = observer(() => {
  const [stakes, setStakes] = useState([]);
  const [socketError, setSocketError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [gameStatuses, setGameStatuses] = useState({});
  const [gameCounter, setGameCounter] = useState({});
  const [possibleWin, setPossibleWin] = useState({});
  const [userGames, setUserGames] = useState({});
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();
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

  // Fetch stakes using useQuery
  const { data: stakesData, error: fetchError, isPending: loadingStakes } = useQuery({
    queryKey: ["stakes"],
    queryFn: fetchStakes,
  });

  // Fetch user game status using useQuery
  const { data: userGameData, error: userGameError } = useQuery({
    queryKey: ["userGameStatus"],
    queryFn: checkIfPlayerInGame,
  });

  // Update stakes and userGames on query success
  useEffect(() => {
    if (stakesData) setStakes(stakesData);
    if (userGameData) setUserGames(userGameData);
  }, [stakesData, userGameData]);

  useEffect(() => {
    if (fetchError || userGameError || socketError) {
      showError(fetchError?.message || userGameError?.message || socketError);
    }
  }, [fetchError, userGameError, socketError]);

  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
    }
  }, [successMessage]);

  useEffect(() => {
    socket.emit("requestGameStatus");
    socket.on("gameStatusUpdate", (data) => {
      setGameStatuses((prevStatuses) => ({
        ...prevStatuses,
        [data.stakeId]: data.gameStatus,
      }));
      setPossibleWin((prevPossibleWin) => ({
        ...prevPossibleWin,
        [data.stakeId]: data.possibleWin || "",
      }));
    });

    socket.on("gameCountdownUpdate", (data) => {
      setGameCounter((prevCounters) => ({
        ...prevCounters,
        [data.stakeId]: data.timeInSeconds,
      }));
    });

    socket.on("error", (err) => {
      setSocketError(err);
    });

    return () => {
      socket.off("gameStatusUpdate");
      socket.off("gameCountdownUpdate");
      socket.off("error");
    };
  }, []);

  const handleJoin = async (stakeId) => {
    try {
      const data = await joinGame(stakeId);
      if (data) {
        navigate("/waitingroom", { state: data });
        setSuccessMessage("Joined game successfully");
      }
    } catch (err) {
      showError(err?.response?.data?.error || "Error joining game");
    }
  };

  const handleLeave = async (stakeId) => {
    try {
      const result = await leaveGame(stakeId);
      setUserGames({});
      setSuccessMessage(result.message);
    } catch (err) {
      showError(err?.response?.data?.error || "Error leaving game");
    }
  };

  const handleJoinBack = () => {

    if(userGameData.active && !userGameData.hasEnded){
    navigate("/game", { state: { game: userGameData, userId: userGameData.userId } })
  }
    if(!userGameData.active && !userGameData.hasEnded){
      navigate("/waitingroom", { state: {sucess:true, game:userGameData} })
    }
  }

  return (
    <div className="bingo-lobby-container bg-[#1c6758]/55">
      {contextHolder}
      <Nav />
<div className="w-full h-fit mb-20">
      <div className="content text-center  text-[#263238] rounded-lg px-5 md:px-64 h-fit">
        <div className=" sm:p-5 rounded-lg bg-gray-800/85 h-fit">
          <h1 className="sm:text-lg text-base font-semibold py-5 text-white">
            Choose Your Stake
          </h1>
<div className="">
            <div className="flex justify-between items-center bg-[#1c6758] p-3 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="w-16">
              <div className="font-semibold text-sm sm:text-lg text-white">Stake</div>
            </div>
            <div className="w-16">
              <div className="font-semibold text-sm sm:text-lg text-white">
              Active
              </div>
            </div>
            <div className="w-16">
              <div className="font-semibold text-xs sm:text-lg text-white">
              Win
              </div>
            </div>
            <div className="w-16">
            <div className="font-semibold text-sm sm:text-lg text-white">
              Join
            </div></div>
          </div>
          </div>
          
          <div className="h-fit py-6">
        {userGameData?.inGame&&(  <div className="flex flex-col items-start w-full"><span className="text-sm pl-2 text-red-700 font-bold">Current Game</span>        <div key={userGameData.gameId} className ="w-full flex justify-between items-center bg-[#1c6758] border-gray-800/85 p-1 ees:p-2 sm:p-3 rounded-lg shadow-md hover:shadow-xl transition-shadow mb-2">
            <div className="w-16">
              <h2 className="text-sm sm:text-xl font-semibold text-white">{userGameData.stake.amount} birr</h2>
            </div>
            <div className="w-16">
              <div className="text-sm sm:text-xl font-semibold text-white">
                {userGameData.active?<><span className="text-red-600">Playing</span></>:<>
                  <span className="text-yellow-600">Waiting</span></>}  
              </div>
            </div>
            <div className="w-16">
              <div className="text-sm sm:text-xl text-white">
                {userGameData.possibleWin ? (
                  <span>{userGameData.possibleWin} birr</span>
                ) : (
                  <span>--</span>
                )}
              </div>
            </div>
            <div className="w-16">
              <button
                onClick={
                    () => handleJoinBack()
                }
                className={` bg-[#43a046] px-3 text-white w-full py-1 ees:py-1 sm:py-2  text-xs sm:text-sm sm:text-xs sm:py-2 sm:px-4 rounded-lg cursor-pointer`}
              >
                
                  <div className="flex items-center justify-center space-x-1">
                    {/* <span>Back</span> */}
                    <FaArrowRightLong className="text-xs" />
                  </div>
                
              </button>
            </div>
          </div>
          <span className="text-sm pl-2 text-[#1c6758] font-bold">New Game</span> 
          </div>)}
          <div className="flex flex-col space-y-2">
        {stakes.map((stake) => (
          <div key={stake.id} className ="flex justify-between items-center bg-[#1c6758]/75 p-1 ees:p-2 sm:p-3 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="w-16">
              <h2 className="text-xs ees:text-sm sm:text-lg font-semibold text-white">{stake.amount} birr</h2>
            </div>
            <div className="w-16">
              <div className="text-xs ees:text-sm sm:text-lg font-semibold text-white">
                {gameStatuses[stake.id] === "None" && (
                  <span className="font-normal text-white">None</span>
                )}
                {gameStatuses[stake.id] === "Waiting" && (
                  <span className="text-yellow-600">Waiting</span>
                )}
                {gameStatuses[stake.id] === "Countdown" && (
                  <span className="text-blue-500">
                    {gameCounter[stake.id] !== undefined ? (
                      <CountdownTimer
                        time={gameCounter[stake.id]}
                        initialTime={45}
                        color="#ffffff"
                      />
                    ) : (
                      "Countdown"
                    )}
                  </span>
                )}
                {gameStatuses[stake.id] === "Playing" && (
                  <span className="text-red-600">Playing</span>
                )}
              </div>
            </div>
            <div className="w-16">
              <div className="text-sm sm:text-xl text-white">
                {possibleWin[stake.id] ? (
                  <span>{possibleWin[stake.id]} birr</span>
                ) : (
                  <span>--</span>
                )}
              </div>
            </div>
            <div className="w-16">
              <button
                onClick={
                   () => handleJoin(stake.id)
                }
                className={`
                  bg-[#43a046] px-2
                 text-white w-full py-1 ees:py-1 sm:py-2  text-xs sm:text-sm sm:text-xs sm:py-2 sm:px-4 rounded-lg cursor-pointer`}
              >
                
                  <div className="flex items-center justify-center space-x-1">
                    <span>Join</span>
                    <FaArrowRightLong className="text-xs" />
                  </div>
                
              </button>
            </div>
          </div>
        ))}
        </div>
      
    </div>
          {loadingStakes && <div className="w-full flex items-center justify-center pb-10"><Spinner /></div>}
        </div>
      </div>
      </div>
      <Footerx />
    </div>
    
    
  
  );
});

export default BingoLobby;
