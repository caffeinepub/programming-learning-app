import AccessControl "authorization/access-control";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

actor {
  type AttendanceRecord = {
    studentId : Nat;
    attendanceCount : Nat;
    totalClasses : Nat;
  };

  type Subject = {
    id : Nat;
    name : Text;
    teacherId : Nat;
    attendanceRecords : [AttendanceRecord];
  };

  type Teacher = {
    id : Nat;
    name : Text;
    department : Text;
  };

  type Student = {
    id : Nat;
    name : Text;
    subjects : [Nat];
  };

  type DepartmentSummary = {
    department : Text;
    totalStudents : Nat;
    totalTeachers : Nat;
    totalSubjects : Nat;
  };

  type SchoolSummary = {
    totalStudents : Nat;
    totalTeachers : Nat;
    totalSubjects : Nat;
    averageAttendance : Float;
    departmentStats : [DepartmentSummary];
  };

  type LoginRole = {
    #student;
    #teacher;
    #admin;
  };

  type LoginResult = {
    #success : AccessControl.UserRole;
    #failure : Text;
  };

  // In-memory sample data
  let sampleSubjects = Map.empty<Nat, Subject>();
  let sampleTeachers = Map.empty<Nat, Teacher>();
  let sampleStudents = Map.empty<Nat, Student>();
  let departmentSummaries = Map.empty<Text, DepartmentSummary>();
  let schoolSummary : SchoolSummary = {
    totalStudents = 5;
    totalTeachers = 2;
    totalSubjects = 3;
    averageAttendance = 88.5;
    departmentStats = [];
  };

  // Access control state
  let accessControlState = AccessControl.initState();

  // Authentication and authorization functions (required)
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside AccessControl.assignRole
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // User profile type and storage
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Login endpoint — accessible to anyone (guests included), no permission guard needed.
  // On success, assigns the appropriate role to the caller so they can access
  // role-protected endpoints after logging in.
  public shared ({ caller }) func login(role : LoginRole, credential : Nat) : async LoginResult {
    switch (role) {
      case (#student) {
        switch (sampleStudents.get(credential)) {
          case (null) { #failure("Invalid Roll Number") };
          case (?_student) {
            // Assign #user role to the caller upon successful student login
            AccessControl.assignRole(accessControlState, caller, caller, #user);
            #success(#user);
          };
        };
      };
      case (#teacher) {
        switch (sampleTeachers.get(credential)) {
          case (null) { #failure("Invalid Teacher ID") };
          case (?_teacher) {
            // Assign #user role to the caller upon successful teacher login
            AccessControl.assignRole(accessControlState, caller, caller, #user);
            #success(#user);
          };
        };
      };
      case (#admin) {
        if (credential == 1) {
          // Assign #admin role to the caller upon successful admin login
          AccessControl.assignRole(accessControlState, caller, caller, #admin);
          #success(#admin);
        } else {
          #failure("Invalid Admin ID");
        };
      };
    };
  };

  // Query all subjects — requires at least #user (teachers, admins)
  public query ({ caller }) func queryAllSubjects() : async [Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view subjects");
    };
    sampleSubjects.values().toArray();
  };

  // Query subjects by teacher — requires at least #user
  public query ({ caller }) func querySubjectsByTeacher(teacherId : Nat) : async [Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view subjects");
    };
    sampleSubjects.values().filter(func(s) { s.teacherId == teacherId }).toArray();
  };

  // Query subjects by student — requires at least #user
  public query ({ caller }) func querySubjectsByStudent(studentId : Nat) : async [Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view subjects");
    };
    switch (sampleStudents.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        sampleSubjects.values().filter(
          func(subject) {
            student.subjects.filter(func(id) { id == subject.id }).size() > 0;
          }
        ).toArray();
      };
    };
  };

  // Query department summary — requires at least #user
  public query ({ caller }) func queryDepartmentSummary(department : Text) : async DepartmentSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view department summaries");
    };
    let statsOpt = departmentSummaries.get(department);
    switch (statsOpt) {
      case (null) {
        Runtime.trap("Department not found");
      };
      case (?stats) { stats };
    };
  };

  // Query all departments — requires at least #user
  public query ({ caller }) func queryAllDepartments() : async [DepartmentSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view departments");
    };
    departmentSummaries.values().toArray();
  };

  // Query school summary — requires at least #user
  public query ({ caller }) func querySchoolSummary() : async SchoolSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view school summary");
    };
    schoolSummary;
  };

  // Query subject summary — requires at least #user
  public query ({ caller }) func querySubjectSummary(subjectId : Nat) : async {
    subject : Subject;
    department : ?DepartmentSummary;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view subject summaries");
    };
    let subjectOpt = sampleSubjects.get(subjectId);
    switch (subjectOpt) {
      case (null) { Runtime.trap("Subject not found") };
      case (?subject) {
        {
          subject;
          department = departmentSummaries.get(getDepartment(subjectId));
        };
      };
    };
  };

  // Query teacher summary — requires at least #user
  public query ({ caller }) func queryTeacherSummary(teacherId : Nat) : async {
    teacher : Teacher;
    department : ?DepartmentSummary;
    subjects : [Subject];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view teacher summaries");
    };
    switch (sampleTeachers.get(teacherId)) {
      case (null) { Runtime.trap("Teacher not found") };
      case (?teacher) {
        {
          teacher;
          department = departmentSummaries.get(getDepartmentFromTeacherId(teacherId));
          subjects = sampleSubjects.values().filter(
            func(subject) { subject.teacherId == teacherId }
          ).toArray();
        };
      };
    };
  };

  // Admin-only: add a subject
  public shared ({ caller }) func addSubject(subject : Subject) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add subjects");
    };
    sampleSubjects.add(subject.id, subject);
  };

  // Admin-only: add a teacher
  public shared ({ caller }) func addTeacher(teacher : Teacher) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add teachers");
    };
    sampleTeachers.add(teacher.id, teacher);
  };

  // Admin-only: add a student
  public shared ({ caller }) func addStudent(student : Student) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add students");
    };
    sampleStudents.add(student.id, student);
  };

  // Admin-only: add a department summary
  public shared ({ caller }) func addDepartmentSummary(summary : DepartmentSummary) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add department summaries");
    };
    departmentSummaries.add(summary.department, summary);
  };

  // Helper functions
  func getDepartment(_subjectId : Nat) : Text {
    "DepartmentId";
  };

  func getDepartmentFromTeacherId(_teacherId : Nat) : Text {
    "DepartmentId";
  };
};
