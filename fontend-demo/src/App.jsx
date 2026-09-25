import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import DiagnosticTestModal from './components/DiagnosticTestModal';
import CourseOverviewModal from './components/CourseOverviewModal';
import ClassroomView from './components/ClassroomView';
import CertificateModal from './components/CertificateModal';
import PracticalTaskModal from './components/PracticalTaskModal';
import ManagerEvaluationView from './components/ManagerEvaluationView';
import PublicVerificationView from './components/PublicVerificationView';
import HRDashboardView from './components/HRDashboardView';
import EnterpriseWorkspace from './components/EnterpriseWorkspace';
import PersonalWorkspace from './components/PersonalWorkspace';
import { ALL_DIGCOMP_COURSES as DIGCOMP_15_COURSES } from './data/courseCatalog';
import { getNextRecommendations, JOB_ROLE_BENCHMARKS } from './utils/competenceEngine';
import { LogOut } from 'lucide-react';
import { enterpriseAdmin, readOrganizations } from './utils/demoAccess';

const scopedKey = (user, key) => `${key}:${user?.organizationId || 'demo'}:${user?.employeeId || user?.id || 'guest'}`;
const readStored = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };

export default function App() {
  const [savedAssessment] = useState(() => {
    try { return JSON.parse(localStorage.getItem('digcomp_personal_assessment') || 'null'); } catch { return null; }
  });
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [courseReturnTab, setCourseReturnTab] = useState('home');
  const [selectedAreaId, setSelectedAreaId] = useState(null);

  // Active Target Role chosen by user for learning & competence benchmarking
  const [selectedRole, setSelectedRole] = useState(() => JOB_ROLE_BENCHMARKS.find(role => role.roleId === savedAssessment?.roleId) || JOB_ROLE_BENCHMARKS[0]);

  // Competence Scores & Benchmark State (Initial state is uncalculated until diagnostic test)
  const [diagnosticDone, setDiagnosticDone] = useState(!!savedAssessment?.scores && !!savedAssessment?.roadmap?.routes);
  const [competenceScores, setCompetenceScores] = useState(savedAssessment?.roadmap?.routes ? savedAssessment.scores : null);

  // Track detailed module and exam progress per course for Review Mode & persistence
  const [courseProgress, setCourseProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('digcomp_course_progress');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const [completedCourses, setCompletedCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('digcomp_completed_courses');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Active course selected for player modal
  const [activeCourse, setActiveCourse] = useState(DIGCOMP_15_COURSES['A3-A'] || DIGCOMP_15_COURSES['A2-A']);

  // Personalized roadmap generated after dynamic role diagnostic test
  const [personalizedRoadmap, setPersonalizedRoadmap] = useState(savedAssessment?.roadmap?.routes ? savedAssessment.roadmap : null);


  // Practical Task submission state
  const [taskSubmission, setTaskSubmission] = useState(() => {
    try { return JSON.parse(localStorage.getItem('digcomp_task_submission') || 'null'); } catch { return null; }
  });

  // Modals
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [showCourseOverviewModal, setShowCourseOverviewModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskCourse, setTaskCourse] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  useEffect(() => {
    if (currentUser) try { localStorage.setItem(scopedKey(currentUser, 'digcomp_task_submission'), JSON.stringify(taskSubmission)); } catch {}
  }, [taskSubmission, currentUser]);

  const handleLogin = (user) => {
    if (!user) return;
    setCurrentUser(user);
    const assessment = readStored(scopedKey(user, 'digcomp_personal_assessment'), null);
    const benchmark = JOB_ROLE_BENCHMARKS.find(role => role.roleId === user.benchmarkId) || JOB_ROLE_BENCHMARKS.find(role => role.roleId === assessment?.roleId) || JOB_ROLE_BENCHMARKS[0];
    const organization = readOrganizations().find(item => item.id === user.organizationId);
    const person = organization?.employees.find(item => item.id === user.employeeId);
    const position = organization?.roles.find(item => item.id === person?.roleId);
    setSelectedRole(position ? { ...benchmark, roleTitle: position.name,
      competencies: benchmark.competencies.map((item,index) => ({ ...item, reqLevelNumber: position.requirements[index]?.level ?? item.reqLevelNumber,
        isCore: position.requirements[index]?.mandatory ?? item.isCore })) } : benchmark);
    setDiagnosticDone(!!assessment?.roadmap?.routes);
    setCompetenceScores(assessment?.scores || null);
    setPersonalizedRoadmap(assessment?.roadmap?.routes ? assessment.roadmap : null);
    setCourseProgress(readStored(scopedKey(user, 'digcomp_course_progress'), {}));
    setCompletedCourses(readStored(scopedKey(user, 'digcomp_completed_courses'), {}));
    setTaskSubmission(readStored(scopedKey(user, 'digcomp_task_submission'), null));
    setSelectedAreaId(null);
    if (user.role === 'enterprise_admin') {
      setCurrentTab('enterprise');
    } else
    if (user.role === 'public_visitor') {
      setCurrentTab('public_verify');
    } else if (user.role === 'dept_manager') {
      setCurrentTab('manager_eval');
    } else if (user.role === 'hr_manager') {
      setCurrentTab('hr_dashboard');
    } else {
      setCurrentTab('landing');
    }
  };

  const handleOpenCourse = (course) => {
    setActiveCourse(course);
    setCourseReturnTab(currentTab);
    setShowCourseOverviewModal(true);
  };

  const handleEnterClassroom = (course) => {
    if (course) setActiveCourse(course);
    setCourseReturnTab(currentTab);
    setShowCourseOverviewModal(false);
    setCurrentTab('classroom');
  };

  const handleSelectRole = (role) => {
    if (!role || role.roleId === selectedRole?.roleId) return;
    setSelectedRole(role);
    setDiagnosticDone(false);
    setCompetenceScores(null);
    setPersonalizedRoadmap(null);
    setSelectedAreaId(null);
    try { localStorage.removeItem(scopedKey(currentUser, 'digcomp_personal_assessment')); } catch {}
  };

  // Called when diagnostic test modal is completed for chosen role
  const handleDiagnosticComplete = (evalResult, roadmap, targetRole) => {
    const role = targetRole || selectedRole;
    setDiagnosticDone(true);
    setShowDiagnosticModal(false);
    setPersonalizedRoadmap(roadmap);
    if (targetRole) setSelectedRole(targetRole);

    // Update live scores matching the role's evaluated levels
    const newScores = {};
    Object.values(evalResult.areaResults).forEach(ar => {
      // Scale level 1..6 to percentage
      const perc = Math.round((ar.currentLevel / 6) * 100);
      newScores[ar.areaId] = Math.max(0, Math.min(100, perc));
    });
    setCompetenceScores(newScores);
    try { localStorage.setItem(scopedKey(currentUser, 'digcomp_personal_assessment'), JSON.stringify({ roleId: role.roleId, scores: newScores, roadmap })); } catch {}

    if (roadmap.assigned.length > 0) {
      setActiveCourse(roadmap.assigned[0]);
    }

    // Switch to Home tab so user sees their newly calculated gap & dashboard
    setCurrentTab('home');
  };

  const handleSaveProgress = (courseId, progressData) => {
    setCourseProgress(prev => {
      const updated = {
        ...prev,
        [courseId]: {
          ...(prev[courseId] || {}),
          ...progressData
        }
      };
      try {
        localStorage.setItem(scopedKey(currentUser, 'digcomp_course_progress'), JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleCourseCompleted = (courseId, score = 95) => {
    const completionTime = new Date().toLocaleDateString('vi-VN') + " " + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // 1. Save completed courses
    setCompletedCourses(prev => {
      const updated = {
        ...prev,
        [courseId]: {
          completed: true,
          score,
          completedAt: completionTime
        }
      };
      try { localStorage.setItem(scopedKey(currentUser, 'digcomp_completed_courses'), JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // 2. Save full course progress with all modules completed
    const courseObj = DIGCOMP_15_COURSES[courseId];
    const allMods = {};
    if (courseObj?.modules) {
      courseObj.modules.forEach(m => { allMods[m.id] = true; });
    }
    setCourseProgress(prev => {
      const updated = {
        ...prev,
        [courseId]: {
          ...(prev[courseId] || {}),
          isCompleted: true,
          score,
          completedAt: completionTime,
          completedModules: allMods
        }
      };
      try { localStorage.setItem(scopedKey(currentUser, 'digcomp_course_progress'), JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    setShowCertModal(true);
  };

  const handleApproveSubmission = (evalData) => {
    setTaskSubmission(prev => ({
      ...prev,
      status: 'approved',
      score: evalData.score,
      managerFeedback: evalData.managerFeedback,
      approvedAt: evalData.approvedAt
    }));

  };

  const handleRejectSubmission = (feedback) => {
    setTaskSubmission(prev => ({
      ...prev,
      status: 'rejected',
      managerFeedback: feedback
    }));
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Determine whether activeCourse is an assigned gap course vs an already completed course
  const isCurrentCourseCompleted = !!completedCourses[activeCourse?.id];
  const activeCourseProgress = courseProgress[activeCourse?.id];
  const recommendations = getNextRecommendations(personalizedRoadmap, completedCourses);
  const activeCourseAssignedInfo = recommendations.find(c => c.id === activeCourse?.id);
  const currentRoleSubmission = taskSubmission?.roleId === selectedRole?.roleId ? taskSubmission : null;

  return (
    <div className="app-container">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDark={isDark}
        setIsDark={setIsDark}
        selectedRole={selectedRole}
        currentUser={currentUser}
        onOpenDiagnosticModal={() => setShowDiagnosticModal(true)}
      />

      <div className="rf-actor-bar"><span>{currentUser.avatar} <strong>{currentUser.roleLabel}</strong> · {currentUser.name}</span><div><button onClick={() => setCurrentUser(null)}><LogOut size={14}/> Đăng xuất</button></div></div>

      <main className="main-content">
        {currentTab === 'enterprise' ? (
          <EnterpriseWorkspace onOpenCourse={handleOpenCourse} organizationId={currentUser.organizationId} onOrganizationChange={organization => setCurrentUser(enterpriseAdmin(organization))} />
        ) : ['landing', 'home', 'matrix', 'path', 'report'].includes(currentTab) ? (
          <PersonalWorkspace
            section={currentTab}
            onNavigate={setCurrentTab}
            user={currentUser}
            selectedRole={selectedRole}
            onSelectRole={handleSelectRole}
            roles={currentUser.role === 'employee' ? [selectedRole] : JOB_ROLE_BENCHMARKS}
            diagnosticDone={diagnosticDone}
            competenceScores={competenceScores}
            roadmap={personalizedRoadmap}
            recommendations={recommendations}
            selectedAreaId={selectedAreaId}
            onSelectArea={setSelectedAreaId}
            completedCourses={completedCourses}
            submission={currentRoleSubmission}
            onStartDiagnostic={() => setShowDiagnosticModal(true)}
            onOpenCourse={handleOpenCourse}
            onOpenTask={() => { setTaskCourse(null); setShowTaskModal(true); }}
            onOpenCertificate={() => setShowCertModal(true)}
          />
        ) : currentTab === 'classroom' ? (
          <ClassroomView
            course={activeCourse}
            onBackToDashboard={() => setCurrentTab(courseReturnTab)}
            onCourseCompleted={handleCourseCompleted}
            isAlreadyCompleted={isCurrentCourseCompleted}
            savedProgress={activeCourseProgress}
            onSaveProgress={handleSaveProgress}
            onOpenCertificate={() => setShowCertModal(true)}
            assignedInfo={activeCourseAssignedInfo}
            onOpenTask={course => { setTaskCourse(course); setShowTaskModal(true); }}
          />
        ) : currentTab === 'public_verify' ? (
          <PublicVerificationView completedCourses={completedCourses} user={currentUser} initialCode={verificationCode} />
        ) : currentTab === 'manager_eval' ? (
          <ManagerEvaluationView
            submission={taskSubmission}
            onApproveSubmission={handleApproveSubmission}
            onRejectSubmission={handleRejectSubmission}
          />
        ) : currentTab === 'hr_dashboard' ? (
          <HRDashboardView diagnosticDone={diagnosticDone} completedCourses={completedCourses} submission={taskSubmission} onNavigate={setCurrentTab} />
        ) : (
          <div className="rf-panel">Trang này chưa khả dụng.</div>
        )}
      </main>

      {/* Modals */}
      {showDiagnosticModal && (
        <DiagnosticTestModal
          targetRole={selectedRole}
          onComplete={(evalResult, roadmap) => handleDiagnosticComplete(evalResult, roadmap, selectedRole)}
          onClose={() => setShowDiagnosticModal(false)}
        />
      )}

      {/* 1. Medium-sized Course Overview Modal (Opens first) */}
      {showCourseOverviewModal && (
        <CourseOverviewModal
          course={activeCourse}
          onClose={() => setShowCourseOverviewModal(false)}
          onEnterClassroom={handleEnterClassroom}
          isAlreadyCompleted={isCurrentCourseCompleted}
          savedProgress={activeCourseProgress}
          assignedInfo={activeCourseAssignedInfo}
        />
      )}

      {showCertModal && (
        <CertificateModal
          completedCourses={completedCourses}
          user={currentUser}
          activeCourseId={activeCourse?.id}
          onClose={() => setShowCertModal(false)}
          onOpenPublicVerification={(code) => {
            setShowCertModal(false);
            setVerificationCode(code);
            setCurrentTab('public_verify');
          }}
        />
      )}

      {showTaskModal && (
        <PracticalTaskModal
          selectedRole={selectedRole}
          course={taskCourse}
          onClose={() => setShowTaskModal(false)}
          onSubmitTask={(data) => setTaskSubmission({ ...data, roleId: selectedRole.roleId })}
          existingSubmission={currentRoleSubmission?.courseId === taskCourse?.id ? currentRoleSubmission : null}
        />
      )}
    </div>
  );
}
