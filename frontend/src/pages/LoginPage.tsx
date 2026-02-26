import { useState } from 'react';
import { GraduationCap, BookOpen, ShieldCheck, LogIn, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';
import type { LoginRole } from '../backend';

type RoleOption = 'student' | 'teacher' | 'admin';

interface LoginPageProps {
  onLoginSuccess: (role: RoleOption, credential: string) => void;
}

const roleConfig: Record<RoleOption, {
  label: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  credentialLabel: string;
  credentialPlaceholder: string;
  hint: string;
}> = {
  student: {
    label: 'Student',
    description: 'View attendance & subjects',
    icon: GraduationCap,
    iconBg: 'bg-teal-500',
    credentialLabel: 'Roll Number',
    credentialPlaceholder: 'Enter Roll No. (e.g. STU001)',
    hint: 'Demo: STU001, STU002, STU003, STU004, or STU005',
  },
  teacher: {
    label: 'Teacher',
    description: 'Mark attendance & manage class',
    icon: BookOpen,
    iconBg: 'bg-navy-500',
    credentialLabel: 'Teacher ID',
    credentialPlaceholder: 'Enter Teacher ID (e.g. TCH001)',
    hint: 'Demo: TCH001 or TCH002',
  },
  admin: {
    label: 'Admin',
    description: 'View analytics & school stats',
    icon: ShieldCheck,
    iconBg: 'bg-teal-600',
    credentialLabel: 'Admin ID',
    credentialPlaceholder: 'Enter Admin ID (e.g. ADM001)',
    hint: 'Demo: ADM001',
  },
};

/**
 * Parse an alphanumeric credential string into a bigint for the backend.
 * Supports formats like STU001, TCH002, ADM001 (strips prefix, parses number)
 * or plain numbers like "1", "101".
 * Returns null if the string cannot be parsed.
 */
function parseCredential(raw: string): bigint | null {
  const trimmed = raw.trim().toUpperCase();
  if (!trimmed) return null;

  // Try plain numeric first
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    return n > 0 ? BigInt(n) : null;
  }

  // Strip known prefixes: STU, TCH, ADM, then parse trailing digits
  const match = trimmed.match(/^[A-Z]+(\d+)$/);
  if (match) {
    const n = parseInt(match[1], 10);
    return n > 0 ? BigInt(n) : null;
  }

  return null;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [credential, setCredential] = useState('');
  const [showHint, setShowHint] = useState(false);
  const { mutate: doLogin, isPending, error: mutationError, reset } = useLogin();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRoleSelect = (role: RoleOption) => {
    setSelectedRole(role);
    setCredential('');
    setLocalError(null);
    reset();
  };

  const handleBack = () => {
    setSelectedRole(null);
    setCredential('');
    setLocalError(null);
    reset();
  };

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredential(e.target.value);
    setLocalError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmed = credential.trim();
    if (!trimmed) {
      setLocalError('Please enter your credentials.');
      return;
    }

    const credBigInt = parseCredential(trimmed);
    if (credBigInt === null) {
      setLocalError('Please enter a valid credential (e.g. STU001, TCH001, ADM001).');
      return;
    }

    if (!selectedRole) return;

    const roleMap: Record<RoleOption, LoginRole> = {
      student: 'student' as LoginRole,
      teacher: 'teacher' as LoginRole,
      admin: 'admin' as LoginRole,
    };

    doLogin(
      { role: roleMap[selectedRole], credential: credBigInt, credentialRaw: trimmed },
      {
        onSuccess: (result) => {
          if (result.__kind__ === 'success') {
            onLoginSuccess(selectedRole, trimmed.toUpperCase());
          } else {
            setLocalError(result.failure || 'Invalid credentials. Please try again.');
          }
        },
        onError: () => {
          setLocalError('Login failed. Please try again.');
        },
      }
    );
  };

  const config = selectedRole ? roleConfig[selectedRole] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-navy text-white px-4 py-5 text-center shadow-md">
        <div className="flex items-center justify-center gap-2 mb-1">
          <GraduationCap className="w-7 h-7 text-teal-300" />
          <h1 className="text-2xl font-bold tracking-tight">SmartAttend</h1>
        </div>
        <p className="text-navy-200 text-sm">College Attendance Management</p>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {!selectedRole ? (
            <>
              <h2 className="text-xl font-semibold text-center text-foreground mb-1">
                Welcome Back
              </h2>
              <p className="text-center text-muted-foreground text-sm mb-8">
                Select your role to sign in
              </p>
              <div className="flex flex-col gap-4">
                {(Object.keys(roleConfig) as RoleOption[]).map((roleKey) => {
                  const rc = roleConfig[roleKey];
                  const Icon = rc.icon;
                  return (
                    <button
                      key={roleKey}
                      onClick={() => handleRoleSelect(roleKey)}
                      className="group w-full bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-left"
                    >
                      <div className={`${rc.iconBg} rounded-xl p-3 flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground text-base">{rc.label}</div>
                        <div className="text-muted-foreground text-sm mt-0.5">{rc.description}</div>
                      </div>
                      <div className="text-muted-foreground group-hover:text-teal-500 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Login Form */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to role selection
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className={`${config!.iconBg} rounded-xl p-3 flex-shrink-0`}>
                  {(() => { const Icon = config!.icon; return <Icon className="w-6 h-6 text-white" />; })()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{config!.label} Login</h2>
                  <p className="text-sm text-muted-foreground">{config!.description}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {config!.credentialLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={credential}
                      onChange={handleCredentialChange}
                      placeholder={config!.credentialPlaceholder}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
                      disabled={isPending}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Show hint"
                    >
                      {showHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {showHint && (
                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-1.5 flex items-center gap-1">
                      💡 {config!.hint}
                    </p>
                  )}
                </div>

                {(localError || mutationError) && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {localError || 'Login failed. Please try again.'}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || !credential.trim()}
                  className="w-full bg-navy text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In as {config!.label}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border">
        <p>
          © {new Date().getFullYear()} SmartAttend · Built with{' '}
          <span className="text-red-400">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'smartattend')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-500 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
