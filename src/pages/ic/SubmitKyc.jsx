import { useState } from "react";
import { Card, Input, Button, Upload, message, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { auth, db } from "../../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function SubmitKyc() {
  const [loading, setLoading] = useState(false);
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

  // 🔹 Upload to IMGBB
  const uploadImage = async (file) => {
    const data = new FormData();
    data.append("image", file);

    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMGBB_API_KEY}`,
      data
    );

    return res.data.data.url;
  };

  // 🔹 Submit KYC
  const handleSubmitKyc = async () => {
    if (!nicFront || !nicBack || !signature) {
      return message.error("Please upload all required images");
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
    } catch (err) {
      console.error(err);
      message.error("KYC submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>KYC Verification</h2>

      <Input
        placeholder="Full Name"
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        style={{ marginBottom: 10 }}
      />

      <Input
        placeholder="NIC Number"
        onChange={(e) => setForm({ ...form, nicNumber: e.target.value })}
        style={{ marginBottom: 10 }}
      />

      <Input
        type="date"
        onChange={(e) => setForm({ ...form, dob: e.target.value })}
        style={{ marginBottom: 10 }}
      />

      <Input
        placeholder="Address"
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        style={{ marginBottom: 10 }}
      />

      <Select
        placeholder="Occupation"
        onChange={(v) => setForm({ ...form, occupation: v })}
        style={{ width: "100%", marginBottom: 15 }}
        options={[
          { value: "Private", label: "Private" },
          { value: "Government", label: "Government" },
          { value: "Self Employed", label: "Self Employed" },
        ]}
      />

      <Upload beforeUpload={(f) => (setNicFront(f), false)}>
        <Button icon={<UploadOutlined />}>Upload NIC Front</Button>
      </Upload>

      <Upload beforeUpload={(f) => (setNicBack(f), false)}>
        <Button icon={<UploadOutlined />} style={{ marginTop: 10 }}>
          Upload NIC Back
        </Button>
      </Upload>

      <Upload beforeUpload={(f) => (setSignature(f), false)}>
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
      >
        Submit KYC
      </Button>
    </Card>
  );
}