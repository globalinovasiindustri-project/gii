import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import * as React from "react";

type Props = {
  name?: string;
  email: string;
  createdBy?: string;
  loginLink: string;
};

export const NewUserNotification = ({
  name = "Teman",
  email,
  createdBy = "Administrator",
  loginLink,
}: Props) => {
  return (
    <Html lang="id">
      <Head />
      <Preview>Akun baru telah dibuat untuk kamu di BeliElektronik</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Text style={logo}>BeliElektronik</Text>

          {/* Content */}
          <Text style={heading}>Hai, {name}</Text>
          <Text style={paragraph}>
            Akun baru telah dibuat untuk kamu di BeliElektronik oleh {createdBy}
            .
          </Text>

          {/* Account Details */}
          <Container style={detailsBox}>
            <Text style={detailsLabel}>Email</Text>
            <Text style={detailsValue}>{email}</Text>
          </Container>

          <Text style={paragraph}>
            Klik tombol di bawah untuk verifikasi email dan mulai menggunakan
            akun kamu.
          </Text>

          <Button href={loginLink} style={button}>
            Verifikasi & Masuk
          </Button>

          <Text style={smallText}>
            Atau salin link ini ke browser:
            <br />
            <a href={loginLink} style={link}>
              {loginLink}
            </a>
          </Text>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>
            Jika kamu tidak mengharapkan email ini, abaikan saja.
          </Text>

          <Text style={footerBrand}>
            © {new Date().getFullYear()} Global Inovasi Industri
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: "40px 20px",
};

const container = {
  backgroundColor: "#ffffff",
  padding: "40px",
  maxWidth: "480px",
  margin: "0 auto",
};

const logo = {
  fontSize: "24px",
  fontWeight: "700" as const,
  color: "#18181b",
  margin: "0 0 32px 0",
  letterSpacing: "-0.5px",
};

const heading = {
  fontSize: "20px",
  fontWeight: "600" as const,
  color: "#18181b",
  margin: "0 0 8px 0",
};

const paragraph = {
  fontSize: "15px",
  color: "#52525b",
  lineHeight: "24px",
  margin: "0 0 24px 0",
};

const detailsBox = {
  backgroundColor: "#f4f4f5",
  padding: "16px",
  margin: "0 0 24px 0",
};

const detailsLabel = {
  fontSize: "12px",
  color: "#71717a",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const detailsValue = {
  fontSize: "15px",
  color: "#18181b",
  margin: "0",
  fontWeight: "500" as const,
};

const button = {
  backgroundColor: "#18181b",
  color: "#ffffff",
  padding: "14px 24px",
  fontSize: "14px",
  fontWeight: "500" as const,
  textDecoration: "none",
  display: "inline-block",
};

const smallText = {
  fontSize: "13px",
  color: "#71717a",
  lineHeight: "20px",
  margin: "24px 0 0 0",
};

const link = {
  color: "#2563eb",
  textDecoration: "none",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#e4e4e7",
  margin: "32px 0",
};

const footer = {
  fontSize: "12px",
  color: "#a1a1aa",
  lineHeight: "18px",
  margin: "0 0 16px 0",
};

const footerBrand = {
  fontSize: "12px",
  color: "#a1a1aa",
  margin: "0",
};

export default NewUserNotification;
