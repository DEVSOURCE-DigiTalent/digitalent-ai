import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AcquisitionPortal from '../components/AcquisitionPortal';
import FrameworkWorkspace from '../components/FrameworkWorkspace';
import { AccountWorkspace, CoursePreview, LearningMarketplace, usePlatform } from '../components/PlatformWorkspace';
import { clearSession, rememberSession, restoreSession, userForAccount } from '../utils/platformService';
import { readPlatform, savePlatform } from '../utils/platformStore';
import { courseAccess } from '../utils/platformPolicy';
import { ORGANIZATIONS_KEY } from '../utils/demoAccess';
import DiagnosticTestModal from '../components/DiagnosticTestModal';
import CourseOverviewModal from '../components/CourseOverviewModal';
import ClassroomView from '../components/ClassroomView';
import CertificateModal from '../components/CertificateModal';
import PracticalTaskModal from '../components/PracticalTaskModal';
import ManagerEvaluationView from '../components/ManagerEvaluationView';
import PublicVerificationView from '../components/PublicVerificationView';
import HRDashboardView from '../components/HRDashboardView';
import BusinessManagementWorkspace from '../components/BusinessManagementWorkspace';
import PersonalWorkspace from '../components/PersonalWorkspace';
import { ALL_DIGCOMP_COURSES as DIGCOMP_15_COURSES } from '../data/courseCatalog';
import { getNextRecommendations, JOB_ROLE_BENCHMARKS } from '../utils/competenceEngine';
import { LogOut } from 'lucide-react';
import { enterpriseAdmin, readOrganizations } from '../utils/demoAccess';
import { USER_ACCOUNTS } from '../data/mockMarketingFlow';
import { EmployeeAssignments } from '../components/TrainingOperations';
import { readOperations, syncLearningProgress } from '../utils/trainingOperations';
import SystemWorkspace from '../components/SystemWorkspace';

const scopedKey = (user, key) => `${key}:${user?.organizationId || 'demo'}:${user?.employeeId || user?.id || 'guest'}`;
const readStored = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };

const PERSONAL_PREVIEW_ACCOUNT_ID = 'preview-independent-learner';

function personalPreviewUser() {
  const platform = readPlatform();
  if (!platform.accounts.some(account => account.id === PERSONAL_PREVIEW_ACCOUNT_ID)) {
    platform.accounts.push({
      id: PERSONAL_PREVIEW_ACCOUNT_ID,
      name: 'Người học cá nhân',
      email: 'personal-preview@example.invalid',
      type: 'personal',
      status: 'VERIFIED',
      targetRole: 'marketing_specialist',
      createdAt: new Date().toISOString(),
    });
    savePlatform(platform);
  }
  return userForAccount(PERSONAL_PREVIEW_ACCOUNT_ID, 'personal');
}

