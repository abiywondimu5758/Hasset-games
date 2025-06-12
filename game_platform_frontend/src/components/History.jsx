import { StyledPagination } from "./Antd Components/StyledPagintation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserGameHistory } from "../services/userServices";
import Nav from "./Nav";
import Spinner from "./Spinner";
import { message} from "antd";
import { formatDate } from "../helper/dateFormatter";
import Footerx from "./Footerx"; 

export const History = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // TanStack Query v5 useQuery with queryFn for fetching paginated history data
  const { data, isPending } = useQuery({
    queryKey: ["userGameHistory", currentPage],
    queryFn: async () => {
      const historyData = await fetchUserGameHistory(currentPage, itemsPerPage);
      return historyData;
    },
    keepPreviousData: true,
    onError: (err) => {
      const errMsg = err.response?.data?.error || "An error occurred";
      showError(errMsg);
    },
  });

  const showError = (error) => {
    messageApi.open({
      type: "error",
      content: error,
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {contextHolder}
      <div className=" min-h-screen text-text px-2 sm:px-4 bg-text/75">
        <Nav />
        <div className="px-1 sm:px-0 mb-20">
        {isPending && (
          
            <Spinner />
          
        )}
        {!isPending && data?.gameHistory?.length > 0 && (
          <div className="p-4 sm:p-6 flex flex-col items-center text-text">
           <div className="bg-bgdark/75 mx-auto rounded-md w-full flex flex-col items-center pt-2">
            <h2 className="text-lg sm:text-2xl font-bold mb-2 ">
              Game History
            </h2>
            <div className="overflow-x-auto w-full rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="text-[10px] sm:text-sm bg-text text-white mx-auto rounded-md">
                    <th className="p-1 sm:p-3 w-4 rounded-tl-md text-center">Game ID</th>
                    <th className="p-1 sm:p-3 text-center">Stake</th>
                    <th className="p-1 sm:p-3 text-center">Win</th>
                    <th className="p-1 sm:p-3 text-center">User Card</th>
                    <th className="p-1 sm:p-3 text-center">Winner Card</th>
                    <th className="p-1 sm:p-3 text-center">Date</th>
                    <th className="p-1 sm:p-3 rounded-tr-md text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
  {data.gameHistory.map((game, index) => (
    <tr
      key={game.gameId}
      className={`${
        index % 2 === 0 ? "bg-text/55" : "bg-bgdark/85"
      } text-[10px] sm:text-sm hover:bg-text transition-all text-white font-bold`}
    >
      <td className="p-1 sm:p-3 text-center">{game.gameId}</td>
      <td className="p-1 sm:p-3 text-center">{game.stakeAmount} birr</td>
      <td className="p-1 sm:p-3 text-center">{game.possibleWin} birr</td>
      <td className="p-1 sm:p-3 text-center">{game.userCardId}</td>
      <td className="p-1 sm:p-3 text-center">
        {game.winnerCards.length > 0 &&
          game.winnerCards.map((winner) => winner.cardId).join(", ")}
      </td>
      <td className="p-1 sm:p-3 text-center">{formatDate(game.date)}</td>
      <td className="p-1 sm:p-3 text-center">
        {game.result === "lost" ? (
          <div className="px-2 py-1 bg-red-600 rounded-full text-center text-[10px] sm:text-sm">
            Lost
          </div>
        ) : (
          <div className="px-2 py-1 bg-green-600 rounded-full text-center text-[10px] sm:text-sm">
            Won
          </div>
        )}
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
            {!isPending && data?.gameHistory?.length === 0 && (
          <div className="p-4 flex items-center justify-center">
            <h2 className="text-lg sm:text-xl">No game history available.</h2>
          </div>
        )}
        <div className="w-fit">
            {/* Pagination Controls */}
            <StyledPagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={data.totalGames}
              onChange={handlePageChange}
              className="mt-6"
              style={{
                // backgroundColor: "#ffffff",
                padding: "10px",
                borderRadius: "8px",
              }}
            /></div>
            </div>
          </div>
        )}
        </div>

      </div>
      <Footerx />
    </>
  );
};
