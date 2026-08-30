import { LoaderCircle, LogIn, Mail, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { authApi, googleLoginApi } from "../../auth/api/authApi";
import API from "../../../shared/api/axios";
import { getDashboardPathForRole, normalizeRole } from "../../../shared/utils/roleRedirects";
import PasswordInput from "../../../shared/components/PasswordInput";

// Must match the 30s cooldown window in resendLoginOtp, backend/src/controllers/authController.js
const RESEND_COOLDOWN_SECONDS = 30;
const OTP_VALIDITY_SECONDS = 5 * 60;

export default function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [showVerificationModal, setShowVerificationModal] =
    useState(false);


  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [sessionExpired] = useState(
    () => new URLSearchParams(window.location.search).get("sessionExpired") === "1"
  );

  const openOtpVerification = useCallback((response, values = {}) => {
    const role = response.user?.role || response.role;
    const email = values.email || response.user?.email || response.googleUser?.email || "";
    const phone = values.phone || response.user?.mobile || "";

    if (response.role !== "SUPER_ADMIN") {
      localStorage.setItem("totpRequired", response.requiresTotpSetup ? "true" : "false");
      localStorage.setItem("passwordResetRequired", response.requiresPasswordReset ? "true" : "false");
    }

    localStorage.setItem("role", normalizeRole(role));
    localStorage.setItem("user", JSON.stringify(response.user || response.googleUser || {}));
    localStorage.setItem("userEmail", email);

    setForm((prev) => ({
      ...prev,
      email: email || prev.email,
      phone: phone || prev.phone,
    }));
    setOtp(["", "", "", "", "", ""]);
    setOtpExpiresAt(Date.now() + OTP_VALIDITY_SECONDS * 1000);
    setResendSeconds(RESEND_COOLDOWN_SECONDS);
    setShowVerificationModal(true);
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await API.post("/auth/resend-otp", { email: form.email });
      setOtp(["", "", "", "", "", ""]);
      setOtpExpiresAt(Date.now() + OTP_VALIDITY_SECONDS * 1000);
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const data = error.response?.data;
      if (data?.retryAfter) {
        setResendSeconds(data.retryAfter);
      }
      alert(data?.message || "Unable to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleCredential = useCallback(async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      alert("Google login failed. Please try again.");
      return;
    }

    setGoogleLoading(true);

    try {
      const response = await googleLoginApi(credentialResponse.credential);
      openOtpVerification(response);
    } catch (error) {
      alert(error.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  }, [openOtpVerification]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      if (localStorage.getItem("passwordResetRequired") === "true") {
        navigate("/change-password", { replace: true });
        return;
      }

      if (localStorage.getItem("totpRequired") === "true") {
        navigate("/enable-totp", { replace: true });
        return;
      }

      const dashboardPath = getDashboardPathForRole(role);
      if (dashboardPath) navigate(dashboardPath, { replace: true });
      return;
    }

    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("passwordResetRequired");
    localStorage.removeItem("totpRequired");
    sessionStorage.clear();
  }, [navigate]);

  useEffect(() => {
    if (!googleClientId) return;

    let isMounted = true;

    const renderGoogleButton = () => {
      if (!isMounted || !window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 382,
      });
    };

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else if (existingScript) {
      existingScript.addEventListener("load", renderGoogleButton);
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderGoogleButton);
      document.body.appendChild(script);
    }

    return () => {
      isMounted = false;
      existingScript?.removeEventListener("load", renderGoogleButton);
    };
  }, [googleClientId, handleGoogleCredential]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };
  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
    ) {
      newErrors.email = "Enter a valid email";
    }

    // Phone is optional - only validated if provided
    if (form.phone.trim() && !/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone =
        "Enter a valid 10-digit mobile number";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoginLoading(true);

    try {
      // ===========================
      // LOGIN API CALL HERE
      // ===========================

      const response = await authApi({
        email: form.email,
        password: form.password,
        phone: form.phone,
      });

      openOtpVerification(response, {
        email: form.email,
        phone: form.phone,
      });
    } catch (error) {
      console.error("Login Error:", error);
      console.log(error.response?.data);

      alert(
        error.response?.data?.message ||
        error.message ||
        "Login Failed"
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = async () => {
    // Guards against double-submission (double-click, or a slow network
    // making the user click again): without this, two verify-otp requests
    // can both fire - the first consumes the OTP and logs the user in, the
    // second then correctly fails against the now-used code and pops an
    // "Invalid OTP" alert even though the user is already authenticated.
    if (otpVerifyLoading) return;
    setOtpVerifyLoading(true);
    try {
      await runOtpVerification();
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  const runOtpVerification = async () => {
    const role = localStorage.getItem("role");
    let verifyEndpoint;
    const otpValue = otp.join("");

    if (!/^\d{6}$/.test(otpValue))
      return alert("Please enter a valid 6 digit OTP");
    if (otpExpiresAt && new Date(otpExpiresAt).getTime() <= Date.now()) {
      return alert("OTP has expired. Please request a new OTP.");
    }

    if (role === "SUPER_ADMIN") {
      verifyEndpoint = "/auth/superadmin/verify-otp";
    } else if (role === "CLINIC_ADMIN") {
      verifyEndpoint = "/auth/clinicadmin/verify-otp";
    } else {
      verifyEndpoint = "/auth/staff/verify-otp";
    }
    const payload = {
      email: form.email,
      otp: otp.join("")
    };

    // 2. Make Verification Call & Set Token
    // 2. Make Verification Call & Set Token
    try {
      const verifyRes = await API.post(verifyEndpoint, payload);

      // A staff account with more than one assigned role doesn't get a
      // dashboard token yet - it gets a short-lived role-selection token
      // instead, and the user picks which dashboard to open next.
      if (verifyRes.data?.needsRoleSelection) {
        sessionStorage.setItem("roleSelectionToken", verifyRes.data.roleSelectionToken);
        sessionStorage.setItem("availableRoles", JSON.stringify(verifyRes.data.roles || []));
        localStorage.setItem("user", JSON.stringify(verifyRes.data.user || {}));
        return navigate("/select-role", { replace: true });
      }

      if (verifyRes.data?.token) {
        localStorage.setItem("token", verifyRes.data.token);
        localStorage.setItem("role", normalizeRole(verifyRes.data.role || role));
        localStorage.setItem("availableRoles", JSON.stringify(verifyRes.data.roles || [verifyRes.data.role || role]));

        // =========== FORCE PASSWORD LOGIC ===========
        if (verifyRes.data?.requiresPasswordReset) {
          localStorage.setItem("passwordResetRequired", "true");
          return navigate("/change-password", { replace: true });
        } else {
          localStorage.setItem("passwordResetRequired", "false");
        }
        // ============================================

      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      alert(error.response?.data?.message || "OTP Verification failed on server");
      return;
    }

    // 3. Navigate to Dashboard with history replaced
    try {
      const redirectRes = await API.get("/dashboard");
      const redirectUrl = redirectRes.data?.data?.redirectUrl;

      if (redirectUrl) {
        return navigate(redirectUrl, { replace: true });
      }
    } catch (e) {
      console.warn("Dashboard redirect failed", e);
    }

    const fallbackPath = getDashboardPathForRole(role);
    if (fallbackPath) return navigate(fallbackPath, { replace: true });
    alert(`Login succeeded but no dashboard is configured for role: "${localStorage.getItem("role")}". Please contact support.`);

  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      {/* LOGO */}

      <div className="w-14 h-14 rounded-2xl bg-[#0C3D2E] flex items-center justify-center">
        <LogIn className="w-7 h-7 text-white" />
      </div>

      <h1 className="mt-6 font-serif text-4xl font-bold text-slate-900">
        Welcome back
      </h1>

      <p className="mt-2 text-slate-500">
        Log in to your account
      </p>

      {sessionExpired && (
        <div className="mt-4 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Your session has expired. Please log in again.
        </div>
      )}

      {/* LOGIN FORM */}

      <form
        onSubmit={handleSubmit}
        className="mt-10 w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8"
      >
        {/* GOOGLE BUTTON */}

        {googleClientId ? (
          <div className="w-full min-h-11 flex justify-center">
            <div
              ref={googleButtonRef}
              className={googleLoading ? "pointer-events-none opacity-60" : ""}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => alert("Google login is not configured")}
            className="w-full border border-slate-200 rounded-xl py-3 flex items-center justify-center gap-3 font-medium hover:bg-slate-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-500">
            OR
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* EMAIL */}

        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Email
        </label>

        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className={`w-full rounded-xl pl-10 pr-4 py-3 focus:outline-none ${errors.email
                ? "border border-red-500"
                : "border border-green-600"
              }`}
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">
            {errors.email}
          </p>
        )}
        {/* PHONE */}

        <label className="block text-sm font-semibold text-slate-900 mt-5 mb-2">
          Phone Number
        </label>

        <div className="relative">
          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");

              if (value.length <= 10) {
                setForm({
                  ...form,
                  phone: value,
                });

                setErrors({
                  ...errors,
                  phone: "",
                });
              }
            }}
            placeholder="Enter phone number"
            className={`w-full rounded-xl pl-10 pr-4 py-3 ${errors.phone
                ? "border border-red-500"
                : "border border-slate-200"
              }`}
          />
        </div>
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">
            {errors.phone}
          </p>
        )}
        {/* PASSWORD */}

        <div className="flex justify-between items-center mt-5 mb-2">
          <label className="text-sm font-semibold text-slate-900">
            Password
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-green-700 hover:text-green-800">
            Forgot Password?
          </Link>
        </div>

        <PasswordInput
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
          error={errors.password}
        />
        <button
          type="submit"
          disabled={loginLoading}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C3D2E] py-3.5 font-semibold text-white transition hover:bg-[#092E23] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loginLoading ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to="/create-account" className="font-medium text-green-700 hover:text-green-800">
            Create Account
          </Link>
        </p>
      </form>

      {/* ================================= */}
      {/* VERIFICATION MODAL */}
      {/* ================================= */}

      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center">
              OTP Authentication
            </h2>

            <p className="text-center text-slate-500 mt-2 mb-6">
              Enter the 6 digit OTP sent to your email.
            </p>

            <label className="block text-sm font-semibold mb-2" htmlFor="login-otp">
              One-time password
            </label>
            <div className="flex justify-center gap-3 mt-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className="w-12 h-12 rounded-xl border border-slate-300 text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              ))}
            </div>

            {/* CONTINUE */}
            <button
              type="button"
              onClick={handleContinue}
              disabled={otpVerifyLoading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#0C3D2E] hover:bg-[#092E23] text-white font-semibold py-3 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {otpVerifyLoading ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Verifying...
                </>
              ) : (
                "Login"
              )}
            </button>


            <p className="mt-6 text-center text-sm text-slate-500">
              Didn't receive an OTP?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendSeconds > 0 || resendLoading}
                className="font-semibold text-teal-600 disabled:text-slate-400"
              >
                {resendLoading
                  ? "Resending..."
                  : resendSeconds > 0
                    ? `Resend in ${resendSeconds}s`
                    : "Resend"}
              </button>
            </p>

            <button
              type="button"
              onClick={() =>
                setShowVerificationModal(false)
              }
              className="mt-3 w-full border border-slate-200 py-3 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 6.6 29 4.7 24 4.7 13.4 4.7 4.7 13.4 4.7 24S13.4 43.3 24 43.3 43.3 34.6 43.3 24c0-1.2-.1-2.3-.3-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 6.6 29 4.7 24 4.7 16.6 4.7 10.2 8.9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.3c5 0 9.5-1.9 12.9-5l-6-5c-2 1.4-4.4 2.3-6.9 2.3-5.3 0-9.7-2.9-11.3-7H6.4l-6.5 5C3.7 39.2 13 43.3 24 43.3z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2.1 3.8-3.9 5l6 5c-.4.4 6.6-4.8 6.6-14 0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
