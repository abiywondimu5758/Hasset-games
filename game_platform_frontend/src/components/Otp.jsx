// import { useState, useEffect, useCallback } from "react";
// import { useMutation } from "@tanstack/react-query";
// import {  resendOTP } from "../services/authServices";
// import { useNavigate, useLocation } from "react-router-dom";
// import Spinner from "./Spinner";
// import { OTPInput } from "input-otp";
// import { cn } from "../helper/cn";
// import PropTypes from "prop-types";
// import { calculateTimeLeft, formatTime } from "../helper/calculateTimeLeft";
// import { message } from "antd";

// const Otp = () => {
//   const location = useLocation();
//   const phoneNumber = location.state?.phoneNumber;
//   const username = location.state?.username;
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [error, setError] = useState(null);

//   const [otp, setOTP] = useState(null);
//   const navigate = useNavigate();

//   const [messageApi, contextHolder] = message.useMessage();

//   const RESEND_OTP_KEY = "otpCountdownEndTime"; // Key for localStorage
//   const COUNTDOWN_DURATION = 240; // 3 minutes in seconds

//   const [timeLeft, setTimeLeft] = useState(0);
//   const [isResendDisabled, setIsResendDisabled] = useState(true);

//   const showSuccess = useCallback(
//     (success) => {
//       messageApi.open({
//         type: "success",
//         content: success,
//       });
//     },
//     [messageApi]
//   );

//   useEffect(() => {
//     // Retrieve the stored end time from localStorage
//     const storedEndTime = localStorage.getItem(RESEND_OTP_KEY);

//     let endTime = 0;

//     if (storedEndTime) {
//       endTime = parseInt(storedEndTime, 10);
//     } else {
//       // If no end time is stored, set it to 3 minutes from now
//       endTime = new Date().getTime() + COUNTDOWN_DURATION * 1000;
//       localStorage.setItem(RESEND_OTP_KEY, endTime.toString());
//     }

//     // Calculate initial time left
//     const initialTimeLeft = calculateTimeLeft(endTime);
//     setTimeLeft(initialTimeLeft);

//     // Set the resend button state based on initial time left
//     setIsResendDisabled(initialTimeLeft > 0);

//     // Set up interval to update countdown every second
//     const timer = setInterval(() => {
//       const updatedTimeLeft = calculateTimeLeft(endTime);
//       setTimeLeft(updatedTimeLeft);

//       if (updatedTimeLeft <= 0) {
//         setIsResendDisabled(false);
//         clearInterval(timer);
//         localStorage.removeItem(RESEND_OTP_KEY);
//       }
//     }, 1000);

