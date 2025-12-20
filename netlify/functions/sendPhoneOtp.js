import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { phone, otp } = JSON.parse(event.body);

    const url = "https://app.text.lk/api/v3/sms/send";
    const payload = {
      recipient: phone,
      sender_id: process.env.TEXTLK_SENDER_ID,
      message: `Your Crown Asia OTP is ${otp}. Valid for 5 minutes.`,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TEXTLK_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}