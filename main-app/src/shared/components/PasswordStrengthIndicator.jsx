import { passwordRequirements } from '../utils/passwordStrength';

export default function PasswordStrengthIndicator({ password }) {
  const metCount = passwordRequirements.filter(([, test]) => test(password)).length;
  const strength = password ? (metCount === passwordRequirements.length ? 'Strong' : metCount >= 3 ? 'Medium' : 'Weak') : 'Password requirements';
  const color = metCount === passwordRequirements.length ? 'bg-emerald-600' : metCount >= 3 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
      <div className="flex items-center justify-between text-slate-700">
        <span>Password strength</span><span className="font-semibold">{strength}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`${color} h-full transition-all`} style={{ width: `${(metCount / passwordRequirements.length) * 100}%` }} />
      </div>
      <ul className="mt-3 space-y-1 text-xs">
        {passwordRequirements.map(([label, test]) => (
          <li key={label} className={test(password) ? 'text-emerald-700' : 'text-slate-500'}>
            {test(password) ? '✓' : '○'} {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
