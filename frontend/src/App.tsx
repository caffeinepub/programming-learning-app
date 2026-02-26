import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherPanel from './pages/TeacherPanel';
import AdminPanel from './pages/AdminPanel';
import { Toaster } from './components/ui/sonner';

export type Role = 'student' | 'teacher' | 'admin' | null;

interface AuthState {
  role: Role;
  credential: string | null;
}

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ role: null, credential: null });

  const handleLoginSuccess = (role: 'student' | 'teacher' | 'admin', credential: string) => {
    setAuth({ role, credential });
  };

  const handleLogout = () => {
    setAuth({ role: null, credential: null });
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-background text-foreground">
        {auth.role === null && (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
        {auth.role === 'student' && (
          <StudentDashboard onLogout={handleLogout} credential={auth.credential!} />
        )}
        {auth.role === 'teacher' && (
          <TeacherPanel onLogout={handleLogout} credential={auth.credential!} />
        )}
        {auth.role === 'admin' && (
          <AdminPanel onLogout={handleLogout} />
        )}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
