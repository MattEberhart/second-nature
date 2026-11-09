import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Creative Consulting Services Agreement | Second Nature Creative Studio",
  description:
    "Project services, intellectual property assignment, payment terms, and scope management for Second Nature Creative LLC.",
};

const sections = [
  {
    heading: "1. Services and Scope of Work",
    paragraphs: [
      "Company provides creative direction, branding, graphic design, email marketing, social media consulting, event planning, and styling services. The specific services, deliverables, milestones, and project timelines for each engagement shall be set forth in an attached, mutually signed Project Scope. Only services specifically enumerated in an active, approved Project Scope are included.",
    ],
  },
  {
    heading: "2. Retainer, Payment Schedule, and Invoicing",
    paragraphs: [
      <><strong>Initial Retainer:</strong> A non-refundable booking retainer of fifty percent (50%) of the total project fee is required upon contract signing. Work will not commence, and production calendar slots will not be reserved, until this retainer is received and processed.</>,
      <><strong>Completion Balance:</strong> The remaining fifty percent (50%) balance of the project fee, plus any approved out-of-scope billable hours or incurred expenses, is strictly due upon project completion prior to the release, transfer, or deployment of any final digital assets or working files.</>,
      <><strong>Late Invoices & Work Stoppage:</strong> Invoices are due upon receipt or as specified in the Project Scope. If payment remains outstanding for forty-eight (48) hours following written notice, Company reserves the right to immediately suspend all active production and withhold deliverable handoffs until accounts are brought current.</>,
    ],
  },
  {
    heading: "3. Change Orders and Out-of-Scope Work",
    paragraphs: [
      "Any requests for deliverables, design iterations, consultations, or project scope expansions not explicitly detailed in the approved Project Scope will be treated as out-of-scope work. Out-of-scope services will be billed at Company’s standard hourly consulting rate of $100.00 per hour, or under a separately approved written change order quote. Company is under no obligation to undertake out-of-scope work until written authorization is provided by Client.",
    ],
  },
  {
    heading: "4. Revisions and Feedback Windows",
    paragraphs: [
      <><strong>Included Revisions:</strong> Unless expressly modified in the Project Scope, all creative deliverables include up to two (2) rounds of consolidated revisions. A revision round consists of minor adjustments, font/color tweaks, layout balancing, and copy updates within the originally agreed concept.</>,
      <><strong>Subsequent Revisions:</strong> Any additional revision rounds beyond the two included rounds, or requests that require completely new creative concepts or structural overhauls after concept approval, will be billed at the standard rate of $100.00 per hour.</>,
      <><strong>Review Window:</strong> Client shall review submitted drafts and provide complete, consolidated written feedback within five (5) business days of delivery. If Client fails to provide feedback within five (5) business days, the submitted draft shall be deemed accepted and approved, and Company may proceed to the next milestone.</>,
    ],
  },
  {
    heading: "5. Client Delays, Inactivity, and Project Pauses",
    paragraphs: [
      <><strong>Cooperation:</strong> Timely completion depends on prompt receipt of Client assets (logos, copy, imagery), administrative credentials, and milestone sign-offs.</>,
      <><strong>Inactivity Pause:</strong> If Client fails to communicate, supply requested assets, or provide necessary approvals for a continuous period of fourteen (14) calendar days, the project will automatically be placed on administrative “Paused” status, and Company will release reserved production calendar dates to other clients.</>,
      <><strong>Restart Fee:</strong> To reactivate a paused project and re-enter Company’s active production queue, Client must pay a non-negotiable Project Restart Fee of $250.00 and agree to an updated timeline based on Company’s current workflow capacity.</>,
    ],
  },
  {
    heading: "6. Subcontractors, Assistants, and Production Team",
    paragraphs: [
      "Company reserves full operational discretion to utilize internal assistants, vetted junior designers, copywriters, and independent subcontractors to execute project deliverables without requiring separate written permission from Client. Company retains sole responsibility for creative direction, quality assurance, final deliverable standards, and strict enforcement of confidentiality obligations across all personnel and contractors.",
    ],
  },
  {
    heading: "7. Intellectual Property, Working Files, and Transfer of Ownership",
    paragraphs: [
      <><strong>Full Ownership Upon Final Payment:</strong> Upon full settlement of all project invoices, retainers, and approved additional hourly charges, Company grants and assigns to Client full ownership and title to all final deliverables, including all proprietary working and raw source files created specifically for the project (e.g., editable vector files, Photoshop .PSD files, Illustrator .AI files, InDesign documents, and raw assets).</>,
      <><strong>Withholding for Nonpayment:</strong> Final file exports, full source files, and delegated account ownership will not be delivered, released, or assigned until the final invoice balance is paid in full.</>,
      <><strong>Preliminary Concepts & Background Tools:</strong> Company retains ownership of preliminary concepts, drafts, and proposals not selected by Client, as well as general operational templates, proprietary workflows, and pre-existing design systems.</>,
    ],
  },
  {
    heading: "8. Software, Advertising Budgets, and Third-Party Costs",
    paragraphs: [
      <><strong>External Tool & Software Licenses:</strong> Where specialized third-party tools, paid plugins, custom font licenses, stock photography licenses, or platform subscriptions (e.g., specific email marketing software, domain hosting, or CRM licenses) are required specifically for Client’s project, the direct cost of such tools shall be billed to and paid by Client upon prior written authorization.</>,
      <><strong>Advertising Spend (Direct Card Attachment):</strong> For any social media advertising, Meta Ads, or Google Ads campaigns managed by Company, Client must directly link their own corporate credit or debit card to the respective platform’s advertising billing manager. Company will never front, advance, invoice, or manage client ad spend through Company financial accounts.</>,
    ],
  },
  {
    heading: "9. Marketing Performance and Platform Disclaimers",
    paragraphs: [
      "Digital marketing, social media campaigns, and event turnouts are subject to changing consumer behavior, third-party platform algorithms, and market variables beyond Company’s control. While Company performs all services with professional skill and diligence, no specific revenue, return on ad spend (ROAS), sales conversions, engagement figures, or web traffic levels are guaranteed. Company is not liable for account interruptions, algorithmic demotions, or policy actions imposed by third-party platforms (e.g., Meta, Google, TikTok, or email service providers).",
    ],
  },
  {
    heading: "10. Portfolio and Marketing Attribution",
    paragraphs: [
      "Unless an express non-disclosure agreement or embargo window is agreed upon in the Project Scope, Company reserves the non-exclusive right to display completed designs, branding collateral, creative concepts, and case study overviews on Company’s website, portfolio, and marketing channels for self-promotional purposes.",
    ],
  },
  {
    heading: "11. Termination and Project Cancellation",
    paragraphs: [
      <><strong>Termination by Client:</strong> Client may terminate this Agreement at any time upon written notice. Upon receipt of termination notice: (a) the initial fifty percent (50%) retainer remains strictly non-refundable; and (b) Client will be billed for all work performed up to the date of cancellation at Company’s standard rate of $100.00 per hour, or based on the proportion of milestone deliverables completed.</>,
      <><strong>File Withholding:</strong> No final working files, design deliverables, or project assets will be released or assigned until all outstanding hours, expenses, and invoices are paid and cleared.</>,
      <><strong>Termination by Company:</strong> Company may terminate this Agreement upon written notice if Client fails to cure an invoice delinquency, engages in abusive conduct toward personnel, or remains unresponsive past thirty (30) days.</>,
    ],
  },
  {
    heading: "12. Limitation of Liability and Indemnification",
    paragraphs: [
      "Client agrees to indemnify, defend, and hold harmless Second Nature Creative LLC and its contractors from any liabilities, claims, losses, or legal costs arising out of copyright infringement for materials provided by Client, client-directed advertising claims, or third-party disputes. To the fullest extent permitted by law, Company’s maximum cumulative liability under this Agreement shall not exceed the total fees paid by Client under the applicable Project Scope.",
    ],
  },
  {
    heading: "13. Governing Law and Dispute Resolution",
    paragraphs: [
      "This Agreement shall be governed by and construed in accordance with the laws of the State of North Carolina. Any legal disputes arising out of this Agreement shall be submitted to the exclusive jurisdiction of the state or federal courts located in Mecklenburg County, North Carolina.",
    ],
  },
  {
    heading: "14. Entire Agreement and Amendments",
    paragraphs: [
      "This Agreement and the attached Project Scope constitute the complete agreement between the parties concerning consulting services, superseding all prior oral or written discussions. Any modifications must be executed in writing and signed by authorized representatives of both parties.",
    ],
  },
  {
    heading: "Execution & Signatures",
    paragraphs: [
      <><strong>SECOND NATURE CREATIVE LLC</strong><br /><br />Authorized Signature: ___________________________<br /><br />Printed Name: _________________________________<br /><br />Title: ________________________________________<br /><br />Date: _________________________________________</>,
      <><strong>CLIENT</strong><br /><br />Signature: ____________________________________<br /><br />Printed Legal Name: ____________________________<br /><br />Title / Company: ______________________________<br /><br />Date: _________________________________________</>,
    ],
  },
  {
    heading: "Schedule A: Project Scope Template",
    paragraphs: [
      <><strong>Project Name:</strong><br />[ENTER PROJECT TITLE]</>,
      <><strong>Project Description & Objectives:</strong><br />[SUMMARY OF CAMPAIGN / DESIGN GOALS]</>,
      <><strong>Agreed Deliverables:</strong><br />[ITEMIZED DELIVERABLES, E.G., 1 LOGO SUITE, 6 SOCIAL GRAPHICS, 1 EMAIL TEMPLATE]</>,
      <><strong>Total Project Fee:</strong><br />$[AMOUNT] USD</>,
      <><strong>Payment Milestones:</strong><br />50% Retainer ($[AMOUNT]) due upon signing; 50% Balance ($[AMOUNT]) due prior to final file release.</>,
      <><strong>Estimated Production Timeline:</strong><br />[START DATE] to [COMPLETION DATE]</>,
      <><strong>Included Revisions:</strong><br />2 consolidated rounds per deliverable (5-day feedback window; additional rounds at $100/hr).</>,
      <><strong>Client Materials Required:</strong><br />[BRAND GUIDELINES, RAW IMAGES, AD ACCOUNT ACCESS, COPY]</>,
      <><strong>Project Scope Approval:</strong><br />Client Initials: ________ Company Initials: ________ Date: ________</>,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Creative Consulting Services Agreement"
      description="Project services, intellectual property assignment, payment terms, and scope management"
      details={[
        { label: "Agreement Date", value: "[DATE]" },
        { label: "Project Scope Reference", value: "[REFERENCE]" },
        { label: "Client Full Legal Name", value: "[CLIENT FULL LEGAL NAME]" },
        { label: "Project Name", value: "[PROJECT NAME]" },
      ]}
      sections={[
        {
          heading: "Agreement",
          paragraphs: [
            "This Creative Consulting Services Agreement (\"Agreement\") is entered into by and between Second Nature Creative LLC (\"Company,\" \"we,\" \"our,\" or \"us\") and the client identified above (\"Client\" or \"you\").",
          ],
        },
        ...sections,
      ]}
    />
  );
}
