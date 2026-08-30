import { Heart, Shield, Zap, Globe, Target, Eye } from "lucide-react";
import SectionHeader from "../components/SectionHeader.jsx";
import aboutBanner from "../../../assets/image.png";

export default function About() {
  return (
    <>
<section className="relative h-screen sm:h-[700px] overflow-hidden">
  
  {/* Background Image */}
 <img
  src={aboutBanner}
  alt="Veterinary"
  className="absolute inset-0 w-full h-full object-cover"
/>

  {/* Overlay */}
 <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-[#f7931e]/20"></div> 

  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center">
    <div className="max-w-xl text-white">

     <span className="inline-block bg-[#f7931e] text-white px-4 sm:px-5 py-2 rounded-full font-medium text-sm sm:text-base shadow-lg"> 
        About PAHMS
      </span>

  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black text-[#f7931e] mt-4 sm:mt-6 leading-tight">
  Revolutionizing{" "}
  <span className="text-[#f7931e] font-black">
    Veterinary Healthcare
  </span>
  
 
</h1>

      <p className="mt-4 sm:mt-6 text-lg sm:text-xl md:text-2xl lg:text-3xl text-white">
        PAHMS was born from a simple observation — veterinary clinics
        deserve powerful digital tools.
      </p>

    </div>
  </div>

</section>

      <section className="bg-brand-soft py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeader
            title="Our Core Values"
            subtitle="The principles that guide every decision we make and every feature we build."
          />
          <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {VALUES.map((v) => (
              <article
                key={v.title}
                className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-line shadow-sm"
              >
               <div className="w-12 sm:w-14 h-12 sm:h-14 mx-auto rounded-2xl bg-[#fff3e0] flex items-center justify-center">
  <v.icon className="w-5 sm:w-6 h-5 sm:h-6 text-[#f7931e]" />
</div>
                <h3 className="mt-4 sm:mt-6 font-semibold text-base sm:text-lg text-ink">
                  {v.title}
                </h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed text-ink-soft">
                  {v.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeader
            badge="Our Team"
            title="Meet the People Behind PAHMS"
            subtitle="A passionate team of engineers, veterinarians, and product experts building the future of animal healthcare."
          />
          <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {TEAM.map((p) => (
              <div key={p.name} className="text-center">
                <img
                  src={p.img}
                  alt={p.name}
                 className="w-full h-32 sm:h-auto aspect-square object-cover rounded-2xl border-2 border-[#f7931e]/20 hover:border-[#f7931e] transition-all duration-300"
                />
                <h3 className="mt-4 sm:mt-6 font-semibold text-base sm:text-lg text-ink">
                  {p.name}
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-section py-12 sm:py-16 md:py-20 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-white">
                {s.value}
              </div>
              <div className="mt-2 text-xs sm:text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function MVCard({ icon: Icon, title, desc, tone }) {
  const bg =
    tone === "brand" ? "bg-brand-light text-brand-dark" : "bg-accent-soft text-accent";
  return (
    <article className="bg-white rounded-2xl border border-line p-6 sm:p-10 shadow-sm">
      <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center ${bg}`}>
        <Icon className="w-5 sm:w-6 h-5 sm:h-6" />
      </div>
      <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-5 sm:mt-7 text-ink">{title}</h3>
      <p className="mt-4 sm:mt-5 text-sm sm:text-base text-ink-soft leading-relaxed">{desc}</p>
    </article>
  );
}

const VALUES = [
  {
    icon: Heart,
    title: "Compassion First",
    desc: "Every feature we build serves the well-being of animals and the people who care for them.",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    desc: "Enterprise-grade security with data isolation ensures your clinic data is always protected.",
  },
  {
    icon: Zap,
    title: "Innovation",
    desc: "We continuously push boundaries to deliver cutting-edge veterinary technology solutions.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    desc: "Making advanced veterinary management tools accessible to clinics of all sizes across India.",
  },
];

const TEAM = [
  {
    name: "Dr. Arjun Mehta",
    role: "Founder & CEO",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Priya Sharma",
    role: "CTO",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Rahul Singh",
    role: "Head of Product",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Dr. Neha Gupta",
    role: "Veterinary Advisor",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
  },
];

const STATS = [
  { value: "2022", label: "Founded" },
  { value: "50+", label: "Team Members" },
  { value: "500+", label: "Clinics Served" },
  { value: "99.9%", label: "Uptime SLA" },
];