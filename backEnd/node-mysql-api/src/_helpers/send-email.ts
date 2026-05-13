import nodemailer from 'nodemailer';
import config from '../../config';

export default async function sendEmail({ to, subject, html, from = config.emailFrom }: any) {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.auth.user,
      pass: config.smtp.auth.pass
    }
  });
  await transporter.sendMail({ from, to, subject, html });
}