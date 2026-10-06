import { PaginatedQuery, PaginatedList } from './api';

export interface CourseListItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  entryLevel?: number;
  estimatedDurationMinutes?: number;
  status: string;
  createdAt: string;
  modulesCount: number;
}

export interface CourseModuleDto {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
}

export interface CourseDetailDto {
  id: string;
  code: string;
  title: string;
  description?: string;
  purpose?: string;
  entryLevel?: number;
  estimatedDurationMinutes?: number;
  certificateEnabled: boolean;
  certificateValidityDays?: number;
  status: string;
  createdAt: string;
  modules: CourseModuleDto[];
}

export interface GetCoursesParams extends PaginatedQuery {
  search?: string;
  status?: string;
  entryLevel?: number;
}
