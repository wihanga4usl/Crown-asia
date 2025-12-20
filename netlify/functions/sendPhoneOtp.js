exports.handler = async (event) => {
  try {
    const { phone, otp } = JSON.parse(event.body);

    if (!phone || !otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Phone or OTP missing" }),
      };
    }

    const params = new URLSearchParams({
      token: process.env.TEXTLK_API_TOKEN,
      to: phone,
      from: process.env.TEXTLK_SENDER_ID,
      message: `Your Crown Asia OTP is ${otp}. Valid for 5 minutes.`,
    });

    const res = await fetch(
      `https://app.text.lk/api/v3/sms/send?${params.toString()}`
    );

    const data = await res.json();

    console.log("TEXT.LK RESPONSE:", data);

    if (!data.status) {
      throw new Error("Text.lk rejected message");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("SMS ERROR:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send OTP" }),
    };
  }
};