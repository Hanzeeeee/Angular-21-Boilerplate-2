import nodemailer from 'nodemailer';
import config from '../../config';
import sendGridEmail from './sendgrid';

export default async function sendEmail({ to, subject, html, from = config.emailFrom }: any) {
  if (config.sendGridApiKey) {
    return await sendGridEmail({ to, subject, html, from });
  }

  if (!config.smtp.host) {
    throw new Error('Email transport is not configured. Provide SENDGRID_API_KEY or SMTP settings.');
  }

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