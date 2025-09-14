import twilio from 'twilio';

// Initialize the Twilio client once and reuse it.
// The '!' tells TypeScript we are sure these environment variables exist.
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;

/**
 * Sends an SMS message to a given phone number using Twilio.
 * @param phoneNumber The recipient's phone number. Should not include the country code.
 * @param message The text body of the message to send.
 * @returns The SID of the message from Twilio upon successful sending.
 * @throws An error if the SMS fails to send.
 */
export const sendSms = async (phoneNumber: string, message: string): Promise<string> => {
  if (!phoneNumber || !message) {
    throw new Error("Phone number and message are required for sending SMS.");
  }

  // Format the phone number to E.164 format for Twilio (e.g., +84912345678)
  const formattedPhone = phoneNumber.startsWith('0')
    ? `+84${phoneNumber.substring(1)}`
    : `+84${phoneNumber}`;

  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone,
    });

    if (response.sid) {
      console.log(`SMS sent successfully to ${formattedPhone}. SID: ${response.sid}`);
      return response.sid;
    } else {
      // This is a fallback for rare cases where the Twilio API might not return an SID but doesn't throw.
      throw new Error("Twilio did not return a message SID.");
    }
  } catch (error: any) {
    console.error("Twilio SMS Error:", error.message);
    // Re-throw a generic, user-friendly error to hide implementation details.
    throw new Error(`Failed to send SMS to ${formattedPhone}. Please try again later.`);
  }
};
