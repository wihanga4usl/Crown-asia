const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

exports.handler = async (event) => {
  try {
    const { phone, otp } = JSON.parse(event.body || "{}");

    if (!phone || !otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Phone or OTP missing" }),
      };
    }

    const url = "https://app.text.lk/api/v3/sms/send";

    const params = new URLSearchParams({
      token: process.env.TEXTLK_API_TOKEN,
      to: phone,
      from: process.env.TEXTLK_SENDER_ID,
      message: `Crown Asia OTP: ${otp}. Valid for 5 minutes.`,
    });

    const res = await fetch(`${url}?${params.toString()}`);

    const text = await res.text(); // ✅ IMPORTANT
    console.log("TEXTLK RAW RESPONSE:", text);

    // Try parsing JSON if possible
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        response: parsed,
      }),
    };
  } catch (err) {
    console.error("SMS ERROR:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send OTP" }),
    };
  }
};