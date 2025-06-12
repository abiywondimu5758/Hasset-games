/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { checkUsernameAvailability } from "../services/authServices";
import Spinner from "./Spinner";
import debounce from "lodash.debounce";
import { userStore } from "../stores/userStore";
import { fetchProfile } from "../services/userServices";
import { authStore } from "../stores/AuthStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { changeUsername } from "../services/userServices";
import ChangePasswordForm from "./ChangePasswordForm";
import Nav from "./Nav";
import { FaTimesCircle } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import { message } from "antd";
import Footerx from "./Footerx";

const Profile = () => {
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");
  const [formData, setFormData] = useState({ username: "" });
  const [messageApi, contextHolder] = message.useMessage();

  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchProfile,
    enabled: authStore.isAuthenticated(),
  });

  useEffect(() => {
    if (profileData) {
      userStore.setUserProfile(profileData);
      const currentUsername = profileData.username || "";
      setOriginalUsername(currentUsername);
      setFormData({ username: currentUsername });
    }
  }, [profileData]);

  useEffect(() => {
    if (profileError) {
      const errMsg = profileError.response?.data?.error || "An error occurred";
      userStore.setError(errMsg);
      messageApi.open({ type: "error", content: errMsg });
    }
  }, [profileError, messageApi]);

  const checkUsername = debounce(async (username) => {
    if (!username || username === originalUsername) {
      setUsernameAvailable(null);
      return;
    }
    setIsChecking(true);
    try {
      const { available } = await checkUsernameAvailability(username);
      setUsernameAvailable(available);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: error ? error : "Error checking username",
      });
    } finally {
      setIsChecking(false);
    }
  }, 500);

  useEffect(() => {
    if (formData.username && formData.username !== originalUsername) {
      checkUsername(formData.username);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username, originalUsername]);

  const mutation = useMutation({
    mutationFn: changeUsername,
    onError: (error) => {
      const errMsg = error.response?.data?.error || "An error occurred";
      messageApi.open({ type: "error", content: errMsg });
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Username changed successfully!",
      });
      window.location.reload();
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (profileLoading || userStore.loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-text/75 ">
      {contextHolder}
      <Nav />
<div className="px-5 sm:px-0 mb-20">
      <div className="max-w-md mx-auto p-6 bg-bgdark/85 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-text text-center">
          Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-2 mb-4">
          <div className="flex flex-col items-start space-y-1 w-full">
            <span className="text-xs md:text-sm font-semibold text-text">
              Username (at least 4 characters)
            </span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2  text-text border border-text rounded focus:border-none focus:ring-2 focus:ring-text focus:outline-none text-xs font-semibold bg-bgdark"
            />
            {isChecking && (
              <div className="w-full flex justify-start mt-1">
                <Spinner size={4} color="#66bb69" />
              </div>
            )}
            {!isChecking && usernameAvailable === false && (
              <div className="flex space-x-1 text-red-500 items-center text-xs font-semibold mt-1">
                <FaTimesCircle />
                <p>Username is taken</p>
              </div>
            )}
            {!isChecking && usernameAvailable && (
              <div className="flex space-x-1 text-green-500 items-center text-xs font-semibold mt-1">
                <BsCheckCircleFill />
                <p>Username is available</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start space-y-1 w-full">
            <span className="text-xs md:text-sm font-semibold text-text">
              Phone Number
            </span>
            <input
              type="text"
              name="phoneNumber"
              value={userStore.userProfile?.phoneNumber || ""}
              disabled={true}
              className="w-full p-2 border border-text/50 rounded focus:border-none focus:ring-2 focus:ring-[#66bb69] focus:outline-none text-xs font-semibold text-text/70 bg-bgdark"
            />
          </div>

          <button
            type="submit"
            className={`w-full p-2 rounded text-xs md:text-sm  text-white ${
              usernameAvailable
                ? "bg-primary"
                : "bg-gray-500"
            }`}
            disabled={!usernameAvailable || usernameAvailable === null}
          >
            {mutation.isLoading ? <Spinner /> : "Save"}
          </button>
        </form>

        {!changePassword ? (
          <button
            className="w-40 p-2 rounded text-xs md:text-sm bg-primary text-white"
            onClick={() => setChangePassword(true)}
          >
            Change Password
          </button>
        ) : (
          <ChangePasswordForm set={() => setChangePassword(false)} />
        )}
      </div>
      </div>
      <Footerx />
    </div>
    
  );
};

export default Profile;
