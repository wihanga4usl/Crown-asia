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
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  SafetyOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";

/* ================= BRAND COLORS ================= */
const BRAND = {
  primary: "#F5A623",   // Crown Asia Gold
  light: "#FFF6E5",
  dark: "#1F1F1F",
  gray: "#8C8C8C",
};

const IMGBB_KEY = process.env.REACT_APP_IMGBB_API_KEY;

export default function IcProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
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
      if (snap.exists()) {
        setUser(snap.data());
      }
    } catch {
      message.error("Failed to load profile");
    }
  };

  /* ================= UPDATE PROFILE ================= */
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

  /* ================= UPLOAD PHOTO ================= */
  const uploadProfilePhoto = async () => {
    if (!photo) {
      message.error("Please select a photo");
      return;
    }

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

        <h2 style={styles.name}>
          {user.firstName} {user.lastName}
        </h2>

        <div>
          <Tag color="gold">Investment Consultant</Tag>
          <Tag color={user.kycStatus === "APPROVED" ? "green" : "orange"}>
            KYC {user.kycStatus}
          </Tag>
        </div>

        <Upload
          beforeUpload={(file) => {
            setPhoto(file);
            return false;
          }}
          showUploadList={false}
          accept="image/png,image/jpeg"
        >
          <Button
            shape="round"
            icon={<UploadOutlined />}
            style={styles.uploadBtn}
          >
            Change Photo
          </Button>
        </Upload>

        {photo && (
          <Button
            type="primary"
            loading={uploading}
            onClick={uploadProfilePhoto}
            style={styles.primaryBtn}
          >
            Upload Photo
          </Button>
        )}
      </Card>

      {/* ================= KYC ALERT ================= */}
      {user.kycStatus !== "APPROVED" && (
        <Card style={styles.kycCard} bordered={false}>
          <SafetyOutlined style={styles.kycIcon} />
          <div>
            <strong>KYC Verification Required</strong>
            <p style={{ margin: "6px 0", color: BRAND.gray }}>
              You need to submit your KYC documents to start adding investments.
            </p>
            <Button
              type="link"
              style={{ color: BRAND.primary, padding: 0 }}
              onClick={() => navigate("/ic/kyc")}
            >
              Go to Settings → KYC Verification
            </Button>
          </div>
        </Card>
      )}

      {/* ================= CONTENT ================= */}
      <Row gutter={[16, 16]}>
        {/* PERSONAL INFO */}
        <Col xs={24}>
          <Card title="Personal Information" style={styles.card}>
            <Form
              layout="vertical"
              initialValues={{
                firstName: user.firstName,
                lastName: user.lastName,
                address: user.address,
              }}
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
                type="primary"
                htmlType="submit"
                loading={loading}
                style={styles.primaryBtn}
              >
                Save Changes
              </Button>
            </Form>
          </Card>
        </Col>

        {/* CONTACT INFO */}
        <Col xs={24}>
          <Card title="Contact Information" style={styles.card}>
            <p><MailOutlined /> Email</p>
            <Input value={user.email} disabled />

            <Button
              type="link"
              style={{ color: BRAND.primary, paddingLeft: 0 }}
              onClick={() => navigate("/ic/change-email")}
            >
              Change Email (OTP)
            </Button>

            <Divider />

            <p><PhoneOutlined /> Phone</p>
            <Input value={user.phone} disabled />
          </Card>
        </Col>

        {/* BANK DETAILS */}
        <Col xs={24}>
          <Card title="Bank Details" style={styles.card}>
            <p style={{ color: BRAND.gray }}>
              <BankOutlined /> Bank details are protected and require email verification.
            </p>

            {user.bank ? (
              <>
                <p><strong>Bank:</strong> {user.bank.bankName}</p>
                <p><strong>Account Name:</strong> {user.bank.accountName}</p>
                <p><strong>Account Number:</strong> {user.bank.accountNumber}</p>

                <Button
                  type="primary"
                  style={styles.primaryBtn}
                  onClick={() => navigate("/ic/bank-otp")}
                >
                  Update Bank Details
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                style={styles.primaryBtn}
                onClick={() => navigate("/ic/bank-otp")}
              >
                Add Bank Details (OTP)
              </Button>
            )}
          </Card>
        </Col>

        {/* SECURITY */}
        <Col xs={24}>
          <Card title="Security" style={styles.card}>
            <Button
              type="primary"
              style={styles.primaryBtn}
              onClick={() => navigate("/ic/change-password-otp")}
            >
              Change Password
            </Button>
          </Card>
        </Col>
      </Row>
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
    padding: 24,
    marginBottom: 16,
  },

  avatar: {
    border: `3px solid ${BRAND.primary}`,
    marginBottom: 12,
  },

  name: {
    margin: "8px 0",
    color: BRAND.dark,
  },

  uploadBtn: {
    marginTop: 12,
    borderColor: BRAND.primary,
    color: BRAND.primary,
  },

  primaryBtn: {
    background: BRAND.primary,
    borderColor: BRAND.primary,
    borderRadius: 20,
    marginTop: 12,
    width: "100%",
  },

  kycCard: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    background: BRAND.light,
    borderRadius: 16,
    marginBottom: 16,
  },

  kycIcon: {
    fontSize: 24,
    color: BRAND.primary,
    marginTop: 4,
  },

  card: {
    borderRadius: 20,
  },
};
