import { useState, useEffect } from "react";
import { Card, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function VerifyPhoneOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const data = JSON.parse(sessionStorage.getItem("regData"));

  useEffect(() => {
    sendPhoneOtp();
  }, []);

  const sendPhoneOtp = async () => {
    await fetch("/.netlify/functions/sendPhoneOtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: data.phone }),
    });
  };

  const verifyAndCreate = async () => {
    try {
      const res = await fetch("/.netlify/functions/verifyPhoneOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: data.phone, otp }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      // Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Create Firestore user document
      await setDoc(doc(db, "users", cred.user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        address: data.address,

        role: "IC",
        kycStatus: "NOT_SUBMITTED",
        emailVerified: true,
        phoneVerified: true,
        wallet: 0,
        createdAt: new Date(),
      });

      sessionStorage.clear();
      message.success("Account created successfully");
      navigate("/ic/dashboard");
    } catch (e) {
      message.error(e.message);
    }
  };

  return (
    <Card style={{ maxWidth: 380, margin: "100px auto" }}>
      <h3>Phone Verification</h3>
      <Input placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
      <Button type="primary" block onClick={verifyAndCreate} style={{ marginTop: 12 }}>
        Verify Phone OTP
      </Button>
    </Card>
  );
}