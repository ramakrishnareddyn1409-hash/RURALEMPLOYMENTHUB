import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useInView, animate } from "framer-motion";
import {
  ArrowRight,
  UserCheck,
  IndianRupee,
  Briefcase,
  Bot,
  Bell,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
} from "lucide-react";
import Navbar from "../components/Navbar";

/* ─────────────────────── Animated Counter ─────────────────────── */
function AnimatedCounter({ target, suffix = "", prefix = "" }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const numeric = parseFloat(String(target).replace(/[^0-9.]/g, ""));
    const isFloat = String(target).includes(".");
    const controls = animate(0, numeric, {
      duration: 2.2,
      ease: "easeOut",
      onUpdate(v) {
        setDisplay(isFloat ? v.toFixed(1) : String(Math.floor(v)));
      },
    });
    return controls.stop;
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

/* ─────────────────────── Metric Card ─────────────────────── */
function MetricCard({ value, suffix, prefix, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "42px 20px",
        borderRight: "1px solid #e8e0cc",
        cursor: "default",
        transition: "background 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#f3ede0"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
        fontWeight: 800,
        color: "#1a3a0e",
        lineHeight: 1,
        marginBottom: 8,
      }}>
        <AnimatedCounter target={value} suffix={suffix} prefix={prefix} />
      </span>
      <span style={{ fontSize: "0.88rem", color: "#6b7280", fontWeight: 500 }}>{label}</span>
    </motion.div>
  );
}

/* ─────────────────────── Feature Card ─────────────────────── */
function FeatureCard({ icon: Icon, title, desc, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "32px 28px",
        border: hovered ? "1px solid #2d6a1f" : "1px solid #e5e7eb",
        boxShadow: hovered ? "0 8px 32px rgba(45,106,31,0.12)" : "none",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "all 0.25s ease",
        cursor: "default",
      }}
    >
      <div style={{
        width: 52, height: 52,
        background: "#eaf5ea", color: "#2d6a1f",
        borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 18,
      }}>
        <Icon size={26} />
      </div>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", margin: "0 0 10px", fontFamily: "'Inter', sans-serif" }}>{title}</h3>
      <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.65, margin: 0 }}>{desc}</p>
    </motion.div>
  );
}

