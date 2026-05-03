import { Resend } from "resend";
import { EmailConfirmation } from "@/components/email-template/email-confirmation";
import { MagicLink } from "@/components/email-template/magic-link";
import { NewUserNotification } from "@/components/email-template/new-user-notification";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "BeliElektronik <noreply@belielektronik.com>";

// Debug logging
console.log("Resend API Key exists:", !!process.env.RESEND_API_KEY);
console.log("Resend API Key length:", process.env.RESEND_API_KEY?.length);
console.log(
  "Resend API Key prefix:",
  process.env.RESEND_API_KEY?.substring(0, 10),
);
console.log("Environment:", process.env.NODE_ENV);
console.log("App URL:", process.env.NEXT_PUBLIC_APP_URL);

export const emailService = {
  sendConfirmationEmail: async ({
    to,
    name,
    confirmationLink,
  }: {
    to: string;
    name: string;
    confirmationLink: string;
  }) => {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: "Konfirmasi Email - BeliElektronik",
        react: EmailConfirmation({
          name,
          confirmationLink,
        }),
      });

      if (error) {
        console.error("Error sending email:", error);
        return {
          success: false,
          message: "Gagal mengirim email konfirmasi",
          data: null,
        };
      }

      console.log("Email sent successfully:", data);
      return {
        success: true,
        message: "Email konfirmasi berhasil dikirim",
        data,
      };
    } catch (error) {
      console.error("Email service error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mengirim email",
        data: null,
      };
    }
  },

  sendMagicLinkEmail: async ({
    to,
    name,
    magicLink,
  }: {
    to: string;
    name: string;
    magicLink: string;
  }) => {
    try {
      console.log("About to send magic link email via Resend...");
      console.log("From:", FROM_EMAIL);
      console.log("To:", to);
      console.log("Subject: Login ke BeliElektronik");
      console.log("Environment:", process.env.NODE_ENV);
      console.log("App URL:", process.env.NEXT_PUBLIC_APP_URL);

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: "Login ke BeliElektronik",
        react: MagicLink({
          name,
          magicLink,
        }),
      });

      console.log("Resend API response received");
      console.log("Data:", data);
      console.log("Error:", error);

      if (error) {
        console.error("Error sending magic link email:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        return {
          success: false,
          message: "Gagal mengirim magic link email",
          data: null,
        };
      }

      console.log("Magic link email sent successfully:", data);
      return {
        success: true,
        message: "Magic link berhasil dikirim ke email kamu",
        data,
      };
    } catch (error) {
      console.error("Magic link email service error:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      console.error(
        "Error name:",
        error instanceof Error ? error.name : "Unknown",
      );
      console.error(
        "Error message:",
        error instanceof Error ? error.message : String(error),
      );
      return {
        success: false,
        message: "Terjadi kesalahan saat mengirim magic link",
        data: null,
      };
    }
  },

  sendNewUserNotification: async ({
    to,
    name,
    email,
    createdBy,
    loginLink,
  }: {
    to: string;
    name: string;
    email: string;
    createdBy?: string;
    loginLink: string;
  }) => {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: "Akun Baru Telah Dibuat - BeliElektronik",
        react: NewUserNotification({
          name,
          email,
          createdBy,
          loginLink,
        }),
      });

      if (error) {
        console.error("Error sending new user notification email:", error);
        return {
          success: false,
          message: "Gagal mengirim email notifikasi pengguna baru",
          data: null,
        };
      }

      console.log("New user notification email sent successfully:", data);
      return {
        success: true,
        message: "Email notifikasi pengguna baru berhasil dikirim",
        data,
      };
    } catch (error) {
      console.error("New user notification email service error:", error);
      return {
        success: false,
        message:
          "Terjadi kesalahan saat mengirim email notifikasi pengguna baru",
        data: null,
      };
    }
  },
};
