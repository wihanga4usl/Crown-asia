import { useEffect, useState } from "react";
import {
  Card,
  InputNumber,
  Button,
  message,
  Descriptions,
  Divider,
} from "antd";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function Withdraw() {
  const [wallet, setWallet] = useState(0);
  const [bank, setBank] = useState({});
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const uid = auth.currentUser.uid;

    // wallet
    const walletSnap = await getDoc(doc(db, "wallets", uid));
    if (walletSnap.exists()) {
      setWallet(walletSnap.data().balance || 0);
    }

    // bank
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      setBank({
        bankName: userSnap.data().bankName,
        accountNumber: userSnap.data().accountNumber,
      });
    }
  };

  const submitWithdraw = async () => {
    if (amount <= 0) {
      message.error("Enter valid amount");
      return;
    }

    if (amount > wallet) {
      message.error("Amount exceeds wallet balance");
      return;
    }

    // check pending request
    const q = query(
      collection(db, "withdrawals"),
      where("userId", "==", auth.currentUser.uid),
      where("status", "==", "PENDING")
    );

    const snap = await getDocs(q);
    if (!snap.empty) {
      message.error("You already have a pending withdrawal");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "withdrawals"), {
        userId: auth.currentUser.uid,
        amount,
        status: "PENDING",
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        requestedAt: serverTimestamp(),
      });

      message.success("Withdrawal request submitted");
      setAmount(0);
    } catch {
      message.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, background: "#F6F7FB", minHeight: "100vh" }}>
      <Card
        title="Withdraw Funds"
        style={{ maxWidth: 420, margin: "auto", borderRadius: 16 }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Wallet Balance">
            Rs. {wallet.toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Bank">
            {bank.bankName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Account No">
            {bank.accountNumber || "-"}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <InputNumber
          style={{ width: "100%" }}
          placeholder="Withdrawal amount"
          min={1000}
          value={amount}
          onChange={setAmount}
        />

        <Button
          type="primary"
          block
          loading={loading}
          onClick={submitWithdraw}
          style={{
            marginTop: 16,
            borderRadius: 10,
            background: "linear-gradient(135deg,#F59E0B,#FACC15)",
            border: "none",
            fontWeight: 600,
          }}
        >
          Request Withdrawal
        </Button>
      </Card>
    </div>
  );
}