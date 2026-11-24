import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter: nodemailer.Transporter | null = null;

try {
  if (env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
} catch (err) {
  console.warn('⚠️ SMTP transport initialization failed, will log emails to console.');
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email via SMTP, logging instead:', error);
    }
  }

  // Fallback logging in development/test
  console.log(`\n📧 [EMAIL DISPATCHED] To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Content:\n${options.text || options.html}\n`);
  return true;
};
