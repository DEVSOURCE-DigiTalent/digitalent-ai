import test from 'node:test';
import assert from 'node:assert/strict';
import { FRAMEWORK_MAPPINGS, FRAMEWORK_VERSION, getFrameworkCoverage, PROFICIENCY_SCALES } from '../data/frameworkRegistry.js';
import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog.js';
import manifest from '../data/frameworkSourceManifest.json' with { type: 'json' };
import { activateRequirement, calculateGap, commitOperations, COMPETENCIES, readOperations, saveRequirementDraft } from './trainingOperations.js';

test('topic coverage never counts pending crosswalks or AI source previews as approved learning coverage',()=>{
  const coverage=getFrameworkCoverage(ALL_DIGCOMP_COURSES);
  assert.deepEqual(coverage,{courseCount:15,moduleCount:63,mappedTopics:21,missingTopics:['6.1','6.2','6.3'],approvedMappings:0});
  assert.equal(new Set(FRAMEWORK_MAPPINGS.map(row=>row.circularCode)).size,24);
  const validDigcomp=new Set(FRAMEWORK_MAPPINGS.filter(row=>row.area!=='6').map(row=>row.circularCode));
  for(const row of FRAMEWORK_MAPPINGS){assert.ok(row.digcompCodes.every(code=>validDigcomp.has(code)));assert.equal(row.reviewStatus,'PENDING');}
  assert.equal(PROFICIENCY_SCALES.find(scale=>scale.id==='DIGCOMP_3_0').labels.length,4);
  for(const course of Object.values(ALL_DIGCOMP_COURSES)){
    assert.equal(course.framework.referenceFrameworkId,'DIGCOMP_3_0');
    assert.equal(course.framework.sourceFrameworkId,'TT02_2025');
    assert.equal(course.framework.alignmentStatus,'PENDING_EXPERT_REVIEW');
    assert.equal(course.framework.competencies.length,course.modules.length);
    assert.doesNotMatch(course.level,/Level/);
  }
});

test('all source documents are fingerprinted and the three AI curricula have complete preview material',()=>{
  assert.equal(manifest.sources.length,8);
  assert.equal(manifest.aiCourses.length,3);
  for(const source of manifest.sources)assert.match(source.sha256,/^[a-f0-9]{64}$/);
  for(const course of manifest.aiCourses){
    assert.equal(course.modules.length,3);
    assert.equal(ALL_DIGCOMP_COURSES[course.id],undefined);
    assert.deepEqual(course.modules.map(module=>module.competenceCode),['6.1','6.2','6.3']);
    for(const module of course.modules)assert.ok(module.objectives.length && module.theory.length && module.practice.length && module.product);
  }
});

test('framework sources are snapshotted per requirement and gap; legacy data is not relabelled',()=>{
  const store=new Map();globalThis.localStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)};
  const org={id:'framework-org',roles:[{id:'role'}],employees:[{id:'person',roleId:'role',name:'Test'}]};
  const items=COMPETENCIES.slice(0,10).map(item=>({competencyId:item.code,requiredLevel:2,weight:10,mandatory:false}));
  const set=saveRequirementDraft(org,'role',items,'admin');
  activateRequirement(org.id,set.id,'admin');
  const run=calculateGap(org,'person','admin');
  assert.equal(run.frameworkSnapshot.mappingVersion,FRAMEWORK_VERSION);
  assert.equal(run.frameworkSnapshot.scaleId,'DIGITALENT_OPERATIONAL_3');
  commitOperations(org.id,state=>{delete state.requirementSets[0].frameworkSnapshot;});
  const legacyRun=calculateGap(org,'person','admin');
  assert.equal(legacyRun.frameworkSnapshot.referenceFrameworkId,'LEGACY_UNSPECIFIED');
  const saved=readOperations(org.id);
  assert.equal(saved.requirementSets[0].frameworkSnapshot,undefined);
  assert.equal(saved.gapRuns[1].frameworkSnapshot.mappingVersion,FRAMEWORK_VERSION);
  assert.equal(saved.profiles.length,0);
});
