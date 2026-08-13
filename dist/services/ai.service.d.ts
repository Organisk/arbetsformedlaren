/**
 * AI Service - Optional AI-enhanced features using OpenAI
 *
 * This service can operate in two modes:
 * 1. With OpenAI API key provided by the user - full AI features
 * 2. Without API key - falls back to rule-based implementations
 *
 * Key principle: AI should never fabricate experience, education,
 * certifications, or competencies that the user doesn't actually have.
 */
export interface AIConfig {
    /** OpenAI API key (optional - if not provided, rule-based fallback) */
    openaiApiKey?: string;
    /** Whether to enable AI features */
    enabled?: boolean;
}
/**
 * AI-enhanced CV analysis results
 */
export interface AIAnalysisResult {
    /** Overall CV quality score (0-100) */
    qualityScore: number;
    /** Missing competencies identified */
    missingCompetencies: string[];
    /** Suggestions for improvement */
    suggestions: string[];
    /** Strengths found in the CV */
    strengths: string[];
    /** Formatting suggestions */
    formattingSuggestions: string[];
}
/**
 * Compare CV against a specific job ad
 */
export interface CVJobComparison {
    /** Match score (0-100) */
    matchScore: number;
    /** Why the match score is what it is */
    matchReasons: string[];
    /** What's missing to be a better match */
    missingForMatch: string[];
    /** Suggestions for CV adjustments */
    adjustments: string[];
}
/**
 * Analyze CV text using AI (or rule-based fallback)
 */
export declare function analyzeCV(cvText: string, config?: AIConfig): AIAnalysisResult;
/**
 * Compare CV against a specific job ad using AI (or rule-based)
 */
export declare function compareCVWithJob(cvText: string, jobTitle: string, jobDescription: string, config?: AIConfig): CVJobComparison;
/**
 * Generate cover letter draft using AI (or rule-based)
 */
export declare function generateCoverLetter(cvText: string, jobTitle: string, company: string, config?: AIConfig): string;
declare const _default: {
    analyzeCV: typeof analyzeCV;
    compareCVWithJob: typeof compareCVWithJob;
    generateCoverLetter: typeof generateCoverLetter;
};
export default _default;
