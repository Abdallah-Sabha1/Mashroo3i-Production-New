"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/services/api";
import "./register.css";

/* ─────────── Types ─────────── */
interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  education: string;
  experience: string;
  businessInterest: string;
}

/* ─────────── Page ─────────── */
export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Call backend API
      const response = await authAPI.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        education: data.education || undefined,
        experience: data.experience || undefined,
        businessInterest: data.businessInterest || undefined,
      });

      // Save token and user info to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.userId.toString());
      localStorage.setItem('userName', response.fullName);
      localStorage.setItem('userEmail', response.email);

      // Show success message
      setSuccessMessage(`Welcome, ${response.fullName}! Redirecting to dashboard...`);

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      // Show error message
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page" id="register-page">
      {/* Decorative background orbs */}
      <div className="register-bg-orb register-bg-orb-1" />
      <div className="register-bg-orb register-bg-orb-2" />
      <div className="register-bg-orb register-bg-orb-3" />

      <div className="register-card-wrapper">
        <div className="register-card" id="register-card">
          {/* ── Logo ── */}
          <div className="register-logo-area">
            <Link href="/" className="register-logo" id="register-logo">
              <div className="register-logo-icon">M</div>
            </Link>
          </div>

          {/* ── Heading ── */}
          <div className="register-header">
            <h1 className="register-title" id="register-title">
              Create Your Account
            </h1>
            <p className="register-subtitle">
              Join Mashroo3i and start building your business
            </p>
          </div>

          {/* ── Success Message ── */}
          {successMessage && (
            <div className="alert alert-success">
              ✓ {successMessage}
            </div>
          )}

          {/* ── Error Message ── */}
          {errorMessage && (
            <div className="alert alert-error">
              ✕ {errorMessage}
            </div>
          )}

          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="register-form"
            id="register-form"
            noValidate
          >
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="form-required">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Ahmad Al-Hassan"
                className={`form-input ${errors.fullName ? "form-input-error" : ""}`}
                {...register("fullName", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
              {errors.fullName && (
                <p className="form-error-text">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="form-required">*</span>
              </label>
              <input
                id="email"
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
              <label htmlFor="password" className="form-label">
                Password <span className="form-required">*</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`form-input ${errors.password ? "form-input-error" : ""}`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="form-error-text">{errors.password.message}</p>
              )}
            </div>

            {/* Divider */}
            <div className="form-divider">
              <div className="form-divider-line" />
              <span className="form-divider-text">Optional Details</span>
              <div className="form-divider-line" />
            </div>

            {/* Education */}
            <div className="form-group">
              <label htmlFor="education" className="form-label">
                Education
              </label>
              <input
                id="education"
                type="text"
                placeholder="Bachelor's in Business"
                className="form-input"
                {...register("education")}
              />
            </div>

            {/* Experience */}
            <div className="form-group">
              <label htmlFor="experience" className="form-label">
                Experience
              </label>
              <input
                id="experience"
                type="text"
                placeholder="5 years in F&B"
                className="form-input"
                {...register("experience")}
              />
            </div>

            {/* Business Interest */}
            <div className="form-group">
              <label htmlFor="businessInterest" className="form-label">
                Business Interest
              </label>
              <input
                id="businessInterest"
                type="text"
                placeholder="Food & Beverage"
                className="form-input"
                {...register("businessInterest")}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="register-submit-btn"
              id="register-submit"
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
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* ── Footer ── */}
          <p className="register-footer" id="register-footer">
            Already have an account?{" "}
            <Link href="/login" className="register-login-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}