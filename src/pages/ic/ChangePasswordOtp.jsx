import { useState } from "react";
import { Card, Input, Button, message } from "antd";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { sendPasswordOtp } from "../../services/passwordOtpService";

export default function ChangePasswordOtp() {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const sendOtp = async () => {
    try {
      await sendPasswordOtp();
      setOtpSent(true);
      message.success("OTP sent to your email");
    } catch {
      message.error("Failed to send OTP");
    }
  };

  const verifyAndChange = async () => {
    try {
      const uid = auth.currentUser.uid;
      const ref = doc(db, "passwordOtps", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) throw new Error();

      const data = snap.data();

      if (data.used) throw new Error("OTP already used");
      if (Date.now() > data.expiresAt) throw new Error("OTP expired");
      if (otp !== data.otp) throw new Error("Invalid OTP");

      // 🔐 RE-AUTHENTICATE
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      // 🔑 UPDATE PASSWORD
      await updatePassword(auth.currentUser, newPassword);

      await deleteDoc(ref);

      message.success("Password changed successfully");
    } catch {
      message.error("OTP or password invalid");
    }
  };

  return (
    <div style={{ padding: 24, background: "#F6F7FB", minHeight: "100vh" }}>
      <Card title="Change Password (OTP)" style={{ maxWidth: 420, margin: "auto" }}>
        {!otpSent ? (
          <Button type="primary" block onClick={sendOtp}>
            Send OTP to Email
          </Button>
        ) : (
          <>
            <Input.Password
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ marginBottom: 12 }}
            />

            <Input
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ marginBottom: 12 }}
            />

            <Input.Password
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ marginBottom: 12 }}
            />

            <Button type="primary" block onClick={verifyAndChange}>
              Change Password
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}