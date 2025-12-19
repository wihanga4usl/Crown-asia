import { useState } from "react";
import {
  Card,
  Input,
  Button,
  message,
  Form,
  Alert,
} from "antd";
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

export default function BankOtp() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpDocId, setOtpDocId] = useState(null);

  const user = auth.currentUser;
  const uid = user.uid;
  const email = user.email;

  /* ================= SEND EMAIL OTP ================= */
  const sendOtpEmail = async (code) => {
    await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        otp: code,
        purpose: "Verify bank details update",
      },
      process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    );
  };

  /* ================= START OTP ================= */
  const startOtp = async () => {
    try {
      setLoading(true);

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await sendOtpEmail(code);

      const ref = await addDoc(collection(db, "otp"), {
        userId: uid,
        purpose: "BANK_DETAILS",
        otp: code,
        used: false,
        attempts: 0,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      setOtpDocId(ref.id);
      setStep(2);
      message.success("OTP sent to your email");
    } catch {
      message.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    try {
      setLoading(true);
      const snap = await getDoc(doc(db, "otp", otpDocId));
      const data = snap.data();

      if (!data || data.used) {
        message.error("Invalid OTP");
        return;
      }

      if (Date.now() > data.expiresAt) {
        message.error("OTP expired");
        return;
      }

      if (otp !== data.otp) {
        message.error("Incorrect OTP");
        return;
      }

      await updateDoc(doc(db, "otp", otpDocId), {
        used: true,
      });

      setStep(3);
      message.success("OTP verified");
    } catch {
      message.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAVE BANK DETAILS ================= */
  const saveBank = async (values) => {
    try {
      setLoading(true);

      await updateDoc(doc(db, "users", uid), {
        bank: values,
      });

      await deleteDoc(doc(db, "otp", otpDocId));

      message.success("Bank details saved successfully");
    } catch {
      message.error("Failed to save bank details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Secure Bank Details"
      style={{ maxWidth: 420, margin: "40px auto" }}
    >
      {step === 1 && (
        <>
          <Alert
            message="Email verification required"
            description={`We will send a verification code to ${email}`}
            type="info"
            showIcon
          />

          <Button
            type="primary"
            block
            style={{ marginTop: 16 }}
            loading={loading}
            onClick={startOtp}
          >
            Send OTP
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Button
            block
            type="primary"
            style={{ marginTop: 12 }}
            loading={loading}
            onClick={verifyOtp}
          >
            Verify OTP
          </Button>
        </>
      )}

      {step === 3 && (
        <Form layout="vertical" onFinish={saveBank}>
          <Form.Item
            label="Bank Name"
            name="bankName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Account Name"
            name="accountName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Account Number"
            name="accountNumber"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Button
            type="primary"
            block
            htmlType="submit"
            loading={loading}
          >
            Save Bank Details
          </Button>
        </Form>
      )}
    </Card>
  );
}