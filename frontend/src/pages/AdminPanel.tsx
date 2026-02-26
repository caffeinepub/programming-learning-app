import { useState } from 'react';
import { Sun, Moon, Users, BookOpen, GraduationCap, TrendingUp, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

interface AdminPanelProps {
  onLogout: () => void;
}

const stats = {
  totalStudents: 248,
  totalTeachers: 18,
  totalSubjects: 24,
  overallAttendance: 78.4,
};

const subjectAttendance = [
  { name: 'DSA', pct: 84, full: 'Data Structures & Algorithms' },
  { name: 'OS', pct: 73, full: 'Operating Systems' },
  { name: 'DBMS', pct: 70, full: 'Database Management' },
  { name: 'CN', pct: 60, full: 'Computer Networks' },
  { name: 'SE', pct: 88, full: 'Software Engineering' },
  { name: 'ML', pct: 50, full: 'Machine Learning' },
  { name: 'Math', pct: 91, full: 'Engineering Mathematics' },
];

const departments = [
  { name: 'Computer Science', students: 120, teachers: 8, attendance: 81 },
  { name: 'Electronics', students: 80, teachers: 6, attendance: 76 },
  { name: 'Mechanical', students: 48, teachers: 4, attendance: 74 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const subject = subjectAttendance.find(s => s.name === label);
    return (
      <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-1">{subject?.full}</p>
        <p className={`font-bold ${payload[0].value >= 75 ? 'text-green-500' : 'text-red-500'}`}>
          {payload[0].value}% attendance
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="bg-navy text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            AD
          </div>
          <span className="text-sm font-medium text-navy-100 hidden sm:block">Admin</span>
        </div>
        <h1 className="font-semibold text-base">Admin Panel</h1>
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
        {/* Stat Cards */}
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-500" />
          School Overview
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, color: 'text-navy-500', bg: 'bg-navy-50 dark:bg-navy-950/40' },
            { label: 'Total Teachers', value: stats.totalTeachers, icon: Users, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/40' },
            { label: 'Total Subjects', value: stats.totalSubjects, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
            { label: 'Avg Attendance', value: `${stats.overallAttendance}%`, icon: TrendingUp, color: stats.overallAttendance >= 75 ? 'text-green-500' : 'text-red-500', bg: stats.overallAttendance >= 75 ? 'bg-green-50 dark:bg-green-950/40' : 'bg-red-50 dark:bg-red-950/40' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-card border border-border rounded-2xl p-4 shadow-card">
                <div className={`${item.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className={`font-bold text-2xl ${item.color}`}>{item.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
              </div>
            );
          })}
        </div>

        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-card mb-5">
          <h3 className="font-semibold text-foreground mb-1 text-sm">Attendance by Subject</h3>
          <p className="text-xs text-muted-foreground mb-4">Dashed line = 75% minimum threshold</p>
          <div className="w-full" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAttendance} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0 0)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'oklch(0.5 0 0)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: 'oklch(0.5 0 0)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={75} stroke="oklch(0.65 0.18 25)" strokeDasharray="4 4" strokeWidth={1.5} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {subjectAttendance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pct >= 75 ? 'oklch(0.55 0.15 160)' : 'oklch(0.60 0.20 25)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-teal-500" />
              ≥ 75% (Good)
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              &lt; 75% (Low)
            </div>
          </div>
        </div>

        {/* Department Table */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-3 text-sm">Department Summary</h3>
          <div className="flex flex-col gap-3">
            {departments.map((dept) => (
              <div key={dept.name} className="border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground text-sm">{dept.name}</span>
                  <span className={`text-sm font-bold ${dept.attendance >= 75 ? 'text-green-500' : 'text-red-500'}`}>
                    {dept.attendance}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${dept.attendance >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${dept.attendance}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{dept.students} students</span>
                  <span>{dept.teachers} teachers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center py-3 text-xs text-muted-foreground border-t border-border mt-4">
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
