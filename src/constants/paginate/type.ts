export interface PaginatedResult<T> {
  data: T[];
  paginationData: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
