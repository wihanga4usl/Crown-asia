const emailjs = require("@emailjs/nodejs");

exports.handler = async (event) => {
  try {
    const { email, otp } = JSON.parse(event.body || "{}");

    if (!email || !otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email and OTP required" }),
      };
    }

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        otp: otp,
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("Email OTP error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send OTP" }),
    };
  }
};