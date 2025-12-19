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
    const { email, otp } = JSON.parse(event.body || "{}");

    const ref = db.collection("emailOtps").doc(email);
    const snap = await ref.get();

    if (!snap.exists) {
      return { statusCode: 400, body: "OTP not found" };
    }

    const data = snap.data();

    if (data.expiresAt.toDate() < new Date()) {
      return { statusCode: 400, body: "OTP expired" };
    }

    const hash = crypto.createHash("sha256").update(otp).digest("hex");

    if (hash !== data.otpHash) {
      await ref.update({ attempts: data.attempts + 1 });
      return { statusCode: 400, body: "Invalid OTP" };
    }

    await ref.update({ verified: true });

    return {
      statusCode: 200,
      body: JSON.stringify({ verified: true }),
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "Verification failed" };
  }
};