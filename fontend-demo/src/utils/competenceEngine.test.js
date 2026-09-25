import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAreaTrainingRoute, getNextRecommendations } from './competenceEngine.js';

const area = (currentLevel, requiredLevel) => ({ areaId: 'area_3', areaName: 'Nội dung số', currentLevel, requiredLevel, targetCourseCode: 'A3-A', isCore: true });

test('a multi-level gap starts with the next unfinished course and preserves the focus module', () => {
  const route = buildAreaTrainingRoute(area(0, 6), { moduleCode: 'A3-A-M2', subName: 'Tích hợp nội dung' });
  assert.deepEqual(route.stages.map(stage => stage.status), ['required','required','required']);
  assert.equal(getNextRecommendations({ routes: [route] })[0].id, 'A3-F');
  assert.equal(getNextRecommendations({ routes: [route] })[0].focusModuleCode, 'A3-F-M2');
  assert.equal(getNextRecommendations({ routes: [route] }, { 'A3-F': { completed: true } })[0].id, 'A3-I');
  assert.equal(getNextRecommendations({ routes: [route] }, { 'A3-F': { completed: true }, 'A3-I': { completed: true } })[0].id, 'A3-A');
});

test('meeting the position requirement does not assign a course', () => {
  const route = buildAreaTrainingRoute(area(3, 3));
  assert.equal(route.gap, 0);
  assert.deepEqual(getNextRecommendations({ routes: [route] }), []);
});

test('a middle-level gap skips foundation but requires intermediate and advanced', () => {
  const route = buildAreaTrainingRoute(area(3, 6));
  assert.deepEqual(route.stages.map(stage => stage.status), ['assessed','required','required']);
});
