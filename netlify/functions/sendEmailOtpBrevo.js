import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email is required" }),
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email }],
        subject: "Your Crown Asia OTP Code",
        htmlContent: `
          <div style="font-family:Arial">
            <h2>Email Verification</h2>
            <p>Your OTP code is:</p>
            <h1>${otp}</h1>
            <p>This code expires in 5 minutes.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, otp }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}