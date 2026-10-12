import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendInvoiceEmail({ to, subject, html }) {
  try {
    if (!to || !process.env.SMTP_USER) {
      console.warn('Email not sent: missing recipient or SMTP config');
      return { ok: false, error: 'Missing email configuration' };
    }

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });

    console.log(`✓ Email sent to ${to}`);
    return { ok: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email error:', error.message);
    return { ok: false, error: error.message };
  }
}
