import fetch from "node-fetch";
import crypto from "crypto";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}

const db = admin.firestore();

export const handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body || "{}");

    if (!email) {
      return { statusCode: 400, body: "Email required" };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await db.collection("emailOtps").doc(email).set({
      otpHash,
      attempts: 0,
      verified: false,
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 5 * 60 * 1000)
      ),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BREVO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email }],
        subject: "Email Verification Code",
        htmlContent: `
          <p>Your verification code is:</p>
          <h2>${otp}</h2>
          <p>This code expires in 5 minutes.</p>
        `,
      }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "Failed to send OTP" };
  }
};