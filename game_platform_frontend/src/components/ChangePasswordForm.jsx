/* eslint-disable react/prop-types */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../services/userServices";
import Spinner from "./Spinner";
import { FaTimesCircle, FaEyeSlash, FaEye } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import { message } from "antd";

const ChangePasswordForm = ({ set }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);

  const mutation = useMutation({
    mutationFn: changePassword,
    onError: (error) => {
      const errorMsg = error.response?.data?.error || "An error occurred";
      
      messageApi.open({ type: "error", content: errorMsg });
    },
    onSuccess: () => {
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      messageApi.open({ type: "success", content: "Password changed successfully!" });
    },
  });

  const passwordsMatch = formData.newPassword === formData.confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    const { length, uppercase, lowercase, number, specialChar } = passwordCriteria;

    if (!length || !uppercase || !lowercase || !number || !specialChar) {
      messageApi.open({ type: "error", content: "Password does not meet all the criteria." })
      return;
    }

    if (!passwordsMatch) {
      messageApi.open({ type: "error", content: "Passwords don't match." })
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "newPassword") {
      setPasswordCriteria({
        length: value.length >= 6,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        specialChar: /[@$!%*?&]/.test(value),
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-bg/65 rounded-lg shadow-md">
      {contextHolder}
      <h2 className="text-xl font-bold mb-4 text-text text-center">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-col items-start justify-start space-y-1 w-full">
          <span className="text-xs md:text-sm font-semibold text-text">Old Password</span>
          <div className="relative w-full">
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={(e) => {
                handleChange(e);
              }}
              className="w-full p-2 border border-text bg-bgdark rounded focus:border-none focus:ring-2 focus:ring-text focus:outline-none text-xs font-semibold text-text"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-text"
            >
              {showOldPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-start justify-start space-y-1 w-full">
          <span className="text-xs md:text-sm font-semibold text-text">New Password</span>
          <div className="relative w-full">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              onChange={(e) => {
                handleChange(e);
              }}
              className="w-full p-2 border border-text bg-bgdark rounded focus:border-none focus:ring-2 focus:ring-text focus:outline-none text-xs font-semibold text-text"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-text"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {passwordFocus && (
          <div className="space-y-1">
            <PasswordCriteria criteria={passwordCriteria} />
          </div>
        )}

        <div className="flex flex-col items-start justify-start space-y-1 w-full">
          <span className="text-xs md:text-sm font-semibold text-text">Confirm Password</span>
          <div className="relative w-full">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onFocus={() => setConfirmPasswordFocus(true)}
              onBlur={() => setConfirmPasswordFocus(false)}
              onChange={(e) => {
                handleChange(e);
              }}
              className="w-full p-2 border border-text bg-bgdark rounded focus:border-none focus:ring-2 focus:ring-text focus:outline-none text-xs font-semibold text-text"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-text"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {confirmPasswordFocus && (
                    <div className="flex space-x-1 items-center text-xs mt-1 font-semibold">
                      {passwordsMatch ? (
                        <div className="flex space-x-1 text-green-700 items-center">
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

        

        <div className="flex space-x-2">
          <button
            type="submit"
            className={`w-full p-2 text-white rounded text-xs sm:text-sm ${
              !passwordsMatch || formData.oldPassword === "" || formData.newPassword === "" || formData.confirmPassword === ""
                ? "bg-gray-500"
                : "bg-primary"
            }`}
            disabled={
              !passwordsMatch || formData.oldPassword === "" || formData.newPassword === "" || formData.confirmPassword === ""
            }
          >
            {mutation.isLoading ? <Spinner /> : "Change Password"}
          </button>
          <button
            onClick={() => set()}
            className="w-full p-1 flex justify-center text-xs sm:text-sm items-center border-text border-[1px] rounded-md hover:bg-text hover:text-white text-text"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const PasswordCriteria = ({ criteria }) => (
  <>
    <CriteriaItem condition={criteria.length} text="At least 6 characters" />
    <CriteriaItem condition={criteria.uppercase} text="At least one uppercase letter" />
    <CriteriaItem condition={criteria.lowercase} text="At least one lowercase letter" />
    <CriteriaItem condition={criteria.number} text="At least one number" />
    <CriteriaItem condition={criteria.specialChar} text="At least one special character" />
  </>
);

const CriteriaItem = ({ condition, text }) => (
  <div className={`flex space-x-1 items-center text-xs font-semibold ${condition ? "text-green-500" : "text-red-500"}`}>
    {condition ? <BsCheckCircleFill /> : <FaTimesCircle />}
    <p>{text}</p>
  </div>
);

export default ChangePasswordForm;
