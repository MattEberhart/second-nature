import { Text } from "@react-email/components";
import { EmailShell, styles } from "./components/email-shell";

export function ContactInquiryCustomerEmail({ name }: { name: string }) {
  return (
    <EmailShell
      preview="We received your Second Nature inquiry"
      eyebrow="Inquiry received"
      title={`Thank you for reaching out, ${name}.`}
    >
      <Text style={styles.text}>
        Your note is safely with Lydia. She’ll review the details and follow up
        within two business days.
      </Text>
      <Text style={styles.text}>
        You can reply directly to this email if there’s anything else you’d like
        her to know.
      </Text>
    </EmailShell>
  );
}
