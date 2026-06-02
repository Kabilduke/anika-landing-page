import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";    
import "./OtpVerify.css";
import otpImg from "../assets/sign/welcome.png";

export default function OtpVerify() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const location = useLocation();         
  const email = location.state?.email;
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      alert("Please enter all 6 digits.");
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Login successful!");
      console.log(data);
      navigate("/profile");
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert(error.message);
    } else {
      alert("OTP resent!");
    }
  };

  return (
    <div className="otp-page">

      <div className="otp-left">
        <img src={otpImg} alt="OTP Image" />
      </div>

      <div className="otp-right">
        <div className="otp-form-wrapper">

          <h1 className="otp-title">Enter OTP</h1>
          <p className="otp-subtitle">
            6-digit code sent to {email ?? "your email"}  {/* ← dynamic email */}
          </p>

          <div className="otp-boxes">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-box"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          <button className="otp-btn-verify" onClick={handleVerify}>
            Verify
          </button>

          <p className="otp-resend-text">
            Resend OTP Now!{" "}
            <button 
              className="otp-resend-link"
              onClick={handleResend}
            >
              Click Here
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}