import { LegalPage } from "../components"

const sections = [
  {
    title: "Information We Collect",
    body: [
      "We collect the following types of information:",
      {
        list: [
          "Personal information: name, email, phone number, clinic details",
          "Professional information: veterinary license, clinic registration documents",
          "Usage data: login activity, feature usage, browser information",
          "Patient data: pet records, medical histories, treatment plans (entered by clinic staff)",
          "Payment information: billing details processed through secure payment gateways",
        ],
      },
    ],
  },
  {
    title: "How We Use Your Information",
    body: [
      "Your information is used to:",
      {
        list: [
          "Provide and maintain the PAHMS platform services",
          "Process clinic registrations and verify credentials",
          "Handle billing, payments, and subscription management",
          "Send important notifications about the service",
          "Improve platform performance and user experience",
          "Ensure security and prevent fraud",
        ],
      },
    ],
  },
  {
    title: "Data Storage & Security",
    body: [
      "We implement enterprise-grade security measures to protect your data, including end-to-end encryption, secure cloud hosting, regular security audits, and multi-factor authentication. All data is stored on secure servers with regular backups.",
      "Each clinic's data is logically isolated using our multi-tenant architecture, ensuring no cross-tenant data access is possible.",
    ],
  },
  {
    title: "Data Sharing & Third Parties",
    body: [
      "We do not sell your personal data or patient records. We may share limited information with:",
      {
        list: [
          "Payment processors for billing purposes",
          "Cloud service providers for hosting and storage",
          "Communication services for notifications (email, SMS, WhatsApp)",
          "Legal authorities when required by law",
        ],
      },
    ],
  },
  {
    title: "Your Rights",
    body: [
      "You have the right to:",
      {
        list: [
          "Access your personal data stored on the platform",
          "Request correction of inaccurate information",
          "Request deletion of your data (subject to legal obligations)",
          "Export your data in a standard format",
          "Opt out of marketing communications",
          "Lodge a complaint with the relevant data protection authority",
        ],
      },
    ],
  },
  {
    title: "Data Retention",
    body: [
      "We retain your data for as long as your account is active or as needed to provide services. After account termination, data is retained for 30 days before permanent deletion. Certain data may be retained longer for legal, regulatory, or legitimate business purposes.",
    ],
  },
  {
    title: "Children's Privacy",
    body: [
      "PAHMS is designed for use by veterinary professionals and clinic administrators. The platform is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children.",
    ],
  },
  {
    title: "Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. We will notify you of any significant changes through the platform or via email. Continued use of the service after changes constitutes acceptance of the updated policy.",
    ],
  },
  {
    title: "Contact Us",
    body: [
      "For privacy-related inquiries, please contact our Data Protection Officer at privacy@pahms.com or through the contact page on our website.",
    ],
  },
];

export default function Privacy() {
  return <LegalPage title="Privacy Policy" sections={sections} />;
}