export default function App() {
  usePlatform();
  const [savedAssessment] = useState(() => {
    try { return JSON.parse(localStorage.getItem('digcomp_personal_assessment') || 'null'); } catch { return null; }
  });
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [managedCourseId, setManagedCourseId] = useState(null);
  const [courseReturnTab, setCourseReturnTab] = useState('home');
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [workSection, setWorkSection] = useState('overview');

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
    const root = document.querySelector('.experience-app');
    if (isDark) root?.setAttribute('data-theme', 'dark');
    else root?.removeAttribute('data-theme');
  }, [isDark]);

  useEffect(() => {
    if (currentUser) try { localStorage.setItem(scopedKey(currentUser, 'digcomp_task_submission'), JSON.stringify(taskSubmission)); } catch {}
  }, [taskSubmission, currentUser]);

  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get('role');
    if (role === 'landing') { clearSession(); return; }
    if (role === 'enterprise') {
      const organization = readOrganizations().find(item => !item.ownerAccountId) || readOrganizations()[0];
      if (organization) { handleLogin(enterpriseAdmin(organization)); return; }
    }
    if (role === 'personal') { handleLogin(personalPreviewUser()); return; }
    const sampleUser = USER_ACCOUNTS.find(user => user.role === role);
    if (sampleUser) { handleLogin(sampleUser); return; }
    const user = restoreSession();
    if (user) handleLogin(user);
  }, []);

  const handleLogin = (user) => {
    if (!user) return;
    if (user.role === 'personal' && !user.accountId) user = personalPreviewUser();
    setCurrentUser(user);
    setManagedCourseId(null);
    rememberSession(user);
    setShowDiagnosticModal(false); setShowCourseOverviewModal(false); setShowCertModal(false); setShowTaskModal(false);
    setVerificationCode('');
    const assessment = readStored(scopedKey(user, 'digcomp_personal_assessment'), null);
    const benchmark = JOB_ROLE_BENCHMARKS.find(role => role.roleId === user.benchmarkId) || JOB_ROLE_BENCHMARKS.find(role => role.roleId === assessment?.roleId) || JOB_ROLE_BENCHMARKS[0];
    const organization = readOrganizations().find(item => item.id === user.organizationId);
    const person = organization?.employees.find(item => item.id === user.employeeId);
    const position = organization?.roles.find(item => item.id === person?.roleId);
    const savedGoal = readStored(scopedKey(user, 'digcomp_career_goal'), null);
    setSelectedRole(position ? { ...benchmark, roleTitle: position.name,
      competencies: benchmark.competencies.map((item,index) => ({ ...item, reqLevelNumber: position.requirements[index]?.level ?? item.reqLevelNumber,
        reqLevelLabel: `Mức ${position.requirements[index]?.level ?? item.reqLevelNumber}/6 theo vị trí`, isCore: position.requirements[index]?.mandatory ?? item.isCore })) } : savedGoal || benchmark);
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
    if (currentUser?.role === 'enterprise_admin') { setManagedCourseId(course.id); setCurrentTab('enterprise'); return; }
    setActiveCourse(course);
    setCourseReturnTab(currentTab);
    setShowCourseOverviewModal(true);
  };

  const handleEnterClassroom = (course) => {
    if (currentUser?.role === 'enterprise_admin') { setShowCourseOverviewModal(false); setManagedCourseId(course?.id); setCurrentTab('enterprise'); return; }
    if (course) setActiveCourse(course);
    setCourseReturnTab(currentTab);
    setShowCourseOverviewModal(false);
    setCurrentTab('classroom');
  };

  const handleSelectRole = (role) => {
    if (!role || (role.roleId === selectedRole?.roleId && role.goalKey === selectedRole?.goalKey)) return;
    try { localStorage.setItem(scopedKey(currentUser, 'digcomp_career_goal'), JSON.stringify(role)); } catch {}
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
    if (currentUser.employeeId && currentUser.organizationId) {
      const levels = role.competencies.map(item => Math.round((newScores[item.id] || 0) * 6 / 100));
      const organizations = readOrganizations().map(org => org.id !== currentUser.organizationId ? org : { ...org, employees: org.employees.map(person => person.id !== currentUser.employeeId ? person : { ...person, [person.before ? 'after' : 'before']: levels, evidence: 'Khảo sát theo vị trí; cần thẩm định minh chứng riêng' }) });
      localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(organizations));
      window.dispatchEvent(new Event('digcomp-organizations'));
    }
    try { localStorage.setItem(scopedKey(currentUser, 'digcomp_personal_assessment'), JSON.stringify({ roleId: role.roleId, scores: newScores, roadmap })); } catch {}

    if (roadmap.assigned.length > 0) {
      setActiveCourse(roadmap.assigned[0]);
    }

    // Switch to Home tab so user sees their newly calculated gap & dashboard
    setCurrentTab('home');
  };

  const handleSaveProgress = (courseId, progressData) => {
    if (!courseAccess(currentUser, courseId).allowed) return;
    const updated = { ...courseProgress, [courseId]: { ...(courseProgress[courseId] || {}), ...progressData } };
    setCourseProgress(updated);
    try {
      localStorage.setItem(scopedKey(currentUser, 'digcomp_course_progress'), JSON.stringify(updated));
      syncLearningProgress(currentUser, courseId, updated[courseId]);
    } catch (e) { console.error('Không thể lưu tiến độ học', e); }
  };

  const handleCourseCompleted = (courseId, score = 95) => {
    if (!courseAccess(currentUser, courseId).allowed) return;
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
    try { syncLearningProgress(currentUser, courseId, { isCompleted: true, completedModules: allMods }); } catch (e) { console.error('Không thể đồng bộ lớp học', e); }
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
    return <AcquisitionPortal onLogin={handleLogin} />;
  }

  // Determine whether activeCourse is an assigned gap course vs an already completed course
  const isCurrentCourseCompleted = !!completedCourses[activeCourse?.id];
  const activeCourseProgress = courseProgress[activeCourse?.id];
  const recommendations = getNextRecommendations(personalizedRoadmap, completedCourses);
  const activeCourseAssignedInfo = recommendations.find(c => c.id === activeCourse?.id);
  const operations = currentUser.employeeId ? readOperations(currentUser.organizationId) : null;
  const latestWorkSubmission = operations?.submissions.find(item => item.employeeId === currentUser.employeeId);
  const latestWorkReview = operations?.evaluations.find(item => item.submissionId === latestWorkSubmission?.id);
  const currentRoleSubmission = latestWorkSubmission ? {
    status: latestWorkReview?.verdict === 'PASSED' ? 'approved' : latestWorkReview ? 'rejected' : 'pending_manager',
    score: latestWorkReview ? Math.round(latestWorkReview.results.reduce((sum,item)=>sum+item.score,0)/latestWorkReview.results.length) : null,
    managerFeedback: latestWorkReview?.feedback,
  } : taskSubmission?.roleId === selectedRole?.roleId ? taskSubmission : null;

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

      <div className="rf-actor-bar"><span>{currentUser.avatar} <strong>{currentUser.roleLabel}</strong> · {currentUser.name}</span><div>{currentUser.employeeId && <button onClick={() => { setWorkSection('overview'); setCurrentTab('work'); }}>Công việc & hồ sơ</button>}<button onClick={() => { clearSession(); setCurrentUser(null); setShowCourseOverviewModal(false); setShowCertModal(false); setShowTaskModal(false); setShowDiagnosticModal(false); }}><LogOut size={14}/> Đăng xuất</button></div></div>

      {currentUser.accountId && currentUser.role !== 'enterprise_admin' && <nav className="pf-shell-links" aria-label="Không gian tài khoản"><button onClick={()=>setCurrentTab('home')}>Học tập của tôi</button><button className={currentTab==='marketplace'?'active':''} onClick={()=>setCurrentTab('marketplace')}>Khám phá & mua khóa</button><button className={currentTab==='account'?'active':''} onClick={()=>setCurrentTab('account')}>Tài khoản & lời mời</button><span className="pf-tag">{currentUser.email}</span></nav>}
      <main className="main-content">
        {currentUser.employeeId && currentUser.organizationId && ['landing','home','path'].includes(currentTab) && <EmployeeAssignments key={currentUser.id} user={currentUser} onOpenCourse={handleOpenCourse}/>}
        {currentUser.role === 'enterprise_admin' && currentTab !== 'account' ? <BusinessManagementWorkspace key={currentUser.organizationId} user={currentUser} initialCourseId={managedCourseId}/> : currentTab === 'framework' ? <FrameworkWorkspace onOpenCourse={handleOpenCourse}/> : currentTab === 'account' && currentUser.accountId ? <AccountWorkspace user={currentUser} onSwitch={handleLogin}/> : currentTab === 'marketplace' && currentUser.accountId ? <LearningMarketplace user={currentUser} selectedRole={selectedRole} onSelectRole={handleSelectRole} onLearning={()=>setCurrentTab('home')} onOpenCourse={handleOpenCourse}/> : currentTab === 'work' && currentUser.employeeId ? (
          <SystemWorkspace key={`${currentUser.id}:${workSection}`} initialSection={workSection} organization={readOrganizations().find(item=>item.id===currentUser.organizationId)} user={currentUser} onOpenCourse={handleOpenCourse}/>
        ) : ['landing', 'home', 'matrix', 'path', 'report'].includes(currentTab) ? (
          <PersonalWorkspace
            section={currentTab}
            onNavigate={setCurrentTab}
            user={currentUser}
            selectedRole={selectedRole}
            onSelectRole={handleSelectRole}
            roles={currentUser.role === 'employee' ? [selectedRole] : JOB_ROLE_BENCHMARKS.map(role => role.roleId === selectedRole?.roleId ? selectedRole : role)}
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
            onOpenTask={() => { if(currentUser.employeeId){setWorkSection('tasks');setCurrentTab('work');}else{setTaskCourse(null);setShowTaskModal(true);} }}
            onOpenCertificate={() => setShowCertModal(true)}
          />
        ) : currentTab === 'classroom' && !courseAccess(currentUser, activeCourse?.id).allowed ? <CoursePreview key={activeCourse.id} user={currentUser} course={activeCourse} onBack={()=>setCurrentTab(courseReturnTab)} onShop={()=>setCurrentTab('marketplace')} onPurchased={()=>setCurrentTab('classroom')}/> : currentTab === 'classroom' ? (
          <ClassroomView
            course={activeCourse}
            onBackToDashboard={() => setCurrentTab(courseReturnTab)}
            onCourseCompleted={handleCourseCompleted}
            isAlreadyCompleted={isCurrentCourseCompleted}
            savedProgress={activeCourseProgress}
            onSaveProgress={handleSaveProgress}
            onOpenCertificate={() => setShowCertModal(true)}
            assignedInfo={activeCourseAssignedInfo}
            onOpenTask={course => { if(currentUser.employeeId){setWorkSection('tasks');setCurrentTab('work');}else{setTaskCourse(course);setShowTaskModal(true);} }}
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
          entryLabel={!courseAccess(currentUser, activeCourse?.id).allowed ? 'Xem bài học thử' : undefined}
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
          independent={currentUser.role === 'personal' && !currentUser.organizationId}
          course={taskCourse}
          onClose={() => setShowTaskModal(false)}
          onSubmitTask={(data) => setTaskSubmission({ ...data, roleId: selectedRole.roleId })}
          existingSubmission={currentRoleSubmission?.courseId === taskCourse?.id ? currentRoleSubmission : null}
        />
      )}
    </div>
  );
}
