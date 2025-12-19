import { useState } from "react";
import { Card, Input, Button, message, Steps } from "antd";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const { Step } = Steps;

export default function Register() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    password: "",
  });

  const [otp, setOtp] = useState("");

  /* ================= SEND EMAIL OTP ================= */
  const sendEmailOtp = async () => {
    if (!form.email) {
      return message.error("Email is required");
    }

    try {
      setLoading(true);

      const res = await fetch("/.netlify/functions/sendEmailOtpBrevo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      if (!res.ok) {
        throw new Error("Failed to send email OTP");
      }

      message.success("OTP sent to your email");
      setStep(1);
    } catch (e) {
      console.error(e);
      message.error("Failed to send email OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP + CREATE ACCOUNT ================= */
  const verifyOtpAndRegister = async () => {
    if (!otp) {
      return message.error("Please enter OTP");
    }

    try {
      setLoading(true);

      // 1️⃣ Verify OTP
      const verifyRes = await fetch("/.netlify/functions/verifyEmailOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          otp,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error("Invalid OTP");
      }

      // 2️⃣ Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // 3️⃣ Create user profile
      await setDoc(doc(db, "users", cred.user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        address: form.address,
        role: "IC",
        kycStatus: "NOT_SUBMITTED",
        wallet: 0,
        createdAt: serverTimestamp(),
      });

      message.success("Account created successfully");
      setStep(2);
    } catch (e) {
      console.error(e);
      message.error(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Card style={{ maxWidth: 480, margin: "60px auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        Create Account
      </h2>

      <Steps current={step} size="small" style={{ marginBottom: 30 }}>
        <Step title="Details" />
        <Step title="Verify Email" />
        <Step title="Done" />
      </Steps>

      {/* STEP 1 — USER DETAILS */}
      {step === 0 && (
        <>
          <Input
            placeholder="First Name"
            style={{ marginBottom: 10 }}
            onChange={(e) =>
              setForm({ ...form, firstName: e.target.value })
            }
          />

          <Input
            placeholder="Last Name"
            style={{ marginBottom: 10 }}
            onChange={(e) =>
              setForm({ ...form, lastName: e.target.value })
            }
          />

          <Input
            placeholder="Email"
            style={{ marginBottom: 10 }}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <Input
            placeholder="Phone Number"
            style={{ marginBottom: 10 }}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <Input
            type="date"
            style={{ marginBottom: 10 }}
            onChange={(e) =>
              setForm({ ...form, dob: e.target.value })
            }
          />

          <Input
            placeholder="Address"
            style={{ marginBottom: 10 }}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          <Input.Password
            placeholder="Password"
            style={{ marginBottom: 20 }}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <Button
            type="primary"
            block
            loading={loading}
            onClick={sendEmailOtp}
          >
            Send Email OTP
          </Button>
        </>
      )}

      {/* STEP 2 — OTP VERIFY */}
      {step === 1 && (
        <>
          <Input
            placeholder="Enter Email OTP"
            style={{ marginBottom: 20 }}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Button
            type="primary"
            block
            loading={loading}
            onClick={verifyOtpAndRegister}
          >
            Verify OTP & Create Account
          </Button>
        </>
      )}

      {/* STEP 3 — DONE */}
      {step === 2 && (
        <div style={{ textAlign: "center" }}>
          <h3>🎉 Registration Successful</h3>
          <p>You can now log in and submit KYC.</p>

          <Button type="primary" href="/login">
            Go to Login
          </Button>
        </div>
      )}
    </Card>
  );
}