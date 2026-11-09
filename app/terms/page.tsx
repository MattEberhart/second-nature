import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | Second Nature Creative Studio",
  description:
    "Terms governing public website use, inquiries, and reservation holds for Second Nature Creative LLC.",
};

const sections = [
  {
    heading: "Acceptance of These Terms",
    paragraphs: [
      "Welcome to Second Nature Creative LLC (\"Second Nature,\" \"Company,\" \"we,\" \"our,\" or \"us\"). These Terms of Service govern access to and use of our website, including browsing rental inventory, requesting reservations, scheduling consultations, submitting inquiries, and accessing information about our products and services.",
      "By accessing or using the website, you agree to comply with these Terms to the extent permitted by law. Where affirmative acceptance is required, you will be asked to acknowledge the Terms through an appropriate electronic process. If you do not agree, discontinue use.",
    ],
  },
  {
    heading: "Our Services",
    paragraphs: [
      "Second Nature Creative LLC provides event rentals, décor, tabletop and specialty inventory, event planning, and styling. We also selectively offer tertiary creative and digital services, including graphic design, branding, creative direction, event strategy, email marketing, social media, and related consulting. We operate primarily in Charlotte, North Carolina, and may serve South Carolina, Virginia, Alabama, and other locations at our discretion.",
    ],
  },
  {
    heading: "Eligibility",
    paragraphs: [
      "Individuals entering contracts or placing reservations must be at least 18 years of age and legally capable of entering binding agreements. Adults may book services for events involving minors; the contracting adult remains responsible. Our website is not directed to children under 13.",
    ],
  },
  {
    heading: "Website Information and Availability",
    paragraphs: [
      "We make reasonable efforts to present accurate descriptions, photographs, pricing, inventory, and service information, but content may contain errors or change. Display of an item or service on the website does not guarantee availability for any specific date. We reserve the right to correct pricing or typographical errors and update offerings at any time.",
    ],
  },
  {
    heading: "Inquiries, Soft Holds, and Quotations",
    items: [
      <><strong>Inquiry Process & Soft Holds:</strong> Submitting a rental hold request or inquiry via our website forms does not create a confirmed booking or guarantee inventory availability. Inquiries are logged and evaluated in order of electronic submission timestamp. A soft hold allows us to review incoming requests chronologically to verify if the requested inventory is available for your event date.</>,
      <><strong>Price Validity vs. Inventory Availability:</strong> Unless stated otherwise in writing, quotations provided are valid for seven (7) calendar days from the date sent, meaning the quoted pricing will be honored during that window. However, honoring a price quote does not guarantee that inventory remains available. Inventory is not locked or removed from availability until a formal Event Rental Agreement is signed and the required booking deposit is received. We reserve the right to decline inquiries or notify customers of unavailability at any time.</>,
    ],
  },
  {
    heading: "When a Rental Booking Becomes Binding",
    paragraphs: ["A rental booking becomes legally binding only when:"],
    items: [
      "Second Nature confirms event requirements, logistics, and inventory availability in writing;",
      "The customer reviews, accepts, and electronically signs our formal Event Rental Agreement;",
      "The required initial booking deposit is paid and processed; and",
      "Second Nature issues an official written confirmation.",
    ],
  },
  {
    heading: "Inquiries Are Not Bookings",
    paragraphs: [
      "An inquiry, soft hold, estimate, unsigned proposal, or unaccepted quotation alone does not constitute a booking.",
    ],
  },
  {
    heading: "Rental Payments",
    paragraphs: [
      "Unless specified otherwise in writing within your confirmed booking documentation:",
    ],
    items: [
      <><strong>Booking Deposit:</strong> Rentals require a non-refundable booking deposit of fifty percent (50%) of the total agreed rental price at the time of contract signing to secure your event date and inventory.</>,
      <><strong>Final Balance Due Date:</strong> The remaining balance of the rental fee, along with any applicable delivery charges, refundable security deposits, and taxes, is due fourteen (14) calendar days prior to the scheduled delivery/event date. Bookings made within 14 days of an event require payment in full upon contract signing.</>,
      <><strong>Accepted Payment Methods:</strong> Payments may be processed via Stripe (credit/debit card) or check where approved in writing. Checks are subject to collection; dishonored or bounced checks do not constitute settled payment and may result in immediate cancellation of your hold or booking.</>,
    ],
  },
  {
    heading: "Creative and Digital Services",
    paragraphs: [
      "Creative direction, branding, graphic design, email marketing, and social media consulting are offered strictly as auxiliary, secondary services at our sole discretion.",
    ],
    items: [
      <><strong>No Obligation to Accept Work:</strong> Submitting an inquiry or project brief through the website does not obligate Second Nature to accept, quote, or perform marketing or creative work. All creative and marketing projects are subject to an internal review process, client vetting, and schedule capacity. We reserve the complete right to decline any creative or marketing request without liability.</>,
      <><strong>Separate Agreement Required:</strong> If accepted, creative and consulting projects are governed by a separate, customized Creative Consulting Services Agreement and Scope of Work (SOW).</>,
      <><strong>Third-Party Platforms:</strong> For marketing projects, we do not control and are not responsible or liable for third-party platforms (e.g., Meta, Google, Klaviyo, Mailchimp), including account suspensions, delivery deliverability, or algorithmic changes outside our direct control.</>,
    ],
  },
  {
    heading: "Relationship to Transaction Agreements",
    paragraphs: [
      "These Website Terms of Service govern general website use and inquiry submissions.",
      "Transaction-specific terms are governed by:",
    ],
    items: [
      "The signed Event Rental Agreement (for decor, inventory, setup, and equipment rentals).",
      "The signed Creative Consulting Services Agreement / SOW (for marketing, design, and consulting).",
      "In the event of any direct conflict between these general website Terms and a signed transaction agreement, the terms of the signed transaction agreement shall control.",
    ],
  },
  {
    heading: "Acceptable Use",
    paragraphs: ["You agree not to:"],
    items: [
      "Submit false, misleading, fraudulent, or impersonated contact or event information;",
      "Use the website or forms for any unlawful, harassing, or unauthorized commercial purpose;",
      "Attempt unauthorized access to our systems, servers, or connected databases;",
      "Introduce viruses, malware, bots, or other technologically harmful material;",
      "Scrape, harvest, copy, or index inventory descriptions, photography, pricing formulas, or website content without express written consent;",
      "Interfere with or disrupt the normal operation and security of the website.",
    ],
  },
  {
    heading: "Enforcement",
    paragraphs: [
      "Violations may result in immediate blocking of your IP address, cancellation of pending inquiries, and pursuit of legal remedies where appropriate.",
    ],
  },
  {
    heading: "Professional Conduct",
    paragraphs: [
      "We value professional, respectful interactions. Intimidation, threats, harassment, discrimination, or abusive communication directed toward our staff, delivery crew, contractors, or fellow vendors will not be tolerated. We reserve the right to immediately decline inquiries, cease communications, or terminate agreements in accordance with contract terms in the event of abusive conduct.",
    ],
  },
  {
    heading: "Intellectual Property",
    paragraphs: [
      "All original website text, styling arrangements, photographs, graphics, logos, branding, website design, and curated catalog imagery are the proprietary intellectual property of Second Nature Creative LLC and are protected by applicable copyright, trademark, and trade dress laws. No license or right is granted to download, copy, distribute, or commercially exploit our media without our express prior written permission.",
    ],
  },
  {
    heading: "Materials You Submit",
    paragraphs: [
      "By submitting mood boards, event floor plans, logos, imagery, or reference materials through our website or inquiry forms, you represent that you hold the necessary rights to share them. You grant us a limited, non-exclusive license to review and use those materials solely for evaluating, quoting, and planning your requested services. We will not use proprietary client materials for external marketing without prior consent.",
    ],
  },
  {
    heading: "Event Photography and Portfolio Use",
    paragraphs: [
      "Second Nature reserves the right to photograph our inventory, styling, tabletop concepts, and completed on-site setups at event venues for documentation, marketing, social media, and portfolio use. We make reasonable efforts not to publish sensitive client information or identifiable minors without proper authorization. Specific exclusivity or embargo requests must be agreed upon in your separate Event Rental Agreement.",
    ],
  },
  {
    heading: "Third-Party Services",
    paragraphs: [
      "Our website integrates third-party tools, payment processors (e.g., Stripe), scheduling tools, and form embeds. We are not responsible for the independent uptime, functionality, or privacy policies of these third-party platforms. Your interactions with third-party providers are subject to their respective terms and privacy policies.",
    ],
  },
  {
    heading: "Privacy and Communications",
    paragraphs: [
      <>Personal details submitted through our site are handled in accordance with our <Link className="underline underline-offset-4 hover:text-olive-dark" href="/privacy">Privacy Policy</Link>. Inquiring through our forms does not automatically opt you into promotional email blasts without your consent. Transactional and administrative communications regarding your quotes, bookings, and invoices may still be sent to the email provided as necessary to conduct business.</>,
    ],
  },
  {
    heading: "Website Disclaimer",
    paragraphs: [
      "This website and its contents are provided on an \"as is\" and \"as available\" basis. While we strive to maintain accurate information and continuous uptime, we do not warrant that site functions will be uninterrupted, error-free, or free of technical bugs. Nonwaivable consumer statutory rights remain unaffected.",
    ],
  },
  {
    heading: "Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by applicable law, Second Nature Creative LLC, its officers, employees, and agents shall not be liable for any indirect, incidental, consequential, or punitive damages resulting from:",
    ],
    items: [
      "Temporary website downtime or technical failure of inquiry submission forms;",
      "Customer reliance on outdated or erroneous website descriptions/pricing prior to a signed contract;",
      "Delays or failures resulting from causes beyond our reasonable control (force majeure).",
    ],
  },
  {
    heading: "Liability for Website Use",
    paragraphs: [
      "Our total liability related to website usage shall be limited to the fullest extent permitted by North Carolina law. Operational liabilities for contracted events and rentals are governed exclusively by the executed Event Rental Agreement.",
    ],
  },
  {
    heading: "Governing Law and Venue",
    paragraphs: [
      "These Terms are governed by and construed in accordance with the laws of the State of North Carolina, without regard to conflict of law principles. Any legal disputes arising out of the use of this website shall be resolved in the state or federal courts located in Mecklenburg County, North Carolina.",
    ],
  },
  {
    heading: "Severability",
    paragraphs: [
      "If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, and all remaining provisions shall continue in full legal effect.",
    ],
  },
  {
    heading: "Contact Us",
    paragraphs: [
      <>For questions, notices, or inquiries regarding these Terms of Service, contact us electronically at:<br /><br />Second Nature Creative LLC<br />Charlotte, North Carolina, United States<br />Telephone: <a className="underline underline-offset-4 hover:text-olive-dark" href="tel:+12569750182">256-975-0182</a><br />Email: <a className="underline underline-offset-4 hover:text-olive-dark" href="mailto:hello@secondnaturecreative.com">hello@secondnaturecreative.com</a></>,
      "Official business mailing address available upon request for formal contractual and legal notices.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="Public website use, inquiries, and reservation holds"
      details={[
        { label: "Effective Date", value: "November 6, 2026" },
        { label: "Last Updated", value: "November 6, 2026" },
      ]}
      sections={sections}
    />
  );
}
