import { useState } from "react";
import { Card, Input, Button, message } from "antd";
import { auth } from "../../firebase";
import { updatePassword } from "firebase/auth";

export default function ChangePasswordOtp() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    try {
      setLoading(true);
      if (password.length < 6) {
        return message.error("Password must be at least 6 characters");
      }

      await updatePassword(auth.currentUser, password);
      message.success("Password updated successfully");
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: "80px auto" }}>
      <h3>Change Password</h3>
      <Input.Password
        placeholder="New password"
        onChange={e => setPassword(e.target.value)}
      />
      <Button
        type="primary"
        block
        loading={loading}
        onClick={changePassword}
        style={{ marginTop: 12 }}
      >
        Update Password
      </Button>
    </Card>
  );
}