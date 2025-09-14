import nodemailer from 'nodemailer';

// --- Interfaces for Type Safety ---
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface UserEmailData {
  email: string;
  userName: string;
  token?: string;
  otpCode?: string;
}

// --- 1. Configure the Nodemailer Transporter ---
// This is the core object that sends the email.
// It's created once and reused for all email sending.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// --- 2. Private Helper Function to Send Email ---
// This function handles the actual sending and error logging.
const _sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...options,
    });
    console.log(`Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error);
    // In a real production app, you might want to throw this error
    // or log it to a dedicated monitoring service.
    throw new Error("Failed to send email.");
  }
};


// --- 3. Public, Use-Case-Specific Functions ---
// These functions are what your services will call. They create the
// specific HTML content for each type of email.

/**
 * Sends an account activation link to a new user.
 */
export const sendLinkAuthenEmail = async (data: UserEmailData): Promise<void> => {
  const activationUrl = `${process.env.URL_CLIENT}/activate?token=${data.token}`;
  
  const html = `
    <h1>Welcome to Bamitop, ${data.userName}!</h1>
    <p>Thank you for registering. Please click the link below to activate your account:</p>
    <a href="${activationUrl}" target="_blank">Activate Your Account</a>
    <p>This link will expire in 24 hours.</p>
  `;

  await _sendEmail({
    to: data.email,
    subject: 'Activate Your Bamitop Account',
    html: html,
  });
};

/**
 * Sends a password reset OTP code to a user.
 */
export const sendOtpResetPassword = async (data: UserEmailData): Promise<void> => {
  const html = `
    <h1>Bamitop Password Reset</h1>
    <p>Hello ${data.userName},</p>
    <p>You requested a password reset. Use the following One-Time Password (OTP) to proceed. This code is valid for 5 minutes.</p>
    <h2>${data.otpCode}</h2>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await _sendEmail({
    to: data.email,
    subject: 'Your Bamitop Password Reset Code',
    html: html,
  });
};

/**

 * Sends an order confirmation email.
 * (Example of another common e-commerce email)
 */
export const sendOrderConfirmation = async (email: string, orderDetails: any): Promise<void> => {
  // In a real app, you would use a templating engine like EJS or Handlebars
  // to generate this HTML from the orderDetails object.
  const html = `
    <h1>Your Order #${orderDetails.orderId} is Confirmed!</h1>
    <p>Thank you for your purchase. We're getting your order ready for shipment.</p>
    <p>Total Amount: $${orderDetails.totalPrice}</p>
    <!-- ... more order details ... -->
  `;

  await _sendEmail({
    to: email,
    subject: `Your Bamitop Order Confirmation #${orderDetails.orderId}`,
    html: html,
  });
};
