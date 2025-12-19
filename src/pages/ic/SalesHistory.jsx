import { useEffect, useState } from "react";
import {
  Card,
  List,
  Tag,
  Button,
  Modal,
  Descriptions,
  Image,
} from "antd";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "sales"),
        where("userId", "==", user.uid)
      );

      const snap = await getDocs(q);
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    load();
  }, []);

  const statusColor = (s) => {
    if (s === "APPROVED") return "green";
    if (s === "REJECTED") return "red";
    return "orange";
  };

  return (
    <div style={{ padding: 24, background: "#F6F7FB", minHeight: "100vh" }}>
      <Card title="My Sales History" style={{ borderRadius: 16 }}>
        <List
          dataSource={sales}
          locale={{ emptyText: "No sales found" }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => {
                  setSelectedSale(item);
                  setOpen(true);
                }}>
                  View Details
                </Button>
              ]}
            >
              <List.Item.Meta
                title={item.fullName}
                description={
                  <>
                    <div>Plan: {item.planName}</div>
                    <div>Amount: Rs. {item.investmentAmount?.toLocaleString()}</div>
                  </>
                }
              />
              <Tag color={statusColor(item.status)}>
                {item.status}
              </Tag>
            </List.Item>
          )}
        />
      </Card>

      {/* DETAILS MODAL */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={900}
        title="Sale Details"
      >
        {selectedSale && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Customer Name">
                {selectedSale.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="NIC">
                {selectedSale.nicNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedSale.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedSale.email}
              </Descriptions.Item>

              <Descriptions.Item label="Investment Plan">
                {selectedSale.planName}
              </Descriptions.Item>
              <Descriptions.Item label="Investment Amount">
                Rs. {selectedSale.investmentAmount?.toLocaleString()}
              </Descriptions.Item>

              <Descriptions.Item label="Payment Method">
                {selectedSale.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Investment Period">
                {selectedSale.investmentPeriod}
              </Descriptions.Item>

              <Descriptions.Item label="Nominee Name">
                {selectedSale.nomineeName}
              </Descriptions.Item>
              <Descriptions.Item label="Nominee Relationship">
                {selectedSale.nomineeRelationship}
              </Descriptions.Item>

              <Descriptions.Item label="Bank Name">
                {selectedSale.bankName}
              </Descriptions.Item>
              <Descriptions.Item label="Account Number">
                {selectedSale.accountNumber}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <strong>Uploaded Documents</strong>
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                {selectedSale.nicFrontUrl && (
                  <Image width={200} src={selectedSale.nicFrontUrl} />
                )}
                {selectedSale.nicBackUrl && (
                  <Image width={200} src={selectedSale.nicBackUrl} />
                )}
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}