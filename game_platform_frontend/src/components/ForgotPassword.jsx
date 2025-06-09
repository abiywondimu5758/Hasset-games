import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

import { message, Tooltip } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    otp: null,
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [showPhoneNumberToolTip, setShowPhoneNumberToolTip] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onError: (error) => {
      messageApi.error(
        error?.response?.data?.message ||
          "An error occurred, please try again later"
      );
    },
    onSuccess: (data) => {
      if (data.success) {
        messageApi.success(data.message);
        navigate("/changeforgotpassword", {
          state: { phoneNumber: formData.phoneNumber },
        });
      }
    },
  });

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowPhoneNumberToolTip(false);
    if (formData.phoneNumber.length === 0) {
      setShowPhoneNumberToolTip(true);

      return;
    }
    forgotPasswordMutation.mutate(formData.phoneNumber);
  };
  return (
    <>
      {contextHolder}
      <div className="flex justify-center items-start pt-20 p-6 bg-gradient-to-br bg-[#1c6758]/75 w-full h-screen">
        <div className="w-full max-w-sm mx-auto h-fit  bg-white rounded-3xl shadow-lg ">
          <div className="px-6 pt-6">
            <img src="/assets/Asset1.svg" alt="Logo" />
          </div>
          <hr className="border-t-1 border-[#42855b] opacity-20 w-full mt-4 mb-2" />
          <div className="px-6 pb-6">
          <div className="flex justify-start items-center space-x-16 mb-4">
            <div className="flex justify-start mb-4">
              <button
                className="flex items-center text-[#1c6758] hover:text-[#42855b] transition duration-300"
                onClick={() => navigate("/login")}
              >
                <ArrowLeftOutlined className="mr-2 font-extraBold" />
                
              </button>
            </div>
            <h2 className="text-xl md:text-2xl text-[#1c6758] font-semibold mb-4 text-center">
              {"Forgot Password"}
            </h2>
</div>
            <>
              <div className="w-full flex flex-col items-center space-y-6 text-[#263238] pt-2">
                <div className="flex flex-col items-start justify-start space-y-1 w-full">
                  <label
                    htmlFor="Phone Number"
                    className="text-xs md:text-sm font-semibold text-[#1a1a1a]"
                  >
                    Phone Number
                  </label>
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
                        id="PhoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) {
                            setFormData({ ...formData, phoneNumber: value });
                          }
                        }}
                        className="w-full p-2 border border-[#42855b] rounded focus:outline-none focus:ring-1 focus:ring-[#1c6758] text-xs font-semibold text-[#1a1a1a] bg-[#1c6758]/10"
                        aria-required="true"
                      />
                    </div>
                  </Tooltip>
                </div>

                <div className="flex justify-center pt-2 w-full">
                  <button
                    className="w-full px-2 py-1 text-white rounded text-base font-semibold bg-[#1c6758] hover:bg-opacity-75 transition duration-300"
                    disabled={forgotPasswordMutation.isPending}
                    aria-busy={forgotPasswordMutation.isPending}
                    onClick={(e) => handleForgotPassword(e)}
                  >
                    {forgotPasswordMutation.isPending ? (
                      <Spinner size={6} />
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </div>
              </div>
            </>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
