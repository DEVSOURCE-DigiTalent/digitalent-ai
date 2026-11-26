import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  contentAiService,
  type ModuleContentAiInput,
  type ModuleContentCheck,
  type ModuleContentSuggestion,
  type PageReview,
  type RewrittenPage,
} from '@/services/content-ai.service';
import type { CatalogBlock, CatalogCourseDetail, CatalogModule } from '@/services/platform-catalog.service';
import { errorMessage } from '../components/pulse-format';
import { useCourseBuilderService } from './course-builder-service';
import type { CourseEdit } from './builder-types';

/** The module's text pages in order: page n sent to the AI = textPages[n - 1]. */
export function textPages(module: CatalogModule): CatalogBlock[] {
  return module.blocks.filter((b) => b.type === 'TEXT' && b.bodyHtml);
}

/** The module as the builder has it: text pages and review questions. */
export function moduleAiInput(course: CatalogCourseDetail, module: CatalogModule): ModuleContentAiInput {
  return {
    courseCode: course.code,
    moduleIndex: module.index,
    moduleTitle: module.title,
    lessons: textPages(module).map((b) => ({ html: b.bodyHtml })),
    questions: module.questions.map((q) => ({ text: q.text, options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })) })),
  };
}

export type PageRewrite = { state: 'loading' } | { state: 'ready'; page: RewrittenPage } | { state: 'replaced' };

/**
 * AI help of one module, shared by the AI bar, the notes under each text page and the question flags: the last check
 * (mapped to block ids and question ids at the time it ran), the last suggestion and the page rewrites in progress.
 */
export function useModuleAi(course: CatalogCourseDetail, module: CatalogModule, edit: CourseEdit) {
  const service = useCourseBuilderService();
  const [busy, setBusy] = useState<'suggest' | 'check' | null>(null);
  const [check, setCheck] = useState<ModuleContentCheck | null>(null);
  const [pageOf, setPageOf] = useState<Map<string, PageReview>>(new Map());
  const [questionFlags, setQuestionFlags] = useState<Map<string, string>>(new Map());
  const [suggestion, setSuggestion] = useState<ModuleContentSuggestion | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [rewrites, setRewrites] = useState<Map<string, PageRewrite>>(new Map());

  // Another module: start clean.
  useEffect(() => {
    setCheck(null);
    setPageOf(new Map());
    setQuestionFlags(new Map());
    setSuggestion(null);
    setAdded(new Set());
    setRewrites(new Map());
  }, [module.moduleId]);

  const runCheck = async () => {
    setBusy('check');
    try {
      const pages = textPages(module);
      const questions = module.questions;
      const result = await contentAiService.check(moduleAiInput(course, module));
      setCheck(result);
      setPageOf(new Map(result.pages.filter((p) => pages[p.number - 1]).map((p) => [pages[p.number - 1]!.blockId, p])));
      setQuestionFlags(new Map(result.questionProblems.filter((p) => questions[p.number - 1]).map((p) => [questions[p.number - 1]!.questionId, p.problem])));
      setRewrites(new Map());
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const runSuggest = async () => {
    setBusy('suggest');
    try {
      setSuggestion(await contentAiService.suggest(moduleAiInput(course, module)));
      setAdded(new Set());
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const setRewrite = (blockId: string, value: PageRewrite | null) =>
    setRewrites((current) => {
      const next = new Map(current);
      if (value) next.set(blockId, value);
      else next.delete(blockId);
      return next;
    });

  const rewritePage = async (blockId: string) => {
    const pageNumber = textPages(module).findIndex((b) => b.blockId === blockId) + 1;
    if (pageNumber < 1) return;
    setRewrite(blockId, { state: 'loading' });
    try {
      const page = await contentAiService.rewritePage({
        ...moduleAiInput(course, module),
        pageNumber,
        notes: pageOf.get(blockId)?.notes ?? [],
      });
      setRewrite(blockId, { state: 'ready', page });
    } catch (err) {
      setRewrite(blockId, null);
      toast.error(errorMessage(err));
    }
  };

  const replacePage = async (blockId: string) => {
    const rewrite = rewrites.get(blockId);
    if (rewrite?.state !== 'ready') return;
    try {
      await edit((v, c) => service.updateBlock(v, c, blockId, { bodyHtml: rewrite.page.html }));
      setRewrite(blockId, { state: 'replaced' });
      toast.success('Đã thay trang bằng bản AI. Bấm "Kiểm tra theo Thông tư" để chấm lại.');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const addLesson = async (key: string, html: string) => {
    const position = module.blocks.length;
    try {
      const detail = await edit((v, c) => service.addBlock(v, c, module.moduleId, 'TEXT', position));
      const block = detail.modules.find((m) => m.moduleId === module.moduleId)?.blocks[position];
      if (block) await edit((v, c) => service.updateBlock(v, c, block.blockId, { bodyHtml: html }));
      setAdded((s) => new Set(s).add(key));
      toast.success('Đã thêm trang vào cuối mô-đun.');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const addQuestion = async (key: string, question: ModuleContentSuggestion['questions'][number]) => {
    try {
      await edit((v, c) => service.addQuestion(v, c, module.moduleId, {
        text: question.text,
        explanation: question.explanation ?? null,
        options: question.options,
      }));
      setAdded((s) => new Set(s).add(key));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return {
    busy, check, pageOf, questionFlags, suggestion, added, rewrites,
    runCheck, runSuggest, rewritePage, replacePage, discardRewrite: (blockId: string) => setRewrite(blockId, null), addLesson, addQuestion,
  };
}

export type ModuleAi = ReturnType<typeof useModuleAi>;
