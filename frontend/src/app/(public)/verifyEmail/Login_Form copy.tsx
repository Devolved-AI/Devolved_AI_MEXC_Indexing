"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./Login_Form.module.css";
import Image from "next/image";
import newLogo from "@/logos/logo-2.png";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import Cookies from 'js-cookie';
import toast from "react-hot-toast";
import Link from "next/link";
import { verify } from "@/app/var";

type Inputs = {
  password: string;
  otp: string;
  userEmail: string;
};

interface LoginFormProps {
  email: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ email }) => {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>("");
  const emailCookie = Cookies.get('email');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    setError(params.get("error"));
  }, [params]);

  useEffect(() => {
    // On component mount, initialize the timer from localStorage
    const storedTime = localStorage.getItem("timeLeft");
    if (storedTime) {
      setTimeLeft(parseInt(storedTime, 10));
    }

    // Update the timer every second
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          const newTime = prevTime - 1;
          localStorage.setItem("timeLeft", newTime.toString()); // Save updated time to localStorage
          return newTime;
        } else {
          clearInterval(intervalId);
          return 0; // Ensure the timer stops at 0
        }
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);


  return (

    <div>
      <section>
        <div className="flex flex-col items-center justify-center px-6 mx-auto h-screen md:h-screen lg:py-0">
          <div className="w-full bg-white lg:rounded-lg lg:shadow dark:border sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <Image priority src={newLogo} alt="Logo" width={120} height={80} quality={70} className="mx-auto" />
              <h1 className="text-4xl pb-0 mb-0 font-bold text-center leading-none tracking-tight text-gray-900 md:text-4xl">
                Argochain Scanner verify OTP
                <br />

              </h1>


              <form
                autoComplete="off"
                className={`${styles.form_container} flex justify-center items-center flex-col `}
              >
                <fieldset className="w-full px-2 flex justify-center items-center flex-col">
                  <label className="w-full text-[#253241] text-[1rem]" htmlFor="email">
                    Your Email
                  </label>
                  <div className="w-full flex items-center border-solid border-[1px] border-[#EAECEF] bg-gray-50 rounded-lg">
                    <input
                      value={email}
                      disabled={true}
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
                        maxLength={1} // Ensures single character per input
                        value={value || ""}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace") {
                            const updatedOtp = [...otp];
                            updatedOtp[index] = ""; // Clear the current input
                            setOtp(updatedOtp);

                            // Move focus to the previous input
                            if (index > 0) {
                              document.getElementById(`otp-${index - 1}`)?.focus();
                            }
                          }
                        }}
                        // onPaste={handleOtpPaste}
                        className="lg:w-10 lg:h-10 w-6 h-8 text-center justify-between mr-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-medium"
                      />
                    ))}

                    {timeLeft > 0 ? (
                      <div className="mx-1 px-2 text-white bg-[#0D0D0D] text-base rounded">
                        <p>
                          {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}
                        </p>
                      </div>
                    ) : (
                      <button
                        // onClick={resendOTP}
                        className="mx-2 text-right p-1 text-[#5F5F5F] hover:text-[#0D0D0D] text-sm rounded-lg"
                      >
                        Resend
                      </button>
                    )}
                  </div>
                </fieldset>

                <div className="flex flex-col justify-center w-full items-center px-2">
                  {isSubmitting ? "Verifying..." : ""}
                </div>
                <div className="h-2">
                  {error && <small className="block w-full px-2 text-red-600">{error}</small>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginForm;
