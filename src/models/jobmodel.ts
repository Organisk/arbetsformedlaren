export interface Job {
  id: string;
  external_id: string | null;
  headline: string;
  company: string;
  municipality: string;
  county: string;
  salary_type: string;
  employment_type: string;
  duration: string;
  working_hours_type: string;
  scope_of_work: number;
  coordinates: { lat: number; lon: number } | null;
  must_have: {
    skills: string[];
    languages: string[];
    work_experiences: string[];
    education: string[];
  };
  nice_to_have: {
    skills?: string[];
    languages?: string[];
  };
  occupation: string;
  occupation_group: string;
  publication_date: string;
  last_publication_date: string | null;
  publication_url: string;
  employer_name: string;
  employer_org_number: string;
}

export interface JobSearchResult {
  id: string;
  external_id: string;
  headline: string;
  company: string;
  match_score: number;
  match_reasons: string[];
  distance_km: number | null;
}
