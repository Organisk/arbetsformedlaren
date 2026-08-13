export declare function extractSkills(cvText: string): string[];
export declare function extractExperienceYears(cvText: string): number;
export declare function extractOccupationalRoles(cvText: string): string[];
export declare function extractEducation(cvText: string): string[];
export declare function extractLanguages(cvText: string): string[];
export interface ParsedCV {
    skills: string[];
    work_experiences: string[];
    education: string[];
    occupational_roles: string[];
    languages: string[];
    seniority?: string;
}
export declare function parseCV(cvText: string): ParsedCV;
export declare function matchCVagainstJob(cv: ParsedCV, job: NormalizedJob, userLocation: {
    lat: number;
    lon: number;
} | null, maxRadiusKm?: number): MatchResult;
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
export interface MatchResult {
    totalScore: number;
    skillsScore: number;
    experienceScore: number;
    occupationScore: number;
    educationScore: number;
    languagesScore: number;
    locationScore: number;
    distanceKm: number | null;
    withinRadius: boolean;
    reasons: string[];
    missing: string[];
    matchedSkills: string[];
    matchedLanguages: string[];
    matchedEducation: string[];
}
