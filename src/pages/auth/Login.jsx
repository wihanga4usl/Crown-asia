import { Card, Form, Input, Button, Typography } from "antd";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const { Title } = Typography;
const LOGO = "https://i.ibb.co/FTMm2N9/Untitled-design-7.png";

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      navigate("/ic/dashboard");
    } catch (err) {
      message.error("Invalid login credentials");
    }
  };

  return (
    <div style={styles.page}>
      <Card style={styles.card}>
        <img src={LOGO} alt="logo" style={styles.logo} />

        <Title level={4} style={{ textAlign: "center" }}>
          Login to Crown Asia
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>

          <Button
            type="primary"
            block
            htmlType="submit"
            style={styles.primaryBtn}
          >
            Login
          </Button>

          <Button
            type="link"
            block
            onClick={() => navigate("/register")}
          >
            Create new account
          </Button>
        </Form>
      </Card>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#F6F7FB",
  },
  card: {
    width: 360,
    borderRadius: 16,
  },
  logo: {
    width: 80,
    display: "block",
    margin: "0 auto 12px",
  },
  primaryBtn: {
    background: "linear-gradient(135deg,#F59E0B,#FACC15)",
    border: "none",
  },
};