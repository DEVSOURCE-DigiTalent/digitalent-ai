export function getDemoCompletionCode(userId, courseId) {
  return `DEMO-${String(userId || 'USER').replace(/[^a-z0-9]/gi, '').toUpperCase()}-${String(courseId || '').replace(/[^a-z0-9]/gi, '').toUpperCase()}`;
}
