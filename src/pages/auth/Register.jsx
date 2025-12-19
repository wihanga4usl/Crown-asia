import { useState } from "react";
import { Card, Input, Button, DatePicker, message } from "antd";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
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

  const change = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const sendEmailOtp = async () => {
    const { firstName, lastName, email, phone, dob, address, password } = form;

    if (!firstName || !lastName || !email || !phone || !dob || !address || !password) {
      return message.error("Please fill all fields");
    }

    try {
      setLoading(true);

      // Save registration data temporarily
      sessionStorage.setItem("regData", JSON.stringify(form));

      const res = await fetch("/.netlify/functions/sendEmailOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to send email OTP");

      message.success("Email OTP sent");
      navigate("/verify-email");
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 420, margin: "80px auto" }}>
      <h2>Create Account</h2>

      <Input placeholder="First Name" name="firstName" onChange={change} />
      <Input placeholder="Last Name" name="lastName" onChange={change} />
      <Input placeholder="Email" name="email" onChange={change} />
      <Input placeholder="Phone (07XXXXXXXX)" name="phone" onChange={change} />

      <DatePicker
        style={{ width: "100%", marginTop: 8 }}
        onChange={(_, d) => setForm({ ...form, dob: d })}
      />

      <Input.TextArea
        placeholder="Address"
        name="address"
        onChange={change}
      />

      <Input.Password
        placeholder="Password"
        name="password"
        onChange={change}
      />

      <Button
        type="primary"
        block
        loading={loading}
        onClick={sendEmailOtp}
        style={{ marginTop: 12 }}
      >
        Verify Email
      </Button>
    </Card>
  );
}