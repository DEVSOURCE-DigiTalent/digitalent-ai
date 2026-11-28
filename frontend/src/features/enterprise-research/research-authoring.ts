import { useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/use-current-user';
import apiClient from '@/services/api-client';
import { type CatalogBlock, type CatalogCourseDetail, type CatalogModule, type CatalogQuestion, type PlatformAsset } from '@/services/platform-catalog.service';
import type { CourseBuilderService } from '@/features/platform/builder/course-builder-service';
import { researchKeys, type ResearchCourseContent } from './research-api';

/** problems = what must be fixed before the content shown can be applied (empty = ready). */
type State = { revision: number; course: CatalogCourseDetail; hasDraft: boolean; hasApplied: boolean; problems: string[] };
type Change = (course: CatalogCourseDetail) => void;

function find<T>(items: T[], matches: (item: T) => boolean) {
  const index = items.findIndex(matches);
  if (index === -1) throw new Error('Nội dung đã thay đổi. Tải lại khóa học trước khi tiếp tục.');
  return { item: items[index]!, index };
}

function moduleFor(course: CatalogCourseDetail, id: string) {
  return find(course.modules, (module) => module.moduleId === id);
}

function nested<T>(course: CatalogCourseDetail, select: (module: CatalogModule) => T[], matches: (item: T) => boolean) {
  const { item: module } = find(course.modules, (item) => select(item).some(matches));
  const items = select(module);
  return { ...find(items, matches), items, module };
}

const insertAt = <T,>(items: T[], item: T, index = items.length) => items.splice(Math.max(0, Math.min(index, items.length)), 0, item);
const blockMatches = (id: string) => (block: CatalogBlock) => block.blockId === id;
const questionMatches = (id: string) => (question: CatalogQuestion) => question.questionId === id;
const newId = () => crypto.randomUUID();

export function useResearchAuthoring(courseId: string) {
  const userId = useCurrentUser((state) => state.user?.id);
  const client = useQueryClient();
  const key = useMemo(() => ['enterprise-rnd', userId, 'editor', courseId] as const, [userId, courseId]);
  const base = `/enterprise/rnd/courses/${courseId}`;
  const resource = `${base}/editor`;
  const query = useQuery({
    queryKey: key,
    queryFn: async () => (await apiClient.get<{ data: State }>(resource)).data.data,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const pending = useRef<Promise<unknown>>(Promise.resolve());

  const editor = useMemo(() => {
    const uploads = new Map<string, PlatformAsset>();
    const publish = (handler: (state: State) => Promise<State>) => {
      const next = pending.current.then(async () => {
        const state = client.getQueryData<State>(key);
        if (!state) throw new Error('Chưa tải được bản biên soạn.');
        try {
          const saved = await handler(state);
          await client.cancelQueries({ queryKey: key });
          client.setQueryData(key, saved);
          return saved;
        } catch (error) {
          if ((error as { response?: { status?: number } })?.response?.status === 409) {
            await client.invalidateQueries({ queryKey: key });
          }
          throw error;
        }
      });
      pending.current = next.catch(() => {});
      return next;
    };
    const save = (change: Change) => publish(async (state) => {
      const course = structuredClone(state.course);
      change(course);
      return (await apiClient.put<{ data: State }>(resource, {
        revision: state.revision, modules: course.modules, final: course.final,
      })).data.data;
    });
    // Applying or removing the company version writes a new course revision (a new course id): reload the list.
    const changed = async () => {
      await client.invalidateQueries({ queryKey: researchKeys.courses(userId) });
      void client.invalidateQueries({ queryKey: ['pulse'] });
    };
    const modify = (change: Change) => save(change).then((result) => result.course);
    const resolveAsset = (course: CatalogCourseDetail, id: string) => {
      const asset = uploads.get(id) ?? course.modules.flatMap((module) => module.blocks)
        .flatMap((block) => [block.asset, ...block.items.map((item) => item.asset)]).find((asset) => asset?.assetId === id);
      if (!asset) throw new Error('Tệp không có trong bản biên soạn.');
      return asset;
    };
    const service: CourseBuilderService = {
      addModule: (_v, _c, title) => modify((course) => {
        course.modules.push({ moduleId: newId(), index: course.modules.length, title, quizTitle: 'Câu hỏi ôn tập', blocks: [], questions: [] });
      }),
      updateModule: (_v, _c, id, input) => modify((course) => {
        const { item } = moduleFor(course, id);
        item.title = input.title;
        if (input.quizTitle !== undefined) item.quizTitle = input.quizTitle;
      }),
      removeModule: (_v, _c, id) => modify((course) => {
        course.modules.splice(moduleFor(course, id).index, 1);
      }),
      addBlock: (_v, _c, id, type, position) => modify((course) => {
        const blocks = moduleFor(course, id).item.blocks;
        insertAt(blocks, { blockId: newId(), index: position ?? blocks.length, type, bodyHtml: null, asset: null, caption: null, altText: null, items: [] }, position);
      }),
      updateBlock: (_v, _c, id, input) => modify((course) => {
        const { item } = nested(course, (m) => m.blocks, blockMatches(id));
        if (input.bodyHtml !== undefined) item.bodyHtml = input.bodyHtml;
        if (input.caption !== undefined) item.caption = input.caption;
        if (input.altText !== undefined) item.altText = input.altText;
        if (input.assetId !== undefined) item.asset = resolveAsset(course, input.assetId);
        if (input.items !== undefined) item.items = input.items.map(({ assetId, caption }) =>
          ({ itemId: newId(), asset: resolveAsset(course, assetId), caption: caption ?? null }));
      }),
      removeBlock: (_v, _c, id) => modify((course) => {
        const { module, items, index } = nested(course, (m) => m.blocks, blockMatches(id));
        items.splice(index, 1);
        for (const question of module.questions.filter((item) => item.blockId === id)) question.blockId = null;
      }),
      moveBlock: (_v, _c, id, position) => modify((course) => {
        const { item, items, index } = nested(course, (m) => m.blocks, blockMatches(id));
        items.splice(index, 1);
        insertAt(items, item, position);
      }),
      addQuestion: (_v, _c, id, input = {}) => modify((course) => {
        const { questions } = moduleFor(course, id).item;
        questions.push({ questionId: newId(), index: questions.length, text: input.text ?? '', explanation: input.explanation ?? null,
          blockId: input.blockId ?? null, options: (input.options ?? [
            { text: '', isCorrect: true }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false },
          ]).map((option) => ({ ...option, optionId: newId() })) });
      }),
      updateQuestion: (_v, _c, id, input) => modify((course) => {
        const { item } = nested(course, (m) => m.questions, questionMatches(id));
        if (input.text !== undefined) item.text = input.text;
        if (input.explanation !== undefined) item.explanation = input.explanation;
        if (input.blockId !== undefined) item.blockId = input.blockId;
        if (input.options !== undefined) item.options = input.options.map((option) => ({ ...option, optionId: newId() }));
      }),
      removeQuestion: (_v, _c, id) => modify((course) => {
        const { items, index } = nested(course, (m) => m.questions, questionMatches(id));
        items.splice(index, 1);
      }),
      updateFinal: (_v, _c, input) => modify((course) => { course.final = input; }),
      uploadAsset: async (file, onProgress) => {
        const body = new FormData();
        body.append('file', file);
        const asset = (await apiClient.post<{ data: PlatformAsset }>(`${resource}/assets`, body, {
          headers: { 'Content-Type': 'multipart/form-data' }, timeout: 0,
          onUploadProgress: (event) => { if (event.total) onProgress?.(Math.round(event.loaded / event.total * 100)); },
        })).data.data;
        uploads.set(asset.assetId, asset);
        return asset;
      },
    };
    return {
      service,
      /** Employees learn and take the tests on the draft (or the content in use) from now on. */
      apply: (info: ResearchCourseContent) => publish(async (state) =>
        (await apiClient.post<{ data: State }>(`${base}/apply`, { revision: state.revision, info })).data.data).then(async (saved) => {
        await changed();
        return saved;
      }),
      /** Employees go back to the standard content; the company version becomes the draft. */
      removeApplied: () => publish(async (state) => (await apiClient.delete<{ data: State }>(`${base}/apply`, {
        params: { revision: state.revision },
      })).data.data).then(async (saved) => {
        await changed();
        return saved;
      }),
      discardDraft: () => publish(async (state) => (await apiClient.delete<{ data: State }>(`${resource}/draft`, {
        params: { revision: state.revision },
      })).data.data).then(async (saved) => {
        await client.invalidateQueries({ queryKey: researchKeys.courses(userId) });
        return saved;
      }),
    };
  }, [base, client, key, resource, userId]);

  return { ...query, ...editor };
}
