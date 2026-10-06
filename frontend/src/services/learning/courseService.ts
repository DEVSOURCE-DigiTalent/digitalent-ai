import apiClient from '../api-client';
import type { ApiResponse, PagedList } from '../../types/api';
import type { CourseDetailDto, CourseListItem, GetCoursesParams } from '../../types/learning';

const BASE_URL = '/courses';

export const courseService = {
  getCourses: async (params?: GetCoursesParams) => {
    return apiClient.get<ApiResponse<PagedList<CourseListItem>>>(BASE_URL, { params });
  },

  getCourseById: async (id: string) => {
    return apiClient.get<ApiResponse<CourseDetailDto>>(`${BASE_URL}/${id}`);
  },
};
