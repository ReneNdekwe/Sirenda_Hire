import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  await resend.emails.send({
    from: 'Sirenda <noreply@sirenda.rw>',
    to,
    subject,
    html,
  });
} 