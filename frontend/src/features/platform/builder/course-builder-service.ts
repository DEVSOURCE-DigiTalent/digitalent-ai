import { createContext, useContext } from 'react';
import { platformCatalogService } from '@/services/platform-catalog.service';

export type CourseBuilderService = Pick<typeof platformCatalogService,
  'addModule' | 'updateModule' | 'removeModule' | 'addBlock' | 'updateBlock' | 'removeBlock' | 'moveBlock' |
  'addQuestion' | 'updateQuestion' | 'removeQuestion' | 'updateFinal' | 'uploadAsset'>;

export const CourseBuilderServiceContext = createContext<CourseBuilderService>(platformCatalogService);

export const useCourseBuilderService = () => useContext(CourseBuilderServiceContext);
