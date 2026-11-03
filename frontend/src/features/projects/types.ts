export type Project = {
  id: number;
  organization: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type ProjectListResponse =
  | Project[]
  | {
      results: Project[];
      count?: number;
      next?: string | null;
      previous?: string | null;
    };
