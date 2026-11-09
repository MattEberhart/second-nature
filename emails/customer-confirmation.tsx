import { Link, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./components/email-shell";
import { formatMoney } from "@/lib/estimator/money";

type Item = { publicName: string; variantLabel: string; quantity: number; lineTotalCents: number };

const TIME_ZONE = "America/New_York";

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function formatParts(startsAt: string | undefined, fallbackLabel: string) {
  if (!startsAt) return { date: fallbackLabel, time: null };
  const start = new Date(startsAt);
  return {
    date: new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(start),
    time: new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit", timeZoneName: "long" }).format(start),
  };
}

export function CustomerConfirmationEmail(props: {
  name: string;
  appointmentLabel: string;
  startsAt?: string;
  meetUrl: string | null;
  resumeUrl?: string;
  items: Item[];
  subtotalCents: number;
  deliveryFeeCents: number;
  fullServiceFeeCents: number;
  totalCents: number;
}) {
  const { date, time } = formatParts(props.startsAt, props.appointmentLabel);
  const hasEstimate = props.items.length > 0;
  return (
    <EmailShell preview="Your consultation with Second Nature Creative is on the calendar" eyebrow="See you soon" title="You’re on the calendar.">
      <Text style={styles.text}>Hi {firstName(props.name)},</Text>
      <Text style={styles.text}>
        We’re so glad you’re here! Your consultation with Second Nature Creative is officially on the calendar.
      </Text>
      <Text style={styles.text}>
        We can’t wait to hear what you’re dreaming up and explore how our collection can bring your vision to life. Feel free to bring your inspiration, questions, or just the beginnings of an idea. There’s no need to have everything figured out.
      </Text>
      <Section style={styles.card}>
        <Text style={styles.label}>Your Consultation Details</Text>
        <Text style={styles.value}><strong>Date:</strong> {date}</Text>
        {time ? <Text style={styles.value}><strong>Time:</strong> {time}</Text> : null}
        <Text style={styles.value}><strong>Location:</strong> Google Meet</Text>
        {props.meetUrl ? (
          <>
            <Text style={styles.value}>
              <strong>Meeting Link:</strong> <Link href={props.meetUrl} style={{ color: "#7D4E6D" }}>{props.meetUrl}</Link>
            </Text>
            <Link href={props.meetUrl} style={styles.button}>Join Google Meet</Link>
          </>
        ) : null}
      </Section>
      {hasEstimate ? (
        <>
          <Text style={{ ...styles.label, marginTop: "28px" }}>Your starting estimate</Text>
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
            These selections are not reserved just yet. We’ll confirm availability and final pricing with you before anything is finalized. Additional charges may apply for missing or damaged pieces.
          </Text>
          {props.resumeUrl ? <Link href={props.resumeUrl} style={{ ...styles.button, backgroundColor: "#7D4E6D" }}>Review your selections</Link> : null}
        </>
      ) : null}
      <Text style={{ ...styles.text, marginTop: "28px" }}>See you soon!</Text>
      <Text style={styles.text}>Lydia at Second Nature Creative</Text>
    </EmailShell>
  );
}
