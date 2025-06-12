import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserReferralHistory } from "../services/userServices";
import Nav from "./Nav";
import Spinner from "./Spinner";
import { message } from "antd";
import { formatDate } from "../helper/dateFormatter";
import { StyledPagination } from "./Antd Components/StyledPagintation";
import Footerx from "./Footerx";

const Referrals = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, error, isPending, isError, refetch } = useQuery({
    queryKey: ["userReferralHistory", currentPage],
    queryFn: () => fetchUserReferralHistory(currentPage, itemsPerPage),
    keepPreviousData: true,
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    refetch();
  };

  const showError = (error) => {
    messageApi.open({
      type: "error",
      content: error,
    });
  };

  if (isError && error) {
    showError(error);
  }

  return (
    <>
      {contextHolder}
      <div className=" min-h-screen text-white bg-text/75">
        <Nav />
        <div className="px-5 sm:px-0 mb-20">
        {isPending && <Spinner className="p-4" />}

        {data && (
          <div className="p-4 flex flex-col items-center text-text">
            <div className="bg-bgdark/85 mx-auto rounded-md w-full flex flex-col items-center pt-2">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-5">
              Referral History
            </h2>
            <div className="flex flex-col sm:flex-row items-center mb-5 justify-center sm:space-x-4 space-x-0 space-y-1 sm:space-y-0">
              <span className="flex space-x-1 text-sm font-semibold">
                <h2>Total Earned from Referral:</h2>
                <h2 className="font-bold">
                  {data.totalAmountEarnedFromReferrals} Birr
                </h2>
              </span>
              <span className="flex space-x-1 text-sm font-semibold">
                <h2>Amount Left:</h2>
                <h2 className="font-bold">{data.currentAmountLeft} Birr</h2>
              </span>
              <span className="flex space-x-1 text-sm font-semibold">
                <h2>Your Referral Code:</h2>
                <h2 className="font-bold">{data.referralCode}</h2>
              </span>
            </div>

            <div className="overflow-x-auto w-full rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="text-[10px] sm:text-sm bg-text mx-auto rounded-md text-white">
                    <th className="p-1 sm:p-3 w-4 rounded-tl-md text-center">Username</th>
                    <th className="p-1 sm:p-3 text-center">Phone Number</th>
                    <th className="p-1 sm:p-3 rounded-tr-md text-center">Referral Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referrals.map((referral, index) => (
                    <tr
                      key={referral.id}
                      className={`${
                        index % 2 === 0 ? "bg-text/55" : "bg-text/85"
                      } text-[10px] sm:text-sm hover:bg-text transition-all text-whitte`}
                    >
                      <td className="p-1 sm:p-3 text-center">{referral.referredUsername}</td>
                      <td className="p-1 sm:p-3 text-center">{referral.referredPhone}</td>
                      <td className="p-1 sm:p-3 text-center">{formatDate(referral.registrationDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isPending && data?.referrals.length === 0 && (
              <div className="p-4 flex items-center justify-center">
                <h2 className="text-xl">No Referral history available.</h2>
              </div>
            )}
            <StyledPagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={data.totalReferrals}
              onChange={handlePageChange}
              className="mt-4"
              style={{
                // backgroundColor: "#ffffff",
                padding: "10px",
                borderRadius: "8px",
              }}
            />
            </div>
          </div>
        )}
        </div>
      </div>
      <Footerx />
    </>
  );
};

export default Referrals;
