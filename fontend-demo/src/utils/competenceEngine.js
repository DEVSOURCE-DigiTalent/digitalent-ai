import { POSITION_REQUIREMENTS, DIAGNOSTIC_ASSESSMENT, ROLE_DIAGNOSTIC_ASSESSMENTS, JOB_ROLE_BENCHMARKS } from '../data/mockMarketingFlow.js';
import { ALL_DIGCOMP_COURSES as DIGCOMP_15_COURSES } from '../data/courseCatalog.js';

export { JOB_ROLE_BENCHMARKS };

// Thuật toán tính toán khoảng cách năng lực (Skill Gap) dựa trên yêu cầu vị trí được chọn
export function evaluateDiagnostic(answers, targetRole = POSITION_REQUIREMENTS) {
  const areaResults = {};
  let totalGap = 0;
  let passedCount = 0;
  const missedModules = [];

  // Standardize targetRole competencies & questions lookup
  const roleCompetencies = targetRole.competencies || POSITION_REQUIREMENTS.competencies;
  const questions = (targetRole?.roleId && ROLE_DIAGNOSTIC_ASSESSMENTS[targetRole.roleId])
    ? ROLE_DIAGNOSTIC_ASSESSMENTS[targetRole.roleId]
    : DIAGNOSTIC_ASSESSMENT;

  questions.forEach((q) => {
    const isCorrect = answers[q.id] === q.correct;
    const assignedLevel = isCorrect ? q.assignedLevelIfCorrect : q.assignedLevelIfWrong;

    // Find competence benchmark for this area in the target role
    const compReq = roleCompetencies.find(c => c.id === q.areaId);
    const reqLevel = compReq ? (compReq.reqLevelNumber || compReq.requiredLevelNumber || 6) : 6;
    const reqLabel = compReq ? (compReq.reqLevelLabel || compReq.requiredLabel || `Level ${reqLevel}`) : `Level ${reqLevel}`;

    // Target course code based on required level
    const areaNum = q.areaCode || q.areaId.replace('area_', '');
    let targetCourseCode = `A${areaNum}-A`;
    if (reqLevel <= 2) {
      targetCourseCode = `A${areaNum}-F`;
    } else if (reqLevel <= 4) {
      targetCourseCode = `A${areaNum}-I`;
    } else {
      targetCourseCode = `A${areaNum}-A`;
    }

    // Khoảng cách năng lực = Mức yêu cầu của vị trí - Mức hiện tại
    const gap = Math.max(0, reqLevel - assignedLevel);
    const isMet = gap === 0;

    if (isMet) passedCount++;
    totalGap += gap;

    if (!isCorrect && q.failedModuleCode) {
      missedModules.push({
        areaId: q.areaId,
        moduleCode: q.failedModuleCode,
        subName: q.subCompetence
      });
    }

    areaResults[q.areaId] = {
      areaId: q.areaId,
      areaName: compReq?.name || q.areaName,
      requiredLevel: reqLevel,
      requiredLabel: reqLabel,
      currentLevel: assignedLevel,
      gap,
      isMet,
      isCore: compReq?.isCore || false,
      targetCourseCode,
      benchmarkNote: compReq?.note || compReq?.benchmarkNote
    };
  });

  return {
    roleTitle: targetRole.roleTitle,
    roleCode: targetRole.roleCode,
    roleId: targetRole.roleId,
    areaResults,
    totalGap,
    passedCount,
    totalAreas: DIAGNOSTIC_ASSESSMENT.length,
    missedModules,
    hasGap: totalGap > 0
  };
}

const COURSE_LEVELS = [
  { code: 'F', maxLevel: 2, name: 'Cơ bản' },
  { code: 'I', maxLevel: 4, name: 'Trung cấp' },
  { code: 'A', maxLevel: 6, name: 'Nâng cao' },
];

