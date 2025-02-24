"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./Login_Form.module.css";
import Image from "next/image";
import newLogo from "@/logos/logo-2.png";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { authEmail, verify } from "@/app/var"; // Your API endpoints

interface LoginFormProps {
  email: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ email }) => {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);

  // Set error from URL params
  useEffect(() => {
    setError(params.get("error"));
  }, [params]);

  // Timer: initialize and update every second. If no valid stored time, reset to 180.
  useEffect(() => {
    const storedTime = localStorage.getItem("timeLeft");
    if (!storedTime || parseInt(storedTime, 10) <= 0) {
      setTimeLeft(180);
      localStorage.setItem("timeLeft", "180");
    } else {
      setTimeLeft(parseInt(storedTime, 10));
    }
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          const newTime = prevTime - 1;
          localStorage.setItem("timeLeft", newTime.toString());
          return newTime;
        } else {
          clearInterval(intervalId);
          return 0;
        }
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Auto-verify when all OTP fields are filled
  useEffect(() => {
    if (otp.every((digit) => digit !== "") && !isSubmitting) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Verify OTP function
  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== otp.length) {
      toast.error("Please enter complete OTP.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(verify, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await response.json();
      if (data.success) {
        Cookies.set("access_token", data.user.token, { expires: 29 });
        toast.success("OTP verified successfully!");
        router.push("/myaccount");
      } else {
        toast.error(data.message || "OTP verification failed.");
      }
    } catch (err) {
      toast.error("An error occurred during OTP verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle each OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9a-zA-Z]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  // Allow full OTP paste into one field
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().replace(/[^0-9a-zA-Z]/g, "");
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < otp.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    if (newOtp.every((digit) => digit !== "")) {
      handleVerify();
    }
  };

  // Resend OTP: call authEmail API, show toast, reset countdown and clear OTP
  const handleResend = async () => {
    try {
      const response = await fetch(authEmail, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("OTP has been resent to your email.");
        setTimeLeft(180);
        localStorage.setItem("timeLeft", "180");
        setOtp(Array(6).fill(""));
      } else {
        toast.error(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      toast.error("An error occurred while resending OTP.");
    }
  };

  return (
    <div>
      <section>
        <div className="flex flex-col items-center justify-center px-6 mx-auto h-screen md:h-screen lg:py-0">
          <div className="w-full bg-white lg:rounded-lg lg:shadow dark:border sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <Image
                priority
                src={newLogo}
                alt="Logo"
                width={120}
                height={80}
                quality={70}
                className="mx-auto"
              />
              <h1 className="text-4xl pb-0 mb-0 font-bold text-center leading-none tracking-tight text-gray-900 md:text-4xl">
                Argochain Scanner verify OTP
              </h1>

              <form autoComplete="off" className={`${styles.form_container} flex justify-center items-center flex-col`}>
                <fieldset className="w-full px-2 flex justify-center items-center flex-col">
                  <label className="w-full text-[#253241] text-[1rem]" htmlFor="email">
                    Your Email
                  </label>
                  <div className="w-full flex items-center border border-[#EAECEF] bg-gray-50 rounded-lg">
                    <input
                      value={email}
                      disabled
                      placeholder="Email"
                      className="w-full px-4 py-3 bg-gray-50 text-gray-900 focus:outline-none"
                    />
                  </div>
                </fieldset>

                <fieldset className="w-full px-2 flex justify-center items-center flex-col">
                  <label className="w-full text-[#253241] text-[1rem]" htmlFor="otp">
                    OTP
                  </label>
                  <div className="w-full flex items-center rounded-md">
                    {otp.map((value, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={value}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace") {
                            const updatedOtp = [...otp];
                            updatedOtp[index] = "";
                            setOtp(updatedOtp);
                            if (index > 0) {
                              document.getElementById(`otp-${index - 1}`)?.focus();
                            }
                          }
                        }}
                        onPaste={handleOtpPaste}
                        className="lg:w-10 lg:h-10 w-6 h-8 text-center mr-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-medium"
                      />
                    ))}

                    {timeLeft > 0 ? (
                      <div className="mx-1 px-2 text-white bg-[#0D0D0D] text-base rounded">
                        <p>
                          {Math.floor(timeLeft / 60)}:
                          {("0" + (timeLeft % 60)).slice(-2)}
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="mx-2 text-right p-1 text-[#5F5F5F] hover:text-[#0D0D0D] text-sm rounded-lg"
                      >
                        Resend
                      </button>
                    )}
                  </div>
                </fieldset>

                <div className="flex flex-col justify-center w-full items-center px-2">
                  {isSubmitting && "Verifying..."}
                </div>
                <div className="h-2">
                  {error && <small className="block w-full px-2 text-red-600">{error}</small>}
                </div>
                {/* Removed the manual Verify OTP button */}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginForm;
