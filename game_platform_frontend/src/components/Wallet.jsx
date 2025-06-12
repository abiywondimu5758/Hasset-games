import { useCallback, useEffect, useState } from "react";
import {
  // initiateDeposit,
  initiateDirectDeposit,
  initiateWithdrawal,
  getBanks,
} from "../services/paymentServices";
import {
  fetchProfile,
  fetchUserTransactionHistory,
} from "../services/userServices";
import { useMutation, useQuery } from "@tanstack/react-query";
import Spinner from "./Spinner";
import Footerx from "./Footerx";
import { StyledPagination } from "./Antd Components/StyledPagintation";
import TransactionTable from "./TransactionTable"; // Import the custom TransactionTable component
import { Tabs } from "antd"; // Import Tabs from Ant Design
import Nav from "./Nav";
import { FaHistory } from "react-icons/fa";
import { FaWallet } from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";
import { message } from "antd";
import { StyledTabs2 } from "./Antd Components/StyledTabs2";

// Removed Tabs.TabPane as it is deprecated.

const Wallet = () => {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState();
  const [selectedDepositBank, setSelectedDepositBank] = useState();
  const [error, setError] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [profile, setProfile] = useState({ username: "", phoneNumber: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [currentActiveTab, setCurrentActiveTab] = useState("1");
  const [successMessage, setSuccessMessage] = useState(null);
  const itemsPerPage = 5;
  const columns = [
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Date",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (text) => {
        const date = new Date(text);
        return date.toLocaleString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true, // Use 12-hour clock; omit this for 24-hour format
        });
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
  ];

  const showSuccess = useCallback(
    (success) => {
      messageApi.open({
        type: "success",
        content: success,
      });
    },
    [messageApi]
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["userTransactionHistory", currentPage],
    queryFn: () => fetchUserTransactionHistory(currentPage, itemsPerPage),
    keepPreviousData: true,
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    refetch();
  };

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchProfile,
    onError: (error) => {
      setError(error.response.data.message || "Error fetching profile:");
    },
  });
  useEffect(() => {
    setProfile({
      username: userProfile?.username,
      phoneNumber: userProfile?.phoneNumber,
    });
  }, [userProfile]);

  const depositMutation = useMutation({
    mutationFn: (depositData) => initiateDirectDeposit(depositData),
    onSuccess: (data) => {
      if (data.success && data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (error) => {
      setError(
        error.response
          ? error.response.data.message
          : "Network error. Please try again."
      );
    },
  });

  const withdrawalMutation = useMutation({
    mutationFn: (withdrawalData) => initiateWithdrawal(withdrawalData),
    onSuccess: (data) => {
      setSuccessMessage(data.message);
    },
    onError: (error) => {
      setError(
        error.response
          ? error.response.data.message
          : "Network error. Please try again."
      );
    },
  });

  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
    }
  }, [successMessage, showSuccess]);

  const {
    data: banksData,
    isLoading: isLoadingBanks,
    isError: isBanksError,
  } = useQuery({
    queryKey: ["banks"],
    queryFn: getBanks,
    enabled: true, // Automatically fetch banks on mount
  });

  // Whenever new data arrives, update banks state
  useEffect(() => {
    if (banksData) {
      setBanks(banksData.banks);
    }
  }, [banksData]);

  const handleDeposit = () => {
    if (!depositAmount) {
      setError("Amount is required.");
      return;
    }
    if (!selectedDepositBank) {
      setError("Bank is required.");
      return;
    }

    if(depositAmount < 10){
      setError("Minimum deposit amount is 10 birr.");
      return;
    }

    setError("You can't deposit currently, please contact support");
    // const depositData = {
    //   type: selectedDepositBank,
    //   amount: depositAmount,
    //   username: profile.username,
    //   phoneNumber: profile.phoneNumber,
    // };
    // depositMutation.mutate(depositData);
  };

  const handleWithdrawal = () => {
    if (!withdrawalAmount) {
      setError("Amount is required.");
      return;
    }
    if (!selectedBank) {
      setError("Bank is required.");
      return;
    }
    setError(null);
    const withdrawalData = {
      amount: withdrawalAmount,
      username: profile.username,
      phoneNumber: profile.phoneNumber,
      account_number: profile.phoneNumber,
      bank_code: selectedBank.toString(),
    };
    withdrawalMutation.mutate(withdrawalData);
  };

  return (
    <div className="bg-text/75  h-fit">
      {contextHolder}
      <Nav />
      <div className="flex justify-center items-start pt-10 p-6 w-full h-fit mb-20 ">
        <div className="w-full max-w-sm mx-auto h-fit bg-bg rounded-3xl shadow-lg">
          {/* <div className="px-6 pt-6">
            <img src="/assets/Asset1.svg" alt="Logo" />
          </div> */}
          {/* <hr className="border-t-1 border-[#42855b] opacity-20 w-full mt-4 mb-2" /> */}
          <StyledTabs2
            defaultActiveKey="1"
            className="custom-tabs"
            tabBarStyle={{
              borderColor: "#20436F",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              padding: "12px", // Added padding of 2px
            }}
            activeKey={currentActiveTab}
            onChange={(key) => setCurrentActiveTab(key)}
            items={[
              {
                key: "1",
                label: (
                  <span className="flex items-center space-x-2">
                    <FaWallet
                      className="text-lg"
                      style={{
                        color: currentActiveTab === "1" ? "#20436F" : "gray",
                      }}
                    /> 
                    <span
                      className={`text-base font-semibold ${
                        currentActiveTab === "1"
                          ? "text-text"
                          : "text-gray-500"
                      }`}
                    >
                      Deposit
                    </span>
                  </span>
                ),
                children: (
                  <div className="flex flex-col items-start justify-start space-y-1 w-full px-6 pt-2 pb-6">
                    <label
                      htmlFor="deposit"
                      className="text-sm md:text-base font-semibold text-text"
                    >
                      Amount
                    </label>
                    <div className="w-full">
                      <input
                        id="deposit"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full mb-4 p-2 border border-text rounded focus:outline-none focus:ring-1 focus:ring-text text-xs font-semibold text-text"
                        placeholder="Enter deposit amount"
                      />
                    </div>
                    <div className="flex flex-col items-start justify-start space-y-1 w-full">
                      <label
                        htmlFor="banks"
                        className="text-sm md:text-base font-semibold text-text"
                      >
                        Banks
                      </label>
                      {isBanksError && (
                        <p className="text-xs text-red-500">
                          Error fetching banks.
                        </p>
                      )}
                      <div className="space-y-2 p-2 border border-text rounded focus:outline-none focus:ring-1 focus:ring-[#20436F] text-xs font-semibold text-[#1a1a1a]">
                        {isLoadingBanks && (
                          <p className="text-xs">
                            <Spinner color="#20436F" size={3} />
                          </p>
                        )}
                        {banks.map((bank, index) => (
                          <label
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="radio"
                              name="selectedDepositBank"
                              value={bank.id}
                              checked={selectedDepositBank === bank.slug}
                              onChange={() => setSelectedDepositBank(bank.slug)}
                              style={{ accentColor: '#20436F' }}
                            />
                            <span className="text-text">{bank.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleDeposit}
                      className="w-full px-2 py-1 text-white rounded text-base font-semibold bg-primary hover:bg-opacity-75 transition duration-300 mt-4"
                      disabled={depositMutation.isPending}
                      aria-busy={depositMutation.isPending}
                    >
                      {depositMutation.isPending ? (
                        <Spinner size={6} />
                      ) : (
                        "Deposit"
                      )}
                    </button>
                    {error && (
                      <div className="flex p-1 items-center justify-center text-xs md:text-sm font-medium text-red-500 bg-red-100 border border-red-500 rounded">
                        {error}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "2",
                label: (
                  <span className="flex items-center space-x-2">
                    <MdAccountBalance
                      className="text-lg"
                      style={{
                        color: currentActiveTab === "2" ? "#20436F" : "gray",
                      }}
                    /> 
                    <span
                      className={`text-base font-semibold ${
                        currentActiveTab === "2"
                          ? "text-text"
                          : "text-gray-500"
                      }`}
                    >
                      Withdraw
                    </span>
                  </span>
                ),
                children: (
                  <div className="flex flex-col items-start justify-start space-y-1 w-full px-6 pt-2 pb-6">
                    <label
                      htmlFor="withdrawal"
                      className="text-sm md:text-base font-semibold text-text"
                    >
                      Amount
                    </label>
                    <div className="w-full">
                      <input
                        id="withdrawal"
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        className="w-full mb-4 p-2 border border-text rounded focus:outline-none focus:ring-1 focus:ring-text text-xs font-semibold text-[#1a1a1a]"
                        placeholder="Enter withdrawal amount"
                      />
                    </div>
                    <div className="flex flex-col items-start justify-start space-y-1 w-full">
                      <label
                        htmlFor="banks"
                        className="text-sm md:text-base font-semibold text-text"
                      >
                        Banks
                      </label>
                      {isBanksError && (
                        <p className="text-xs text-red-500">
                          Error fetching banks.
                        </p>
                      )}
                      <div className="space-y-2 p-2 border border-text rounded focus:outline-none focus:ring-1 focus:ring-[#20436F] text-xs font-semibold text-[#1a1a1a]">
                        {isLoadingBanks && (
                          <p className="text-xs">
                            <Spinner color="#20436F" size={3} />
                          </p>
                        )}
                        {banks.map((bank, index) => (
                          <label
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="radio"
                              name="selectedBank"
                              value={bank.id}
                              checked={selectedBank === bank.id}
                              onChange={() => setSelectedBank(bank.id)}
                              style={{ accentColor: '#20436F' }}
                            />
                            <span className="text-text">{bank.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {error && (
                      <div className="flex p-1 items-center justify-center text-xs md:text-sm font-medium text-red-500 bg-red-100 border border-red-500 rounded">
                        {error}
                      </div>
                    )}
                    <button
                      onClick={handleWithdrawal}
                      className="w-full px-2 py-1 text-white rounded text-base font-semibold bg-primary hover:bg-opacity-75 transition duration-300"
                      disabled={withdrawalMutation.isPending}
                      aria-busy={withdrawalMutation.isPending}
                    >
                      {withdrawalMutation.isPending ? (
                        <Spinner size={6} />
                      ) : (
                        "Withdraw"
                      )}
                    </button>
                  </div>
                ),
              },
              {
                key: "3",
                label: (
                  <span className="flex items-center space-x-2">
                    <FaHistory
                      className="text-lg"
                      style={{
                        color: currentActiveTab === "3" ? "#20436F" : "gray",
                      }}
                    /> 
                    <span
                      className={`text-base font-semibold ${
                        currentActiveTab === "3"
                          ? "text-text"
                          : "text-gray-500"
                      }`}
                    >
                      Transactions
                    </span>
                  </span>
                ),
                children: (
                  <div className="p-5">
                    {isLoading ? (
                      <Spinner />
                    ) : isError ? (
                      <div className="text-red-500">
                        Error fetching transactions: {error}
                      </div>
                    ) : data ? (
                      <>
                        <TransactionTable
                          data={data.transactions}
                          columns={columns}
                        />
                        <StyledPagination
                          current={currentPage}
                          pageSize={itemsPerPage}
                          total={data.totalTransactions}
                          onChange={handlePageChange}
                          className="mt-4"
                          style={{
                            padding: "10px",
                            borderRadius: "8px",
                          }}
                        />
                      </>
                    ) : (
                      <div className="text-gray-500">
                        No transactions found.
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
      <Footerx />
    </div>
  );
};

export default Wallet;
