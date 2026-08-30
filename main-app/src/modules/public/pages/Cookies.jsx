import { LegalPage } from "../components"

const sections = [
  {
    title: "What Are Cookies?",
    body: [
      "Cookies are small text files that are stored on your device when you visit our platform. They help us provide you with a better experience by remembering your preferences, keeping you signed in, and understanding how you use PAHMS.",
    ],
  },
  {
    title: "Types of Cookies We Use",
    body: [
      {
        subhead: "Essential Cookies",
        text: "Required for the platform to function properly. These cookies enable core features like authentication, session management, and security. They cannot be disabled.",
      },
      {
        subhead: "Performance Cookies",
        text: "Help us understand how users interact with the platform by collecting anonymous usage statistics. This data helps us improve performance and user experience.",
      },
      {
        subhead: "Functional Cookies",
        text: "Remember your preferences such as language settings, dashboard layout, and notification preferences to provide a personalized experience.",
      },
      {
        subhead: "Analytics Cookies",
        text: "We use analytics tools to understand user behavior, track feature adoption, and measure platform performance. This data is aggregated and anonymized.",
      },
    ],
  },
  {
    title: "How We Use Cookies",
    body: [
      {
        list: [
          "Authenticate users and maintain secure sessions",
          "Remember user preferences and settings",
          "Analyze platform usage and performance",
          "Prevent fraud and enhance security",
          "Improve and optimize the user experience",
        ],
      },
    ],
  },
  {
    title: "Third-Party Cookies",
    body: [
      "Some cookies may be set by third-party services we use, including:",
      {
        list: [
          "Analytics providers (for platform usage insights)",
          "Payment processors (for secure transaction handling)",
          "Communication services (for notification delivery)",
        ],
      },
      "These third parties have their own privacy policies governing how they use such information.",
    ],
  },
  {
    title: "Managing Your Cookie Preferences",
    body: [
      "You can manage cookie preferences through your browser settings. Most browsers allow you to refuse cookies, delete existing cookies, or be notified when a cookie is set.",
      "Please note that disabling essential cookies may affect the functionality of the platform and prevent you from using certain features.",
    ],
  },
  {
    title: "Cookie Duration",
    body: [
      {
        subhead: "Session Cookies",
        text: "Temporary cookies that are deleted when you close your browser.",
      },
      {
        subhead: "Persistent Cookies",
        text: "Remain on your device for a set period (typically 30 days to 1 year) or until you delete them manually.",
      },
    ],
  },
  {
    title: "Updates to This Policy",
    body: [
      "We may update this Cookies Policy from time to time to reflect changes in technology, legislation, or our data practices. We will notify you of significant changes through the platform.",
    ],
  },
  {
    title: "Contact Us",
    body: [
      "If you have questions about our use of cookies, please contact us at privacy@pahms.com or visit our contact page.",
    ],
  },
];

export default function Cookies() {
  return <LegalPage title="Cookies Policy" sections={sections} />;
}
