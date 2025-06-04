import { randomBytes } from "crypto";
import { add } from "date-fns";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import { sendEmail } from "../server/email-service";

export async function requestPasswordReset(email: string): Promise<boolean> {
  // Find user by email (case-insensitive)
  const user = await storage.getUserByEmail(email);
  if (!user) {
    return false; // Don't reveal if email exists or not
  }

  // Generate reset token
  const resetToken = randomBytes(32).toString("hex");
  const resetTokenExpires = add(new Date(), { minutes: 10 }); // Token expires in 10 minutes

  // Save reset token to user
  await storage.updateUser(user.id, {
    resetToken,
    resetTokenExpires,
  });

  // Send reset email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: "Reset Your Sirenda Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Sirenda Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2563eb; margin: 0; font-size: 24px;">Sirenda</h2>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Rent a car in Rwanda</p>
            </div>
            
            <h1 style="color: #2563eb; margin-bottom: 20px; text-align: center;">Password Reset Request</h1>
            
            <p style="font-size: 16px; line-height: 1.5; color: #374151;">Hello ${user.fullName},</p>
            
            <p style="font-size: 16px; line-height: 1.5; color: #374151;">We received a request to reset your password for your Sirenda account. Click the button below to reset it:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5; color: #374151;">This link will expire in 10 minutes for security reasons.</p>
            
            <p style="font-size: 16px; line-height: 1.5; color: #374151;">If you didn't request this password reset, you can safely ignore this email.</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #6b7280; margin: 0;">Best regards,<br>The Sirenda Team</p>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                This is an automated message, please do not reply to this email.<br>
                If you need assistance, please contact our support team at support@sirenda.rw
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  return true;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  // Find user with valid reset token
  const user = await storage.getUserByResetToken(token);
  if (!user || !user.resetTokenExpires || new Date() > user.resetTokenExpires) {
    return false;
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user's password and clear reset token
  await storage.updateUser(user.id, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpires: null,
  });

  return true;
} 