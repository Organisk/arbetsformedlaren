import fetch from 'node-fetch';

const API_BASE_URL = 'https://jobsearch.api.jobtechdev.se';

export interface Skill {
  weight: number;
  concept_id: string;
  label: string;
  legacy_ams_taxonomy_id: string;
}

export interface MustHave {
  skills: Skill[];
  languages: Skill[];
  work_experiences: any[];
  education: any[];
  education_level: any[];
}

export interface NiceToHave {
  skills?: Skill[];
  languages?: Skill[];
}

export interface Occupation {
  conceptual_id: string;
  label: string;
  legacy_ams_taxonomy_id: string;
}

export interface OccupationGroup {
  conceptual_id: string;
  label: string;
  legacy_ams_taxonomy_id: string;
}

export interface WorkplaceAddress {
  municipality: string;
  municipality_code: string;
  municipality_concept_id: string;
  region: string;
  region_code: string;
  region_concept_id: string;
  country: string;
  country_code: string;
  street_address: string;
  postcode: string;
  city: string;
  coordinates: [number, number];  // [lon, lat]
}

export interface Employer {
  phone_number: string | null;
  email: string | null;
  url: string | null;
  organization_number: string;
  name: string;
  workplace: string;
}

export interface ApplicationDetails {
  via: string;
  via_arbetsformedlingen: boolean;
  url: string;
  other: string[];
}

export interface JobSearchHit {
  relevance: number;
  id: string;
  external_id: string | null;
  original_id: string | null;
  label: any[];
  webpage_url: string;
  logo_url: string | null;
  headline: string;
  application_deadline: string;
  number_of_vacancies: number;
  employment_type: { conceptual_id: string; label: string; legacy_ams_taxonomy_id: string };
  salary_type: { conceptual_id: string; label: string; legacy_ams_taxonomy_id: string };
  duration: { conceptual_id: string; label: string; legacy_ams_taxonomy_id: string };
  working_hours_type: { conceptual_id: string; label: string; legacy_ams_taxonomy_id: string };
  scope_of_work: number;
  access: any;
  employer: Employer;
  application_details: ApplicationDetails;
  experience_requirements: any;
  driving_license_requirements: any;
  occupation: Occupation;
  occupation_group: OccupationGroup;
  workplace_address: WorkplaceAddress;
  must_have: MustHave;
  nice_to_have: NiceToHave;
  // experience_requirements removed - duplicate
  education: any[];
  publication_date: string;
  last_publication_date: string;
  removal: boolean;
  source_type: string;
  timestamp: number;
}

export interface JobSearchResponse {
  total: { value: number };
  positions: number;
  query_time_in_millis: number;
  result_time_in_millis: number;
  stats: any[];
  freetext_concepts: any[];
  hits: JobSearchHit[];
}

export interface NormalizedJob {
  id: string;
  external_id: string | null;
  headline: string;
  company: string;
  municipality: string;
  county: string;
  employment_type: string;
  duration: string;
  scope_of_work: number;
  lat: number;
  lon: number;
  must_skills: string[];
  must_languages: string[];
  must_education: string[];
  occupation: string;
  occupation_group: string;
  publication_url: string;
  employer_name: string;
  salary_type: string;
  publication_date: string;
}

/**
 * Search jobs using the JobSearch API
 */
export async function searchJobs(filters: {
  q?: string;
  location?: string;
  radius?: number;
  size?: number;
  page?: number;
}): Promise<NormalizedJob[]> {
  const params = new URLSearchParams();
  
  if (filters.q) params.append('q', filters.q);
  if (filters.location) params.append('location', filters.location);
  if (filters.radius) params.append('radius', String(filters.radius));
  if (filters.size) params.append('size', String(filters.size));
  if (filters.page) params.append('page', String(filters.page));

  const url = `${API_BASE_URL}/search?${params.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`JobSearch API error ${response.status}: ${response.statusText}`);
  }

  const data: JobSearchResponse = await response.json();
  
  return data.hits.map((hit: JobSearchHit): NormalizedJob => ({
    id: hit.id || '',
    external_id: hit.external_id || null,
    headline: hit.headline || 'Okänd annons',
    company: hit.employer?.name || 'Okänd arbetsgivare',
    municipality: hit.workplace_address?.municipality || '',
    county: hit.workplace_address?.region || '',
    employment_type: hit.employment_type?.label || '',
    duration: hit.duration?.label || '',
    scope_of_work: hit.scope_of_work || 0,
    lat: hit.workplace_address?.coordinates?.[1] || 0,  // [lon, lat] -> lat
    lon: hit.workplace_address?.coordinates?.[0] || 0,  // [lon, lat] -> lon
    must_skills: hit.must_have?.skills?.map((s: Skill) => s.label || s.concept_id || '') || [],
    must_languages: hit.must_have?.languages?.map((l: Skill) => l.label || l.concept_id || '') || [],
    must_education: hit.must_have?.education_level?.map((e: any) => e || '') || [],
    occupation: hit.occupation?.label || '',
    occupation_group: hit.occupation_group?.label || '',
    publication_url: hit.webpage_url,
    employer_name: hit.employer?.name || '',
    salary_type: hit.salary_type?.label || '',
    publication_date: hit.publication_date,
  }));
}

/**
 * Search jobs by geographic location with radius
 */
export async function searchByLocation(
  query: string, 
  location: string, 
  radius?: number
): Promise<NormalizedJob[]> {
  return searchJobs({
    q: query,
    location: location,
    radius: radius || 40,
  });
}

/**
 * Get a single job by external ID
 */
export async function getJobByExternalId(externalId: string): Promise<NormalizedJob | null> {
  try {
    const results = await searchJobs({ q: `external_id:${externalId}` });
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`Error fetching job ${externalId}:`, error);
    return null;
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await searchJobs({ q: 'test' });
    return true;
  } catch {
    return false;
  }
}

export default { searchJobs, searchByLocation, getJobByExternalId, healthCheck };
