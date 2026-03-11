"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─────────── Navbar ─────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
      <div className="navbar-container">
        <a href="#" className="navbar-logo" id="logo">
          <div className="logo-icon">M</div>
          <span className="logo-text">Mashroo3i</span>
        </a>
        <div className="navbar-actions">
          <Link href="/login" className="btn btn-ghost" id="login-btn">
            Login
          </Link>
          <Link href="/register" className="btn btn-primary" id="get-started-btn">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─────────── Hero ─────────── */
function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-container">
        <div className="animate-fade-in-up">
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered Business Planning
          </span>
        </div>

        <h1 className="hero-heading animate-fade-in-up delay-100">
          Turn Your Business
          <br />
          Idea Into Reality
        </h1>

        <p className="hero-subheading animate-fade-in-up delay-200">
          AI-powered platform for Jordanian entrepreneurs to evaluate ideas,
          generate feasibility studies, and create professional business plans in
          minutes.
        </p>

        <div className="hero-actions animate-fade-in-up delay-300">
          <Link href="/register" className="btn btn-primary btn-lg" id="hero-cta-primary">
            Start Free Trial →
          </Link>
          <button className="btn btn-outline btn-lg" id="hero-cta-secondary">
            ▶ Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Stats ─────────── */
const stats = [
  { number: "1,200+", label: "Ideas Evaluated", gradient: "gradient-1" },
  { number: "95%", label: "Success Rate", gradient: "gradient-2" },
  { number: "24/7", label: "AI Support", gradient: "gradient-3" },
];

function Stats() {
  return (
    <section className="stats" id="stats">
      <div className="stats-container">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`stat-card reveal reveal-delay-${i + 1}`}
          >
            <div className={`stat-number ${stat.gradient}`}>{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────── Features ─────────── */
const features = [
  {
    icon: "🤖",
    title: "AI-Powered Evaluation",
    description:
      "Get instant feedback on your business idea with our advanced AI engine trained on successful Jordanian startups.",
  },
  {
    icon: "📊",
    title: "Financial Planning",
    description:
      "Automated financial projections, break-even analysis, and ROI calculations tailored for the Jordan market.",
  },
  {
    icon: "📄",
    title: "Business Plan Generator",
    description:
      "Create professional, investor-ready business plans in minutes with our AI-powered document generator.",
  },
  {
    icon: "🎯",
    title: "Market Analysis",
    description:
      "Get insights on competitors, market size, and opportunities specific to Jordan and the MENA region.",
  },
  {
    icon: "💡",
    title: "SWOT Analysis",
    description:
      "Comprehensive analysis of strengths, weaknesses, opportunities, and threats for your business idea.",
  },
  {
    icon: "📈",
    title: "Growth Tracking",
    description:
      "Monitor your progress and get AI recommendations to optimize your business strategy over time.",
  },
];

function Features() {
  return (
    <section className="features" id="features">
      <div className="features-container">
        <div className="section-header reveal">
          <h2 className="section-title">Everything You Need to Launch</h2>
          <p className="section-subtitle">
            Comprehensive tools for every stage of your business journey
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`feature-card reveal reveal-delay-${i + 1}`}
              id={`feature-${i + 1}`}
            >
              <span className="feature-icon">{feature.icon}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── CTA ─────────── */
function CTA() {
  return (
    <section className="cta" id="cta">
      <div className="cta-container">
        <div className="cta-card reveal">
          <div className="cta-content">
            <h2 className="cta-heading">Ready to Build Your Business?</h2>
            <p className="cta-subheading">
              Join thousands of entrepreneurs who trust Mashroo3i
            </p>
            <Link href="/register" className="btn btn-white btn-lg" id="cta-button">
              Get Started for Free →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Footer ─────────── */
function Footer() {
  return (
    <footer className="footer" id="footer">
      <p>© 2026 Mashroo3i. All rights reserved.</p>
    </footer>
  );
}

/* ─────────── Page Composition ─────────── */
export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
