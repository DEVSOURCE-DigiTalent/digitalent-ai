// Only company allocations contribute to training KPIs. Personal/self-study
// enrollments and recalled allocations are intentionally outside this cohort.
export function businessDashboard(organization, operations, today = new Date()) {
  const people = new Map(organization.employees.map(person => [person.id, person]));
  const localDay = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const allocations = operations.assignments.filter(item => item.status !== 'CANCELLED' && people.has(item.employeeId)).map(item => {
    const enrollment = operations.enrollments.find(row => row.assignmentId === item.id && row.employeeId === item.employeeId && row.courseId === item.courseId && row.status !== 'CANCELLED');
    const progress = Math.max(0, Math.min(100, Number(enrollment?.progress) || 0));
    const completed = enrollment?.status === 'COMPLETED';
    const overdue = !completed && !!item.dueDate && item.dueDate < localDay;
    return {...item, employee:people.get(item.employeeId), progress, completed, overdue,
      learningStatus:completed?'COMPLETED':overdue?'OVERDUE':progress>0?'IN_PROGRESS':'NOT_STARTED',lastAccessedAt:enrollment?.lastAccessedAt};
  });
  const capability = organization.employees.map(person => {
    const requirement = operations.requirementSets.find(set => set.positionId === person.roleId && set.status === 'ACTIVE');
    const items = (requirement?.items || []).map(item => {
      const profile = operations.profiles.find(row => row.employeeId === person.id && row.competencyId === item.competencyId);
      const known = [1,2,3].includes(profile?.confirmedLevel);
      return {...item, currentLevel:known?profile.confirmedLevel:null, known, met:known && profile.confirmedLevel >= item.requiredLevel};
    });
    return {person,requirement,items,known:items.filter(item=>item.known).length,met:items.filter(item=>item.met).length};
  });
  const completed = allocations.filter(item => item.completed).length;
  return {allocations,capability,allocatedEmployees:new Set(allocations.map(item=>item.employeeId)).size,completed,
    overdue:allocations.filter(item=>item.overdue).length,
    completionRate:allocations.length ? Math.round(completed/allocations.length*100) : null,
    averageProgress:allocations.length ? Math.round(allocations.reduce((sum,item)=>sum+item.progress,0)/allocations.length) : null,
    employeesWithRequirements:capability.filter(item=>item.requirement).length,
    requiredCriteria:capability.reduce((sum,item)=>sum+item.items.length,0),
    knownCriteria:capability.reduce((sum,item)=>sum+item.known,0),
    metCriteria:capability.reduce((sum,item)=>sum+item.met,0),
    pendingReviews:operations.tasks.filter(task=>people.has(task.employeeId) && task.status==='SUBMITTED').length};
}
