import { useState } from 'react';
import { Sun, Moon, Users, CheckCircle2, XCircle, Clock, Camera, LogOut, MapPin, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import CameraCapture from '../components/CameraCapture';
import { useGeolocation } from '../hooks/useGeolocation';

interface TeacherPanelProps {
  onLogout: () => void;
  credential: string;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | null;

const teacherData: Record<string, { name: string; initials: string; subject: string; class: string }> = {
  'TCH001': { name: 'Dr. Priya Mehta', initials: 'PM', subject: 'Data Structures & Algorithms', class: 'CS-B (5th Sem)' },
  'TCH002': { name: 'Prof. Rajesh Kumar', initials: 'RK', subject: 'Operating Systems', class: 'CS-A (5th Sem)' },
};

const defaultTeacher = { name: 'Teacher', initials: 'TC', subject: 'Subject', class: 'Class' };

const studentList = [
  { id: 1, name: 'Rahul Sharma', rollNo: 'STU001' },
  { id: 2, name: 'Priya Patel', rollNo: 'STU002' },
  { id: 3, name: 'Amit Kumar', rollNo: 'STU003' },
  { id: 4, name: 'Sneha Singh', rollNo: 'STU004' },
  { id: 5, name: 'Vikram Rao', rollNo: 'STU005' },
  { id: 6, name: 'Divya Singh', rollNo: 'STU006' },
  { id: 7, name: 'Rohan Joshi', rollNo: 'STU007' },
  { id: 8, name: 'Ananya Nair', rollNo: 'STU008' },
  { id: 9, name: 'Meera Iyer', rollNo: 'STU009' },
  { id: 10, name: 'Karan Malhotra', rollNo: 'STU010' },
];

/**
 * Normalize a teacher credential string to look up in teacherData.
 * Accepts "TCH001", "tch001", "1", "2" etc.
 */
function normalizeTeacherCredential(credential: string): string {
  const upper = credential.trim().toUpperCase();
  if (/^TCH\d+$/.test(upper)) return upper;
  if (/^\d+$/.test(upper)) {
    const n = parseInt(upper, 10);
    return `TCH${String(n).padStart(3, '0')}`;
  }
  return upper;
}

export default function TeacherPanel({ onLogout, credential }: TeacherPanelProps) {
  const { theme, setTheme } = useTheme();
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [saved, setSaved] = useState(false);
  const [cameraStudentId, setCameraStudentId] = useState<number | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<Record<number, string>>({});
  const { coordinates, isLoading: geoLoading, error: geoError, fetchLocation, formatCoordinates } = useGeolocation();

  const key = normalizeTeacherCredential(credential);
  const teacherInfo = teacherData[key] ?? defaultTeacher;

  const setStatus = (id: number, status: AttendanceStatus) => {
    setSaved(false);
    setAttendance(prev => ({ ...prev, [id]: prev[id] === status ? null : status }));
  };

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length;
  const lateCount = Object.values(attendance).filter(v => v === 'late').length;
  const unmarkedCount = studentList.length - presentCount - absentCount - lateCount;
  const allMarked = unmarkedCount === 0;

  const handleSave = () => {
    setSaved(true);
    fetchLocation();
  };

  const handleCameraCapture = (studentId: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCapturedPhotos(prev => ({ ...prev, [studentId]: e.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const cameraStudent = cameraStudentId !== null
    ? studentList.find(s => s.id === cameraStudentId)
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="bg-navy text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {teacherInfo.initials}
          </div>
          <span className="text-sm font-medium text-navy-100 hidden sm:block">{teacherInfo.name}</span>
        </div>
        <h1 className="font-semibold text-base">Teacher Panel</h1>
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
        {/* Teacher Info */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-card mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {teacherInfo.initials}
            </div>
            <div>
              <h2 className="font-bold text-foreground">{teacherInfo.name}</h2>
              <p className="text-sm text-muted-foreground">{teacherInfo.subject}</p>
              <p className="text-xs text-muted-foreground">{teacherInfo.class}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">{today}</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Present', count: presentCount, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
            { label: 'Absent', count: absentCount, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
            { label: 'Late', count: lateCount, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
            { label: 'Unmarked', count: unmarkedCount, color: 'text-muted-foreground', bg: 'bg-muted/50' },
          ].map(item => (
            <div key={item.label} className={`${item.bg} rounded-xl p-2 text-center border border-border`}>
              <div className={`font-bold text-xl ${item.color}`}>{item.count}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Student List */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-500" />
            Mark Attendance
          </h3>
          <span className="text-xs text-muted-foreground">{studentList.length} students</span>
        </div>

        <div className="flex flex-col gap-2 mb-5">
          {studentList.map((student) => {
            const status = attendance[student.id] ?? null;
            const photo = capturedPhotos[student.id];
            return (
              <div key={student.id} className="bg-card border border-border rounded-xl p-3 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {photo ? (
                      <img
                        src={photo}
                        alt={`${student.name} photo`}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-teal-400"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-semibold text-muted-foreground">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="font-medium text-foreground text-sm block truncate">{student.name}</span>
                      <span className="text-xs text-muted-foreground">Roll: {student.rollNo}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {status && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                        status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    )}
                    <button
                      onClick={() => setCameraStudentId(student.id)}
                      className="p-1.5 rounded-lg bg-muted hover:bg-teal-100 dark:hover:bg-teal-900/30 text-muted-foreground hover:text-teal-600 transition-colors"
                      title="Capture photo"
                      aria-label={`Capture photo for ${student.name}`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatus(student.id, 'present')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      status === 'present'
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-transparent text-green-600 border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Present
                  </button>
                  <button
                    onClick={() => setStatus(student.id, 'absent')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      status === 'absent'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-transparent text-red-600 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Absent
                  </button>
                  <button
                    onClick={() => setStatus(student.id, 'late')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      status === 'late'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-transparent text-amber-600 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Late
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!allMarked || saved}
          className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
        >
          {geoLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving with location...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Attendance Saved!
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Save Attendance {!allMarked && `(${unmarkedCount} unmarked)`}
            </>
          )}
        </button>

        {/* Location display after save */}
        {saved && (
          <div className="mt-3 bg-card border border-border rounded-xl p-3 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              {geoLoading ? (
                'Fetching location...'
              ) : geoError ? (
                <span className="text-amber-500">Location unavailable: {geoError}</span>
              ) : coordinates ? (
                <>
                  <span className="font-medium text-foreground">Saved from: </span>
                  {formatCoordinates(coordinates)}
                </>
              ) : (
                'Location not captured'
              )}
            </div>
          </div>
        )}
      </main>

      {/* Camera Modal */}
      {cameraStudentId !== null && cameraStudent && (
        <CameraCapture
          studentName={cameraStudent.name}
          onCapture={(file) => {
            handleCameraCapture(cameraStudentId, file);
            setCameraStudentId(null);
          }}
          onClose={() => setCameraStudentId(null)}
        />
      )}

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
