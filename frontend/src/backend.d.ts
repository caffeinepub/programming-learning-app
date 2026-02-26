import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AttendanceRecord {
    totalClasses: bigint;
    studentId: bigint;
    attendanceCount: bigint;
}
export interface DepartmentSummary {
    totalStudents: bigint;
    totalSubjects: bigint;
    totalTeachers: bigint;
    department: string;
}
export type LoginResult = {
    __kind__: "failure";
    failure: string;
} | {
    __kind__: "success";
    success: UserRole;
};
export interface SchoolSummary {
    averageAttendance: number;
    totalStudents: bigint;
    totalSubjects: bigint;
    totalTeachers: bigint;
    departmentStats: Array<DepartmentSummary>;
}
export interface Teacher {
    id: bigint;
    name: string;
    department: string;
}
export interface Subject {
    id: bigint;
    name: string;
    attendanceRecords: Array<AttendanceRecord>;
    teacherId: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Student {
    id: bigint;
    subjects: Array<bigint>;
    name: string;
}
export enum LoginRole {
    admin = "admin",
    teacher = "teacher",
    student = "student"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDepartmentSummary(summary: DepartmentSummary): Promise<void>;
    addStudent(student: Student): Promise<void>;
    addSubject(subject: Subject): Promise<void>;
    addTeacher(teacher: Teacher): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    login(role: LoginRole, credential: bigint): Promise<LoginResult>;
    queryAllDepartments(): Promise<Array<DepartmentSummary>>;
    queryAllSubjects(): Promise<Array<Subject>>;
    queryDepartmentSummary(department: string): Promise<DepartmentSummary>;
    querySchoolSummary(): Promise<SchoolSummary>;
    querySubjectSummary(subjectId: bigint): Promise<{
        subject: Subject;
        department?: DepartmentSummary;
    }>;
    querySubjectsByStudent(studentId: bigint): Promise<Array<Subject>>;
    querySubjectsByTeacher(teacherId: bigint): Promise<Array<Subject>>;
    queryTeacherSummary(teacherId: bigint): Promise<{
        subjects: Array<Subject>;
        teacher: Teacher;
        department?: DepartmentSummary;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
