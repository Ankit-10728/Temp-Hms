import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import Logo from "./Logo.jsx";

export default function Footer() {
  return (
    <footer className="bg-[#0b0b0c] text-slate-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-10">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <Logo light showSubtitle={false} />
            <p className="mt-6 text-sm leading-relaxed text-slate-400 max-w-xs">
              The complete Pet &amp; Animal Healthcare Management System.
              Empowering veterinary clinics with enterprise-grade digital
              solutions.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-slate-400">
            <li>
              <a
                href="mailto:info@pahms.com"
                className="group flex items-center gap-3 hover:text-[#f7931e] transition-colors"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>info@pahms.com</span>
              </a>
            </li>

            <li>
              <a
                href="tel:+911234567890"
                className="group flex items-center gap-3 hover:text-[#f7931e] transition-colors"
              >
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>+91 123 456 7890</span>
              </a>
            </li>

            <li>
              <a
                href="https://maps.google.com/?q=New+Delhi,+India"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 hover:text-[#f7931e] transition-colors"
              >
                <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>New Delhi, India</span>
              </a>
            </li>
          </ul>
          </div>

          <FooterCol
            title="PRODUCT"
            items={[
              { label: "Features", to: "/" },
              { label: "Pricing", to: "/" },
              { label: "About Us", to: "/about" },
              { label: "Contact", to: "/contact" },
            ]}
          />
          <FooterCol
            title="LEGAL"
            items={[
              { label: "Terms & Conditions", to: "/terms" },
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Cookies Policy", to: "/cookies" },
            ]}
          />
          <FooterCol
            title="SUPPORT"
            items={[
              { label: "Help Center", to: "/contact" },
              { label: "Documentation", to: "/contact" },
              { label: "Status", to: "/contact" },
            ]}
          />
        </div>

        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-slate-500">
          <p>© 2026 PAHMS. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link to="/cookies" className="hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <h4 className="text-white text-sm font-semibold tracking-wider">
        {title}
      </h4>
      <ul className="mt-6 space-y-4 text-sm text-slate-400">
        {items.map((i) => (
          <li key={i.label}>
            <Link to={i.to} className="hover:text-white transition">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}