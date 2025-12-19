import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";
import { theme } from "../theme";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!id) return; // 🛑 protect against undefined

    const loadAll = async () => {
      try {
        // USER
        const userSnap = await getDoc(doc(db, "users", id));
        if (!userSnap.exists()) {
          navigate("/admin/users");
          return;
        }
        setUser(userSnap.data());

        // SALES
        const q = query(
          collection(db, "sales"),
          where("uid", "==", id)
        );
        const salesSnap = await getDocs(q);
        setSales(salesSnap.docs.map(d => d.data()));
      } catch (err) {
        console.error("User detail error:", err);
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [id, navigate]);

  /* ================= ACTIONS ================= */

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  /* ================= UI STATES ================= */

  if (!id) {
    return (
      <div style={styles.page}>
        <p>Invalid user. Go back.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <p>Loading user details...</p>
      </div>
    );
  }

  if (!user) return null;

  /* ================= RENDER ================= */

  return (
    <div style={styles.page}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>

      <h2 style={styles.title}>User Details</h2>

      <div style={styles.grid}>
        {/* PROFILE CARD */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Profile</h3>

          <Info label="Full Name" value={`${user.firstName} ${user.lastName}`} />
          <Info label="Email" value={user.email} />
          <Info label="Phone" value={user.phone || "—"} />
          <Info label="Role" value={user.role} />
          <Info
            label="KYC Status"
            value={user.kycStatus || "N/A"}
            highlight
          />
        </div>

        {/* SALES CARD */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Sales Summary</h3>

          <Info label="Total Sales" value={sales.length} />
          <Info
            label="Approved Sales"
            value={sales.filter(s => s.status === "APPROVED").length}
          />
          <Info
            label="Pending Sales"
            value={sales.filter(s => s.status === "PENDING").length}
          />
        </div>
      </div>
    </div>
  );
}

/* ================= INFO ROW ================= */

function Info({ label, value, highlight }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.label}>{label}</span>
      <span
        style={{
          ...styles.value,
          ...(highlight ? styles.highlight : {}),
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: theme.colors.background,
  },

  /* TOP BAR */
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  backBtn: {
    padding: "10px 18px",
    borderRadius: theme.radius.md,
    border: "none",
    background: theme.colors.card,
    color: theme.colors.textPrimary,
    fontWeight: "600",
    boxShadow: theme.shadow.soft,
    cursor: "pointer",
  },
  logoutBtn: {
    padding: "10px 18px",
    borderRadius: theme.radius.md,
    border: "none",
    background: theme.gradient.gold,
    color: "#fff",
    fontWeight: "600",
    boxShadow: theme.shadow.card,
    cursor: "pointer",
  },

  title: {
    marginBottom: "30px",
    color: theme.colors.textPrimary,
    fontSize: "26px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: "24px",
  },

  card: {
    background: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: "26px",
    boxShadow: theme.shadow.card,
  },

  cardTitle: {
    marginBottom: "18px",
    color: theme.colors.primary,
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },

  label: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },

  value: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },

  highlight: {
    padding: "4px 12px",
    borderRadius: "999px",
    background: theme.gradient.gold,
    color: "#fff",
    fontSize: "13px",
  },
};