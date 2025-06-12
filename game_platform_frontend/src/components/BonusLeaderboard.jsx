import { useQuery } from "@tanstack/react-query";
import { fetchBonusLeaderboard } from "../services/statService";
import Spinner from "./Spinner";
import { StyledTabs } from "./Antd Components/StyledTabs";
import { StyledPagination } from "./Antd Components/StyledPagintation";
import { useState } from "react";

const BonusLeaderboard = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ["bonusLeaderboard"],
    queryFn: fetchBonusLeaderboard,
  });

  const [pageSettings, setPageSettings] = useState({}); // track current page per bonus period
  const pageSize = 10;

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => text.length > 6 ? text.slice(0,6) : text,
    },
    // Removed Phone Number column
    {
      title: "Total Points",
      dataIndex: "totalPoints",
      key: "totalPoints",
    },
    {
      title: "PrizeAmount",
      dataIndex: "prizeAmount",
      key: "prizeAmount",
    },
    {
      title: "Min Deposit",
      dataIndex: "minDeposit",
      key: "minDeposit",
    },
    {
      title: "Min Game",
      dataIndex: "minGame",
      key: "minGame",
    },
  ];

  if (isPending) return <Spinner />;
  if (error)
    return (
      <p className="text-text font-semibold text-lg">
        There are currently no active Bonus Periods
      </p>
    );
  if (data?.periods.length == 0) {
    return (
      <div className="w-full flex justify-center">
        <p className="text-[#ffffff] font-semibold text-lg">
          There are currently no active Bonus Periods.
        </p>
      </div>
    );
  }

  const bonusPeriods = data?.periods || [];
  const tabItems = bonusPeriods.map((period, index) => {
    const currentPage = pageSettings[index] || 1;
    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
    const visibleLeaderboard = period.leaderboard.slice(start, end);

    return {
      label: period.period.type,
      key: String(index),
      children: period.leaderboard.length > 0 ? (
        <>
          <div className="flex flex-col space-y-2 mb-6 mt-4 w-full">
            <span className="text-text text-base ">
              <span className="font-semibold">Prize Distribution: </span>
              {period.period.prizeDistribution === 'PREDEFINED'
                ? `For the top ${period.period.predefinedWinners === null ? 0 : period.period.predefinedWinners}`
                : period.period.prizeDistribution === 'RANDOM'
                  ? '3 winners will be randomly drawn from top 20'
                  : `For the top ${period.period.predefinedWinners === null ? 0 : period.period.predefinedWinners} and also 3 winners will be randomly drawn from top 20`}
            </span>
            <span className="text-text font-semibold text-base mb-10">
              {period.period.dateTimeInAMH}
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="min-w-full">
              <thead>
                <tr className="text-[10px] sm:text-sm text-white bg-text/100 mx-auto rounded-md">
                  <th className="p-1 sm:p-3 w-4 rounded-tl-md text-center">Rank</th>
                  <th className="p-1 sm:p-3 text-center">Username</th>
                  <th className="p-1 sm:p-3 text-center">Total Points</th>
                  <th className="p-1 sm:p-3 text-center">PrizeAmount</th>
                  <th className="p-1 sm:p-3 text-center">Min Deposit</th>
                  <th className="p-1 sm:p-3 text-center rounded-tr-md">Min Game</th>
                </tr>
              </thead>
              <tbody className="rounded-md">
                {visibleLeaderboard.map((item, idx) => (
                  <tr
                    key={item.username}
                    className={`${idx % 2 === 0 ? "bg-text/55" : "bg-text/85"} text-[10px] text-white font-semibold sm:text-sm hover:bg-text transition-all `}
                  >
                    <td className="p-1 sm:p-3 text-center">{item.rank}</td>
                    <td className="p-1 sm:p-3 text-center">{item.username}</td>
                    <td className="p-1 sm:p-3 text-center">{item.totalPoints}</td>
                    <td className="p-1 sm:p-3 text-center">{item.prizeAmount}</td>
                    <td className="p-1 sm:p-3 text-center">{item.minDeposit}</td>
                    <td className="p-1 sm:p-3 text-center">{item.minGame}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <StyledPagination
              current={currentPage}
              total={period.leaderboard.length}
              pageSize={pageSize}
              onChange={(page) =>
                setPageSettings((prev) => ({ ...prev, [index]: page }))
              }
            />
          </div>
        </>
      ) : (
        <div className="w-full flex justify-center">
          <p className="text-text font-semibold text-lg">
            No leaderboard data for this period.
          </p>
        </div>
      ),
    };
  });

  return (
    <>
    <StyledTabs
      type="card"
      items={tabItems.map((tab) => ({
        ...tab,
        label: (
          <span className="tab-label-bonus">
            {tab.label}
          </span>
        ),
      }))}
      tabBarStyle={{
        borderColor: "#ffffff",
        "--ant-tabs-tab-hover-bg": "transparent",
        color: "white",
      }}
    />
    <style>
{`
.tab-label-bonus {
  color: #20436F;
  transition: color 0.2s;
}
.tab-label-bonus:hover,
.ant-tabs-tab-active .tab-label-bonus {
  color: #ffffff;
}
`}
</style>
    </>
  );
};

export default BonusLeaderboard;
