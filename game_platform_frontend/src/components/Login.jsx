import { useState } from "react";
import { login } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Spinner from "./Spinner";
import { authStore } from "../stores/AuthStore";
import { useMutation  } from "@tanstack/react-query";
import { Tooltip } from "antd";
import Modal from "./Modal";

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showUsernameToolTip, setShowUsernameToolTip] = useState(false);
  const [showPasswordToolTip, setShowPasswordToolTip] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const loginMutation = useMutation({
    mutationFn: (formData) => login(formData), 
    onSuccess: (data) => {
      authStore.setAccessToken(data.accessToken);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      navigate("/dashboard");
    },
    onError: (error) => {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError("Network error. Please try again.");
      }
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowUsernameToolTip(false);
    setShowPasswordToolTip(false);
    
    if(formData.username.length === 0){
      setShowUsernameToolTip(true);
      return;
    }
    if(formData.password.length === 0){
      setShowPasswordToolTip(true);
      return;
    }
    loginMutation.mutate(formData)
  };


  return (
    <div className="flex justify-center items-center p-6 bg-[#20446f]/75 w-full h-screen">

      <div className="w-full max-w-sm mx-auto h-fit  bg-white rounded-3xl shadow-lg">
      <div className="px-6 pt-6">
        {/* <img src='/assets/Asset1.svg' alt="Logo"/> */}
      </div>
      <hr className="border-t-1 border-[#186ccc] opacity-20 w-full mt-4 mb-2" />
      <div className="px-6 pb-6">
      <h2 className="text-xl md:text-2xl text-[#20446f] font-semibold mb-4 text-center">
        Login
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6 mb-2">
        <div className="space-y-3">
        <div className="flex flex-col items-start justify-start space-y-1 w-full">
          <label htmlFor="username" className="text-xs md:text-sm font-semibold text-[#1a1a1a]">
          Username
          </label>
          <Tooltip
          title="Fill in your username"
          open={showUsernameToolTip}
          placement="top"
          overlayInnerStyle={{ backgroundColor: '#20446f', color: '#fff' }}
          >
          <div className="w-full">
            <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full p-2 border border-[#186ccc] rounded focus:outline-none focus:ring-1 focus:ring-[#20446f] text-xs font-semibold text-[#1a1a1a] focus:scale-100 bg-[#20446f]/10"
            aria-required="true"
            />
          </div>
          </Tooltip>
        </div>
        <div className="flex flex-col items-start justify-start space-y-1 w-full">
          <label htmlFor="password" className="text-xs md:text-sm font-semibold text-[#1a1a1a]">
          Password
          </label>
          <Tooltip
          title="Fill in your password"
          open={showPasswordToolTip}
          placement="top"
          overlayInnerStyle={{ backgroundColor: '#20446f', color: '#fff' }}
          >
          <div className="relative w-full">
            <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-2 border border-[#186ccc] rounded focus:outline-none focus:ring-1 focus:ring-[#20446f] text-xs font-semibold text-[#1a1a1a] bg-[#20446f]/10"
            aria-required="true"
            />
            <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#20446f]"
            aria-label={showPassword ? "Hide password" : "Show password"}
            >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          </Tooltip>
        </div>
        </div>
        <div className="flex flex-col space-y-2">
        <button
        type="submit"
        className="w-full px-2 py-1 text-white rounded text-base font-semibold bg-[#20446f] hover:bg-opacity-75 transition duration-300"
        disabled={loginMutation.isPending}
        aria-busy={loginMutation.isPending}
        >
        {loginMutation.isPending ? <Spinner size={6} /> : "Login"}
        </button>
        {error && (
        <div className="flex p-1 items-center justify-center text-xs md:text-sm font-medium text-red-500 bg-red-100 border border-red-500 rounded">
          {error}
        </div>
        )}
        </div>
      </form>
    
      <a
        href="/forgot-password"
        className="text-xs sm:text-sm font-bold pt-8 text-[#20446f] hover:text-opacity-90 transition duration-300"
      >
        Forgot password?
      </a>
      <div className="flex space-x-1 pt-2">
        <p className="text-xs sm:text-sm text-black">
        Don&apos;t have an account?
        </p>
        <a
        href="/register"
        className="text-xs sm:text-sm font-bold text-[#20446f] hover:text-opacity-90 transition duration-300"
        >
        Register
        </a>
      </div>
      </div>
      </div>
      {/* <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/> */}

        
    </div>
    );
};

export default LoginForm;
