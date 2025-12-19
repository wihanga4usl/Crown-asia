import { useEffect, useState } from "react";
import { Card, Row, Col, Button, message } from "antd";
import {
  TeamOutlined,
  IdcardOutlined,
  FileDoneOutlined,
  WalletOutlined,
  DollarOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [stats, setStats] = useState({
    users: 0,
    kycPending: 0,
    salesPending: 0,
    withdrawalsPending: 0,
    totalInvestment: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      message.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      message.error("Logout failed");
    }
  };

  const loadStats = async () => {
    try {
      // USERS
      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.size;

      // PENDING KYC
      const kycSnap = await getDocs(
        query(collection(db, "users"), where("kycStatus", "==", "PENDING"))
      );

      // PENDING SALES
      const salesPendingSnap = await getDocs(
        query(collection(db, "sales"), where("status", "==", "PENDING"))
      );

      // PENDING WITHDRAWALS
      const withdrawalSnap = await getDocs(
        query(collection(db, "withdrawals"), where("status", "==", "PENDING"))
      );

      // TOTAL INVESTMENT
      const approvedSalesSnap = await getDocs(
        query(collection(db, "sales"), where("status", "==", "APPROVED"))
      );

      let totalInvestment = 0;
      approvedSalesSnap.forEach((d) => {
        totalInvestment += d.data().investmentAmount || 0;
      });

      setStats({
        users,
        kycPending: kycSnap.size,
        salesPending: salesPendingSnap.size,
        withdrawalsPending: withdrawalSnap.size,
        totalInvestment,
      });
    } catch (err) {
      message.error("Failed to load dashboard data");
    }
  };

  return (
    <div style={{ padding: 16, background: "#F6F7FB", minHeight: "100vh" }}>
      {/* HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#F6F7FB",
          paddingBottom: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>

          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* STATS */}
      <Row gutter={[16, 16]}>
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={<TeamOutlined />}
          color="#3B82F6"
        />
        <StatCard
          title="Pending KYC"
          value={stats.kycPending}
          icon={<IdcardOutlined />}
          color="#F59E0B"
        />
        <StatCard
          title="Pending Sales"
          value={stats.salesPending}
          icon={<FileDoneOutlined />}
          color="#EF4444"
        />
        <StatCard
          title="Pending Withdrawals"
          value={stats.withdrawalsPending}
          icon={<WalletOutlined />}
          color="#8B5CF6"
        />
        <StatCard
          title="Total Investment (LKR)"
          value={`Rs. ${stats.totalInvestment.toLocaleString()}`}
          icon={<DollarOutlined />}
          color="#22C55E"
        />
      </Row>

      {/* QUICK ACTIONS */}
      <Card style={{ marginTop: 32, borderRadius: 16 }}>
        <h3>Quick Actions</h3>

        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Button block onClick={() => navigate("/admin/kyc")}>
              KYC Approvals
            </Button>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Button block onClick={() => navigate("/admin/sales")}>
              Sale Approvals
            </Button>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Button block onClick={() => navigate("/admin/withdrawals")}>
              Withdrawals
            </Button>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Button block onClick={() => navigate("/admin/users")}>
              Manage Users
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

/* STAT CARD COMPONENT */
function StatCard({ title, value, icon, color }) {
  return (
    <Col xs={24} sm={12} md={8} lg={6}>
      <Card style={{ borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#6B7280", fontSize: 13 }}>
              {title}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>
              {value}
            </div>
          </div>

          <div
            style={{
              background: `${color}20`,
              color,
              padding: 12,
              borderRadius: 12,
              fontSize: 22,
            }}
          >
            {icon}
          </div>
        </div>
      </Card>
    </Col>
  );
}
