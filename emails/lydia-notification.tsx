import { Link, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./components/email-shell";
import { formatMoney } from "@/lib/estimator/money";

export function LydiaNotificationEmail(props: {
  customerName: string;
  customerEmail: string;
  appointmentLabel: string;
  meetUrl: string | null;
  eventDate: string | null;
  venueName: string | null;
  fulfillment: string;
  notes: string | null;
  totalCents: number;
  itemSummary: string[];
  adminUrl: string;
}) {
  return (
    <EmailShell preview={`New consultation with ${props.customerName}`} eyebrow="New planning consultation" title={`${props.customerName} is ready to talk.`}>
      <Section style={styles.card}>
        <Text style={styles.label}>Meeting</Text><Text style={styles.value}>{props.appointmentLabel}</Text>
        <Text style={styles.label}>Email</Text><Text style={styles.value}>{props.customerEmail}</Text>
        <Text style={styles.label}>Event date</Text><Text style={styles.value}>{props.eventDate || "Not decided"}</Text>
        <Text style={styles.label}>Venue</Text><Text style={styles.value}>{props.venueName || "Not provided"}</Text>
        <Text style={styles.label}>Fulfillment</Text><Text style={styles.value}>{props.fulfillment}</Text>
      </Section>
      {props.itemSummary.length ? (
        <>
          <Text style={styles.label}>Selections · {formatMoney(props.totalCents)}</Text>
          {props.itemSummary.map((item) => <Text key={item} style={{ ...styles.text, margin: "5px 0" }}>{item}</Text>)}
        </>
      ) : <Text style={styles.text}>This customer booked a consultation without building an estimate first.</Text>}
      {props.notes ? <><Text style={{ ...styles.label, marginTop: "24px" }}>Notes</Text><Text style={styles.text}>{props.notes}</Text></> : null}
      <Section style={{ marginTop: "28px" }}>
        {props.meetUrl ? <Link href={props.meetUrl} style={styles.button}>Join Google Meet</Link> : null}{" "}
        <Link href={props.adminUrl} style={{ ...styles.button, backgroundColor: "#7D4E6D" }}>Open dashboard</Link>
      </Section>
    </EmailShell>
  );
}
