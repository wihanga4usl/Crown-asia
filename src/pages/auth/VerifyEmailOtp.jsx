import emailjs from "@emailjs/browser";

export const sendEmailOtp = async (email, otp) => {
  return emailjs.send(
    process.env.REACT_APP_EMAILJS_SERVICE_ID,
    process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
    {
      to_email: email,
      otp: otp,
    },
    process.env.REACT_APP_EMAILJS_PUBLIC_KEY
  );
};