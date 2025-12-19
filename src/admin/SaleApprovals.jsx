import { useEffect, useState, useCallback } from "react";
import { Card, Select } from "antd";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function SaleApprovals() {
  const [sales, setSales] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const snap = await getDocs(collection(db, "sales"));
    setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // ✅ wrap with useCallback
  const applyFilter = useCallback(() => {
    if (statusFilter === "ALL") {
      setFiltered(sales);
    } else {
      setFiltered(sales.filter(s => s.status === statusFilter));
    }
  }, [sales, statusFilter]);

  // ✅ dependency fixed
  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200, marginBottom: 20 }}
          options={[
            { value: "ALL", label: "All" },
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
          ]}
        />

        {filtered.map(s => (
          <Card key={s.id} style={{ marginBottom: 12 }}>
            <b>{s.fullName}</b> — LKR {s.investmentAmount}
          </Card>
        ))}
      </Card>
    </div>
  );
}