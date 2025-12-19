import { useState } from "react";
import { Card, Input, Button, message } from "antd";
import emailjs from "@emailjs/browser";
import { auth, db } from "../../firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { updateEmail } from "firebase/auth";

export default function ChangeEmail() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [otpDocId, setOtpDocId] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;
  const uid = user.uid;
  const oldEmail = user.email;

  /* ================= SEND EMAIL OTP ================= */
  const sendOtpEmail = async (email, code, purpose) => {
    await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        otp: code,
        purpose,
      },
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    );
  };

  /* ================= START FLOW ================= */
  const startOldEmailVerification = async () => {
    try {
      setLoading(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      await sendOtpEmail(oldEmail, code, "Verify current email");

      const ref = await addDoc(collection(db, "otp"), {
        userId: uid,
        purpose: "CHANGE_EMAIL",
        step: "VERIFY_OLD",
        oldOtp: code,
        attempts: 0,
        used: false,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      setOtpDocId(ref.id);
      message.success("OTP sent to your current email");
    } catch (err) {
      message.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OLD EMAIL ================= */
  const verifyOldEmail = async () => {
    try {
      setLoading(true);
      const snap = await getDoc(doc(db, "otp", otpDocId));
      const data = snap.data();

      if (Date.now() > data.expiresAt) {
        message.error("OTP expired");
        return;
      }

      if (otp !== data.oldOtp) {
        message.error("Invalid OTP");
        return;
      }

      setOtp("");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEND NEW EMAIL OTP ================= */
  const sendNewEmailOtp = async () => {
    try {
      setLoading(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      await sendOtpEmail(newEmail, code, "Verify new email");

      await updateDoc(doc(db, "otp", otpDocId), {
        step: "VERIFY_NEW",
        newEmail,
        newOtp: code,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      message.success("OTP sent to new email");
    } catch {
      message.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY NEW EMAIL ================= */
  const verifyNewEmail = async () => {
    try {
      setLoading(true);
      const snap = await getDoc(doc(db, "otp", otpDocId));
      const data = snap.data();

      if (otp !== data.newOtp) {
        message.error("Invalid OTP");
        return;
      }

      await updateEmail(auth.currentUser, newEmail);
      await updateDoc(doc(db, "users", uid), { email: newEmail });
      await deleteDoc(doc(db, "otp", otpDocId));

      message.success("Email updated successfully");
    } catch {
      message.error("Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Change Email"
      style={{ maxWidth: 420, margin: "40px auto" }}
    >
      {step === 1 && (
        <>
          <p>Verify your current email ({oldEmail})</p>

          <Button
            type="primary"
            block
            loading={loading}
            onClick={startOldEmailVerification}
          >
            Send OTP
          </Button>

          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ marginTop: 12 }}
          />

          <Button
            block
            style={{ marginTop: 12 }}
            onClick={verifyOldEmail}
          >
            Verify
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <Input
            placeholder="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />

          <Button
            type="primary"
            block
            loading={loading}
            style={{ marginTop: 12 }}
            onClick={sendNewEmailOtp}
          >
            Send OTP
          </Button>

          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ marginTop: 12 }}
          />

          <Button
            block
            style={{ marginTop: 12 }}
            onClick={verifyNewEmail}
          >
            Confirm Change
          </Button>
        </>
      )}
    </Card>
  );
}