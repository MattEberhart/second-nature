import { Button, Text } from "@react-email/components";
import { EmailShell, styles } from "./components/email-shell";

export function ContactInquiryOwnerEmail({
  name,
  email,
  phone,
  interest,
  eventDate,
  message,
  adminUrl,
}: {
  name: string;
  email: string;
  phone: string;
  interest: string;
  eventDate: string | null;
  message: string | null;
  adminUrl: string;
}) {
  return (
    <EmailShell
      preview={`New inquiry from ${name}`}
      eyebrow="New website inquiry"
      title={`${name} would like to connect.`}
    >
      <Text style={styles.label}>Contact</Text>
      <Text style={styles.value}>
        {email}
        <br />
        {phone}
      </Text>
      <Text style={styles.label}>Interested in</Text>
      <Text style={styles.value}>{interest}</Text>
      {eventDate ? (
        <>
          <Text style={styles.label}>Event date</Text>
          <Text style={styles.value}>{eventDate}</Text>
        </>
      ) : null}
      {message ? (
        <>
          <Text style={styles.label}>Message</Text>
          <Text style={styles.value}>{message}</Text>
        </>
      ) : null}
      <Button href={adminUrl} style={styles.button}>
        View customer
      </Button>
    </EmailShell>
  );
}