//     // Clean up the interval on component unmount
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     if (successMessage) {
//       showSuccess(successMessage);
//     }
//   }, [successMessage, showSuccess]);

//   const resendOTPMutation = useMutation({
//     mutationFn: resendOTP,
//     onError: (error) => {
//       if (error.response) {
//         setError(error.response.data.message);
//       } else {
//         setError("Network error. Please try again.");
//       }
//     },
//     onSuccess: (data) => {
//       if (data.success) {
//         setError(null);
//         setSuccessMessage(data.message);
//       }
//     },
//   });
//   // const verifyOTPMutation = useMutation({
//   //   mutationFn: verifyOTP,
//   //   onError: (error) => {
//   //     if (error.response) {
//   //       setError(error.response.data.message);
//   //     } else {
//   //       setError("Network error. Please try again.");
//   //     }
//   //   },
//   //   onSuccess: (data) => {
//   //     if (data.success) {
//   //       setSuccessMessage(data.message);
//   //     }
//   //     navigate("/login");
//   //   },
//   // });

//   const handleResendOTP = async (e) => {
//     e.preventDefault();

//     try {
//       e.preventDefault();
//       resendOTPMutation.mutate(phoneNumber);

//       // Reset countdown
//       const newEndTime = new Date().getTime() + COUNTDOWN_DURATION * 1000;
//       localStorage.setItem(RESEND_OTP_KEY, newEndTime.toString());
//       setTimeLeft(COUNTDOWN_DURATION);
//       setIsResendDisabled(true);
//     // eslint-disable-next-line no-unused-vars
//     } catch (error) {
//       // console.error("Error resending OTP:", error);
//     }
//   };
//   const handlVerify = (e) => {
//     e.preventDefault();
//     // verifyOTPMutation.mutate({ identifier: phoneNumber? phoneNumber: username, otp: otp });
//     console.log('sent')
//   };

//   return (
//     <>
//       {contextHolder}
//       <div className="flex justify-center items-center p-6 bg-[#1c6758]/75 w-full h-screen">
//         <div className="w-full max-w-sm mx-auto h-fit bg-white rounded-3xl shadow-lg ">
//           <div className="px-6 pt-6">
//             <img src="/assets/Asset1.svg" alt="Logo" />
//           </div>
//           <hr className="border-t-1 border-[#42855b] opacity-20 w-full mt-4 mb-2" />
//           <div className="px-6 pb-6">
//             <h2 className="text-xl md:text-2xl text-[#1c6758] font-semibold mb-4 text-center">
//               {"OTP"}
//             </h2>

//             <>
//               <div className="w-full flex flex-col items-center space-y-2 text-[#263238] mt-12">
//                 <span className="text-xs sm:text-sm font-semibold pl-2 mb-3">
//                   Please enter the code sent to your phone number
//                 </span>

//                 <OTPInput
//                   maxLength={6}
//                   onChange={(value) => {
//                     if (value.length === 6) {
//                       setOTP(value);
//                     }
//                   }}
//                   containerClassName="group flex pb-1 w-full justify-center items-center has-[:disabled]:opacity-30"
//                   render={({ slots }) => (
//                     <>
//                       <div className="flex">
//                         {slots.slice(0, 1).map((slot, idx) => (
//                           <Slot key={idx} {...slot} />
//                         ))}
//                       </div>

//                       <FakeDash />
//                       <div className="flex">
//                         {slots.slice(1, 2).map((slot, idx) => (
//                           <Slot key={idx} {...slot} />
//                         ))}
//                       </div>

//                       <FakeDash />
//                       <div className="flex">
//                         {slots.slice(2, 3).map((slot, idx) => (
//                           <Slot key={idx} {...slot} />
//                         ))}
//                       </div>

//                       <FakeDash />
//                       <div className="flex">
//                         {slots.slice(3, 4).map((slot, idx) => (
//                           <Slot key={idx} {...slot} />
//                         ))}
//                       </div>

//                       <FakeDash />
//                       <div className="flex">
//                         {slots.slice(4, 5).map((slot, idx) => (
//                           <Slot key={idx} {...slot} />
//                         ))}
//                       </div>

//                       <FakeDash />

//                       <div className="flex">
//                         {slots.slice(5, 6).map((slot, idx) => (
//                           <Slot key={idx} {...slot} />
//                         ))}
//                       </div>
//                     </>
//                   )}
//                 />
//                 <div className="w-full flex items-center justify-center mb-3 space-x-2">
//                   <span className="text-xs font-semibold pl-2 text-gray-500">
//                     Resend in {formatTime(timeLeft)}
//                   </span>
//                   <div
//                     className={`w-fit h-fit p-1 text-white rounded text-xs font-semibold bg-[#1c6758] cursor-pointer ${
//                       isResendDisabled ? "opacity-50 cursor-not-allowed" : ""
//                     }`}
//                     onClick={isResendDisabled ? null : handleResendOTP}
//                   >
//                     Resend
//                   </div>
//                 </div>
//                 <div className="flex justify-center pt-16 w-full">
//                   <button
//                     className="w-full px-2 py-1 text-white rounded text-base font-semibold bg-[#1c6758] hover:bg-opacity-75 transition duration-300"
//                     onClick={(e) => handlVerify(e)}
//                     disabled={verifyOTPMutation.isPending}
//                     aria-busy={verifyOTPMutation.isPending}
//                   >
//                     {verifyOTPMutation.isPending ? (
//                       <Spinner size={6} />
//                     ) : (
//                       "Verify"
//                     )}
//                   </button>
//                 </div>
//                 {error && (
//                   <div className="flex p-1 items-center justify-center text-xs md:text-sm font-medium text-red-500 bg-red-100 border border-red-500 rounded">
//                     {error}
//                   </div>
//                 )}
//               </div>
//             </>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
// function Slot(props) {
//   return (
//     <div
//       className={cn(
//         " relative sm:w-10 sm:h-10 w-[36px] h-[36px] sm:text-xl text-[#1c6758] text-lg font-semibold flex items-center justify-center", // Base size and positioning
//         "transition-all duration-300", // Smooth transitions
//         "border border-[#1c6758]  first:border-l first:rounded-l-md last:rounded-r-md", // Border and rounded corners
//         "group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20", // Hover and focus styles
//         "outline-0 outline-accent-foreground/20", // Outline styling
//         props.isActive && "outline-4 outline-accent-foreground" // Conditional active state
//       )}
//     >
//       {props.char !== null && <div>{props.char}</div>}
//       {props.hasFakeCaret && <FakeCaret />}
//     </div>
//   );
// }

// Slot.propTypes = {
//   isActive: PropTypes.bool.isRequired,
//   char: PropTypes.string,
//   hasFakeCaret: PropTypes.bool,
// };

// // You can emulate a fake textbox caret!
// function FakeCaret() {
//   return (
//     <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
//       <div className="w-px h-5 sm:6 bg-[#1c6758]" />
//     </div>
//   );
// }

// // Inspired by Stripe's MFA input.
// function FakeDash() {
//   return (
//     <div className="flex sm:w-4 w-3  justify-center items-center">
//       <div className="sm:w-2 w-2 h-[2px] rounded-full bg-[#1c6758] bg-border" />
//     </div>
//   );
// }

// export default Otp;
