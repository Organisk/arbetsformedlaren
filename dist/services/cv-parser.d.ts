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
export declare function matchCVagainstJob(cv: ParsedCV, jobMustHave: {
    skills: string[];
    languages: string[];
    work_experiences: string[];
    education: string[];
}, jobOccupation?: string, cvOccupation?: string): {
    score: number;
    reasons: string[];
    missing: string[];
};
