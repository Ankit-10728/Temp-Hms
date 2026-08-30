import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../../shared/api/axios";
import PasswordInput from "../../../shared/components/PasswordInput";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const requestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const { data } = await API.post("/auth/forgot-password", { email });
      setSent(true);
      setMessage(data.message);
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Unable to send the reset OTP.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("New password and confirm password must match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/reset-password", { email, otp, newPassword });
      setMessage(data.message);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Unable to reset the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <form onSubmit={sent ? resetPassword : requestOtp} className="w-full max-w-md rounded-3xl border border-slate-200 p-7 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-500">{sent ? "Enter the reset OTP sent to your email and choose a new password." : "Enter your registered email to receive a password reset OTP."}</p>
        <label className="mt-6 block text-sm font-semibold text-slate-900">Email</label>
        <input type="email" required value={email} disabled={sent} autoComplete="email" onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 disabled:bg-slate-50" />
        {sent && <>
          <label className="mt-4 block text-sm font-semibold text-slate-900">Reset OTP</label>
          <input inputMode="numeric" required value={otp} maxLength={6} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
          <label className="mt-4 block text-sm font-semibold text-slate-900">New Password</label>
          <PasswordInput
            name="newPassword"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            required
            className="mt-2"
          />
          <label className="mt-4 block text-sm font-semibold text-slate-900">Confirm New Password</label>
          <PasswordInput
            name="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
            className="mt-2"
          />
        </>}
        {message && <p className={`mt-4 rounded-xl border px-3 py-2.5 text-sm ${isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</p>}
        <button disabled={loading} type="submit" className="mt-6 w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60">{loading ? "Please wait..." : sent ? "Reset Password" : "Send Reset OTP"}</button>
        <Link to="/login" className="mt-4 block text-center text-sm font-medium text-green-700 hover:text-green-800">Back to login</Link>
      </form>
    </div>
  );
}
