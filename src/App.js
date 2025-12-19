import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import { antdTheme } from "./antdTheme";

import { auth } from "./firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

/* ================= AUTH PAGES ================= */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* ================= IC PAGES ================= */
import IcDashboard from "./pages/ic/Dashboard";
import SubmitKyc from "./pages/ic/SubmitKyc";
import Profile from "./pages/ic/Profile";
import ChangeEmail from "./pages/ic/ChangeEmail";
import BankOtp from "./pages/ic/BankOtp";
import SubmitSale from "./pages/ic/SubmitSale";
import SalesHistory from "./pages/ic/SalesHistory";
import IcProfile from "./pages/ic/Profile";
import ChangePasswordOtp from "./pages/ic/ChangePasswordOtp";
import Withdraw from "./pages/ic/Withdraw";



/* ================= ADMIN PAGES ================= */
import AdminDashboard from "./admin/AdminDashboard";
import Users from "./admin/Users";
import UserDetail from "./admin/UserDetail";
import SaleApprovals from "./admin/SaleApprovals";
import KycApprovals from "./admin/KycApprovals";




function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= AUTH LISTENER ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(u);

      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        setRole(snap.data().role);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return null;

  return (
    <ConfigProvider theme={antdTheme}>
      <BrowserRouter>
        <Routes>

          {/* ================= AUTH ================= */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
            
          />
          <Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

          {/* ================= ROOT REDIRECT ================= */}
          <Route
            path="/"
            element={
              !user ? (
                <Navigate to="/login" />
              ) : role === "ADMIN" ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/ic" />
              )
            }
          />

          {/* ================= IC ROUTES ================= */}
          <Route
            path="/ic"
            element={
              user && role === "IC" ? <IcDashboard /> : <Navigate to="/" />
            }
          />
          <Route
            path="/ic/kyc"
            element={
              user && role === "IC" ? <SubmitKyc /> : <Navigate to="/" />
            }
          />
          <Route
            path="/ic/profile"
            element={
              user && role === "IC" ? <Profile /> : <Navigate to="/" />
            }
          />
          <Route path="/ic/change-email" element={<ChangeEmail />} />
          <Route path="/ic/bank-otp" element={<BankOtp />} />
          <Route path="/ic/sale" element={<SubmitSale />} />
          <Route path="/ic/sales" element={<SalesHistory />} />
<Route path="/ic/sale" element={<SubmitSale />} />
<Route path="/ic/profile" element={<IcProfile />} />
<Route
  path="/ic/change-password-otp"
  element={<ChangePasswordOtp />}
/>
<Route path="/ic/sale" element={<SubmitSale />} />
<Route path="/ic/withdraw" element={<Withdraw />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route
            path="/admin"
            element={
              user && role === "ADMIN" ? <AdminDashboard /> : <Navigate to="/" />
            }
          />
          <Route
            path="/admin/users"
            element={
              user && role === "ADMIN" ? <Users /> : <Navigate to="/" />
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              user && role === "ADMIN" ? <UserDetail /> : <Navigate to="/" />
            }
          />
          <Route
            path="/admin/sales"
            element={
              user && role === "ADMIN" ? <SaleApprovals /> : <Navigate to="/" />
            }
          />
          <Route
            path="/admin/kyc"
            element={
              user && role === "ADMIN" ? <KycApprovals /> : <Navigate to="/" />
            }
          />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;