import { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  Upload,
  message,
  Typography,
  Spin,
  Alert,
  Divider,
} from "antd";
import {
  UploadOutlined,
  IdcardOutlined,
  CameraOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase";
import axios from "axios";

const { Title, Text } = Typography;

/* 🔑 PUT YOUR REAL IMGBB API KEY */
const IMGBB_KEY = "5074277cd18be2c8a823a08faeae4d17";

export default function SubmitKyc() {
  const [kycStatus, setKycStatus] = useState("NOT_SUBMITTED");
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [nicNumber, setNicNumber] = useState("");
  const [address, setAddress] = useState("");
  const [nicFront, setNicFront] = useState(null);
  const [nicBack, setNicBack] = useState(null);
  const [selfie, setSelfie] = useState(null);

  /* ================= REALTIME KYC STATUS ================= */
  useEffect(() => {
    if (!auth.currentUser) return;

    const ref = doc(db, "users", auth.currentUser.uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setKycStatus(snap.data().kycStatus || "NOT_SUBMITTED");
      }
      setLoadingStatus(false);
    });

    return () => unsub();
  }, []);

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (file) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be under 5MB");
    }

    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        params: { key: IMGBB_KEY },
      }
    );

    return res.data.data.url;
  };

  /* ================= SUBMIT KYC ================= */
  const submitKyc = async () => {
    if (kycStatus === "PENDING" || kycStatus === "APPROVED") {
      return message.warning("KYC already submitted");
    }

    if (!nicNumber || !address || !nicFront || !nicBack || !selfie) {
      return message.error("Please complete all required fields");
    }

    try {
      setSubmitting(true);

      const nicFrontUrl = await uploadImage(nicFront);
      const nicBackUrl = await uploadImage(nicBack);
      const selfieUrl = await uploadImage(selfie);

      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          kycStatus: "PENDING",
          kycRejectedAt: null,
          kyc: {
            nicNumber,
            address,
            nicFrontUrl,
            nicBackUrl,
            selfieUrl,
            submittedAt: new Date(),
          },
        },
        { merge: true }
      );

      message.success("KYC submitted successfully");
    } catch (err) {
      console.error("KYC ERROR:", err);
      message.error(err.message || "KYC submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= LOADING ================= */
  if (loadingStatus) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  /* ================= STATUS VIEWS ================= */

  if (kycStatus === "PENDING") {
    return (
      <Card style={styles.statusCard}>
        <SafetyOutlined style={styles.statusIcon("#F59E0B")} />
        <Title level={4}>KYC Under Review</Title>
        <Text>Your documents are currently being reviewed.</Text>
      </Card>
    );
  }

  if (kycStatus === "APPROVED") {
    return (
      <Card style={styles.statusCard}>
        <SafetyOutlined style={styles.statusIcon("#16A34A")} />
        <Title level={4}>KYC Approved</Title>
        <Text>Your identity has been verified successfully.</Text>
      </Card>
    );
  }

  /* ================= KYC FORM (NOT_SUBMITTED / REJECTED) ================= */
  return (
    <div style={styles.page}>
      {kycStatus === "REJECTED" && (
        <Alert
          type="error"
          message="KYC Rejected"
          description="Please submit clear documents again."
          style={{ marginBottom: 20 }}
        />
      )}

      <Card style={styles.card}>
        <Title level={4}>
          <IdcardOutlined /> Identity Verification
        </Title>
        <Text type="secondary">
          Complete KYC to activate sales and wallet features.
        </Text>

        <Divider />

        <Input
          placeholder="NIC Number"
          value={nicNumber}
          onChange={(e) => setNicNumber(e.target.value)}
          style={{ marginBottom: 12 }}
        />

        <Input.TextArea
          placeholder="Residential Address"
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <Upload beforeUpload={(f) => (setNicFront(f), false)} maxCount={1}>
          <Button block icon={<UploadOutlined />}>
            Upload NIC Front
          </Button>
        </Upload>

        <Upload beforeUpload={(f) => (setNicBack(f), false)} maxCount={1}>
          <Button block icon={<UploadOutlined />} style={{ marginTop: 8 }}>
            Upload NIC Back
          </Button>
        </Upload>

        <Upload beforeUpload={(f) => (setSelfie(f), false)} maxCount={1}>
          <Button block icon={<CameraOutlined />} style={{ marginTop: 8 }}>
            Upload Passport Photo (Blue Background)
          </Button>
        </Upload>

        <Button
          type="primary"
          block
          loading={submitting}
          onClick={submitKyc}
          style={styles.submitBtn}
        >
          Submit KYC
        </Button>
      </Card>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    background: "#F8FAFC",
    minHeight: "100vh",
    padding: 24,
  },
  card: {
    maxWidth: 520,
    margin: "auto",
    borderRadius: 14,
  },
  submitBtn: {
    marginTop: 24,
    height: 44,
    fontWeight: 600,
    background: "#1F3A8A",
  },
  statusCard: {
    maxWidth: 480,
    margin: "120px auto",
    textAlign: "center",
    borderRadius: 14,
  },
  statusIcon: (color) => ({
    fontSize: 48,
    color,
    marginBottom: 16,
  }),
};