export function buildAreaTrainingRoute(areaResult, missedModule = null) {
  const areaNumber = Number(String(areaResult.areaId).replace('area_', ''));
  const current = Math.max(0, Math.min(6, Number(areaResult.currentLevel) || 0));
  const target = Math.max(1, Math.min(6, Number(areaResult.requiredLevel) || 6));
  const focusIndex = missedModule?.moduleCode?.match(/-M(\d+)$/)?.[1] || null;
  const stages = COURSE_LEVELS.map(level => {
    const id = `A${areaNumber}-${level.code}`;
    const course = DIGCOMP_15_COURSES[id];
    return {
      id,
      name: level.name,
      maxLevel: level.maxLevel,
      course,
      status: current >= target || current >= level.maxLevel ? 'assessed' : level.maxLevel - 1 > target ? 'extension' : 'required',
      focusModuleCode: focusIndex ? `${id}-M${focusIndex}` : null,
    };
  });
  const next = stages.find(stage => stage.status === 'required');
  return {
    areaId: areaResult.areaId,
    areaName: areaResult.areaName,
    currentLevel: current,
    requiredLevel: target,
    gap: Math.max(0, target - current),
    isCore: !!areaResult.isCore,
    priority: areaResult.isCore ? 1 : Math.max(0, target - current) >= 2 ? 2 : 3,
    focusSubName: missedModule?.subName || null,
    targetCourseId: areaResult.targetCourseCode,
    nextCourseId: next?.id || null,
    stages,
  };
}

export function getNextRecommendations(roadmap, completedCourses = {}) {
  return (roadmap?.routes || []).flatMap(route => {
    const next = route.stages.find(stage => stage.status === 'required' && !completedCourses[stage.id]?.completed);
    if (!next?.course) return [];
    return [{
      ...next.course,
      areaId: route.areaId,
      areaName: route.areaName,
      currentLevel: route.currentLevel,
      requiredLevel: route.requiredLevel,
      gap: route.gap,
      isCore: route.isCore,
      priority: route.priority,
      focusModuleCode: next.focusModuleCode,
      focusSubName: route.focusSubName,
      reason: `Hiện tại ${route.currentLevel}/6, vị trí cần ${route.requiredLevel}/6. Học ${next.name} trước trong lĩnh vực này; ${route.stages.filter(stage => stage.status === 'required' && !completedCourses[stage.id]?.completed).length - 1} cấp tiếp theo trong lộ trình.`,
    }];
  }).sort((a, b) => a.priority - b.priority || b.gap - a.gap);
}

// Đánh giá đầu vào quyết định cấp được bỏ qua; các cấp còn thiếu học tuần tự trong cùng lĩnh vực.
export function generatePersonalizedRoadmap(evaluation) {
  const routes = Object.values(evaluation.areaResults).map(area => buildAreaTrainingRoute(
    area,
    evaluation.missedModules.find(item => item.areaId === area.areaId)
  ));
  const assigned = getNextRecommendations({ routes });
  const exempted = routes.filter(route => route.gap === 0).map(route => ({
    ...DIGCOMP_15_COURSES[route.targetCourseId],
    areaId: route.areaId,
    areaName: route.areaName,
    currentLevel: route.currentLevel,
    reason: `Khảo sát đầu vào ước tính đã đạt mức ${route.currentLevel}/6 so với yêu cầu ${route.requiredLevel}/6. Không cần chỉ định khóa trong lĩnh vực này.`,
  }));
  const requiredStages = routes.flatMap(route => route.stages.filter(stage => stage.status === 'required'));
  const assessedStages = routes.flatMap(route => route.stages.filter(stage => stage.status === 'assessed'));
  return {
    routes,
    assigned,
    exempted,
    totalAssignedHours: requiredStages.reduce((sum, stage) => sum + (parseFloat(stage.course?.duration) || 0), 0),
    totalSavedHours: assessedStages.reduce((sum, stage) => sum + (parseFloat(stage.course?.duration) || 0), 0),
  };
}
