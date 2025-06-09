import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { register, checkUsernameAvailability,sendOTP } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import debounce from "lodash.debounce";
import { FaEye, FaEyeSlash, FaTimesCircle } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import { message, Tooltip } from "antd";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    username: "",
    password: "",
    confirmPassword: "",
    otp:"",
    referralCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showPhoneNumberToolTip, setShowPhoneNumberToolTip] = useState(false);
  const [showUsernameToolTip, setShowUsernameToolTip] = useState(false);
  const [showPasswordToolTip, setShowPasswordToolTip] = useState(false);
  const [showConfirmPasswordToolTip, setShowConfirmPasswordToolTip] =
    useState(false);
    const [showOTPToolTip, setShowOTPToolTip] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);

  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const showSuccess = useCallback(
    (success) => {
      messageApi.open({
        type: "success",
        content: success,
      });
    },
    [messageApi]
  );
  const checkUsername = useMemo(
    () =>
      debounce(async (username) => {
        setError(null);
        if (username.length < 4) {
          setUsernameAvailable(null); // Only check if username has exactly 4 characters
          return;
        }
        setIsChecking(true);
        try {
          const { available } = await checkUsernameAvailability(
            username.charAt(0).toLowerCase() + username.slice(1)
          );

          setUsernameAvailable(available);
        } catch {
          setError("Error checking username.");
        } finally {
          setIsChecking(false);
        }
      }, 500),
    [setError, setIsChecking, setUsernameAvailable]
  );

  useEffect(() => {
    checkUsername(formData.username);
  }, [formData.username, checkUsername]);

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password });

    setPasswordCriteria({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    });
  };
  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
    }
  }, [successMessage, showSuccess]);

  const passwordsMatch = formData.password === formData.confirmPassword;

  const registrationMutation = useMutation({
    mutationFn: register,
    onError: (error) => {
      if (error) {
        setError(error.response.data.message);
      } else {
        setError("Network error. Please try again.");
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        setSuccessMessage(data.message);
      }
      setError(false);
      navigate("/login", { state: { phoneNumber: formData.phoneNumber } });
    },
  });

  const sendOTPMutation = useMutation({
    mutationFn: sendOTP,
    onError: (error) => {
      if (error) {
        setError(error.response.data.message);
      } else {
        setError("Network error. Please try again.");
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        setSuccessMessage(data.message);
    setOtpButtonDisabled(true);
    setOtpResendTimer(10);
      }
      setError(false);
    }
  })



  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPhoneNumberToolTip(false);
    setShowUsernameToolTip(false);
    setShowPasswordToolTip(false);
    setShowConfirmPasswordToolTip(false);
    setShowOTPToolTip(false);
    if (formData.phoneNumber.length < 6) {
      setShowPhoneNumberToolTip(true);
      return;
    }
    if (formData.username.length < 4) {
      setShowUsernameToolTip(true);
      return;
    }
    if (formData.password.length == 0) {
      setShowPasswordToolTip(true);
      return;
    }
    if (formData.confirmPassword.length == 0) {
      setShowConfirmPasswordToolTip(true);
      return;
    }
    if (formData.otp.length < 6) {
      setShowOTPToolTip(true);
      return;
    }
    
    const { length, uppercase, lowercase, number, specialChar } =
      passwordCriteria;
    if (
      !/^\d+$/.test(formData.phoneNumber) ||
      formData.phoneNumber.length != 10 ||
      !(
        formData.phoneNumber.startsWith("09") ||
        formData.phoneNumber.startsWith("07")
      )
    ) {
      setError("Incorrect phone number.");
      return;
    }

    if (formData.username.length < 4) {
      setError("Username must be at least 4 characters");
      return;
    }
    if (!length || !uppercase || !lowercase || !number || !specialChar) {
      setError("Password does not meet all the criteria.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords don't match.");
      return;
    }
    registrationMutation.mutate(formData);
  };

  const [otpButtonDisabled, setOtpButtonDisabled] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  const handleSendOTP = () => {
    if (formData.phoneNumber.length < 6) {
      setShowPhoneNumberToolTip(true);
      return;
    }
    if (formData.username.length < 4) {
      setShowUsernameToolTip(true);
      return;
    }

    sendOTPMutation.mutate({
      phoneNumber: formData.phoneNumber,
      username: formData.username,
    });


  };

  useEffect(() => {
    let intervalId;

    if (otpButtonDisabled && otpResendTimer > 0) {
      intervalId = setInterval(() => {
        setOtpResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (otpResendTimer === 0) {
      setOtpButtonDisabled(false);
    }

    return () => clearInterval(intervalId);
  }, [otpButtonDisabled, otpResendTimer]);

  return (
    <>
      {contextHolder}
      
      <div className="flex justify-center items-center p-6 bg-[#1c6758]/75 w-full h-screen">
        <div className="w-full max-w-sm mx-auto h-fit bg-white rounded-3xl shadow-lg ">
          <div className="px-6 pt-6">
            <img src="/assets/Asset1.svg" alt="Logo" />
          </div>
          <hr className="border-t-1 border-[#42855b] opacity-20 w-full mt-4 mb-2" />
          <div className="px-6 pb-6 mt:pb-4">
            <h2 className="text-xl md:text-2xl text-[#1c6758] font-semibold mb-4 text-center">
              {"Register"}
            </h2>

            <>
              {" "}
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-3 mb-2">
                <div className="space-y-1">
                  <div className="flex flex-col items-start justify-start space-y-1 w-full">
                    <span className="text-xs md:text-xs font-semibold text-[#1a1a1a]">
                      Phone Number
                    </span>
                    <Tooltip
                      title="Fill in your phone number"
                      open={showPhoneNumberToolTip}
                      placement="top"
                      overlayInnerStyle={{
                        backgroundColor: "#1c6758",
                        color: "#fff",
                      }}
                    >
                      <div className="w-full">
                        <input
                          id="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                              setFormData({
                                ...formData,
                                phoneNumber: value,
                              });
                            }
                          }}
                          className="w-full p-2 border border-[#42855b] rounded focus:outline-none focus:ring-1 focus:ring-[#1c6758] text-xs font-semibold text-[#1a1a1a] bg-[#1c6758]/10"
                          aria-required="true"
                        />
                      </div>
                    </Tooltip>
                  </div>
                  <div className="flex flex-col items-start justify-start space-y-1 w-full">
                    <span className="text-xs md:text-xs font-semibold text-[#1a1a1a]">
                      Username{" "}
                      <span className="text-gray-400 text-[9px]">
                        (at least 4 characters)
                      </span>
                    </span>
                    <Tooltip
                      title="Fill in your username"
                      open={showUsernameToolTip}
                      placement="top"
                      overlayInnerStyle={{
                        backgroundColor: "#1c6758",
                        color: "#fff",
                      }}
                    >
                      <div className="w-full">
                        <input
                          id="username"
                          type="text"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              username: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-[#42855b] rounded focus:outline-none focus:ring-1 focus:ring-[#1c6758] text-xs font-semibold text-[#1a1a1a] bg-[#1c6758]/10"
                          aria-required="true"
                        />
                        {isChecking && (
                          <div className="w-full flex justify-start mt-1">
                            <Spinner size={2} color="#1c6758" />
                          </div>
                        )}
                        {!isChecking && usernameAvailable == false && (
                          <div className="flex space-x-1 text-red-500 items-center text-xs font-semibold mt-1">
                            <FaTimesCircle />
                            <p>Username is taken</p>
                          </div>
                        )}
                        {!isChecking && usernameAvailable && (
                          <div className="flex space-x-1 text-[#1c6758] items-center text-xs font-semibold mt-1">
                            <BsCheckCircleFill />
                            <p>Username is available</p>
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  </div>
                  <div className="flex flex-col items-start justify-start space-y-1 w-full">
                    <span className="text-xs md:text-xs font-semibold text-[#1a1a1a]">
                      Password
                    </span>
                    <Tooltip
                      title="Set a password"
                      open={showPasswordToolTip}
                      placement="top"
                      overlayInnerStyle={{
                        backgroundColor: "#1c6758",
                        color: "#fff",
                      }}
                    >
                      <div className="relative w-full">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onFocus={() => setPasswordFocus(true)}
                          onBlur={() => setPasswordFocus(false)}
                          onChange={(e) => {
                            handlePasswordChange(e.target.value);
                            setError(null);
                          }}
                          className="w-full p-2 border border-[#42855b] rounded focus:outline-none focus:ring-1 focus:ring-[#1c6758] text-xs font-semibold text-[#1a1a1a] bg-[#1c6758]/10"
                          aria-required="true"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#1c6758]"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </Tooltip>
                  </div>
                  {passwordFocus && (
                    <div className="space-y-1">
                      {/* Password criteria checks */}
                      <div
                        className={`flex space-x-1 items-center text-xs font-semibold ${
                          passwordCriteria.length
                            ? "text-[#1c6758]"
                            : "text-red-500"
                        }`}
                      >
                        {passwordCriteria.length ? (
                          <BsCheckCircleFill />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <p>At least 6 characters</p>
                      </div>
                      <div
                        className={`flex space-x-1 items-center text-xs font-semibold ${
                          passwordCriteria.uppercase
                            ? "text-[#1c6758]"
                            : "text-red-500"
                        }`}
                      >
                        {passwordCriteria.uppercase ? (
                          <BsCheckCircleFill />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <p>At least one uppercase letter</p>
                      </div>
                      <div
                        className={`flex space-x-1 items-center text-xs font-semibold ${
                          passwordCriteria.lowercase
                            ? "text-[#1c6758]"
                            : "text-red-500"
                        }`}
                      >
                        {passwordCriteria.lowercase ? (
                          <BsCheckCircleFill />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <p>At least one lowercase letter</p>
                      </div>
                      <div
                        className={`flex space-x-1 items-center text-xs font-semibold ${
                          passwordCriteria.number
                            ? "text-[#1c6758]"
                            : "text-red-500"
                        }`}
                      >
                        {passwordCriteria.number ? (
                          <BsCheckCircleFill />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <p>At least one number</p>
                      </div>
                      <div
                        className={`flex space-x-1 items-center text-xs font-semibold ${
                          passwordCriteria.specialChar
                            ? "text-[#1c6758]"
                            : "text-red-500"
                        }`}
                      >
                        {passwordCriteria.specialChar ? (
                          <BsCheckCircleFill />
                        ) : (
                          <FaTimesCircle />
                        )}
                        <p>At least one special character</p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-start justify-start space-y-1 w-full">
                    <span className="text-xs md:text-xs font-semibold text-[#1a1a1a]">
                      Confirm Password
                    </span>
                    <Tooltip
                      title="Confirm the password you set"
                      open={showConfirmPasswordToolTip}
                      placement="top"
                      overlayInnerStyle={{
                        backgroundColor: "#1c6758",
                        color: "#fff",
                      }}
                    >
                      <div className="relative w-full">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onFocus={() => setConfirmPasswordFocus(true)}
                          onBlur={() => setConfirmPasswordFocus(false)}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-[#42855b] rounded focus:outline-none focus:ring-1 focus:ring-[#1c6758] text-xs font-semibold text-[#1a1a1a] bg-[#1c6758]/10"
                          aria-required="true"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#1c6758]"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </Tooltip>
                    {confirmPasswordFocus && (
                      <div className="flex space-x-1 items-center text-xs font-semibold">
                        {passwordsMatch ? (
                          <div className="flex space-x-1 text-[#1c6758] items-center">
                            <BsCheckCircleFill />
                            <p>{"Passwords match"}</p>
                          </div>
                        ) : (
                          <div className="flex space-x-1 text-red-500 items-center">
                            <FaTimesCircle />
                            <p>{"Passwords don't match"}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start justify-start space-y-1 w-full">
                    <span className="text-xs md:text-xs font-semibold text-[#1a1a1a]">
                      OTP
                    </span>
                    <Tooltip
                      title="Fill in OTP sent to your phone"
                      open={showOTPToolTip}
                      placement="top"
                      overlayInnerStyle={{
                        backgroundColor: "#1c6758",
                        color: "#fff",
                      }}
                    >
                      <div className="w-full flex items-start justify-between space-x-4">
                        <input
                          id="otp"
                          type="text"
                          value={formData.otp}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              otp: e.target.value,
                            })
                          }
                          className="w-2/3 p-2 border border-[#42855b] rounded focus:outline-none focus:ring-1 focus:ring-[#1c6758] text-xs font-semibold text-[#1a1a1a] bg-[#1c6758]/10"
                          aria-required="true"
                        />
                        <button
                          className={`w-1/3 h-8 rounded  text-white text-center font-semibold ${
                            otpButtonDisabled
                              ? "bg-red-500 cursor-not-allowed"
                              : "bg-[#1c6758] hover:bg-opacity-75 transition duration-300"
                          }`}
                          onClick={handleSendOTP}
                          disabled={otpButtonDisabled}
                        >
                          {otpButtonDisabled
                            ? `Resend in ${otpResendTimer}`
                            : "Send OTP"}
                        </button>
                      </div>
                    </Tooltip>
                  </div>
                  <div className="flex flex-col items-start justify-start space-y-1 w-full">
                    <span className="text-xs md:text-sm font-semibold text-[#1a1a1a]">
                      Referral Code{" "}
                      <span className="text-gray-400 text-[9px]">
                        (optional)
                      </span>
                    </span>
                    <div className="w-full">
                      <input
                        id="referralCode"
                        type="text"
                        value={formData.referralCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            referralCode: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-[#42855b] rounded focus:outline-none focus:ring-1 focus:ring-[#1c6758] text-xs font-semibold text-[#1a1a1a] bg-[#1c6758]/10"
                        aria-required="false"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    type="submit"
                    className="w-full px-2 py-1 text-white rounded text-base font-semibold bg-[#1c6758] hover:bg-opacity-75 transition duration-300"
                    disabled={isChecking || registrationMutation.isPending}
                    aria-busy={isChecking || registrationMutation.isPending}
                  >
                    {registrationMutation.isPending ? (
                      <Spinner size={6} />
                    ) : (
                      "Register"
                    )}
                  </button>
                  {error && (
                    <div className="flex p-1 items-center justify-center text-xs md:text-sm font-medium text-red-500 bg-red-100 border border-red-500 rounded">
                      {error}
                    </div>
                  )}
                </div>
              </form>
              <div className="flex space-x-1 mt-2 md:mt-3">
                <p className="text-xs md:text-sm text-black">
                  Already have an account?
                </p>
                <a
                  href="/login"
                  className="text-xs sm:text-sm font-bold text-[#1c6758] hover:text-opacity-90 transition duration-300"
                >
                  Login
                </a>
              </div>
            </>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
