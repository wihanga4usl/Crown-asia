import { useEffect, useState } from "react";
import { Card, Button, Tag, Tabs, Input, Row, Col, message, Modal } from "antd";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import AdminSaleDetailsModal from "./AdminSaleDetailsModal";

const { TabPane } = Tabs;

export default function SaleApprovals() {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [status, search, sales]);

  const loadSales = async () => {
    const snap = await getDocs(collection(db, "sales"));
    setSales(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const applyFilter = () => {
    let data = sales.filter((s) => (s.status || "").toUpperCase() === status);

    if (search) {
      const s = search.toLowerCase();
      data = data.filter((x) =>
        (x.customerFullName || "").toLowerCase().includes(s) ||
        (x.customerNic || "").toLowerCase().includes(s) ||
        (x.customerPhone || "").toLowerCase().includes(s)
      );
    }
    setFiltered(data);
  };

  const approveSale = async (saleId) => {
    await updateDoc(doc(db, "sales", saleId), {
      status: "APPROVED",
      approvedAt: new Date(),
    });
    message.success("Sale Approved");
    setSelectedSale(null);
    loadSales();
  };

  const rejectSale = async (saleId) => {
    Modal.confirm({
      title: "Reject Sale",
      content: "Are you sure you want to reject this sale?",
      okText: "Reject",
      okType: "danger",
      onOk: async () => {
        await updateDoc(doc(db, "sales", saleId), {
          status: "REJECTED",
          rejectedAt: new Date(),
        });
        message.error("Sale Rejected");
        setSelectedSale(null);
        loadSales();
      },
    });
  };

  const tagColor = (st) =>
    st === "APPROVED" ? "green" : st === "REJECTED" ? "red" : "orange";

  return (
    <div style={{ padding: 24, background: "#F6F7FB", minHeight: "100vh" }}>
      <h2>Admin – Sales</h2>

      <Tabs activeKey={status} onChange={setStatus}>
        <TabPane tab="Pending" key="PENDING" />
        <TabPane tab="Approved" key="APPROVED" />
        <TabPane tab="Rejected" key="REJECTED" />
      </Tabs>

      <Input
        placeholder="Search by name / NIC / phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 420, marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        {filtered.map((sale) => (
          <Col xs={24} lg={12} key={sale.id}>
            <Card
              style={{ borderRadius: 16 }}
              title={sale.customerFullName || "No Name"}
              extra={<Tag color={tagColor(status)}>{status}</Tag>}
            >
              <div><b>NIC:</b> {sale.customerNic || "-"}</div>
              <div>
                <b>Amount:</b> Rs. {Number(sale.investmentAmount || 0).toLocaleString()}
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button onClick={() => setSelectedSale(sale)}>View Full Details</Button>

                {status === "PENDING" && (
                  <>
                    <Button type="primary" onClick={() => approveSale(sale.id)}>
                      Approve
                    </Button>
                    <Button danger onClick={() => rejectSale(sale.id)}>
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* FULL DETAILS MODAL */}
      <AdminSaleDetailsModal
        sale={selectedSale}
        open={!!selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </div>
  );
}