import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const { role } = userDoc.data();

      if (allowedRoles.includes(role)) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [allowedRoles]);

  if (loading) return <div style={{ padding: 40 }}>Checking access...</div>;

  if (!allowed) return <Navigate to="/login" />;

  return children;
}