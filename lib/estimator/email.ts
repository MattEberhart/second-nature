import "server-only";
import { Resend } from "resend";
import { ResumeEstimateEmail } from "@/emails/resume-estimate";
import { CustomerConfirmationEmail } from "@/emails/customer-confirmation";
import { LydiaNotificationEmail } from "@/emails/lydia-notification";
import { ContactInquiryOwnerEmail } from "@/emails/contact-inquiry-owner";
import { ContactInquiryCustomerEmail } from "@/emails/contact-inquiry-customer";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Resend is not configured.");
  return new Resend(key);
}

function sender() {
  return process.env.RESEND_FROM_EMAIL || "Second Nature <hello@secondnaturecreative.com>";
}

function ownerEmail() {
  return (
    process.env.LYDIA_EMAIL?.trim() ||
    process.env.ADMIN_EMAILS?.split(",")[0]?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "hello@secondnaturecreative.com"
  );
}

export async function sendResumeEstimate(input: { id: string; name: string; email: string; resumeUrl: string }) {
  const { error } = await client().emails.send(
    {
      from: sender(),
      to: input.email,
      replyTo: ownerEmail(),
      subject: "Your Second Nature estimate is saved",
      react: ResumeEstimateEmail({ name: input.name, resumeUrl: input.resumeUrl }),
    },
    { idempotencyKey: `estimate-resume-${input.id}-${new Date().toISOString().slice(0, 10)}` },
  );
  if (error) throw new Error(error.message);
}

type DeliveryResult = { status: "sent" | "failed"; error?: string };

export async function sendContactInquiryEmails(input: {
  inquiryId: string;
  contactId: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  eventDate: string | null;
  message: string | null;
}): Promise<{ owner: DeliveryResult; customer: DeliveryResult }> {
  const lydiaEmail = ownerEmail();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resend = client();

  const customerPromise = resend.emails
    .send(
      {
        from: sender(),
        to: input.email,
        replyTo: lydiaEmail,
        subject: "We received your Second Nature inquiry",
        react: ContactInquiryCustomerEmail({ name: input.name }),
      },
      { idempotencyKey: `contact-customer-${input.inquiryId}` },
    )
    .then(({ error }) =>
      error
        ? ({ status: "failed", error: error.message } as const)
        : ({ status: "sent" } as const),
    )
    .catch((error: unknown) => ({
      status: "failed" as const,
      error: error instanceof Error ? error.message : "Customer email failed.",
    }));

  const ownerPromise = resend.emails
        .send(
          {
            from: sender(),
            to: lydiaEmail,
            replyTo: input.email,
            subject: `New inquiry: ${input.name}`,
            react: ContactInquiryOwnerEmail({
              name: input.name,
              email: input.email,
              phone: input.phone,
              interest: input.interest,
              eventDate: input.eventDate,
              message: input.message,
              adminUrl: `${siteUrl}/admin/customers/${input.contactId}`,
            }),
          },
          { idempotencyKey: `contact-owner-${input.inquiryId}` },
        )
        .then(({ error }) =>
          error
            ? ({ status: "failed", error: error.message } as const)
            : ({ status: "sent" } as const),
        )
        .catch((error: unknown) => ({
          status: "failed" as const,
          error: error instanceof Error ? error.message : "Owner email failed.",
        }));

  const [owner, customer] = await Promise.all([ownerPromise, customerPromise]);
  return { owner, customer };
}

export async function sendAppointmentEmails(input: {
  estimateId?: string;
  customerName: string;
  customerEmail: string;
  appointmentLabel: string;
  meetUrl: string | null;
  resumeUrl?: string;
  eventDate: string | null;
  venueName: string | null;
  fulfillment: string;
  notes: string | null;
  items: Array<{ publicName: string; variantLabel: string; quantity: number; lineTotalCents: number }>;
  subtotalCents: number;
  deliveryFeeCents: number;
  fullServiceFeeCents: number;
  totalCents: number;
  appointmentId: string;
}) {
  const lydiaEmail = ownerEmail();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resend = client();
  const customer = await resend.emails.send(
    {
      from: sender(),
      to: input.customerEmail,
      replyTo: lydiaEmail,
      subject: "Your Second Nature consultation is confirmed",
      react: CustomerConfirmationEmail({
        name: input.customerName,
        appointmentLabel: input.appointmentLabel,
        meetUrl: input.meetUrl,
        resumeUrl: input.resumeUrl,
        items: input.items,
        subtotalCents: input.subtotalCents,
        deliveryFeeCents: input.deliveryFeeCents,
        fullServiceFeeCents: input.fullServiceFeeCents,
        totalCents: input.totalCents,
      }),
    },
    { idempotencyKey: `appointment-customer-${input.appointmentId}` },
  );
  if (customer.error) throw new Error(customer.error.message);

  const owner = await resend.emails.send(
      {
        from: sender(),
        to: lydiaEmail,
        replyTo: input.customerEmail,
        subject: `New consultation: ${input.customerName}`,
        react: LydiaNotificationEmail({
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          appointmentLabel: input.appointmentLabel,
          meetUrl: input.meetUrl,
          eventDate: input.eventDate,
          venueName: input.venueName,
          fulfillment: input.fulfillment,
          notes: input.notes,
          totalCents: input.totalCents,
          itemSummary: input.items.map((item) => `${item.quantity} × ${item.publicName} · ${item.variantLabel}`),
          adminUrl: `${siteUrl}/admin`,
        }),
      },
      { idempotencyKey: `appointment-owner-${input.appointmentId}` },
    );
  if (owner.error) throw new Error(owner.error.message);
}
