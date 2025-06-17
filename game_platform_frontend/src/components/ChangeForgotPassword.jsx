import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { changeForgottenPassword, resendOTP } from "../services/authServices";
import { useNavigate, useLocation } from "react-router-dom";
import Spinner from "./Spinner";
import { FaEye, FaEyeSlash, FaTimesCircle } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import { OTPInput } from "input-otp";
import { cn } from "../helper/cn";
import PropTypes from "prop-types";
import { calculateTimeLeft, formatTime } from "../helper/calculateTimeLeft";
import { message } from "antd";

const ChangeForgotPassword = () => {
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber;
  const [formData, setFormData] = useState({
    phoneNumber: phoneNumber,
    otp: null,
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const RESEND_OTP_KEY = "fcOtpCountdownEndTime"; // Key for localStorage
  const COUNTDOWN_DURATION = 240; // 3 minutes in seconds

  const [timeLeft, setTimeLeft] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    // Retrieve the stored end time from localStorage
    const storedEndTime = localStorage.getItem(RESEND_OTP_KEY);

    let endTime = 0;

    if (storedEndTime) {
      endTime = parseInt(storedEndTime, 10);
    } else {
      // If no end time is stored, set it to 3 minutes from now
      endTime = new Date().getTime() + COUNTDOWN_DURATION * 1000;
      localStorage.setItem(RESEND_OTP_KEY, endTime.toString());
    }

    // Calculate initial time left
    const initialTimeLeft = calculateTimeLeft(endTime);
    setTimeLeft(initialTimeLeft);

    // Set the resend button state based on initial time left
    setIsResendDisabled(initialTimeLeft > 0);

    // Set up interval to update countdown every second
    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft(endTime);
      setTimeLeft(updatedTimeLeft);

      if (updatedTimeLeft <= 0) {
        setIsResendDisabled(false);
        clearInterval(timer);
        localStorage.removeItem(RESEND_OTP_KEY);
      }
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, newPassword: password });

    setPasswordCriteria({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    });
  };

  const passwordsMatch = formData.newPassword === formData.confirmPassword;

  const resendOTPMutation = useMutation({
    mutationFn: resendOTP,
    onError: (error) => {
      messageApi.error(
        error?.response?.data?.message ||
          "An error occurred, please try again later"
      );
    },
    onSuccess: (data) => {
      if (data.success) {
        messageApi.success(data.message);
        navigate("/login");
      }
    },
  });

  const changeForgottenPasswordMutation = useMutation({
    mutationFn: changeForgottenPassword,
    onError: (error) => {
      messageApi.error(
        error?.response?.data?.message ||
          "An error occurred, please try again later"
      );
    },
    onSuccess: (data) => {
      if (data.success) {
        messageApi.success(data.message);
        navigate("/login");
      }
    },
  });

  const handleResendOTP = (e) => {
    e.preventDefault();
    resendOTPMutation.mutate(formData.phoneNumber);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { length, uppercase, lowercase, number, specialChar } =
      passwordCriteria;

    if (
      !/^\d+$/.test(formData.phoneNumber) ||
      formData.phoneNumber.length !== 10 ||
      !(
        formData.phoneNumber.startsWith("09") ||
        formData.phoneNumber.startsWith("07")
      )
    ) {
      messageApi.error("Incorrect phone number.");
      return;
    }

    if (!length || !uppercase || !lowercase || !number || !specialChar) {
      messageApi.error("Password does not meet all the criteria.");
      return;
    }

    if (!passwordsMatch) {
      messageApi.error("Passwords don't match.");
      return;
    }

    changeForgottenPasswordMutation.mutate(formData);
  };

  return (
    <>
      {contextHolder}
      <div className="flex justify-center items-start pt-20 p-6 bg-gradient-to-br bg-text/75 w-full h-screen">
        <div className="w-full max-w-sm mx-auto h-fit  bg-white rounded-3xl shadow-lg ">
          <div className="px-6 pt-6">
            <img src="/assets/Asset1.svg" alt="Logo" />
          </div>
          <hr className="border-t-1 border-[#42855b] opacity-20 w-full mt-4 mb-2" />
          <div className="px-6 pb-6">
            <h2 className="text-xl md:text-2xl text-text font-semibold mb-4 text-center">
              {"Change Password"}
            </h2>

            <>
              {" "}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <OTPInput
                  maxLength={6}
                  onChange={(value) => {
                    if (value.length === 6) {
                      setFormData({ ...formData, otp: value });
                    }
                  }}
                  containerClassName="group flex pb-1 w-full justify-center items-center has-[:disabled]:opacity-30"
                  render={({ slots }) => (
                    <>
                      <div className="flex">
                        {slots.slice(0, 1).map((slot, idx) => (
                          <Slot key={idx} {...slot} />
                        ))}
                      </div>

                      <FakeDash />
                      <div className="flex">
                        {slots.slice(1, 2).map((slot, idx) => (
                          <Slot key={idx} {...slot} />
                        ))}
                      </div>

                      <FakeDash />
                      <div className="flex">
                        {slots.slice(2, 3).map((slot, idx) => (
                          <Slot key={idx} {...slot} />
                        ))}
                      </div>

                      <FakeDash />
                      <div className="flex">
                        {slots.slice(3, 4).map((slot, idx) => (
                          <Slot key={idx} {...slot} />
                        ))}
                      </div>

                      <FakeDash />
                      <div className="flex">
                        {slots.slice(4, 5).map((slot, idx) => (
                          <Slot key={idx} {...slot} />
                        ))}
                      </div>

                      <FakeDash />

                      <div className="flex">
                        {slots.slice(5, 6).map((slot, idx) => (
                          <Slot key={idx} {...slot} />
                        ))}
                      </div>
                    </>
                  )}
                />
                <div className="w-full flex items-center justify-center mb-3 space-x-2">
                  <span className="text-xs font-semibold pl-2 text-gray-500">
                    Resend in {formatTime(timeLeft)}
                  </span>
                  <div
                    className={`w-fit h-fit p-1 text-white rounded text-xs font-semibold bg-text cursor-pointer ${
                      isResendDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={isResendDisabled ? null : handleResendOTP}
                  >
                    Resend
                  </div>
                </div>

                <div className="flex flex-col items-start justify-start space-y-1 w-full">
                  <span className="text-xs md:text-sm font-semibold text-[#1a1a1a]">
                    New Password
                  </span>
                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.NewPassword}
                      onFocus={() => setPasswordFocus(true)}
                      onBlur={() => setPasswordFocus(false)}
                      onChange={(e) => {
                        handlePasswordChange(e.target.value);
                      }}
                      className="w-full p-2 border border-[#42855b] rounded focus:outline-none focus:ring-1 focus:ring-text text-xs font-semibold text-[#1a1a1a] bg-text/10"
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-text"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                {passwordFocus && (
                  <div className="space-y-1">
                    {/* Password criteria checks */}
                    <div
                      className={`flex space-x-1 items-center text-xs font-semibold ${
                        passwordCriteria.length
                          ? "text-text"
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
                          ? "text-text"
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
                          ? "text-text"
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
                          ? "text-text"
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
                          ? "text-text"
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
                <div className="flex flex-col items-start justify-start space-y-1 w-full pb-4">
                  <span className="text-xs md:text-sm font-semibold text-[#1a1a1a]">
                    Confirm Password
                  </span>
                  <div className="relative w-full">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      onFocus={() => setConfirmPasswordFocus(true)}
                      onBlur={() => setConfirmPasswordFocus(false)}
                      className="w-full p-2 border border-[#42855b] rounded focus:outline-none focus:ring-1 focus:ring-text text-xs font-semibold text-[#1a1a1a] bg-text/10"
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-text"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {confirmPasswordFocus && (
                      <div className="flex space-x-1 items-center text-xs font-semibold">
                        {passwordsMatch ? (
                          <div className="flex space-x-1 text-text items-center ">
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
                </div>
                <button
                  type="submit"
                  className="w-full px-2 py-1 text-white rounded text-base font-semibold bg-text hover:bg-opacity-75 transition duration-300"
                  disabled={changeForgottenPasswordMutation.isPending}
                  aria-busy={changeForgottenPasswordMutation.isPending}
                >
                  {changeForgottenPasswordMutation.isPending ? (
                    <Spinner size={6} />
                  ) : (
                    "Send"
                  )}
                </button>
              </form>
            </>
          </div>
        </div>
      </div>
    </>
  );
};
function Slot(props) {
  return (
    <div
      className={cn(
        " relative sm:w-10 sm:h-10 w-[36px] h-[36px] sm:text-xl text-text text-lg font-semibold flex items-center justify-center", // Base size and positioning
        "transition-all duration-300", // Smooth transitions
        "border border-text  first:border-l first:rounded-l-md last:rounded-r-md", // Border and rounded corners
        "group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20", // Hover and focus styles
        "outline-0 outline-accent-foreground/20", // Outline styling
        props.isActive && "outline-4 outline-accent-foreground" // Conditional active state
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  );
}

Slot.propTypes = {
  isActive: PropTypes.bool.isRequired,
  char: PropTypes.string,
  hasFakeCaret: PropTypes.bool,
};

// You can emulate a fake textbox caret!
function FakeCaret() {
  return (
    <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div className="w-px h-5 sm:6 bg-text" />
    </div>
  );
}

// Inspired by Stripe's MFA input.
function FakeDash() {
  return (
    <div className="flex sm:w-4 w-3  justify-center items-center">
      <div className="sm:w-2 w-2 h-[2px] rounded-full bg-text bg-border" />
    </div>
  );
}

export default ChangeForgotPassword;
