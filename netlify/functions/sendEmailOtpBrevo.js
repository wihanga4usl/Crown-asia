exports.handler = async (event) => {
  try {
    // Allow only POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    const { email, otp } = JSON.parse(event.body || "{}");

    if (!email || !otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email and OTP are required" }),
      };
    }

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER;

    // 🔴 CRITICAL CHECKS
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "BREVO_API_KEY is missing" }),
      };
    }

    if (!senderEmail) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "BREVO_SENDER is missing" }),
      };
    }

    const payload = {
      sender: {
        name: "Crown Asia Investment",
        email: senderEmail,
      },
      to: [
        {
          email: email,
        },
      ],
      subject: "Your Email Verification Code",
      htmlContent: `
        <div style="font-family:Arial,sans-serif">
          <h2>Email Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing:4px">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
          <br/>
          <small>© Crown Asia Investment</small>
        </div>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const resultText = await response.text();

    if (!response.ok) {
      console.error("Brevo API error:", resultText);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "Brevo API error",
          details: resultText,
        }),
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
      body: JSON.stringify({ error: err.message }),
    };
  }
};