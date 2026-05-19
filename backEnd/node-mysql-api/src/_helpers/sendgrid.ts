import sgMail from '@sendgrid/mail';
import config from '../../config';

if (!config.sendGridApiKey) {
  throw new Error('SENDGRID_API_KEY is not configured.');
}

sgMail.setApiKey(config.sendGridApiKey);

export default async function sendGridEmail({ to, subject, html, from }: any) {
  const msg = {
    to,
    from,
    subject,
    html
  };

  try {
    const response = await sgMail.send(msg);
    return response;
  } catch (error: any) {
    console.error('SendGrid email error:', error?.message || error);
    if (error?.response?.body) {
      console.error('SendGrid response body:', error.response.body);
    }
    throw error;
  }
}
