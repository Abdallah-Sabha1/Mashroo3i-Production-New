"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./dashboard.css";

/* ─────────── Dashboard Navbar ─────────── */
function DashboardNav() {
  return (
    <nav className="dash-nav" id="dashboard-nav">
      <div className="dash-nav-inner">
        <Link href="/" className="navbar-logo" id="dash-logo">
          <div className="logo-icon">M</div>
          <span className="logo-text">Mashroo3i</span>
        </Link>

        <div className="dash-nav-right">
          <span className="dash-plan-badge" id="plan-badge">Pro Plan</span>
          <div className="dash-profile" id="user-profile">
            <div className="dash-profile-info">
              <span className="dash-profile-name">Ahmad Al-Hassan</span>
              <span className="dash-profile-email">ahmad@example.com</span>
            </div>
            <div className="dash-avatar" id="user-avatar">A</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─────────── Stats ─────────── */
const statsData = [
  {
    icon: "💡",
    badge: "Total Ideas",
    badgeColor: "badge-indigo",
    number: "12",
  },
  {
    icon: "🤖",
    badge: "Evaluations",
    badgeColor: "badge-purple",
    number: "8",
  },
  {
    icon: "📊",
    badge: "Avg Score",
    badgeColor: "badge-green",
    number: "82",
  },
  {
    icon: "🎯",
    badge: "Success Rate",
    badgeColor: "badge-yellow",
    number: "75%",
  },
];

function StatsGrid() {
  return (
    <div className="dash-stats-grid">
      {statsData.map((stat, i) => (
        <div
          key={stat.badge}
          className={`dash-stat-card dash-animate dash-animate-delay-${i + 1}`}
          id={`stat-${stat.badge.toLowerCase().replace(/\s/g, "-")}`}
        >
          <div className="dash-stat-top">
            <span className="dash-stat-icon">{stat.icon}</span>
            <span className={`dash-badge ${stat.badgeColor}`}>
              {stat.badge}
            </span>
          </div>
          <div className="dash-stat-number">{stat.number}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────── Quick Action ─────────── */
function QuickAction() {
  return (
    <div className="dash-quick-action dash-animate dash-animate-delay-5" id="quick-action">
      <div className="dash-quick-action-text">
        <h3 className="dash-quick-title">
          Ready to launch your next idea?
        </h3>
        <p className="dash-quick-sub">
          Get AI-powered insights in minutes
        </p>
      </div>
      <button className="dash-quick-btn" id="new-idea-btn">
        + New Business Idea
      </button>
    </div>
  );
}

/* ─────────── Recent Ideas ─────────── */
const ideas = [
  {
    id: 1,
    title: "Healthy Manakish Restaurant",
    category: "Food & Beverage",
    categoryColor: "badge-purple",
    score: 78,
    status: "Evaluated",
  },
  {
    id: 2,
    title: "AI Tutoring Platform",
    category: "Technology",
    categoryColor: "badge-blue",
    score: 85,
    status: "Evaluated",
  },
  {
    id: 3,
    title: "Eco-Friendly Packaging",
    category: "Manufacturing",
    categoryColor: "badge-green",
    score: null,
    status: "Draft",
  },
];

function scoreColor(score: number) {
  if (score >= 80) return "badge-green";
  if (score >= 60) return "badge-yellow";
  return "badge-red";
}

function RecentIdeas() {
  return (
    <section className="dash-ideas-section dash-animate dash-animate-delay-6">
      <div className="dash-ideas-header">
        <h2 className="dash-ideas-title">Your Business Ideas</h2>
        <button className="btn btn-ghost" id="view-all-ideas">
          View All →
        </button>
      </div>

      <div className="dash-ideas-list">
        {ideas.map((idea, i) => (
          <div
            key={idea.id}
            className={`dash-idea-card dash-animate dash-animate-delay-${i + 7}`}
            id={`idea-card-${idea.id}`}
          >
            <div className="dash-idea-left">
              <h3 className="dash-idea-name">{idea.title}</h3>
              <div className="dash-idea-badges">
                <span className={`dash-badge ${idea.categoryColor}`}>
                  {idea.category}
                </span>
                {idea.score !== null && (
                  <span className={`dash-badge ${scoreColor(idea.score)}`}>
                    Score: {idea.score}/100
                  </span>
                )}
                <span
                  className={`dash-badge ${
                    idea.status === "Evaluated"
                      ? "badge-indigo"
                      : "badge-gray"
                  }`}
                >
                  {idea.status}
                </span>
              </div>
            </div>
            <div className="dash-idea-actions">
              <button className="btn btn-ghost btn-sm" id={`view-idea-${idea.id}`}>
                View
              </button>
              <button className="btn btn-primary btn-sm" id={`continue-idea-${idea.id}`}>
                Continue →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────── Page Composition ─────────── */
export default function DashboardPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("dash-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    document.querySelectorAll(".dash-animate").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="dash-page" id="dashboard-page">
      <DashboardNav />

      <main className="dash-main">
        <div className="dash-container">
          {/* Welcome */}
          <div className="dash-welcome dash-animate" id="welcome-section">
            <h1 className="dash-welcome-heading">
              Welcome back, Ahmad! 👋
            </h1>
            <p className="dash-welcome-sub">
              Here&apos;s what&apos;s happening with your business ideas
            </p>
          </div>

          <StatsGrid />
          <QuickAction />
          <RecentIdeas />
        </div>
      </main>
    </div>
  );
}
