import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { register, checkUsernameAvailability, sendOTP } from "../services/authServices";
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
    otp: "",
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
    },
  });

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

    const { length, uppercase, lowercase, number, specialChar } = passwordCriteria;
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
      <div className="flex justify-center items-center p-6 bg-bg/75 w-full h-screen text-text">
        <div className="w-full max-w-sm sm:max-w-2xl mx-auto h-fit bg-bg rounded shadow-xl backdrop-blur-xl">
          <div className="px-6 pt-6">
            {/* <img src='/assets/Asset1.svg' alt="Logo"/> */}
          </div>
          <hr className="border-t-1 border-primary opacity-20 w-full mt-4 mb-2" />
          <div className="px-6 pb-4">
            <h2 className="text-xl md:text-2xl text-primary font-semibold mb-4 text-center">
              Register
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 mb-2 w-full">
              {/* Responsive grid for fields */}
              <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6">
                {/* Phone Number */}
                <div className="flex flex-col items-start justify-start space-y-1 w-full">
                  <label
                    htmlFor="phoneNumber"
                    className="text-xs md:text-sm font-semibold text-text"
                  >
                    Phone Number
                  </label>
                  <Tooltip
                    title="Fill in your phone number"
                    open={showPhoneNumberToolTip}
                    placement="top"
                    overlayInnerStyle={{
                      backgroundColor: "#e67300",
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
                        className="w-full p-2 border border-text/40 rounded focus:outline-none focus:ring-1 focus:ring-text text-xs font-semibold text-text bg-transparent"
                        aria-required="true"
                      />
                    </div>
                  </Tooltip>
                </div>
                {/* Username */}
                <div className="flex flex-col items-start justify-start space-y-1 w-full">
                  <label
                    htmlFor="username"
                    className="text-xs md:text-sm font-semibold text-text"
                  >
                    Username{" "}
                    <span className="text-gray-400 text-[9px]">
                      (at least 4 characters)
                    </span>
                  </label>
                  <Tooltip
                    title="Fill in your username"
                    open={showUsernameToolTip}
                    placement="top"
                    overlayInnerStyle={{
                      backgroundColor: "#e67300",
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
                        className="w-full p-2 border border-text/40 rounded focus:outline-none focus:ring-1 focus:ring-text text-xs font-semibold text-text bg-transparent"
                        aria-required="true"
                      />
                      {isChecking && (
                        <div className="w-full flex justify-start mt-1">
                          <Spinner size={2} color="#e67300" />
                        </div>
                      )}
                      {!isChecking && usernameAvailable === false && (
                        <div className="flex space-x-1 text-red-500 items-center text-xs font-semibold mt-1">
                          <FaTimesCircle />
                          <p>Username is taken</p>
                        </div>
                      )}
                      {!isChecking && usernameAvailable && (
                        <div className="flex space-x-1 text-primary items-center text-xs font-semibold mt-1">
                          <BsCheckCircleFill />
                          <p>Username is available</p>
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </div>
                {/* Password */}
                <div className="flex flex-col items-start justify-start space-y-1 w-full mt-3 sm:mt-0">
                  <label
                    htmlFor="password"
                    className="text-xs md:text-sm font-semibold text-text"
                  >
                    Password
                  </label>
                  <Tooltip
                    title="Set a password"
                    open={showPasswordToolTip}
                    placement="top"
                    overlayInnerStyle={{
                      backgroundColor: "#e67300",
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
                        className="w-full p-2 border border-text/40 rounded focus:outline-none focus:ring-1 focus:ring-text text-xs font-semibold text-text bg-transparent"
                        aria-required="true"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </Tooltip>
                  {/* Password criteria (full width, below both columns) */}
                  {passwordFocus && (
                    <div className="col-span-2 mt-2">
                      <div className="space-y-1">
                        <div
                          className={`flex space-x-1 items-center text-xs font-semibold ${
                            passwordCriteria.length
                              ? "text-primary"
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
                              ? "text-primary"
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
                              ? "text-primary"
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
                              ? "text-primary"
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
                              ? "text-primary"
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
                    </div>
                  )}
                </div>
                {/* Confirm Password */}
                <div className="flex flex-col items-start justify-start space-y-1 w-full mt-3 sm:mt-0">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs md:text-sm font-semibold text-text"
                  >
                    Confirm Password
                  </label>
                  <Tooltip
                    title="Confirm the password you set"
                    open={showConfirmPasswordToolTip}
                    placement="top"
                    overlayInnerStyle={{
                      backgroundColor: "#e67300",
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
                        className="w-full p-2 border border-text/40 rounded focus:outline-none focus:ring-1 focus:ring-text text-xs font-semibold text-text bg-transparent"
                        aria-required="true"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary"
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
                    <div className="flex space-x-1 items-center text-xs font-semibold mt-1">
                      {passwordsMatch ? (
                        <div className="flex space-x-1 text-primary items-center">
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
                {/* OTP */}
                <div className="flex flex-col items-start justify-start space-y-1 w-full mt-3 sm:col-span-2">
                  <label htmlFor="otp" className="text-xs md:text-sm font-semibold text-text">
                    OTP
                  </label>
                  <Tooltip
                    title="Fill in OTP sent to your phone"
                    open={showOTPToolTip}
                    placement="top"
                    overlayInnerStyle={{
                      backgroundColor: "#e67300",
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
                        className="w-2/3 p-2 border border-text/40 rounded focus:outline-none focus:ring-1 focus:ring-text text-xs font-semibold text-text bg-transparent"
                        aria-required="true"
                      />
                      <button
                        className={`w-1/3 h-8 rounded text-white text-center font-semibold ${
                          otpButtonDisabled
                            ? "bg-red-500 cursor-not-allowed"
                            : "bg-primary hover:bg-opacity-75 transition duration-300"
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
                {/* Referral Code */}
                <div className="flex flex-col items-start justify-start space-y-1 w-full mt-3 sm:col-span-2">
                  <label htmlFor="referralCode" className="text-xs md:text-sm font-semibold text-text">
                    Referral Code{" "}
                    <span className="text-gray-400 text-[9px]">(optional)</span>
                  </label>
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
                      className="w-full p-2 border border-text/40 rounded focus:outline-none focus:ring-1 focus:ring-text text-xs font-semibold text-text bg-transparent"
                      aria-required="false"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 mt-4">
                <button
                  type="submit"
                  className="w-full px-2 py-1 text-white rounded text-base bg-primary hover:bg-opacity-75 transition duration-300"
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
            <div className="mt-4 text-center text-xs sm:text-sm text-text">
              <a
                href="/login"
                className="font-bold hover:text-opacity-90 transition"
              >
                Already have an account? Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
