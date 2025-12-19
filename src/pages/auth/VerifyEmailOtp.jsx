import { useState } from "react";
import { Card, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";

export default function VerifyEmailOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const data = JSON.parse(sessionStorage.getItem("regData"));

  const verify = async () => {
    try {
      const res = await fetch("/.netlify/functions/verifyEmailOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, otp }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Invalid OTP");

      message.success("Email verified");
      navigate("/verify-phone");
    } catch (e) {
      message.error(e.message);
    }
  };

  return (
    <Card style={{ maxWidth: 380, margin: "100px auto" }}>
      <h3>Email Verification</h3>
      <Input placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
      <Button type="primary" block onClick={verify} style={{ marginTop: 12 }}>
        Verify Email OTP
      </Button>
    </Card>
  );
}