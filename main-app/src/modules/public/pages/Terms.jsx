import { LegalPage } from "../components";
const sections = [
  {
    title: "Acceptance of Terms",
    body: [
      "By accessing or using the PAHMS (Pet & Animal Healthcare Management System) platform, you agree to be bound by these Terms and Conditions. If you do not agree to all the terms, you may not access or use the service.",
      "These terms apply to all users of the platform, including clinic administrators, veterinarians, staff members, and any other individuals who access or use the service.",
    ],
  },
  {
    title: "Description of Service",
    body: [
      "PAHMS is a multi-tenant SaaS platform that provides veterinary clinic management tools including appointment scheduling, patient records management, pharmacy management, billing, telemedicine, analytics, and related services.",
      "We reserve the right to modify, suspend, or discontinue any aspect of the service at any time with reasonable notice to users.",
    ],
  },
  {
    title: "User Accounts & Registration",
    body: [
      "To use PAHMS, clinics must register and complete the verification process. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      "You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.",
    ],
  },
  {
    title: "Subscription & Billing",
    body: [
      "PAHMS offers various subscription plans. By subscribing, you agree to pay all applicable fees. Subscription fees are billed in advance on a monthly or annual basis and are non-refundable except as required by law.",
      "We reserve the right to change subscription pricing with 30 days advance notice. Continued use after price changes constitutes acceptance of the new pricing.",
    ],
  },
  {
    title: "Data Ownership & Privacy",
    body: [
      "You retain ownership of all data you input into the platform. PAHMS will not sell, share, or use your data for purposes other than providing the service.",
      "We implement industry-standard security measures to protect your data. Please refer to our Privacy Policy for detailed information about data handling practices.",
    ],
  },
  {
    title: "Acceptable Use",
    body: [
      "You agree not to:",
      {
        list: [
          "Use the platform for any unlawful purpose",
          "Attempt to gain unauthorized access to other accounts or systems",
          "Upload malicious code or interfere with platform operations",
          "Resell or redistribute the service without authorization",
          "Violate any applicable laws or regulations",
        ],
      },
    ],
  },
  {
    title: "Intellectual Property",
    body: [
      "The PAHMS platform, including its design, code, features, documentation, and branding, is the intellectual property of PAHMS Technologies Pvt. Ltd. You may not copy, modify, or reverse engineer any part of the platform.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "PAHMS shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the platform. Our total liability shall not exceed the amount paid by you in the twelve months preceding the claim.",
    ],
  },
  {
    title: "Termination",
    body: [
      "Either party may terminate the agreement at any time. Upon termination, your access to the platform will be revoked, and your data will be retained for 30 days before permanent deletion, unless otherwise required by law.",
    ],
  },
  {
    title: "Governing Law",
    body: [
      "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.",
    ],
  },
  {
    title: "Contact Information",
    body: [
      "For questions about these Terms, please contact us at legal@pahms.com or through our contact page.",
    ],
  },
];

export default function Terms() {
  return <LegalPage title="Terms & Conditions" sections={sections} />;
}
