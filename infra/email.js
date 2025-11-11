import nodemailer from "nodemailer";
const tranporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  auth: {
    host: process.env.EMAIL_SMTP_USER,
    post: process.env.EMAIL_SMTP_PASSWORD,
  },
  secure: process.env.NODE_ENV === "production" ? true : false,
});

async function send(mailOptions) {
  await tranporter.sendMail(mailOptions);
}

const mail = {
  send,
};

export default mail;
