import { NavLink, Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import Logo from "./Logo.jsx";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-2 bg-transparent rounded-full p-1">
          {links.map((l) => {
            const active =
              l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  active
                    ? "bg-brand-light text-brand-dark"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {l.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {/* Account Icon Button */}
          <NavLink
            to="/login"
            aria-label="Account"
            className={({ isActive }) =>
              `w-10 h-10 rounded-full flex items-center justify-center transition shadow-xs ${
                isActive
                  ? "bg-brand text-white"
                  : "bg-brand-soft text-brand-dark hover:bg-brand-light border border-brand-light"
              }`
            }
          >
            <User className="w-5 h-5" />
          </NavLink>
        </div>
      </div>
    </header>
  );
}