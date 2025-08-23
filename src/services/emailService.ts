import nodemailer from "nodemailer";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

interface EmailData {
  email: string;
  userName: string;
  token?: string;
  otpCode?: string;
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_APP,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const readAndPopulateTemplate = (templateName: string, data: EmailData): string => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const templatePath = path.join(__dirname, '..', 'emails', templateName);
  
  let html = fs.readFileSync(templatePath, 'utf-8');
  
  // Replace all placeholders like {{key}} with data from the object
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, data[key as keyof EmailData] || '');
  });

  return html;
};

// --- SERVICE FUNCTIONS ---

const sendOtpResetPassword = async (dataSend: EmailData): Promise<void> => {
  const htmlBody = readAndPopulateTemplate('resetPasswordTemplate.html', dataSend);

  await transporter.sendMail({
    from: '"BAMITO Sports" <your-email@gmail.com>',
    to: dataSend.email,
    subject: "Mã xác thực đổi mật khẩu",
    html: htmlBody,
  });
};

const sendLinkAuthenEmail = async (dataSend: EmailData): Promise<void> => {
  // Create the full activation link to pass to the template
  const activationLink = `${process.env.URL_SERVER}/api/user/auth-email?token=${dataSend.token}`;
  
  const htmlBody = readAndPopulateTemplate('activationTemplate.html', {
    ...dataSend,
    activationLink, // Add the generated link to the data
  });

  await transporter.sendMail({
    from: '"BAMITO Sports" <your-email@gmail.com>',
    to: dataSend.email,
    subject: "Xác thực tài khoản của bạn",
    html: htmlBody,
  });
};

export {
  sendOtpResetPassword,
  sendLinkAuthenEmail,
};
