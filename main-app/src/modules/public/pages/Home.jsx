import { useState } from "react";
import { Link } from "react-router-dom";
import heroBanner from "../../../assets/hero_banner.png";
import {
  Zap,
  Shield,
  Heart,
  ArrowRight,
  Play,
  Calendar,
  Stethoscope,
  Pill,
  BarChart3,
  Users,
  Video,
  Bell,
  Syringe,
  FlaskConical,
  ClipboardList,
  Scissors,
  Award,
  Cpu,
  Cloud,
  Database,
  Building2,
  Globe,
  UserPlus,
  Settings,
  Rocket,
  Star,
  Sparkles,
  Lock,
  RefreshCw,
  Headphones,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { SectionHeader } from "../components";

export default function Home() {
  return (
    <div className="bg-white text-ink overflow-x-hidden antialiased selection:bg-accent/10 selection:text-accent">
      <Hero />
      <Features />
      <Stats />
      <WhyUs />
      <HowItWorks />
      <Testimonials />
      <Trust />
      <CTA />
    </div>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section
      className="relative overflow-hidden min-h-[520px] md:min-h-[620px] lg:min-h-[700px] flex items-center bg-no-repeat bg-cover bg-[75%_center] lg:bg-center"
      style={{
        backgroundImage: `url(${heroBanner})`,
      }}
    >
      {/* Mobile overlay only */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-white/60 lg:hidden pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-6 lg:px-10 py-14 sm:py-16 lg:py-24 grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        {/* Left Content */}
        <div className="lg:col-span-7 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-soft text-accent font-semibold text-xs sm:text-sm uppercase tracking-wider border border-accent/20 shadow-sm">
            <Zap className="w-4 h-4 fill-accent/20" />
            Enterprise-Grade Veterinary Platform
          </span>

          <h1 className="mt-6 font-serif text-[2.5rem] sm:text-5xl lg:text-7xl font-bold leading-tight text-ink">
            Transform Your
            <br />
            <span className="relative inline-block text-brand-dark">
              Veterinary
              <span className="absolute left-0 bottom-1 w-full h-2 bg-accent-soft/80 rounded-sm -z-10" />
            </span>{" "}
            Practice
          </h1>

          <p className="mt-6 text-base sm:text-lg leading-8 text-ink-soft max-w-lg mx-auto lg:mx-0">
            PAHMS is a complete multi-tenant SaaS platform designed to digitally
            manage veterinary clinics, pet hospitals, and animal healthcare
            organizations from one centralized system.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Link
              to="/login"
              className="group inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <Play className="w-4 h-4 fill-white" />
              Learn More
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3">
            <span className="inline-flex items-center gap-2 bg-brand-soft border border-brand-light px-4 py-2 rounded-lg text-sm text-ink-soft font-medium">
              <Shield className="w-4 h-4 text-brand" />
              HIPAA Compliant
            </span>

            <span className="inline-flex items-center gap-2 bg-accent-soft/70 border border-accent/20 px-4 py-2 rounded-lg text-sm text-ink-soft font-medium">
              <Heart className="w-4 h-4 text-accent fill-accent/20" />
              500+ Clinics Trust Us
            </span>
          </div>
        </div>

        {/* Empty right side for desktop image */}
        <div className="hidden lg:block lg:col-span-5 min-h-[500px]" />
      </div>
    </section>
  );
}
/* ---------------- Features ---------------- */
const FEATURES = [
  { icon: Calendar, title: "Appointment Management", desc: "Smart scheduling with automated reminders, real-time availability, and drag-and-drop calendar.", tone: "brand" },
  { icon: Stethoscope, title: "Pet Medical Records", desc: "Complete digital health records including diagnostics, surgeries, prescriptions, and treatment history.", tone: "accent" },
  { icon: Pill, title: "Pharmacy Management", desc: "End-to-end medicine inventory, automated reorder alerts, prescription management, and expiry tracking.", tone: "brand" },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time revenue tracking, patient analytics, staff performance metrics, and business insights.", tone: "accent" },
  { icon: Shield, title: "Role-Based Access", desc: "Enterprise-grade RBAC with customizable permissions for doctors, staff, receptionists, and admins.", tone: "brand" },
  { icon: Users, title: "Multi-Tenant SaaS", desc: "Independent workspaces for multiple clinics with isolated data, branding, and subscription plans.", tone: "accent" },
  { icon: Video, title: "Telemedicine", desc: "Built-in video consultations with screen sharing, file uploads, and integrated prescription delivery.", tone: "brand" },
  { icon: Bell, title: "Notification Engine", desc: "Multi-channel notifications via email, SMS, WhatsApp, and in-app alerts for all stakeholders.", tone: "accent" },
  { icon: Syringe, title: "Vaccination Tracking", desc: "Automated vaccination schedules, reminder systems, certificate generation, and compliance tracking.", tone: "brand" },
  { icon: FlaskConical, title: "Lab Management", desc: "Laboratory test ordering, result tracking, report generation, and integration with diagnostics.", tone: "accent" },
  { icon: ClipboardList, title: "Billing System", desc: "Automated invoicing, payment tracking, insurance claims, tax calculations, and financial reports.", tone: "brand" },
  { icon: Scissors, title: "Grooming & Kennel", desc: "Grooming appointments, kennel boarding management, pet daycare scheduling, and service tracking.", tone: "accent" },
];

const TONES = {
  brand: "bg-brand-light text-brand-dark",
  accent: "bg-accent-soft text-accent border border-accent/20",
};

function FeatureCard({ icon: Icon, title, desc, tone }) {
  return (
    <div className="group bg-white border border-line rounded-2xl p-6 shadow-xs hover:shadow-xl hover:border-accent/40 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${TONES[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="mt-5 font-serif text-lg font-bold text-ink tracking-tight transition-colors group-hover:text-accent">{title}</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-soft font-normal">{desc}</p>
      </div>
    </div>
  );
}

function Features() {
  const [showAll, setShowAll] = useState(false);

  // Show 8 items initially, or all 12 when expanded
  const displayedFeatures = showAll ? FEATURES : FEATURES.slice(0, 8);

  return (
    <section className="py-24 bg-gradient-to-b from-brand-soft/40 via-accent-soft/20 to-brand-soft/40 border-y border-line/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionHeader
          badge="Features"
          title="Everything Your Clinic Needs"
          subtitle="A comprehensive suite of tools designed specifically for veterinary healthcare — from appointments to analytics."
        />
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        {/* View More / Show Less Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 bg-white hover:bg-accent-soft text-accent font-semibold px-6 py-3 rounded-xl border border-accent/30 shadow-sm hover:border-accent transition-all duration-200 hover:-translate-y-0.5"
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="w-4 h-4 text-accent" />
              </>
            ) : (
              <>
                View More Features {" "}
                <ChevronDown className="w-4 h-4 text-accent" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Stats ---------------- */
function Stats() {
  const items = [
    { icon: Building2, value: "500+", label: "Clinics Onboarded", tone: "bg-brand-light text-brand-dark" },
    { icon: Heart, value: "1.2M+", label: "Pets Treated", tone: "bg-accent-soft text-accent border border-accent/20" },
    { icon: Users, value: "5,000+", label: "Veterinarians", tone: "bg-brand-light text-brand-dark" },
    { icon: Globe, value: "25+", label: "Cities Covered", tone: "bg-accent-soft text-accent border border-accent/20" },
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map(({ icon: Icon, value, label, tone }) => (
            <div 
              key={label} 
              className="group flex flex-col items-center text-center p-6 rounded-2xl border border-line/60 bg-brand-soft/30 hover:bg-white hover:shadow-md hover:border-accent/30 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 ${tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="mt-5 font-serif text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
                {value}
              </div>
              
              <div className="mt-1.5 text-sm md:text-sm font-medium text-ink-soft">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Why Us ---------------- */
function WhyUs() {
  const items = [
    { icon: Lock, title: "HIPAA Compliant", desc: "Enterprise-grade security standards to protect sensitive patient data at all times.", tone: "bg-brand-light text-brand-dark" },
    { icon: Cpu, title: "AI-Powered Insights", desc: "Smart analytics that predict patient trends, optimize scheduling, and flag inventory shortages.", tone: "bg-accent-soft text-accent border border-accent/20" },
    { icon: Cloud, title: "99.9% Uptime SLA", desc: "Reliable cloud infrastructure with guaranteed availability for mission-critical operations.", tone: "bg-brand-light text-brand-dark" },
    { icon: Database, title: "Data Isolation", desc: "Complete logical data separation between tenants with independent backups and recovery.", tone: "bg-accent-soft text-accent border border-accent/20" },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden border-y border-line/50">
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-light/40 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-soft/60 rounded-full filter blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <SectionHeader
          badge="Why PAHMS"
          badgeColor="accent"
          badgeIcon={Award}
          title="Why Clinics Choose Us"
          subtitle="We don't just build software — we build trust, reliability, and partnerships that last."
        />
        
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, title, desc, tone }) => (
            <div
              key={title}
              className="group rounded-2xl p-7 bg-white border border-line hover:border-accent/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 ${tone}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-bold text-ink tracking-tight transition-colors group-hover:text-accent">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft font-normal">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- How It Works ---------------- */
function HowItWorks() {
  const steps = [
    { n: "01", icon: UserPlus, title: "Register Your Clinic", desc: "Sign up with your clinic details, upload verification documents, and create your workspace in minutes.", tone: "bg-brand-light text-brand-dark", numBg: "bg-brand" },
    { n: "02", icon: Settings, title: "Configure Your System", desc: "Set up departments, add staff with role-based access, configure services, pharmacy, and notification preferences.", tone: "bg-accent-soft text-accent border border-accent/20", numBg: "bg-accent" },
    { n: "03", icon: Rocket, title: "Go Live", desc: "Start managing appointments, patient records, billing, telemedicine, and analytics from your personalized dashboard.", tone: "bg-brand-light text-brand-dark", numBg: "bg-brand" },
  ];
  return (
    <section className="py-24 bg-gradient-to-b from-white via-accent-soft/10 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionHeader
          badge="How It Works"
          badgeColor="accent"
          title="Three Simple Steps"
          subtitle="Get your veterinary clinic up and running on PAHMS in just a few simple steps."
        />
        <div className="mt-20 grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px border-t-2 border-dashed border-accent/30" />
          {steps.map(({ n, icon: Icon, title, desc, tone, numBg }) => (
            <div key={n} className="group text-center relative">
              <div className="relative inline-block transition-transform duration-300 group-hover:scale-105">
                <div className={`w-24 h-24 mx-auto rounded-2xl border border-line flex items-center justify-center shadow-xs ${tone}`}>
                  <Icon className="w-9 h-9" />
                </div>
                <span className={`absolute -top-2 -right-2 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-md ${numBg}`}>
                  {n}
                </span>
              </div>
              <h3 className="mt-8 font-serif text-2xl font-bold text-ink tracking-tight transition-colors group-hover:text-accent">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft max-w-xs mx-auto font-normal">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
function Testimonials() {
  const tcards = [
    { quote: "PAHMS transformed how we manage our clinic. From appointment booking to pharmacy inventory — everything is now in one place. Our efficiency has improved by 60%.", name: "Dr. Priya Sharma", role: "Lead Veterinarian, HappyPaws Clinic, Mumbai", initials: "PS", theme: "bg-brand-light text-brand-dark" },
    { quote: "The multi-tenant architecture is a game-changer. We now manage all three of our clinic branches from a single dashboard with complete data isolation.", name: "Dr. Rajesh Kumar", role: "Owner, PetCare Hospital, Bangalore", initials: "RK", theme: "bg-accent-soft text-accent border border-accent/20" },
    { quote: "Telemedicine integration has been invaluable. We now provide follow-up consultations remotely, saving pet parents time while keeping our schedules efficient.", name: "Dr. Ananya Patel", role: "Veterinary Surgeon, AnimalWelfare Trust, Delhi", initials: "AP", theme: "bg-brand-light text-brand-dark" },
    { quote: "The analytics dashboard gives us insights we never had before — revenue trends, patient demographics, staff performance. It's helped us grow revenue by 35%.", name: "Dr. Vikram Reddy", role: "Clinic Director, VetLife Center, Hyderabad", initials: "VR", theme: "bg-accent-soft text-accent border border-accent/20" },
    { quote: "Vaccination tracking alone saves us hours every week. Automated reminders and certificate generation have reduced no-shows by nearly half.", name: "Dr. Meera Iyer", role: "Head Veterinarian, FurCare Clinic, Chennai", initials: "MI", theme: "bg-brand-light text-brand-dark" },
    { quote: "The role-based access control is perfect for our large team. Receptionists, nurses, and doctors each see exactly what they need without compromising security.", name: "Dr. Arjun Nair", role: "Practice Manager, PetPoint Hospital, Pune", initials: "AN", theme: "bg-accent-soft text-accent border border-accent/20" },
  ];
  return (
    <section className="py-24 bg-slate-50/60 border-y border-line/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionHeader
          badge="Testimonials"
          badgeColor="accent"
          title="Trusted by Veterinarians"
          subtitle="Hear from veterinary professionals who use PAHMS daily to run their clinics more efficiently."
        />
        
        <div className="mt-16 custom-swiper-container">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true, el: '.custom-swiper-pagination' }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
          >
            {tcards.map(({ quote, name, role, initials, theme }) => (
              <SwiperSlide key={name} className="h-full">
                <article className="bg-white border border-line rounded-2xl p-8 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-[340px]">
                  <div>
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-accent/40" fill="currentColor">
                      <path d="M7 7h4v4H7c0 2 1 3 3 4v2c-3 0-6-2-6-6V7zm9 0h4v4h-4c0 2 1 3 3 4v2c-3 0-6-2-6-6V7z" />
                    </svg>
                    <p className="mt-4 text-ink-soft italic leading-relaxed text-sm line-clamp-4">"{quote}"</p>
                  </div>
                  <div>
                    <div className="mt-4 flex gap-0.5 text-accent">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ${theme}`}>
                        {initials}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-ink text-sm truncate">{name}</div>
                        <div className="text-xs text-ink-soft truncate">{role}</div>
                      </div>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="custom-swiper-pagination flex justify-center gap-2 mt-4" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Trust ---------------- */
function Trust() {
  const items = [
    { icon: Lock, title: "End-to-End Encryption", desc: "All communication and stored data encrypted using AES-256 and TLS 1.3 protocols.", tone: "text-brand-dark", bg: "bg-brand-light" },
    { icon: RefreshCw, title: "Seamless Migration", desc: "Free data migration from your existing system with zero downtime and full data integrity.", tone: "text-accent", bg: "bg-accent-soft border border-accent/20" },
    { icon: Headphones, title: "24/7 Support", desc: "Round-the-clock technical support via chat, phone, and email with guaranteed response times.", tone: "text-brand-dark", bg: "bg-brand-light" },
    { icon: BadgeCheck, title: "GDPR Compliant", desc: "Full compliance with global data protection regulations including GDPR and India's DPDP Act.", tone: "text-accent", bg: "bg-accent-soft border border-accent/20" },
  ];
  return (
    <section className="py-20 bg-white border-b border-line/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, title, desc, tone, bg }) => (
          <div key={title} className="rounded-2xl p-6 bg-slate-50/60 border border-line/80 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all duration-300">
            <div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs ${bg}`}>
                <Icon className={`w-5 h-5 ${tone}`} />
              </div>
              <h3 className="mt-5 font-serif text-lg font-bold text-ink tracking-tight">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft font-normal">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTA() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-light/20 via-white to-accent-soft/30 pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center relative z-10 space-y-6">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-soft border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-accent fill-accent/20" /> Start Your Free Trial
        </span>
        <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-ink">
          Ready to Modernize Your <br />Veterinary Practice?
        </h2>
        <p className="text-base md:text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed font-normal">
          Join 500+ clinics already using PAHMS to streamline operations, improve patient care, and grow their practice. No credit card required.
        </p>
        <div className="pt-4 flex flex-wrap gap-4 justify-center">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Get Started Free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Talk to Sales
          </Link>
        </div>
        <p className="pt-2 text-sm font-medium text-ink-soft/80">
          Free 14-day trial • No setup fees • Cancel anytime
        </p>
      </div>
    </section>
  );
}