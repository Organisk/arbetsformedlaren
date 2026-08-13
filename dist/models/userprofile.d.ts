export interface UserProfile {
    id: string;
    email: string | null;
    created_at: string;
    location_lat: number | null;
    location_lon: number | null;
    radius_km: number;
    preferences: {
        occupations?: string[];
        min_seniority?: string;
        preferred_employment_types?: string[];
    };
}
export interface CvData {
    skills: string[];
    work_experiences: string[];
    education: string[];
    occupational_roles: string[];
    seniority?: string;
    languages: string[];
}
