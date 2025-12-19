import emailjs from "@emailjs/browser";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export const sendPasswordOtp = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const uid = auth.currentUser.uid;

  await setDoc(doc(db, "passwordOtps", uid), {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
    attempts: 0,
    used: false,
  });

  await emailjs.send(
    process.env.REACT_APP_EMAILJS_SERVICE_ID,
    process.env.REACT_APP_EMAILJS_PASSWORD_TEMPLATE_ID,
    {
      to_email: auth.currentUser.email,
      otp,
    },
    process.env.REACT_APP_EMAILJS_PUBLIC_KEY
  );
};