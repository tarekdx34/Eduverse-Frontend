import { ApiClient } from './client';

export type SearchEntityType =
  | 'course'
  | 'material'
  | 'user'
  | 'announcement'
  | 'assignment'
  | 'quiz'
  | 'file'
  | 'post';

export interface SearchIndexItem {
  indexId: number;
  entityType: SearchEntityType;
  entityId: number;
  title: string | null;
  content: string | null;
  keywords: string | null;
  metadata: string | null;
  courseId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupedSearchResult {
  entityType: SearchEntityType;
  items: SearchIndexItem[];
  count: number;
}

export interface GlobalSearchResponse {
  results: GroupedSearchResult[];
  totalResults: number;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchHistoryItem {
  searchId: number;
  userId: number;
  searchQuery: string;
  searchFilters: string;
  resultsCount: number;
  createdAt: string;
}

export const SearchService = {
  globalSearch: (params: {
    query: string;
    entityType?: SearchEntityType;
    page?: number;
    limit?: number;
    sortBy?: 'relevance' | 'recent';
  }) => ApiClient.get<GlobalSearchResponse>('/search', { params }),

  getHistory: (params?: { page?: number; limit?: number }) =>
    ApiClient.get<{ data: SearchHistoryItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      '/search/history',
      { params }
    ),

  clearHistory: () => ApiClient.delete<{ message: string; deletedCount: number }>('/search/history'),
};