/* ─────────────────────── Main Component ─────────────────────── */
const Home = () => {
  const features = [
    { icon: UserCheck,   title: "Smart Attendance",    desc: "Biometric & geo-location based check-in with real-time verification for every rural worker." },
    { icon: IndianRupee, title: "DBT Payments",        desc: "Direct Benefit Transfer salary disbursals with digital wage slips and full audit trail." },
    { icon: Briefcase,   title: "Work Assignments",    desc: "Allocate MGNREGA projects to workers and track progress by village and scheme." },
    { icon: Bot,         title: "AI Assistant",        desc: "24/7 multilingual assistant for workers to resolve queries about pay, schemes, and rights." },
    { icon: Bell,        title: "Smart Notifications", desc: "Automated SMS, WhatsApp & in-app alerts for payments, attendance, and policy updates." },
    { icon: BarChart3,   title: "Analytics & Reports", desc: "Real-time dashboards with attendance heatmaps, payroll summaries, and scheme compliance." },
  ];

  const metrics = [
    { value: "12400", suffix: "+",      prefix: "", label: "Villages Covered" },
    { value: "8.5",   suffix: " Lakh",  prefix: "", label: "Beneficiaries" },
    { value: "37",    suffix: "",        prefix: "", label: "Active Schemes" },
    { value: "29",    suffix: "",        prefix: "", label: "States & UTs" },
  ];

  return (
    <>
      <Helmet>
        <title>Rural Employment Hub — Empowering Rural India</title>
        <meta name="description" content="Digital platform for rural employment management: attendance, payments, work assignments and AI support for MGNREGA workers across India." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Helmet>

      <style>{`
        body { font-family: 'Inter', sans-serif; margin: 0; background: #f6f0e6; }

        /* ── Hero ── */
        .hero-section {
          position: relative; width: 100%; height: 92vh;
          min-height: 560px; display: flex; align-items: center; overflow: hidden; background: #173f35;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background: url('/hero-bg.jpg') center center / cover no-repeat;
          animation: heroZoom 20s ease-in-out infinite alternate;
        }
        @keyframes heroZoom {
          from { transform: scale(1.0); }
          to   { transform: scale(1.08); }
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(12,48,40,0.94) 0%, rgba(18,70,55,0.8) 46%, rgba(156,73,43,0.38) 100%);
        }
        .hero-section::after {
          content: ""; position: absolute; width: 420px; height: 420px; right: -110px; bottom: -180px;
          border: 1px solid rgba(245,189,118,0.5); border-radius: 50%;
          box-shadow: 0 0 0 28px rgba(245,189,118,0.08), 0 0 0 56px rgba(245,189,118,0.05);
          z-index: 1; pointer-events: none;
        }
        .hero-content {
          position: relative; z-index: 2;
          max-width: 780px; padding: 0 5vw;
        }
        .hero-badge {
          display: inline-block; background: #e9a24b; color: #173f35;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.13em;
          padding: 6px 16px; border-radius: 4px; margin-bottom: 22px;
        }
        .hero-heading {
          font-size: clamp(2rem, 5vw, 3.6rem); font-weight: 800; color: #fff;
          line-height: 1.15; margin: 0 0 14px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.4);
        }
        .hero-subheading {
          font-size: clamp(1.3rem, 3vw, 2rem); font-weight: 700; color: #f5bd76;
          margin: 0 0 18px; text-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .hero-description {
          font-size: 1.05rem; color: rgba(255,255,255,0.88);
          line-height: 1.7; margin: 0 0 32px; max-width: 540px;
        }
        .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
        .btn-apply {
          display: inline-flex; align-items: center; gap: 8px;
          background: #e9a24b; color: #173f35; font-weight: 800;
          font-size: 0.95rem; padding: 13px 28px; border-radius: 8px;
          text-decoration: none; transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(212,160,23,0.4);
        }
        .btn-apply:hover {
          background: #f5bd76; transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(212,160,23,0.55);
        }
        .btn-explore {
          display: inline-flex; align-items: center; gap: 8px;
          background: #e9a24b; color: #173f35; font-weight: 800;
          font-size: 0.95rem; padding: 13px 28px; border-radius: 8px;
          text-decoration: none; border: 1.5px solid #e9a24b;
          box-shadow: 0 4px 20px rgba(233,162,75,0.35); transition: all 0.25s ease;
        }
        .btn-explore:hover {
          background: #f5bd76; border-color: #f5bd76; transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(233,162,75,0.5);
        }
        .scroll-hint {
          position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
          color: rgba(255,255,255,0.6); z-index: 2;
        }

        /* ── Metrics ── */
        .metrics-section { background: #f6f0e6; border-bottom: 1px solid #ded0b9; }
        .metrics-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          max-width: 1100px; margin: 0 auto;
        }
        .metrics-grid > div:last-child { border-right: none !important; }

        /* ── About ── */
        .about-section { padding: 96px 5vw; background: #fffaf2; }
        .about-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
        }
        .section-badge {
          display: inline-block; background: #dce9dc; color: #205b4c;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
          padding: 5px 14px; border-radius: 4px; margin-bottom: 18px;
        }
        .section-heading {
          font-size: clamp(1.6rem,3vw,2.4rem); font-weight: 800; color: #111827;
          line-height: 1.2; margin: 0 0 18px;
        }
        .section-body { font-size: 1rem; color: #4b5563; line-height: 1.8; margin: 0 0 24px; }
        .about-list { list-style: none; padding: 0; margin: 0 0 32px; display: flex; flex-direction: column; gap: 10px; }
        .about-list li { font-size: 0.95rem; color: #374151; }
        .about-img-wrap { position: relative; }
        .about-img { width: 100%; border-radius: 16px; object-fit: cover; height: 380px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .about-img-badge {
          position: absolute; bottom: -20px; left: -20px;
          background: #c86643; color: #fff; border-radius: 12px;
          padding: 16px 24px; box-shadow: 0 8px 24px rgba(212,160,23,0.4);
          display: flex; flex-direction: column; align-items: center;
        }
        .badge-number { font-size: 1.8rem; font-weight: 800; line-height: 1; }
        .badge-label { font-size: 0.78rem; font-weight: 600; opacity: 0.9; margin-top: 2px; }

        /* ── Features ── */
        .features-section { padding: 96px 5vw; background: #e8efe7; }
        .features-inner { max-width: 1100px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 56px; }
        .section-subtext { color: #6b7280; font-size: 1.05rem; margin-top: 8px; }
        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .features-section .section-heading { color: #173f35; }
        .features-section .section-subtext { color: #53665d; }


        /* ── Footer ── */
        .footer { background: #0d2410; color: rgba(255,255,255,0.8); }
        .footer-inner {
          max-width: 1100px; margin: 0 auto; padding: 60px 5vw 40px;
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px;
        }
        .footer-logo { font-size: 1.2rem; font-weight: 800; color: #fff; display: block; margin-bottom: 10px; }
        .footer-tagline { font-size: 0.85rem; opacity: 0.6; line-height: 1.5; margin: 0; }
        .footer-links, .footer-contact { display: flex; flex-direction: column; gap: 10px; }
        .footer-links h4, .footer-contact h4 { color: #fff; font-weight: 700; margin: 0 0 6px; font-size: 0.95rem; }
        .footer-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.88rem; transition: color 0.2s; }
        .footer-links a:hover { color: #f0b429; }
        .footer-contact span { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; opacity: 0.6; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding: 20px 5vw; text-align: center; font-size: 0.82rem; opacity: 0.45; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .about-inner { grid-template-columns: 1fr; gap: 40px; }
          .about-img-wrap { order: -1; }
          .features-grid { grid-template-columns: repeat(2,1fr); }
          .footer-inner { grid-template-columns: 1fr; gap: 32px; }
        }
        @media (max-width: 600px) {
          .metrics-grid { grid-template-columns: repeat(2,1fr); }
          .metrics-grid > div:nth-child(2) { border-right: none !important; }
          .features-grid { grid-template-columns: 1fr; }
          .hero-content { padding: 0 20px; }
        }
      `}</style>

      <Navbar />

      {/* ══════════ HERO ══════════ */}
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-badge"
          >
            GOVERNMENT OF INDIA INITIATIVE
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="hero-heading"
          >
            Empowering Rural<br />Employment Management
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.7 }}
            className="hero-subheading"
          >
            Empowering Rural India
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="hero-description"
          >
            Building inclusive development through sustainable rural infrastructure &amp; modern
            employment opportunities for every citizen across India's villages.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.54, duration: 0.7 }}
            className="hero-actions"
          >
            <Link to="/admin" className="btn-explore">
              Admin Login <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-apply">
              <UserCheck size={18} /> Employee Login
            </Link>
          </motion.div>
        </div>
        <motion.div
          animate={{ y: [0, 9, 0] }}
          transition={{ repeat: Infinity, duration: 1.9 }}
          className="scroll-hint"
        >
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* ══════════ METRICS BAR ══════════ */}
      <section className="metrics-section">
        <div className="metrics-grid">
          {metrics.map((m, i) => (
            <MetricCard key={i} delay={i * 0.12} {...m} />
          ))}
        </div>
      </section>

      {/* ══════════ ABOUT ══════════ */}
      <section className="about-section">
        <div className="about-inner">
          <div>
            <span className="section-badge">ABOUT THE HUB</span>
            <h2 className="section-heading">
              Digitising Rural<br />Employment at Scale
            </h2>
            <p className="section-body">
              The Rural Employment Hub is a Government of India initiative to digitise the management
              of MGNREGA and allied rural employment schemes. It unifies biometric attendance, direct
              benefit transfers, AI-assisted grievance redressal, and real-time analytics in one platform.
            </p>
            <ul className="about-list">
              <li>✅ Aadhaar-based biometric verification integrated</li>
              <li>✅ Direct salary transfer to Jan Dhan accounts</li>
              <li>✅ Multi-language support in 12 regional languages</li>
              <li>✅ Offline-capable for low-connectivity rural areas</li>
            </ul>
            <div className="hero-actions">
              {[ ["state_admin", "State Admin"], ["assistant_admin", "Assistant Admin"], ["field_worker", "Field Worker"], ["worker", "Worker"] ].map(([role, label]) => (
                <Link key={role} to={`/register?role=${role}`} className="btn-apply">
                  Register as {label} <ArrowRight size={18} />
                </Link>
              ))}
            </div>
          </div>
          <div className="about-img-wrap">
            <img src="/hero-bg.jpg" alt="Rural village aerial view" className="about-img" />
            <div className="about-img-badge">
              <span className="badge-number">500+</span>
              <span className="badge-label">Districts Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="features-section">
        <div className="features-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <span className="section-badge">PLATFORM FEATURES</span>
            <h2 className="section-heading">Everything You Need to Manage Rural Work</h2>
            <p className="section-subtext">A complete digital ecosystem for administrators and workers alike.</p>
          </motion.div>
          <div className="features-grid">
            {features.map((f, i) => (
              <FeatureCard key={i} delay={i * 0.1} {...f} />
            ))}
          </div>
        </div>
      </section>


      {/* ══════════ FOOTER ══════════ */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <span className="footer-logo">🌾 Rural Employment Hub</span>
            <p className="footer-tagline">Empowering Rural India — Ministry of Rural Development</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/login">Employee Login</Link>
            <Link to="/admin">Admin Login</Link>
            <Link to="/register">Register</Link>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <span><MapPin size={14} /> New Delhi, India</span>
            <span><Phone size={14} /> 1800-111-555</span>
            <span><Mail size={14} /> help@ruralhub.gov.in</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Rural Employment Hub. Government of India Initiative.</p>
        </div>
      </footer>
    </>
  );
};

export default Home;


