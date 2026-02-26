import { Sun, Moon, User, BookOpen, AlertTriangle, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';

interface StudentDashboardProps {
  onLogout: () => void;
  credential: string;
}

// Sample student data keyed by normalized credential (e.g. "STU001", "101")
const studentData: Record<string, {
  name: string;
  rollNo: string;
  course: string;
  semester: string;
  avatar: string;
  subjects: { id: number; name: string; attended: number; total: number }[];
}> = {
  'STU001': {
    name: 'Rahul Sharma',
    rollNo: 'STU001',
    course: 'B.Tech Computer Science',
    semester: '5th Semester',
    avatar: 'RS',
    subjects: [
      { id: 1, name: 'Data Structures & Algorithms', attended: 42, total: 50 },
      { id: 2, name: 'Operating Systems', attended: 35, total: 48 },
      { id: 3, name: 'Database Management Systems', attended: 28, total: 40 },
      { id: 4, name: 'Computer Networks', attended: 18, total: 30 },
    ],
  },
  'STU002': {
    name: 'Priya Patel',
    rollNo: 'STU002',
    course: 'B.Tech Computer Science',
    semester: '5th Semester',
    avatar: 'PP',
    subjects: [
      { id: 1, name: 'Data Structures & Algorithms', attended: 45, total: 50 },
      { id: 2, name: 'Operating Systems', attended: 40, total: 48 },
      { id: 3, name: 'Software Engineering', attended: 22, total: 25 },
      { id: 4, name: 'Machine Learning', attended: 10, total: 20 },
    ],
  },
  'STU003': {
    name: 'Amit Kumar',
    rollNo: 'STU003',
    course: 'B.Tech Electronics',
    semester: '3rd Semester',
    avatar: 'AK',
    subjects: [
      { id: 5, name: 'Circuit Theory', attended: 30, total: 40 },
      { id: 6, name: 'Digital Electronics', attended: 25, total: 35 },
      { id: 7, name: 'Signals & Systems', attended: 18, total: 30 },
    ],
  },
  'STU004': {
    name: 'Sneha Singh',
    rollNo: 'STU004',
    course: 'B.Tech Mechanical',
    semester: '4th Semester',
    avatar: 'SS',
    subjects: [
      { id: 8, name: 'Thermodynamics', attended: 38, total: 45 },
      { id: 9, name: 'Fluid Mechanics', attended: 30, total: 40 },
      { id: 10, name: 'Engineering Drawing', attended: 20, total: 25 },
    ],
  },
  'STU005': {
    name: 'Vikram Rao',
    rollNo: 'STU005',
    course: 'B.Tech Civil',
    semester: '6th Semester',
    avatar: 'VR',
    subjects: [
      { id: 11, name: 'Structural Analysis', attended: 40, total: 50 },
      { id: 12, name: 'Geotechnical Engineering', attended: 35, total: 45 },
      { id: 13, name: 'Transportation Engineering', attended: 28, total: 38 },
    ],
  },
};

const defaultStudent = {
  name: 'Student',
  rollNo: 'Unknown',
  course: 'Unknown Course',
  semester: 'Unknown Semester',
  avatar: 'ST',
  subjects: [],
};

/**
 * Normalize a credential string to look up in studentData.
 * Accepts "STU001", "stu001", "1", "101" etc.
 */
function normalizeStudentCredential(credential: string): string {
  const upper = credential.trim().toUpperCase();
  // Already in STU format
  if (/^STU\d+$/.test(upper)) return upper;
  // Plain number — try mapping to STU00X
  if (/^\d+$/.test(upper)) {
    const n = parseInt(upper, 10);
    return `STU${String(n).padStart(3, '0')}`;
  }
  return upper;
}

export default function StudentDashboard({ onLogout, credential }: StudentDashboardProps) {
  const { theme, setTheme } = useTheme();
  const key = normalizeStudentCredential(credential);
  const studentProfile = studentData[key] ?? defaultStudent;
  const subjects = studentProfile.subjects;

  const overallAttended = subjects.reduce((s, sub) => s + sub.attended, 0);
  const overallTotal = subjects.reduce((s, sub) => s + sub.total, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="bg-navy text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {studentProfile.avatar}
          </div>
          <span className="text-sm font-medium text-navy-100">{studentProfile.name}</span>
        </div>
        <h1 className="font-semibold text-base">Student Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg bg-navy-700 hover:bg-red-600 transition-colors"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {studentProfile.avatar}
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg leading-tight">{studentProfile.name}</h2>
              <p className="text-muted-foreground text-sm">Roll No: {studentProfile.rollNo}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{studentProfile.course} · {studentProfile.semester}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Attendance</span>
            <span className={`font-bold text-lg ${overallPct >= 75 ? 'text-green-500' : 'text-red-500'}`}>
              {overallPct}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${overallPct >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Low Attendance Warning */}
        {subjects.some(s => Math.round((s.attended / s.total) * 100) < 75) && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-5 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 dark:text-amber-400 text-sm">
              You have subjects with attendance below 75%. Attend more classes to avoid shortage.
            </p>
          </div>
        )}

        {/* Subjects */}
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-500" />
          Subject-wise Attendance
        </h3>

        {subjects.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
            <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No subjects found for your profile.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {subjects.map((sub) => {
              const pct = Math.round((sub.attended / sub.total) * 100);
              const isLow = pct < 75;
              return (
                <div key={sub.id} className="bg-card border border-border rounded-xl p-4 shadow-card">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-foreground text-sm leading-snug flex-1 pr-2">{sub.name}</span>
                    <span className={`font-bold text-base flex-shrink-0 ${isLow ? 'text-red-500' : 'text-green-500'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{sub.attended} attended</span>
                    <span>{sub.total} total classes</span>
                  </div>
                  {isLow && (
                    <div className="mt-2 text-xs text-red-500 font-medium">
                      ⚠ Below 75% — needs {Math.ceil(0.75 * sub.total - sub.attended)} more classes
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="text-center py-3 text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} SmartAttend · Built with <span className="text-red-400">♥</span> using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'smartattend')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-500 hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
