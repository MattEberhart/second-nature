import { Link, Text } from "@react-email/components";
import { EmailShell, styles } from "./components/email-shell";

export function ResumeEstimateEmail({ name, resumeUrl }: { name: string; resumeUrl: string }) {
  return (
    <EmailShell preview="Your Second Nature estimate is saved" eyebrow="Saved for later" title={`Your ideas are safe, ${name}.`}>
      <Text style={styles.text}>
        We saved your selections so you can come back whenever inspiration strikes. No items are reserved yet—this is simply your place to keep exploring.
      </Text>
      <Link href={resumeUrl} style={styles.button}>Continue your estimate</Link>
      <Text style={{ ...styles.text, fontSize: "13px", marginTop: "26px" }}>
        When everything feels right, choose a complimentary Google Meet with Lydia to talk through the details and possible bundle pricing.
      </Text>
    </EmailShell>
  );
}
