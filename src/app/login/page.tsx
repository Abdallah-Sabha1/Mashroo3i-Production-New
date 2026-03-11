"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import "../register/register.css";
import "./login.css";

/* ─────────── Types ─────────── */
interface LoginFormData {
  email: string;
  password: string;
}

/* ─────────── Page ─────────── */
export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Login data:", data);
    setIsSubmitting(false);
  };

  return (
    <div className="register-page" id="login-page">
      {/* Decorative background orbs */}
      <div className="register-bg-orb register-bg-orb-1" />
      <div className="register-bg-orb register-bg-orb-2" />
      <div className="register-bg-orb register-bg-orb-3" />

      <div className="register-card-wrapper">
        <div className="register-card login-card" id="login-card">
          {/* ── Logo ── */}
          <div className="register-logo-area">
            <Link href="/" className="register-logo" id="login-logo">
              <div className="register-logo-icon">M</div>
            </Link>
          </div>

          {/* ── Heading ── */}
          <div className="register-header">
            <h1 className="register-title" id="login-title">
              Welcome Back
            </h1>
            <p className="register-subtitle">
              Login to continue building your business
            </p>
          </div>

          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="register-form"
            id="login-form"
            noValidate
          >
            {/* Email */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email <span className="form-required">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="ahmad@example.com"
                className={`form-input ${errors.email ? "form-input-error" : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="form-error-text">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="login-password-header">
                <label htmlFor="login-password" className="form-label">
                  Password <span className="form-required">*</span>
                </label>
                <Link href="#" className="login-forgot-link" id="forgot-password-link">
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className={`form-input ${errors.password ? "form-input-error" : ""}`}
                {...register("password", {
                  required: "Password is required",
                })}
              />
              {errors.password && (
                <p className="form-error-text">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="register-submit-btn"
              id="login-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="register-submit-loading">
                  <svg
                    className="register-spinner"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="32"
                      strokeDashoffset="32"
                    />
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* ── Footer ── */}
          <p className="register-footer" id="login-footer">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="register-login-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
