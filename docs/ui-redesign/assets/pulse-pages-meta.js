const PAGE_META=[
  {
    "id": "CK-01",
    "role": "public",
    "kind": "catalog",
    "route": "/business"
  },
  {
    "id": "CK-02",
    "role": "public",
    "kind": "signup",
    "route": "/business/try"
  },
  {
    "id": "CK-03",
    "role": "public",
    "kind": "login",
    "route": "/login"
  },
  {
    "id": "CK-04",
    "role": "public",
    "kind": "reset",
    "route": "/forgot-password"
  },
  {
    "id": "CK-05",
    "role": "public",
    "kind": "activate",
    "route": "/business/try/verify"
  },
  {
    "id": "CK-06",
    "role": "public",
    "kind": "course",
    "route": "/business/courses/:id"
  },
  {
    "id": "OW-01",
    "role": "owner",
    "kind": "setup",
    "route": "/setup"
  },
  {
    "id": "OW-02",
    "role": "owner",
    "kind": "dashboard",
    "route": "/enterprise/dashboard"
  },
  {
    "id": "OW-03",
    "role": "owner",
    "kind": "departments",
    "route": "/enterprise/departments"
  },
  {
    "id": "OW-04",
    "role": "owner",
    "kind": "positions",
    "route": "/enterprise/positions"
  },
  {
    "id": "OW-05",
    "role": "owner",
    "kind": "positionDetail",
    "route": "/enterprise/positions/:id"
  },
  {
    "id": "OW-06",
    "role": "owner",
    "kind": "requirements",
    "route": "/enterprise/requirements"
  },
  {
    "id": "OW-07",
    "role": "owner",
    "kind": "members",
    "route": "/enterprise/members"
  },
  {
    "id": "OW-08",
    "role": "owner",
    "kind": "memberProfile",
    "route": "/enterprise/competency-profiles"
  },
  {
    "id": "OW-09",
    "role": "owner",
    "kind": "gap",
    "route": "/enterprise/skill-gap"
  },
  {
    "id": "OW-10",
    "role": "owner",
    "kind": "framework",
    "route": "/enterprise/framework"
  },
  {
    "id": "OW-11",
    "role": "owner",
    "kind": "batches",
    "route": "/enterprise/training-batches"
  },
  {
    "id": "OW-12",
    "role": "owner",
    "kind": "batchWizard",
    "route": "/enterprise/training-batches/new"
  },
  {
    "id": "OW-13",
    "role": "owner",
    "kind": "purchase",
    "route": "/enterprise/courses"
  },
  {
    "id": "OW-14",
    "role": "owner",
    "kind": "tasks",
    "route": "/enterprise/tasks"
  },
  {
    "id": "OW-15",
    "role": "owner",
    "kind": "reports",
    "route": "/enterprise/reports"
  },
  {
    "id": "OW-16",
    "role": "owner",
    "kind": "certificates",
    "route": "/enterprise/reports"
  },
  {
    "id": "OW-17",
    "role": "owner",
    "kind": "checkout",
    "route": "Proposed flow · no live route"
  },
  {
    "id": "OW-18",
    "role": "owner",
    "kind": "inventory",
    "route": "Proposed flow · no live route"
  },
  {
    "id": "MG-01",
    "role": "manager",
    "kind": "managerDashboard",
    "route": "/enterprise/team"
  },
  {
    "id": "MG-02",
    "role": "manager",
    "kind": "teamMembers",
    "route": "/enterprise/team/members"
  },
  {
    "id": "MG-03",
    "role": "manager",
    "kind": "reviewQueue",
    "route": "/enterprise/reviews"
  },
  {
    "id": "MG-04",
    "role": "manager",
    "kind": "reviewDetail",
    "route": "/enterprise/reviews/:submissionId"
  },
  {
    "id": "MG-05",
    "role": "manager",
    "kind": "teamTraining",
    "route": "/enterprise/team/training"
  },
  {
    "id": "MG-06",
    "role": "manager",
    "kind": "teamReport",
    "route": "/enterprise/team/skill-gap"
  },
  {
    "id": "EM-01",
    "role": "employee",
    "kind": "learnerHome",
    "route": "/enterprise/me"
  },
  {
    "id": "EM-02",
    "role": "employee",
    "kind": "initialExam",
    "route": "/enterprise/me/assessments"
  },
  {
    "id": "EM-03",
    "role": "employee",
    "kind": "myProfile",
    "route": "/enterprise/me/competency"
  },
  {
    "id": "EM-04",
    "role": "employee",
    "kind": "myRoadmap",
    "route": "/enterprise/me/learning-path"
  },
  {
    "id": "EM-05",
    "role": "employee",
    "kind": "myCourses",
    "route": "/enterprise/me/courses"
  },
  {
    "id": "EM-06",
    "role": "employee",
    "kind": "lesson",
    "route": "/enterprise/me/courses/:courseId/lessons/:lessonId"
  },
  {
    "id": "EM-07",
    "role": "employee",
    "kind": "finalExam",
    "route": "/enterprise/me/assessments/:id/attempt"
  },
  {
    "id": "EM-08",
    "role": "employee",
    "kind": "examResult",
    "route": "/enterprise/me/assessments/:id/result"
  },
  {
    "id": "EM-09",
    "role": "employee",
    "kind": "submitEvidence",
    "route": "/enterprise/me/tasks"
  },
  {
    "id": "EM-10",
    "role": "employee",
    "kind": "feedback",
    "route": "/enterprise/me/tasks/:id/feedback"
  },
  {
    "id": "EM-11",
    "role": "employee",
    "kind": "myCertificates",
    "route": "/enterprise/me/achievements"
  },
  {
    "id": "EM-12",
    "role": "employee",
    "kind": "notifications",
    "route": "/enterprise/notifications"
  },
  {
    "id": "PA-01",
    "role": "platform",
    "kind": "platformDashboard",
    "route": "/platform/dashboard"
  },
  {
    "id": "PA-02",
    "role": "platform",
    "kind": "organizations",
    "route": "/platform/organizations"
  },
  {
    "id": "PA-03",
    "role": "platform",
    "kind": "orgDetail",
    "route": "/platform/organizations/:id"
  },
  {
    "id": "PA-04",
    "role": "platform",
    "kind": "users",
    "route": "/platform/users"
  },
  {
    "id": "PA-05",
    "role": "platform",
    "kind": "userDetail",
    "route": "/platform/users/:id"
  },
  {
    "id": "PA-06",
    "role": "platform",
    "kind": "adminFramework",
    "route": "/platform/framework"
  },
  {
    "id": "PA-07",
    "role": "platform",
    "kind": "domainDetail",
    "route": "/platform/framework/:id"
  },
  {
    "id": "PA-08",
    "role": "platform",
    "kind": "curriculum",
    "route": "/platform/curriculum"
  },
  {
    "id": "PA-09",
    "role": "platform",
    "kind": "courseDetail",
    "route": "/platform/courses/:id"
  },
  {
    "id": "PA-10",
    "role": "platform",
    "kind": "courseEditor",
    "route": "/platform/courses/:id/edit"
  },
  {
    "id": "PA-11",
    "role": "platform",
    "kind": "questions",
    "route": "/platform/questions"
  },
  {
    "id": "PA-12",
    "role": "platform",
    "kind": "questionEditor",
    "route": "/platform/questions/:id"
  },
  {
    "id": "PA-13",
    "role": "platform",
    "kind": "assessmentTemplate",
    "route": "/platform/assessment-templates"
  },
  {
    "id": "PA-14",
    "role": "platform",
    "kind": "referencePositions",
    "route": "/platform/positions"
  },
  {
    "id": "PA-15",
    "role": "platform",
    "kind": "referenceRequirements",
    "route": "/platform/positions/:id/requirements"
  },
  {
    "id": "PA-16",
    "role": "platform",
    "kind": "pricing",
    "route": "/platform/plans"
  },
  {
    "id": "PA-17",
    "role": "platform",
    "kind": "priceEditor",
    "route": "/platform/plans/:code"
  },
  {
    "id": "PA-18",
    "role": "platform",
    "kind": "orders",
    "route": "/platform/subscriptions"
  },
  {
    "id": "PA-19",
    "role": "platform",
    "kind": "orderDetail",
    "route": "/platform/subscriptions/:id"
  },
  {
    "id": "PA-20",
    "role": "platform",
    "kind": "audit",
    "route": "/platform/audit-log"
  },
  {
    "id": "PA-21",
    "role": "platform",
    "kind": "settings",
    "route": "/platform/settings"
  }
];
