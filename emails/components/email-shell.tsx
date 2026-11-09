import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export function EmailShell({
  preview,
  eyebrow,
  title,
  children,
}: {
  preview: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={mark}>
            <Text style={monogram}>SN</Text>
          </Section>
          <Text style={eyebrowStyle}>{eyebrow}</Text>
          <Heading style={heading}>{title}</Heading>
          {children}
          <Hr style={rule} />
          <Text style={footer}>
            Second Nature Creative Studio · Charlotte, North Carolina
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const styles = {
  text: { color: "#49443b", fontSize: "15px", lineHeight: "24px" },
  button: {
    backgroundColor: "#9E9576",
    borderRadius: "7px",
    color: "#FAF8F4",
    display: "inline-block",
    fontSize: "12px",
    letterSpacing: "1.5px",
    padding: "14px 22px",
    textDecoration: "none",
    textTransform: "uppercase" as const,
  },
  card: {
    backgroundColor: "#EBE7DE",
    borderRadius: "12px",
    padding: "18px 22px",
    margin: "22px 0",
  },
  label: { color: "#7D4E6D", fontSize: "11px", letterSpacing: "1.4px", textTransform: "uppercase" as const },
  value: { color: "#28241D", fontSize: "15px", lineHeight: "22px", margin: "4px 0 12px" },
};

const body = { backgroundColor: "#F4F1EA", margin: 0, padding: "36px 12px", fontFamily: "Georgia, 'Times New Roman', serif" };
const container = { backgroundColor: "#FAF8F4", borderRadius: "16px", margin: "0 auto", maxWidth: "600px", padding: "42px" };
const mark = { backgroundColor: "#7D4E6D", borderRadius: "999px", height: "54px", marginBottom: "32px", width: "54px" };
const monogram = { color: "#FAF8F4", fontFamily: "Arial, sans-serif", fontSize: "15px", lineHeight: "54px", margin: 0, textAlign: "center" as const };
const eyebrowStyle = { color: "#9E9576", fontFamily: "Arial, sans-serif", fontSize: "11px", letterSpacing: "2px", margin: "0 0 10px", textTransform: "uppercase" as const };
const heading = { color: "#28241D", fontSize: "34px", fontWeight: 400, lineHeight: "42px", margin: "0 0 24px" };
const rule = { borderColor: "#DED8CC", margin: "36px 0 20px" };
const footer = { color: "#7a7469", fontFamily: "Arial, sans-serif", fontSize: "12px", lineHeight: "19px", margin: 0 };
