export type Organization = {
  id: number;
  name: string;
  slug: string;
  created_at: string;
};

export type OrganizationListResponse =
  | Organization[]
  | {
      results: Organization[];
    };
