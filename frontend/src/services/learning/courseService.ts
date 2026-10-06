import { apiClient } from '../../lib/api-client';
import type { PaginatedList } from '../../types/api';
import type { CourseDetailDto, CourseListItem, GetCoursesParams } from '../../types/learning';

const BASE_URL = '/enterprise/courses';

export const courseService = {
  getCourses: async (params?: GetCoursesParams) => {
    return apiClient.get<PaginatedList<CourseListItem>>(BASE_URL, { params });
  },

  getCourseById: async (id: string) => {
    return apiClient.get<CourseDetailDto>(`${BASE_URL}/${id}`);
  },
};
