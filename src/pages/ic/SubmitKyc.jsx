import { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  Upload,
  message,
  Select,
  Alert,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function SubmitKyc() {
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  const [nicFront, setNicFront] = useState(null);
  const [nicBack, setNicBack] = useState(null);
  const [signature, setSignature] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    nicNumber: "",
    dob: "",
    address: "",
    occupation: "",
  });

  /* ================= LOAD USER KYC STATUS ================= */
  useEffect(() => {
    const loadStatus = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) {
        setKycStatus(snap.data().kycStatus || null);
      }
    };
    loadStatus();
  }, []);

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (file) => {
    const data = new FormData();
    data.append("image", file);

    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMGBB_API_KEY}`,
      data
    );

    return res.data.data.url;
  };

  /* ================= SUBMIT KYC ================= */
  const handleSubmitKyc = async () => {
    if (kycStatus === "PENDING") {
      return message.warning("Your KYC is still under review");
    }

    if (kycStatus === "APPROVED") {
      return message.success("Your KYC is already approved");
    }

    if (!nicFront || !nicBack || !signature) {
      return message.error("Please upload all required documents");
    }

    try {
      setLoading(true);

      const nicFrontUrl = await uploadImage(nicFront);
      const nicBackUrl = await uploadImage(nicBack);
      const signatureUrl = await uploadImage(signature);

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        kyc: {
          ...form,
          nicFrontUrl,
          nicBackUrl,
          signatureUrl,
          submittedAt: serverTimestamp(),
        },
        kycStatus: "PENDING",
      });

      message.success("KYC submitted successfully");
      setKycStatus("PENDING");
    } catch (err) {
      console.error(err);
      message.error("KYC submission failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Card style={{ maxWidth: 650, margin: "40px auto" }}>
      <h2>KYC Verification</h2>

      {kycStatus === "PENDING" && (
        <Alert
          type="warning"
          message="Your KYC is under review"
          style={{ marginBottom: 20 }}
        />
      )}

      {kycStatus === "REJECTED" && (
        <Alert
          type="error"
          message="Your KYC was rejected. Please resubmit."
          style={{ marginBottom: 20 }}
        />
      )}

      <Input
        placeholder="Full Name"
        disabled={kycStatus === "PENDING"}
        style={{ marginBottom: 10 }}
        onChange={(e) =>
          setForm({ ...form, fullName: e.target.value })
        }
      />

      <Input
        placeholder="NIC Number"
        disabled={kycStatus === "PENDING"}
        style={{ marginBottom: 10 }}
        onChange={(e) =>
          setForm({ ...form, nicNumber: e.target.value })
        }
      />

      <Input
        type="date"
        disabled={kycStatus === "PENDING"}
        style={{ marginBottom: 10 }}
        onChange={(e) =>
          setForm({ ...form, dob: e.target.value })
        }
      />

      <Input
        placeholder="Address"
        disabled={kycStatus === "PENDING"}
        style={{ marginBottom: 10 }}
        onChange={(e) =>
          setForm({ ...form, address: e.target.value })
        }
      />

      <Select
        placeholder="Occupation"
        disabled={kycStatus === "PENDING"}
        style={{ width: "100%", marginBottom: 15 }}
        onChange={(v) => setForm({ ...form, occupation: v })}
        options={[
          { value: "Private", label: "Private" },
          { value: "Government", label: "Government" },
          { value: "Self Employed", label: "Self Employed" },
        ]}
      />

      <Upload
        beforeUpload={(file) => {
          setNicFront(file);
          return false;
        }}
        disabled={kycStatus === "PENDING"}
      >
        <Button icon={<UploadOutlined />}>Upload NIC Front</Button>
      </Upload>

      <Upload
        beforeUpload={(file) => {
          setNicBack(file);
          return false;
        }}
        disabled={kycStatus === "PENDING"}
      >
        <Button icon={<UploadOutlined />} style={{ marginTop: 10 }}>
          Upload NIC Back
        </Button>
      </Upload>

      <Upload
        beforeUpload={(file) => {
          setSignature(file);
          return false;
        }}
        disabled={kycStatus === "PENDING"}
      >
        <Button icon={<UploadOutlined />} style={{ marginTop: 10 }}>
          Upload Signature
        </Button>
      </Upload>

      <Button
        type="primary"
        block
        loading={loading}
        onClick={handleSubmitKyc}
        style={{ marginTop: 20 }}
        disabled={kycStatus === "PENDING"}
      >
        Submit KYC
      </Button>
    </Card>
  );
}