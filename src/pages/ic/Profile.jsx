import { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Row,
  Col,
  Button,
  Tag,
  Form,
  Input,
  message,
  Divider,
  Upload,
  Modal,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import axios from "axios";

/* ================= BRAND COLORS ================= */
const BRAND = {
  primary: "#F5A623",
  light: "#FFF6E5",
  dark: "#1F1F1F",
  gray: "#8C8C8C",
};

const IMGBB_KEY = process.env.REACT_APP_IMGBB_API_KEY;

export default function IcProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  /* PHOTO */
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  /* PHONE OTP */
  const [phoneModal, setPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(1);
  const [otpLoading, setOtpLoading] = useState(false);

  const uid = auth.currentUser?.uid;

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line
  }, []);

  const loadProfile = async () => {
    if (!uid) return;
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) setUser(snap.data());
    } catch {
      message.error("Failed to load profile");
    }
  };

  /* ================= UPDATE BASIC PROFILE ================= */
  const updateProfile = async (values) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", uid), values);
      message.success("Profile updated");
      loadProfile();
    } catch {
      message.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPLOAD PROFILE PHOTO ================= */
  const uploadProfilePhoto = async () => {
    if (!photo) return message.error("Select a photo first");

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", photo);

      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
        fd
      );

      await updateDoc(doc(db, "users", uid), {
        profilePhotoUrl: res.data.data.url,
      });

      message.success("Profile photo updated");
      setPhoto(null);
      loadProfile();
    } catch {
      message.error("Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ================= SEND PHONE OTP ================= */
  const sendPhoneOtp = async () => {
    if (!newPhone) return message.error("Enter phone number");

    try {
      setOtpLoading(true);
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      await setDoc(doc(db, "phoneOtps", uid), {
        phone: newPhone,
        otp: otpCode,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      await fetch("/.netlify/functions/sendPhoneOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone, otp: otpCode }),
      });

      setOtpStep(2);
      message.success("OTP sent to phone");
    } catch {
      message.error("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  /* ================= VERIFY PHONE OTP ================= */
  const verifyPhoneOtp = async () => {
    try {
      setOtpLoading(true);
      const ref = doc(db, "phoneOtps", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) return message.error("OTP expired");

      const data = snap.data();
      if (data.otp !== otp) return message.error("Invalid OTP");

      await updateDoc(doc(db, "users", uid), { phone: newPhone });
      await deleteDoc(ref);

      message.success("Phone number updated");
      setPhoneModal(false);
      setOtp("");
      setNewPhone("");
      setOtpStep(1);
      loadProfile();
    } catch {
      message.error("OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={styles.page}>
      {/* ================= PROFILE HERO ================= */}
      <Card style={styles.heroCard} bordered={false}>
        <Avatar
          size={96}
          src={user.profilePhotoUrl}
          icon={<UserOutlined />}
          style={styles.avatar}
        />

        <h2>{user.firstName} {user.lastName}</h2>

        <Tag color="gold">Investment Consultant</Tag>
        <Tag color={user.kycStatus === "APPROVED" ? "green" : "orange"}>
          KYC {user.kycStatus}
        </Tag>

        <Upload
          beforeUpload={(file) => {
            setPhoto(file);
            return false;
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} style={styles.uploadBtn}>
            Change Photo
          </Button>
        </Upload>

        {photo && (
          <Button
            loading={uploading}
            onClick={uploadProfilePhoto}
            style={styles.primaryBtn}
          >
            Upload Photo
          </Button>
        )}
      </Card>

      {/* ================= PERSONAL INFO ================= */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Personal Information" style={styles.card}>
            <Form
              layout="vertical"
              initialValues={user}
              onFinish={updateProfile}
            >
              <Form.Item label="First Name" name="firstName">
                <Input />
              </Form.Item>
              <Form.Item label="Last Name" name="lastName">
                <Input />
              </Form.Item>
              <Form.Item label="Address" name="address">
                <Input.TextArea rows={2} />
              </Form.Item>

              <Button
                htmlType="submit"
                loading={loading}
                style={styles.primaryBtn}
              >
                Save Changes
              </Button>
            </Form>
          </Card>
        </Col>

        {/* ================= CONTACT ================= */}
        <Col xs={24}>
          <Card title="Contact Information" style={styles.card}>
            <Input
              prefix={<MailOutlined />}
              value={user.email}
              disabled
            />
            <Divider />
            <Input
              prefix={<PhoneOutlined />}
              value={user.phone}
              disabled
            />
            <Button
              type="link"
              onClick={() => setPhoneModal(true)}
              style={{ color: BRAND.primary }}
            >
              Change Phone (OTP)
            </Button>
          </Card>
        </Col>
      </Row>

      {/* ================= PHONE OTP MODAL ================= */}
      <Modal
        open={phoneModal}
        onCancel={() => setPhoneModal(false)}
        footer={null}
        title="Change Phone Number"
      >
        {otpStep === 1 && (
          <>
            <Input
              placeholder="9477XXXXXXX"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <Button
              loading={otpLoading}
              onClick={sendPhoneOtp}
              style={styles.primaryBtn}
            >
              Send OTP
            </Button>
          </>
        )}

        {otpStep === 2 && (
          <>
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              loading={otpLoading}
              onClick={verifyPhoneOtp}
              style={styles.primaryBtn}
            >
              Verify OTP
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    padding: 16,
    background: "#F6F7FB",
    minHeight: "100vh",
  },
  heroCard: {
    textAlign: "center",
    borderRadius: 20,
    marginBottom: 16,
  },
  avatar: {
    border: `3px solid ${BRAND.primary}`,
    marginBottom: 8,
  },
  uploadBtn: {
    marginTop: 12,
    color: BRAND.primary,
    borderColor: BRAND.primary,
  },
  primaryBtn: {
    background: BRAND.primary,
    borderColor: BRAND.primary,
    borderRadius: 20,
    marginTop: 12,
    width: "100%",
  },
  card: {
    borderRadius: 20,
  },
};