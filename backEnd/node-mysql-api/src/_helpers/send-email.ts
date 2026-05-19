import config from '../../config';
import sendGridEmail from './sendgrid';

export default async function sendEmail({ to, subject, html, from = config.emailFrom }: any) {
  if (!config.sendGridApiKey) {
    throw new Error('SendGrid API key is not configured. Email service unavailable.');
  }

  try {
    return await sendGridEmail({ to, subject, html, from });
  } catch (error: any) {
    console.error('Failed to send email to:', to, 'subject:', subject, 'error:', error?.message || error);
    throw error;
  }
}
