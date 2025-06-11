/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  FaTrophy,
  FaWallet,
  FaUser,
  FaEnvelope,
  FaSignOutAlt,
  FaHome,
  FaBars,
  FaTimes,
  FaHistory,
  FaUserPlus,
  FaGamepad,
} from "react-icons/fa";
import { IoClipboardOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { fetchProfile } from "../services/userServices";
import { userStore } from "../stores/userStore";
import { logout } from "../services/authServices";
import { useLocation } from "react-router-dom";
import { message, Alert } from "antd";
import Spinner from "./Spinner";
import Logo from "../../public/assets/logo.svg";

// Reusable Wallet component
const WalletButton = ({ onClick, userProfile }) => (
  <button
    className="flex items-center text-white font-semibold text-xs ees:text-base"
    onClick={onClick}
  >
    <div className="flex py-2 px-2 ees:py-1 ees:px-2 md:p-2 items-center space-x-1 bg-primary rounded-lg">
      <FaWallet />
      <span className="flex md:space-x-1 font-semibold  md:text-base">
        <span>ETB.</span>
        <span>
          {String(
            Number(userProfile?.wallet || 0) +
            Number(userProfile?.referralBonus || 0)
          )}
        </span>
      </span>
    </div>
  </button>
);

// Reusable Logout component
const LogoutButton = ({ onClick }) => (
  <button
    onClick={onClick}
    // className="flex items-center border p-2 rounded border-red-500 text-red-500"
  >
    <FaSignOutAlt className="mr-1 text-red-500 text-3xl" />
    {/* <span className="text-base">Logout</span> */}
  </button>
);

const Nav = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
const [infoMessage, setInfoMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const showError = (error) => {
    messageApi.open({
      type: "error",
      content: error,
    });
  };
  const showInfo = (info) => {
    messageApi.open({
      type: "info",
      content: info,
    });
  };
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
    if (error || userStore.error) {
      showError(error || userStore.error.toString());
    }
  }, [error]);

    useEffect(() => {
      if (infoMessage) {
        showInfo(infoMessage);
      }
    }, [infoMessage]);

  const handleLogout = () => {
    logout();
    userStore.clearUserProfile();
    navigate("/login");
  };

  const handleTabChange = (path) => {
    setActiveTab(path);
    navigate(path);
  };

  const isActive = (tab) =>
    activeTab === tab
      ? "text-text font-semibold text-base"
      : "font-semibold text-base";

  return (
    <>
    <div className="px-5">
      {contextHolder}
      {loading ||
        (userStore.loading && (
          <div className="p-4">
            <Spinner className="p-4" />
          </div>
        ))}
      {error ||
        (userStore.error && (
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
        ))}

      {/* Top Navigation Bar */}
      <div className="flex justify-start items-center space-x-1 mb-6">
      <img src={Logo} alt="Logo" className="h-20 w-auto" />
      <header className="bg-bg/75 py-1 px-2 ees:px-4 flex justify-between items-center shadow-md  h-12 w-full sm:w-full mx-auto rounded-md">
        
                <div className="text-lg md:text-xl font-semibold flex justify-start md:space-x-0  items-center w-full">
          <button
            className="lg:hidden  mr-1 text-text"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          >
            {isDrawerOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="flex space-x-0" onClick={() => handleTabChange("/dashboard")}>
            <button
              className={`hidden lg:flex items-center ${isActive("/dashboard")}`}
            >
              <FaHome className="mr-2 md:text-2xl text-lg" />
            </button>
            <span className="text-xs sm:text-sm">
              Welcome,{" "}
              <span className="text-text">
                player!
              </span>
            </span>
          </div>
        </div>
        <div className="mr-2 hidden lg:flex space-x-4 pr-14 text-text">
          {[
            { icon: FaTrophy, label: "Leaderboard", path: "/leaderboard" },
            { icon: FaHistory, label: "History", path: "/history" },
            { icon: FaUserPlus, label: "Referral", path: "/referrals" },
            { icon: FaGamepad, label: "How to play", path: "/how-to-play" },
            { icon: FaUser, label: "Profile", path: "/profile" },
            { icon: FaEnvelope, label: "Contact", path: "https://t.me/fortunebingogames" },
          ].map((item, index) => (
            <button
              key={index}
              className={`flex min-w-fit items-center ${isActive(item.path)}`}
              onClick={() => {
                if (item.path.startsWith("http")) {
                  window.open(item.path, "_blank");
                } else {
                  handleTabChange(item.path);
                }
              }}
            >
              <item.icon className="mr-1" />
              <span className="md:mb-1 w-fit ">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="flex space-x-4 items-center">
          <WalletButton onClick={() => handleTabChange("/wallet")} userProfile={userStore.userProfile} />
          <div className=" wallet-login-container ">
          <LogoutButton onClick={handleLogout} /></div>
        </div>
      </header>
</div>


      {/* Drawer for small screens */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      ></div>
      <div
        className={`fixed left-0 top-0 text-text h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } z-50`}
      >
<div className="flex justify-between items-center px-4 pt-4 pb-6 border-b">

<div className="flex items-center space-x-4">
  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
    <FaUser className="text-gray-500" />
  </div>
  <div className="flex flex-col">
    <span className="font-semibold ">{userStore?.userProfile?.username || "User"}</span>
    <span className="text-sm text-text/75">{userStore?.userProfile?.phoneNumber || "No number"}</span>
  </div>
</div>
</div>
<div className="flex flex-col px-4 pt-3 pb-6 space-y-3">

<button
          className={`flex items-center ${isActive("/dashboard")}`}
          onClick={() => handleTabChange("/dashboard", "/dashboard")}
        >
          <FaHome className="mr-2" />
          <span className="md:mb-1">Home</span>
        </button>
        <button
          className={`flex items-center ${isActive("/profile")}`}
          onClick={() => handleTabChange("/profile", "/profile")}
        >
          <FaUser className="mr-2" />
          <span className="md:mb-1">Profile</span>
        </button>
        <button
          className={`flex items-center ${isActive("/leaderboard")}`}
          onClick={() => handleTabChange("/leaderboard", "/leaderboard")}
        >
          <FaTrophy className="mr-2" />
          <span className="md:mb-1">Leaderboard</span>
        </button>

        <button
          className={`flex items-center ${isActive("/wallet")}`}
          onClick={() => handleTabChange("/wallet", "/wallet")}
        >
          <FaWallet className="mr-2" />
          <span className="md:mb-1">Wallet</span>
        </button>
        <button
          className={`flex items-center ${isActive("/referrals")}`}
          onClick={() => handleTabChange("/referrals", "/referrals")}
        >
          <FaUserPlus className="mr-1" />
          <span className="md:mb-1">Referral</span>
        </button>
        <button
          className={`flex items-center ${isActive("/history")}`}
          onClick={() => handleTabChange("/history", "/history")}
        >
          <FaHistory className="mr-1" />
          <span className="md:mb-1">History</span>
        </button>

        <button
          className={`flex items-center ${isActive("https://t.me/fortunebingogames")}`}
          onClick={() => window.open("https://t.me/fortunebingogames", "_blank")}
        >
          <FaEnvelope className="mr-2" />
          <span>Contact</span>
        </button>
        </div>
        <div className="w-full border-b"></div>
        <div className="flex flex-col px-4 py-6 space-y-2">
        <button
          className={`w-full flex items-center ${isActive("/wallet")}`}
          onClick={() => handleTabChange("/wallet", "/wallet")}
        >
          
            <div className="flex px-4 py-2 items-center space-x-1 w-full bg-primary rounded-lg text-white h-12">
              <FaWallet />
              <span className="flex space-x-2 items-center">
                <span className="text-sm font-semibold">Wallet: </span>
                <span className="">
                  {" "}
                  {String(
                    Number(userStore?.userProfile?.wallet || 0) +
                      Number(userStore?.userProfile?.referralBonus || 0)
                  )}
                  {" Birr"}
                </span>
              </span>
            </div>

          
        </button>
        <div className="flex px-4 py-2 items-center justify-start space-x-2 bg-primary rounded-lg text-white ">
        <div className="flex space-x-1 items-center"><FaUserPlus/>
              <span className="text-sm font-semibold">Ref code:</span>
              </div>
              <div className="flex items-center bg-white/10 rounded p-1 space-x-1" onClick={() => { navigator.clipboard.writeText(userStore?.userProfile?.referralCode); setInfoMessage("Referral code copied to clipboard"); }}>
                <span className="font-semibold cursor-pointer" >
                  {userStore?.userProfile?.referralCode}
                </span>
                <IoClipboardOutline/>
                </div>
            </div>
            </div>
            <div className="w-full border-b"></div>
            <div className="flex flex-col px-4 py-6 space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center border p-1 rounded border-red-500 text-red-500"
        >
          <FaSignOutAlt className="mr-1" />
          <span>Logout</span>
        </button>
        </div>
    </div>

    <style>
      {`
        /* Hide Wallet and Logout buttons on screens 569px or less */
        @media (max-width: 569px) {
          .wallet-login-container {
            display: none;
          }
        }
      `}
    </style>
    </div>
  </>
);
});

export default Nav;
