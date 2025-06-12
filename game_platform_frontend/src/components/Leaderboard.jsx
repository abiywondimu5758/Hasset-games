/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  fetchWeekly,
  fetchMonthly,
  fetchYearly,
} from "../services/statService";
import Nav from "./Nav";
import Spinner from "./Spinner";
import { message, Alert, Tabs } from "antd";
import BonusLeaderboard from "./BonusLeaderboard";
import { StyledTabs } from "./Antd Components/StyledTabs";
import { StyledPagination } from "./Antd Components/StyledPagintation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Footerx from "./Footerx";

const { TabPane } = Tabs;

const Leaderboard = () => {
  const [topThreePlayers, setTopThreePlayers] = useState([]);
  const [restOfThePlayers, setRestOfThePlayers] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(10);
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState("bonus");
  const [activeTimeFrame, setActiveTimeFrame] = useState("weekly");

  const queryClient = useQueryClient();

  const showError = (error) => {
    messageApi.open({
      type: "error",
      content: error,
    });
  };

  const fetchTimeFrameData = (timeFrame) => {
    switch (timeFrame) {
      case "weekly":
        return (page, limit) => fetchWeekly(page, limit);
      case "monthly":
        return (page, limit) => fetchMonthly(page, limit);
      case "yearly":
        return (page, limit) => fetchYearly(page, limit);
      default:
        return (page, limit) => fetchWeekly(page, limit);
    }
  };

  const { data, error, isPending } = useQuery({
    queryKey: ["leaderboard", activeTimeFrame, currentPage, playersPerPage],
    queryFn: () => fetchTimeFrameData(activeTimeFrame)(currentPage, playersPerPage),
    enabled: activeTab === "players",
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setTopThreePlayers(data.topThreePlayers); // Fixed top three
      setRestOfThePlayers(data.restOfThePlayers); // Paginated rest
      setTotalPlayers(data.totalPlayers - 3); // Adjust total players excluding top three
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      showError(error ? String(error) : "Failed to fetch leaderboard data");
    }
  }, [error]);

  const fetchData = (timeFrame) => {
    setActiveTimeFrame(timeFrame);
    setCurrentPage(1);
    queryClient.invalidateQueries(["leaderboard", timeFrame]);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // The query will automatically refetch due to the queryKey dependency
  };

  const currentPlayers = restOfThePlayers;

  return (
    <>
      {contextHolder}
      {/* className="bg-gray-900" */}
      <div className="bg-[#20446f]/75 min-h-screen pb-20" >
        <Nav />
        <div className="px-5 sm:px-0 mb-20">
        <div className="bg-bgdark/85  text-[#20446f] p-6 rounded-xl max-w-lg mx-auto shadow-lg h-fit">
          <div className="flex justify-between items-center mb-5">
            <h2 className="sm:text-lg text-base font-semibold text-white">
              Leaderboard
            </h2>
          </div>

          <StyledTabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            items={[
              {
                key: "bonus",
                label: (
                  <span
                    style={{ color: "white" }} // Set text color to white
                  >
                    Bonus
                  </span>
                ),
                children: <BonusLeaderboard />,
              },
              {
                key: "players",
                label: (
                  <span
                    style={{ color: "white" }} // Set text color to white
                  >
                    Players
                  </span>
                ),
                children: (
                  <>
                    {isPending && <Spinner />}
                    <div className="flex justify-between p-2 sm:p-3 text-[#20446f] text-base items-center bg-bgdark/65 rounded-lg">
                      {["weekly", "monthly", "yearly"].map((timeFrame) => (
                        <div
                          key={timeFrame}
                          className={`${
                            activeTimeFrame === timeFrame
                              ? "bg-[#20446f] text-white"
                              : "bg-[#DFEAF8]/95 text-black"
                          } px-2 py-2 sm:px-4 sm:py-2 rounded-lg cursor-pointer`}
                          onClick={() => fetchData(timeFrame)}
                        >
                          {timeFrame.charAt(0).toUpperCase() +
                            timeFrame.slice(1)}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-around items-end mt-8 mb-6 bg-bgdark/65 p-2 rounded-lg">
                      {topThreePlayers.map((player, index) => (
                        <div
                          key={index}
                          className={`text-center relative mx-2 ${
                            index === 0
                              ? "order-2"
                              : index === 1
                              ? "order-1"
                              : "order-3"
                          }`}
                        >
                          {index === 0 && (
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl sm:text-3xl">
                              👑
                            </span>
                          )}
                          <span className="text-5xl sm:text-6xl">👤</span>
                          <div className="text-xs text-[#20446f] sm:text-sm font-bold mt-2">
                            {player.username}
                          </div>
                          <div className="text-[#20446f] text-lg sm:text-xl font-bold">
                            {player.amountWon}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 rounded-lg bg-bgdark/65 p-2">
                      {currentPlayers.map((player, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-3 border-b  border-[#20446f]"
                        >
                          <div className="flex items-center">
                            <span className="text-4xl mr-3">👤</span>
                            <div className="text-sm font-bold text-[#20446f]">
                              {player.username}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-[#20446f]">
                            {player.amountWon}
                          </div>
                        </div>
                      ))}
                    </div>
                    <StyledPagination
                      current={currentPage}
                      pageSize={playersPerPage}
                      total={totalPlayers}
                      onChange={handlePageChange}
                      className="mt-4"
                    />
                  </>
                ),
              },
            ]}
            onTabClick={() => {}}
            style={{
              "--ant-tabs-tab-hover-bg": "transparent", // Remove hover background
            }}
          />
        </div>
        </div>
      </div>
      <Footerx />
    </>
  );
};

export default Leaderboard;