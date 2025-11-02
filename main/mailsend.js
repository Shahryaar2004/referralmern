import nodemailer from "nodemailer";

export async function sendMail({ to, subject, text, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "davidjohns105555@gmail.com",
        pass: "grzdownuhfvlixbu", // your app password
      },
    });

    const info = await transporter.sendMail({
      from: '"Zapzo" <davidjohns105555@gmail.com>',
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}
