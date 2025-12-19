import { useEffect, useState } from "react";
import { Card, Row, Col, Button, Avatar, Alert } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  PlusOutlined,
  WalletOutlined,
  FileDoneOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

/* ================= BRAND ================= */
const BRAND = {
  bg: "#F6F7FB",
};

const LOGO = "https://i.ibb.co/FTMm2N9/Untitled-design-7.png";

export default function IcDashboard() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [wallet, setWallet] = useState(0);
  const [activeSales, setActiveSales] = useState(0);
  const [totalPremium, setTotalPremium] = useState(0);
  const [kycStatus, setKycStatus] = useState("PENDING");

  /* ================= USER ================= */
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setUserEmail(user.email);

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;
      const u = snap.data();

      setUserName(`${u.firstName || ""} ${u.lastName || ""}`.trim());
      setWallet(u.wallet || 0);
      setKycStatus(String(u.kycStatus || "PENDING").toUpperCase());
    });

    return () => unsub();
  }, [user, navigate]);

  /* ================= SALES ================= */
  useEffect(() => {
    if (!user) return;

    const loadSales = async () => {
      const q = query(
        collection(db, "sales"),
        where("userId", "==", user.uid),
        where("status", "==", "APPROVED")
      );

      const snap = await getDocs(q);
      setActiveSales(snap.size);

      let total = 0;
      snap.forEach((d) => (total += d.data().amount || 0));
      setTotalPremium(total);
    };

    loadSales();
  }, [user]);

  const canAddSale = kycStatus === "APPROVED";

  /* ================= LOGOUT ================= */
  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}
      <div style={styles.header}>
        <div style={styles.brand}>
          <img src={LOGO} alt="logo" style={styles.logo} />
          <div>
            <div style={styles.brandTitle}>Crown Asia Investment</div>
            <div style={styles.brandSub}>Investment Consultant</div>
          </div>
        </div>

        <Button icon={<LogoutOutlined />} shape="round" onClick={logout}>
          Sign Out
        </Button>
      </div>

      {/* ================= PROFILE CARD ================= */}
      <Card style={styles.profileCard}>
        <div style={styles.profileRow}>
          <div style={{ display: "flex", gap: 12 }}>
            <Avatar size={52} icon={<UserOutlined />} />
            <div>
              <strong>{userName}</strong>
              <div style={{ fontSize: 12, color: "#6B7280" }}>
                {userEmail}
              </div>
            </div>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={!canAddSale}
            style={styles.addBtn}
            onClick={() => navigate("/ic/sale")}
          >
            Add Sale
          </Button>
        </div>
      </Card>

      {/* ================= KYC ALERT ================= */}
      {!canAddSale && (
        <Alert
          type="warning"
          showIcon
          message="KYC Verification Required"
          description="Your KYC must be approved before adding sales."
          style={{ marginBottom: 20, borderRadius: 14 }}
        />
      )}

      {/* ================= STATS ================= */}
      <Row gutter={[16, 16]}>
        {/* WALLET */}
        <Col xs={24} md={8}>
          <StatCard
            title="Wallet Balance"
            value={`Rs. ${wallet.toLocaleString()}`}
            icon={<WalletOutlined />}
            gradient="linear-gradient(135deg,#3B82F6,#60A5FA)"
            sub="Available balance"
            action={
              <Button
                size="small"
                shape="round"
                disabled={wallet <= 0}
                onClick={() => navigate("/ic/withdraw")}
                style={styles.withdrawBtn}
              >
                Withdraw Funds
              </Button>
            }
          />
        </Col>

        {/* ACTIVE SALES */}
        <Col xs={24} md={8}>
          <StatCard
            title="Active Investments"
            value={activeSales}
            icon={<FileDoneOutlined />}
            gradient="linear-gradient(135deg,#22C55E,#4ADE80)"
            sub="Approved sales"
          />
        </Col>

        {/* TOTAL PREMIUM */}
        <Col xs={24} md={8}>
          <StatCard
            title="Total Premium"
            value={`Rs. ${totalPremium.toLocaleString()}`}
            icon={<DollarOutlined />}
            gradient="linear-gradient(135deg,#F59E0B,#FACC15)"
            sub="Total investment value"
          />
        </Col>
      </Row>

      <BottomNav navigate={navigate} />
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, icon, gradient, sub, action }) {
  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 18,
        background: gradient,
        color: "#fff",
        boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
      }}
    >
      <div style={styles.statRow}>
        <div>
          <div style={styles.statTitle}>{title}</div>
          <div style={styles.statValue}>{value}</div>
          <div style={styles.statSub}>{sub}</div>
          {action && <div style={{ marginTop: 12 }}>{action}</div>}
        </div>

        <div style={styles.statIcon}>{icon}</div>
      </div>
    </Card>
  );
}

function BottomNav({ navigate }) {
  return (
    <div style={styles.bottomNav}>
      <Button
        type="text"
        icon={<FileTextOutlined />}
        onClick={() => navigate("/ic/sales")}
      >
        Sales
      </Button>

      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<PlusOutlined />}
        style={styles.fab}
        onClick={() => navigate("/ic/sale")}
      />

      <Button
        type="text"
        icon={<UserOutlined />}
        onClick={() => navigate("/ic/profile")}
      >
        Profile
      </Button>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: BRAND.bg,
    padding: 16,
    paddingBottom: 90,
  },

  header: {
    background: "#fff",
    padding: "14px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    marginBottom: 16,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  logo: { width: 36 },

  brandTitle: { fontWeight: 600, fontSize: 15 },

  brandSub: { fontSize: 12, color: "#6B7280" },

  profileCard: {
    borderRadius: 18,
    marginBottom: 16,
  },

  profileRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  addBtn: {
    background: "linear-gradient(135deg,#F59E0B,#FACC15)",
    border: "none",
    borderRadius: 14,
  },

  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statTitle: { fontSize: 13, opacity: 0.9 },

  statValue: { fontSize: 24, fontWeight: 700 },

  statSub: { fontSize: 12, opacity: 0.85 },

  statIcon: {
    fontSize: 28,
    background: "rgba(255,255,255,0.25)",
    padding: 14,
    borderRadius: 14,
  },

  withdrawBtn: {
    background: "rgba(255,255,255,0.25)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.35)",
    backdropFilter: "blur(6px)",
  },

  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#fff",
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0",
    borderTop: "1px solid #E5E7EB",
  },

  fab: {
    background: "linear-gradient(135deg,#F59E0B,#FACC15)",
    border: "none",
    boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
  },
};
