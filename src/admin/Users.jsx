import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { theme } from "../theme";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.title}>Users Management</h2>
        <p style={styles.subtitle}>
          View and manage all registered users
        </p>
      </div>

      {/* TABLE */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>KYC Status</th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <tr
  key={u.id}
  style={styles.row}
  onClick={() => window.location.href = `/admin/users/${u.id}`}
>
                <td>
                  <div style={styles.userCell}>
                    <div style={styles.avatar}>
                      {u.firstName?.charAt(0)}
                    </div>
                    <div>
                      <div style={styles.name}>
                        {u.firstName} {u.lastName}
                      </div>
                      <div style={styles.uid}>
                        {u.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>

                <td style={styles.email}>{u.email}</td>

                <td>
                  <span style={roleBadge(u.role)}>
                    {u.role}
                  </span>
                </td>

                <td>
                  <span style={kycBadge(u.kycStatus)}>
                    {u.kycStatus || "N/A"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= BADGES ================= */

const roleBadge = (role) => ({
  padding: "6px 14px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600",
  background:
    role === "ADMIN"
      ? "#3A2A14"
      : role === "IC"
      ? "#D9941A"
      : "#7A6A55",
  color: "#fff",
});

const kycBadge = (status) => ({
  padding: "6px 14px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600",
  background:
    status === "APPROVED"
      ? "#2E7D32"
      : status === "PENDING"
      ? "#D9941A"
      : "#9CA3AF",
  color: "#fff",
});

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: "40px",
    minHeight: "100vh",
    background: theme.colors.background,
  },

  header: {
    marginBottom: "24px",
  },

  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },

  subtitle: {
    marginTop: "6px",
    color: theme.colors.textSecondary,
  },

  tableWrap: {
    background: theme.colors.card,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadow.card,
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  row: {
    transition: "background 0.2s",
  },

  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: theme.gradient.gold,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "700",
  },

  name: {
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },

  uid: {
    fontSize: "11px",
    color: theme.colors.textSecondary,
  },

  email: {
    color: theme.colors.textPrimary,
  },
};