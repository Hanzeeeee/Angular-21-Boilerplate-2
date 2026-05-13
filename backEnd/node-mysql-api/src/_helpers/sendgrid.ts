import sgMail from '@sendgrid/mail';
import config from '../../config';

export default async function sendGridEmail({ to, subject, html, from }: any) {
  if (!config.sendGridApiKey) {
    throw new Error('SENDGRID_API_KEY is not configured.');
  }

  sgMail.setApiKey(config.sendGridApiKey);

  await sgMail.send({
    to,
    from,
    subject,
    html
  });
}
