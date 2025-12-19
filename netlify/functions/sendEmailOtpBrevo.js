export async function handler(event) {
  try {
    const { email, otp } = JSON.parse(event.body);

    if (!email || !otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing email or OTP" }),
      };
    }

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Crown Asia Investment",
          email: process.env.BREVO_SENDER_EMAIL, // 🔥 MUST EXIST
        },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent: `
          <div style="font-family:Arial">
            <h2>OTP Verification</h2>
            <p>Your OTP code is:</p>
            <h1>${otp}</h1>
            <p>This code expires in 5 minutes.</p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Brevo API response:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal error" }),
    };
  }
}