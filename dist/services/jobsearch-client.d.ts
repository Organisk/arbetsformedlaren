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
    coordinates: [number, number];
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
    employment_type: {
        conceptual_id: string;
        label: string;
        legacy_ams_taxonomy_id: string;
    };
    salary_type: {
        conceptual_id: string;
        label: string;
        legacy_ams_taxonomy_id: string;
    };
    duration: {
        conceptual_id: string;
        label: string;
        legacy_ams_taxonomy_id: string;
    };
    working_hours_type: {
        conceptual_id: string;
        label: string;
        legacy_ams_taxonomy_id: string;
    };
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
    education: any[];
    publication_date: string;
    last_publication_date: string;
    removal: boolean;
    source_type: string;
    timestamp: number;
}
export interface JobSearchResponse {
    total: {
        value: number;
    };
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
export declare function searchJobs(filters: {
    q?: string;
    location?: string;
    radius?: number;
    size?: number;
    page?: number;
}): Promise<NormalizedJob[]>;
/**
 * Search jobs by geographic location with radius
 */
export declare function searchByLocation(query: string, location: string, radius?: number): Promise<NormalizedJob[]>;
/**
 * Get a single job by external ID
 */
export declare function getJobByExternalId(externalId: string): Promise<NormalizedJob | null>;
/**
 * Health check
 */
export declare function healthCheck(): Promise<boolean>;
declare const _default: {
    searchJobs: typeof searchJobs;
    searchByLocation: typeof searchByLocation;
    getJobByExternalId: typeof getJobByExternalId;
    healthCheck: typeof healthCheck;
};
export default _default;
