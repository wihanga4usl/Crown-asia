export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed",
      };
    }

    const { email } = JSON.parse(event.body || "{}");

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email required" }),
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
          name: process.env.BREVO_SENDER_NAME || "Crown Asia",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent: `
          <div style="font-family:Arial">
            <h2>Email Verification</h2>
            <p>Your OTP code is:</p>
            <h1>${otp}</h1>
            <p>This OTP expires in 5 minutes.</p>
          </div>
        `,
      }),
    });

    const result = await response.text();

    if (!response.ok) {
      console.error("Brevo API error:", result);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        otp, // TEMP for testing
      }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}