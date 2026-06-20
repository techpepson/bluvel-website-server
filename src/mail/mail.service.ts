import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('BREVO_SERVER');
    const port = this.configService.get<number>('BREVO_PORT') || 587;
    const user = this.configService.get<string>('BREVO_USER');
    const pass = this.configService.get<string>('BREVO_SMTP_KEY');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  }

  async sendContactSubmissionEmail(data: {
    name: string;
    email: string;
    company?: string;
    service: string;
    budget?: string;
    message: string;
  }) {
    const recipient = 'info@bluvelhq.com'; // Admin notification email
    const subject = `New Contact Submission from ${data.name} - ${data.service}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; border-bottom: 2px solid #eff0f6; padding-bottom: 10px; margin-top: 0;">New Contact Form Submission</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 30%; color: #374151;">Name:</td>
            <td style="padding: 8px 0; color: #4b5563;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
            <td style="padding: 8px 0; color: #4b5563;"><a href="mailto:${data.email}" style="color: #4f46e5; text-decoration: none;">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Company:</td>
            <td style="padding: 8px 0; color: #4b5563;">${data.company || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Service Needed:</td>
            <td style="padding: 8px 0; color: #4b5563;">
              <span style="background-color: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold;">
                ${data.service}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Budget:</td>
            <td style="padding: 8px 0; color: #4b5563;">${data.budget || 'N/A'}</td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #4f46e5; border-radius: 4px;">
          <h4 style="margin-top: 0; margin-bottom: 8px; color: #374151;">Message:</h4>
          <p style="margin: 0; color: #4b5563; line-height: 1.5; white-space: pre-wrap;">${data.message}</p>
        </div>
        
        <div style="margin-top: 25px; font-size: 0.8em; color: #9ca3af; text-align: center; border-top: 1px solid #eff0f6; padding-top: 15px;">
          This message was sent automatically from the Bluvel Website contact form.
        </div>
      </div>
    `;

    try {
      const fromEmail = 'info@bluvelhq.com';
      await this.transporter.sendMail({
        from: `"Bluvel Website" <${fromEmail}>`,
        to: recipient,
        replyTo: data.email,
        subject,
        html: htmlContent,
      });
      this.logger.log(
        `Contact submission email sent successfully for ${data.name}`,
      );
    } catch (error) {
      this.logger.error('Failed to send contact submission email', error.stack);
    }
  }
}
