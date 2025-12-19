import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Tag,
  Row,
  Col,
  Image,
  Modal,
  message,
  Typography,
} from "antd";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const { Title, Text } = Typography;

export default function KycApprovals() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.kycStatus === "PENDING");
    setUsers(list);
  };

  const approve = async (uid) => {
    await updateDoc(doc(db, "users", uid), {
      kycStatus: "APPROVED",
      kycApprovedAt: new Date(),
    });
    message.success("KYC Approved");
    setSelected(null);
    loadUsers();
  };

  const reject = async (uid) => {
    Modal.confirm({
      title: "Reject KYC",
      content: "Are you sure you want to reject this KYC?",
      okType: "danger",
      onOk: async () => {
        await updateDoc(doc(db, "users", uid), {
          kycStatus: "REJECTED",
          kycRejectedAt: new Date(),
        });
        message.error("KYC Rejected");
        setSelected(null);
        loadUsers();
      },
    });
  };

  return (
    <div style={{ padding: 24, background: "#F6F7FB", minHeight: "100vh" }}>
      <Title level={3}>KYC Approvals</Title>

      <Row gutter={[16, 16]}>
        {users.map((u) => (
          <Col xs={24} md={12} lg={8} key={u.id}>
            <Card
              title={`${u.firstName || ""} ${u.lastName || ""}`}
              extra={<Tag color="orange">PENDING</Tag>}
              actions={[
                <Button type="link" onClick={() => setSelected(u)}>
                  View Details
                </Button>,
              ]}
            >
              <Text>Email: {u.email}</Text><br />
              <Text>Phone: {u.phone}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* DETAILS MODAL */}
      {selected && (
        <Modal
          open
          width={900}
          footer={null}
          onCancel={() => setSelected(null)}
          title="KYC Full Details"
        >
          <Row gutter={16}>
            <Col span={12}>
              <p><b>NIC:</b> {selected.kyc?.nicNumber}</p>
              <p><b>Address:</b> {selected.kyc?.address}</p>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Image src={selected.kyc?.nicFrontUrl} />
              <p style={{ textAlign: "center" }}>NIC Front</p>
            </Col>
            <Col span={8}>
              <Image src={selected.kyc?.nicBackUrl} />
              <p style={{ textAlign: "center" }}>NIC Back</p>
            </Col>
            <Col span={8}>
              <Image src={selected.kyc?.selfieUrl} />
              <p style={{ textAlign: "center" }}>Selfie</p>
            </Col>
          </Row>

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button danger onClick={() => reject(selected.id)}>
              Reject
            </Button>
            <Button
              type="primary"
              style={{ marginLeft: 12 }}
              onClick={() => approve(selected.id)}
            >
              Approve
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}