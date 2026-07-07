import nodemailer, { Transporter } from 'nodemailer';

class EmailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendVerificationEmail(toEmail: string, rawToken: string): Promise<boolean> {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: toEmail,
                subject: 'Verify your email',
                html: `<p>Click the link below to verify your email:</p><a href="${verificationUrl}">${verificationUrl}</a>`
            });
            return true;
        } catch (err: any) {
            throw new Error(err.message);
        }
    }

    async sendPasswordResetEmail(toEmail: string, rawToken: string): Promise<boolean> {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: toEmail,
                subject: 'Reset your password',
                html: `<p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`
            });
            return true;
        } catch (err: any) {
            throw new Error(err.message);
        }
    }
}

export default EmailService