import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../shared/api/axios';
import { changePassword } from '../modules/auth/api/authApi';
import { getDashboardPathForRole } from '../shared/utils/roleRedirects';
import PasswordInput from '../shared/components/PasswordInput';
import PasswordStrengthIndicator from '../shared/components/PasswordStrengthIndicator';
import { isStrongPassword } from '../shared/utils/passwordStrength';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectAfterChange = async () => {
    try {
      const redirectRes = await API.get('/dashboard');
      const redirectUrl = redirectRes.data?.data?.redirectUrl;

      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
        return;
      }
    } catch (error) {
      console.warn('Dashboard redirect failed after password change', error);
    }

    const dashboardPath = getDashboardPathForRole(localStorage.getItem('role'));

    if (dashboardPath) {
      return navigate(dashboardPath, { replace: true });
    }

    navigate('/login', { replace: true });
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New password and confirm password must match.');
      return;
    }

    if (!isStrongPassword(newPassword)) {
      alert('Use a strong password that meets all the requirements below.');
      return;
    }

    setSubmitting(true);

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      localStorage.removeItem('passwordResetRequired');

      alert('Password updated successfully.');
      await redirectAfterChange();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        error.message ||
        'Unable to update password.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-lg border border-slate-200 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
        <p className="text-slate-500 mt-2">
          Update your temporary password to continue.
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Current password
            </label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              New password
            </label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <PasswordStrengthIndicator password={newPassword} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Confirm new password
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
