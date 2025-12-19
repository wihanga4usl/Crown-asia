import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  Checkbox,
  message,
  Divider,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { auth, db } from "../../firebase";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

export default function SubmitSale() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [nicFront, setNicFront] = useState(null);
  const [nicBack, setNicBack] = useState(null);
  const [signatureDoc, setSignatureDoc] = useState(null);

  const [kycStatus, setKycStatus] = useState("PENDING");

  // ✅ Check IC KYC status (optional gate)
  useEffect(() => {
    const run = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setKycStatus(String(snap.data().kycStatus || "PENDING").toUpperCase());
      }
    };
    run();
  }, []);

  const uploadToImgBB = async (file) => {
    const key = process.env.REACT_APP_IMGBB_API_KEY;
    if (!key) throw new Error("Missing REACT_APP_IMGBB_API_KEY in .env");

    const fd = new FormData();
    fd.append("image", file);

    const res = await axios.post(`https://api.imgbb.com/1/upload?key=${key}`, fd);
    return res.data?.data?.url;
  };

  const onSubmit = async (values) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        message.error("Please login again.");
        navigate("/login");
        return;
      }

      if (kycStatus !== "APPROVED") {
        message.error("KYC must be approved before submitting a sale.");
        return;
      }

      // Required uploads
      if (!nicFront) {
        message.error("NIC Front image is required.");
        return;
      }
      if (!nicBack) {
        message.error("NIC Back image is required.");
        return;
      }

      setLoading(true);

      // Upload files first
      const nicFrontUrl = await uploadToImgBB(nicFront);
      const nicBackUrl = await uploadToImgBB(nicBack);
      const signatureUrl = signatureDoc ? await uploadToImgBB(signatureDoc) : "";

      // Convert dates
      const dob = values.dob ? values.dob.toDate() : null;
      const paymentDate = values.paymentDate ? values.paymentDate.toDate() : null;

      // Save to Firestore
      await addDoc(collection(db, "sales"), {
  /* ================= SYSTEM ================= */
  userId: user.uid,
  status: "PENDING",
  createdAt: serverTimestamp(),

  /* ================= INVISIBLE ADMIN FIELDS ================= */
  customerName: values.fullName,
  customerNic: values.nicNumber,
  investmentAmountQuick: Number(values.investmentAmount),
  paymentMethodQuick: values.paymentMethod,
  planQuick: values.planName,

  /* ================= SECTION 1: Applicant Details ================= */
  fullName: values.fullName,
  initialsName: values.initialsName,
  nicNumber: values.nicNumber,
  dob,
  gender: values.gender,
  maritalStatus: values.maritalStatus,
  nationality: values.nationality,
  address: values.address,
  phone: values.phone,
  email: values.email,

  /* ================= SECTION 2: Employment / Income ================= */
  occupation: values.occupation,
  employerName: values.employerName || "",
  employerAddress: values.employerAddress || "",
  monthlyIncome: Number(values.monthlyIncome || 0),
  employmentType: values.employmentType,
  yearsOfEmployment: Number(values.yearsOfEmployment || 0),

  /* ================= SECTION 3: Investment / Proposal ================= */
  planName: values.planName,
  investmentAmount: Number(values.investmentAmount),
  paymentMethod: values.paymentMethod,
  paymentDate,
  investmentPeriod: values.investmentPeriod,
  expectedReturn: values.expectedReturn || "",
  agentName: values.agentName,

  /* ================= SECTION 4: Nominee ================= */
  nomineeName: values.nomineeName || "",
  nomineeRelationship: values.nomineeRelationship || "",
  nomineeNic: values.nomineeNic || "",
  nomineePhone: values.nomineePhone || "",
  nomineeAddress: values.nomineeAddress || "",

  /* ================= SECTION 5: Bank ================= */
  bankName: values.bankName || "",
  branchName: values.branchName || "",
  accountHolder: values.accountHolder || "",
  accountNumber: values.accountNumber || "",

  /* ================= DOCUMENT UPLOADS ================= */
  nicFrontUrl,
  nicBackUrl,
  signatureUrl,
});


      message.success("Sale submitted successfully (PENDING).");
      form.resetFields();
      setNicFront(null);
      setNicBack(null);
      setSignatureDoc(null);

      // go to sales list
      navigate("/ic/sales");
    } catch (e) {
      console.error(e);
      message.error("Failed to submit sale.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, background: "#F6F7FB", minHeight: "100vh" }}>
      <Card
        title="Add Sale (Proposal Form)"
        style={{ maxWidth: 980, margin: "0 auto", borderRadius: 16 }}
      >
        {kycStatus !== "APPROVED" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#b45309", fontWeight: 600 }}>
              KYC Not Approved
            </div>
            <div style={{ color: "#6B7280" }}>
              You can submit sales only after your KYC is approved by Admin.
            </div>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          initialValues={{
            nationality: "Sri Lankan",
            employmentType: "Permanent",
            paymentMethod: "Bank Transfer",
            gender: "Male",
            maritalStatus: "Single",
          }}
        >
          {/* SECTION 1 */}
          <Divider orientation="left">Applicant Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
                <Input placeholder="Full name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="initialsName" label="Name with Initials" rules={[{ required: true }]}>
                <Input placeholder="Name with initials" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="nicNumber" label="NIC Number" rules={[{ required: true }]}>
                <Input placeholder="NIC / Passport / DL number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="dob" label="Date of Birth" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                <Select>
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="maritalStatus" label="Marital Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="Single">Single</Option>
                  <Option value="Married">Married</Option>
                  <Option value="Divorced">Divorced</Option>
                  <Option value="Widowed">Widowed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="nationality" label="Nationality" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={24}>
              <Form.Item name="address" label="Residential Address" rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Contact Number" rules={[{ required: true }]}>
                <Input placeholder="07xxxxxxxx" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email Address" rules={[{ required: true, type: "email" }]}>
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>
          </Row>

          {/* SECTION 2 */}
          <Divider orientation="left">Employment / Income Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="occupation" label="Occupation" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="employmentType" label="Employment Type" rules={[{ required: true }]}>
                <Select>
                  <Option value="Permanent">Permanent</Option>
                  <Option value="Contract">Contract</Option>
                  <Option value="Self-Employed">Self-Employed</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="employerName" label="Employer Name">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="yearsOfEmployment" label="Years of Employment">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={24}>
              <Form.Item name="employerAddress" label="Employer Address">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="monthlyIncome" label="Monthly Income (LKR)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          {/* SECTION 3 */}
          <Divider orientation="left">Investment / Proposal Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="planName" label="Investment Plan Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="investmentAmount" label="Investment Amount (LKR)" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="paymentMethod" label="Payment Method" rules={[{ required: true }]}>
                <Select>
                  <Option value="Cash">Cash</Option>
                  <Option value="Bank Transfer">Bank Transfer</Option>
                  <Option value="Cheque">Cheque</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="paymentDate" label="Payment Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="investmentPeriod" label="Investment Period (Months / Years)" rules={[{ required: true }]}>
                <Input placeholder="e.g., 12 months / 2 years" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="expectedReturn" label="Expected Return / Benefit">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="agentName" label="Agent / Consultant Name" rules={[{ required: true }]}>
                <Input placeholder="IC name" />
              </Form.Item>
            </Col>
          </Row>

          {/* SECTION 4 */}
          <Divider orientation="left">Nominee Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="nomineeName" label="Nominee Full Name">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="nomineeRelationship" label="Relationship to Applicant">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="nomineeNic" label="Nominee NIC Number">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="nomineePhone" label="Nominee Contact Number">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={24}>
              <Form.Item name="nomineeAddress" label="Nominee Address">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          {/* SECTION 5 */}
          <Divider orientation="left">Bank Details (If Applicable)</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="bankName" label="Bank Name">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="branchName" label="Branch Name">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="accountHolder" label="Account Holder Name">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="accountNumber" label="Account Number">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* SECTION 6 */}
          <Divider orientation="left">Uploads & Declaration</Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 6, fontWeight: 500 }}>NIC Front Image *</div>
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
                  setNicFront(file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Upload Front</Button>
              </Upload>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ marginBottom: 6, fontWeight: 500 }}>NIC Back Image *</div>
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
                  setNicBack(file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Upload Back</Button>
              </Upload>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ marginBottom: 6, fontWeight: 500 }}>Signature / Document (Optional)</div>
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
                  setSignatureDoc(file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Col>
          </Row>

          <Form.Item
            name="declaration"
            valuePropName="checked"
            rules={[
              {
                validator: (_, v) => (v ? Promise.resolve() : Promise.reject(new Error("You must confirm the declaration"))),
              },
            ]}
            style={{ marginTop: 16 }}
          >
            <Checkbox>
              I confirm that the above information is true and correct.
            </Checkbox>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={kycStatus !== "APPROVED"}
            style={{
              width: "100%",
              borderRadius: 12,
              height: 44,
              background: "linear-gradient(135deg,#F59E0B,#FACC15)",
              border: "none",
              fontWeight: 700,
            }}
          >
            Submit Sale
          </Button>

          <Button
            style={{ width: "100%", marginTop: 10, borderRadius: 12 }}
            onClick={() => navigate("/ic/sales")}
          >
            View My Sales
          </Button>
        </Form>
      </Card>
    </div>
  );
}