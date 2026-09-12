import { Link, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./components/email-shell";
import { formatMoney } from "@/lib/estimator/money";

type Item = { publicName: string; variantLabel: string; quantity: number; lineTotalCents: number };

export function CustomerConfirmationEmail(props: {
  name: string;
  appointmentLabel: string;
  meetUrl: string | null;
  resumeUrl?: string;
  items: Item[];
  subtotalCents: number;
  deliveryFeeCents: number;
  fullServiceFeeCents: number;
  totalCents: number;
}) {
  return (
    <EmailShell preview="Your estimate and consultation are ready" eyebrow="A thoughtful beginning" title="Your planning call is on the calendar.">
      <Text style={styles.text}>Hi {props.name},</Text>
      <Text style={styles.text}>
        Your starting estimate is below, and Lydia will review availability, details, and possible bundle pricing with you during your consultation.
      </Text>
      <Section style={styles.card}>
        <Text style={styles.label}>Consultation</Text>
        <Text style={styles.value}>{props.appointmentLabel}</Text>
        {props.meetUrl ? <Link href={props.meetUrl} style={styles.button}>Join Google Meet</Link> : null}
      </Section>
      {props.items.map((item) => (
        <Section key={`${item.publicName}-${item.variantLabel}`} style={{ borderBottom: "1px solid #ded8cc", padding: "10px 0" }}>
          <Text style={{ ...styles.value, margin: 0 }}>{item.publicName} · {item.variantLabel}</Text>
          <Text style={{ ...styles.text, fontSize: "13px", margin: "3px 0 0" }}>Qty {item.quantity} · {formatMoney(item.lineTotalCents)}</Text>
        </Section>
      ))}
      <Section style={{ ...styles.card, marginTop: "22px" }}>
        <Text style={styles.label}>Starting estimate</Text>
        <Text style={{ ...styles.value, fontSize: "24px" }}>{formatMoney(props.totalCents)}</Text>
        <Text style={{ ...styles.text, fontSize: "13px", margin: 0 }}>
          Rentals {formatMoney(props.subtotalCents)}{props.deliveryFeeCents ? ` · Delivery ${formatMoney(props.deliveryFeeCents)}` : ""}{props.fullServiceFeeCents ? ` · Full service from ${formatMoney(props.fullServiceFeeCents)}` : ""}
        </Text>
      </Section>
      <Text style={{ ...styles.text, fontSize: "13px" }}>
        These selections are not reserved just yet. Lydia will confirm availability and final pricing with you before anything is finalized. Additional charges may apply for missing or damaged pieces.
      </Text>
      {props.resumeUrl ? <Link href={props.resumeUrl} style={{ ...styles.button, backgroundColor: "#7D4E6D" }}>Review your selections</Link> : null}
    </EmailShell>
  );
}
