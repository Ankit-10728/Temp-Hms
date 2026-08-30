import { useState } from "react";
import axios from "axios";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Headphones,
  Building2,
  Send,
} from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        // `${API_URL}/api/v1/contact`
        "http://localhost:5000/api/v1/contact",
        {
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
        },
      );

      if (response.data.success) {
        setSent(true);
        setForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setTimeout(() => setSent(false), 3500);
      }
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="legal-gradient py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <span className="inline-flex items-center px-4 py-1.5 rounded-fullbg-[#fff3e0] text-[#f7931e] border border-[#f7931e]/20text-sm font-medium">
            Contact Us
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mt-7 text-ink">
            Get in Touch
          </h1>
          <p className="mt-6 text-lg text-ink-soft">
            Have questions about PAHMS? Whether you're looking for a demo, need
            support, or want to partner with us — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INFO.map((i) => {
            const Card = i.href ? "a" : "div";

            return (
              <Card
                key={i.title}
                href={i.href || undefined}
                target={i.href?.startsWith("http") ? "_blank" : undefined}
                rel={i.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group bg-white rounded-2xl border border-line p-7 text-center shadow-sm hover:-translate-y-1 hover:border-[#f7931e] hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#fff3e0] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <i.icon className="w-5 h-5 text-[#f7931e]" />
                </div>

                <h3 className="mt-5 font-semibold text-ink group-hover:text-[#f7931e] transition-colors">
                  {i.title}
                </h3>

                <p className="mt-2 text-ink">{i.line1}</p>
                <p className="mt-1 text-sm text-ink-soft">{i.line2}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16">
          <div>
            <h2 className="font-serif text-4xl font-bold text-ink">
              Let's Start a Conversation
            </h2>
            <p className="mt-5 text-ink-soft leading-relaxed">
              Fill out the form and our team will reach out to you within 24
              hours. Or reach us directly through the contact information
              provided.
            </p>
            <div className="mt-10 space-y-7">
              {REASONS.map((r) => (
                <div key={r.title} className="flex gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${r.bg}`}
                  >
                    <r.icon className={`w-5 h-5 ${r.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{r.title}</h3>
                    <p className="text-sm text-ink-soft mt-1">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={onSubmit}
           className="bg-white border border-line rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300" 
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <Field
                label="Full Name"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={onChange}
              />
              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
              />
              <Field
                label="Phone"
                name="phone"
                placeholder="+91 XXXXX XXXXX"
                value={form.phone}
                onChange={onChange}
              />
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={onChange}
                  className="w-full px-4 py-3 rounded-lg border border-line focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-sm bg-white"
                >
                  <option value="">Select a topic</option>
                  <option>Sales Inquiry</option>
                  <option>Technical Support</option>
                  <option>Enterprise Solutions</option>
                  <option>Partnership</option>
                </select>
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-ink mb-2">
                Message
              </label>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={onChange}
                placeholder="Tell us how we can help..."
                className="w-full px-4 py-3 rounded-lg border border-line focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3.5 rounded-xl disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
              <Send className="w-4 h-4" />
            </button>
            {sent && (
              <p className="mt-4 text-sm text-[#f7931e]">
                Thanks! We'll be in touch shortly.
              </p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ label, ...rest }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">{label}</label>
      <input
        {...rest}
        className="w-full px-4 py-3 rounded-lg border border-line focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-sm"
      />
    </div>
  );
}

const INFO = [
  {
    icon: Mail,
    title: "Email Us",
    line1: "info@pahms.com",
    line2: "We reply within 24 hours",
    href: "mailto:info@pahms.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    line1: "+91 123 456 7890",
    line2: "Mon-Sat, 9AM-6PM IST",
    href: "tel:+911234567890",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    line1: "Connaught Place, New Delhi",
    line2: "India 110001",
    href: "https://maps.google.com/?q=Connaught+Place+New+Delhi",
  },
  {
    icon: Clock,
    title: "Business Hours",
    line1: "Mon - Sat: 9AM - 6PM",
    line2: "Sunday: Closed",
    href: null,
  },
];

const REASONS = [
  {
    icon: MessageSquare,
    title: "Sales Inquiries",
    desc: "Interested in PAHMS for your clinic? Let's discuss your needs.",
   bg: "bg-[#fff3e0]",
color: "text-[#f7931e]",
    
  },
  {
    icon: Headphones,
    title: "Technical Support",
    desc: "Need help with the platform? Our support team is here 24/7.",
 bg: "bg-[#fff8ef]",
color: "text-[#f7931e]",
  },
  {
    icon: Building2,
    title: "Enterprise Solutions",
    desc: "Custom integrations and dedicated support for large organizations.",
   bg: "bg-[#fff8ef]",
color: "text-[#f7931e]",
  },
];