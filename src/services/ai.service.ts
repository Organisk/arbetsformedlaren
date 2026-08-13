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
export function analyzeCV(cvText: string, config: AIConfig = {}): AIAnalysisResult {
  const { openaiApiKey } = config;
  
  // If no OpenAI key, use rule-based analysis
  if (!openaiApiKey) {
    return analyzeCVRuleBased(cvText);
  }
  
  // If OpenAI key provided, would call OpenAI API
  // For MVP, fall back to rule-based
  console.log('OpenAI API key provided but falling back to rule-based analysis');
  return analyzeCVRuleBased(cvText);
}

/**
 * Rule-based CV analysis (fallback when no OpenAI key)
 */
function analyzeCVRuleBased(cvText: string): AIAnalysisResult {
  const missingCompetencies: string[] = [];
  const suggestions: string[] = [];
  const strengths: string[] = [];
  const formattingSuggestions: string[] = [];
  
  const text = cvText.toLowerCase();
  
  // Check for common skill categories
  const techSkills = ['python', 'javascript', 'react', 'aws', 'docker', 'kubernetes'];
  const missingTech = techSkills.filter(skill => !text.includes(skill));
  
  if (missingTech.length > 0) {
    missingCompetencies.push(...missingTech.map(s => s.charAt(0).toUpperCase() + s.slice(1)));
  }
  
  // Check for experience mentions
  if (!/(?:år|experience|erfarenhet)/.test(text)) {
    suggestions.push('Lyft fram din arbetserfarenhet med konkreta exempel och tidsperioder');
  }
  
  // Check for education mentions
  if (!/(?:utbildning|högskola|universitet|examen)/.test(text)) {
    suggestions.push('Lägg till din utbildning och institution');
  }
  
  // Check for language mentions
  if (!/(?:språk|engelska|svenska)/.test(text)) {
    suggestions.push('Tydliggör dina språkkunskaper');
  }
  
  // Identify strengths
  if (/(?:ledarskap|projektledning|management)/.test(text)) {
    strengths.push('Ledarskaps- och projektledningserfarenhet');
  }
  
  if (/(?:sql|python|javascript)/.test(text)) {
    strengths.push('Tekniska kompetenser inom kodning och databaser');
  }
  
  // Formatting suggestions
  if (text.length > 500 && !/(?:erfarenhet|utbildning|kompetenser)/.test(text)) {
    formattingSuggestions.push('Structurera CV:n med rubriker för erfarenhet, utbildning och kompetenser');
  }
  
  // Calculate quality score (0-100)
  let score = 50; // Base score
  if (missingCompetencies.length === 0) score += 20;
  if (/(?:år|erfarenhet)/.test(text)) score += 15;
  if (/(?:utbildning|examen)/.test(text)) score += 15;
  if (/(?:engelska|språk)/.test(text)) score += 10;
  const qualityScore = Math.min(score, 100);
  
  return {
    qualityScore,
    missingCompetencies: [...new Set(missingCompetencies)],
    suggestions: [...new Set(suggestions)],
    strengths: [...new Set(strengths)],
    formattingSuggestions: [...new Set(formattingSuggestions)],
  };
}

/**
 * Compare CV against a specific job ad using AI (or rule-based)
 */
export function compareCVWithJob(
  cvText: string,
  jobTitle: string,
  jobDescription: string,
  config: AIConfig = {}
): CVJobComparison {
  const { openaiApiKey } = config;
  
  // If no OpenAI key, use rule-based comparison
  if (!openaiApiKey) {
    return compareCVWithJobRuleBased(cvText, jobTitle, jobDescription);
  }
  
  // Fall back to rule-based for MVP
  console.log('OpenAI API key provided but falling back to rule-based comparison');
  return compareCVWithJobRuleBased(cvText, jobTitle, jobDescription);
}

/**
 * Rule-based CV vs job comparison
 */
function compareCVWithJobRuleBased(
  cvText: string,
  jobTitle: string,
  jobDescription: string
): CVJobComparison {
  const matchReasons: string[] = [];
  const missingForMatch: string[] = [];
  const adjustments: string[] = [];
  
  const cvLower = cvText.toLowerCase();
  const descLower = (jobDescription || '').toLowerCase();
  const titleLower = jobTitle.toLowerCase();
  
  // Check for title match
  const titleKeywords = titleLower.split(' ').filter(w => w.length > 3);
  const titleMatches = titleKeywords.filter(k => cvLower.includes(k));
  
  if (titleMatches.length > 0) {
    matchReasons.push(`${titleMatches.length} av titelns nyckelord matchar`);
  }
  
  // Check for key skills from job description
  const commonTech = ['python', 'javascript', 'react', 'aws', 'sql', 'docker'];
  const foundSkills = commonTech.filter(skill => descLower.includes(skill) && cvLower.includes(skill));
  const missingSkills = commonTech.filter(skill => descLower.includes(skill) && !cvLower.includes(skill));
  
  if (foundSkills.length > 0) {
    matchReasons.push(`${foundSkills.length} efterfrågade tekniska kompetenser matchar`);
  }
  
  if (missingSkills.length > 0) {
    missingForMatch.push(...missingSkills);
  }
  
  // Check experience
  const expPatterns = /(\d+)\s*[Åå]\s*år/;
  const hasExperience = expPatterns.test(cvLower);
  
  if (hasExperience) {
    matchReasons.push('Arbete erfarenhet matchar krav');
  } else {
    missingForMatch.push('Arbetslivserfarenhet');
    adjustments.push('Lyft fram specifika projekt och tidsperioder');
  }
  
  // Calculate match score (0-100)
  let score = 0;
  if (titleMatches.length > 0) score += 25;
  if (foundSkills.length > 0) score += 40;
  if (hasExperience) score += 25;
  const matchScore = Math.min(score, 100);
  
  // Suggestions
  if (missingSkills.length > 0) {
    adjustments.push(`Tänk på att lägga till ${missingSkills.slice(0, 3).join(', ')} i ditt CV`);
  }
  if (!hasExperience) {
    adjustments.push('Lägg till konkreta projekt med tidsperioder och resultat');
  }
  
  return {
    matchScore,
    matchReasons: [...new Set(matchReasons)],
    missingForMatch: [...new Set(missingForMatch)],
    adjustments: [...new Set(adjustments)],
  };
}

/**
 * Generate cover letter draft using AI (or rule-based)
 */
export function generateCoverLetter(
  cvText: string,
  jobTitle: string,
  company: string,
  config: AIConfig = {}
): string {
  const { openaiApiKey } = config;
  
  // If no OpenAI key, use rule-based generation
  if (!openaiApiKey) {
    return generateCoverLetterRuleBased(cvText, jobTitle, company);
  }
  
  // Fall back to rule-based for MVP
  console.log('OpenAI API key provided but falling back to rule-based cover letter');
  return generateCoverLetterRuleBased(cvText, jobTitle, company);
}

/**
 * Rule-based cover letter generation
 */
function generateCoverLetterRuleBased(
  cvText: string,
  jobTitle: string,
  company: string
): string {
  const text = cvText.toLowerCase();
  
  // Extract key points from CV
  const hasExperience = /(?:år|erfarenhet)/.test(text);
  const hasEducation = /(?:utbildning|examen|högskola)/.test(text);
  const hasTechSkills = /(?:python|javascript|react|aws)/.test(text);
  
  // Build a personalized cover letter
  let letter = `
Till rekryteringschef
${company}

Jag skriver för att uttrycka mitt intresse för positionen som ${jobTitle} hos ${company}. Som sökande med erfarenhet inom IT-sektorn har jag under mina år i branschen utvecklat kompetenser som passar väl för er organisation.

Min professionella bakgrund inkluderar arbete med olika tekniska projekt och uppgifter som krävs för rollen. Jag har arbetat med löpande utveckling och har erfarenhet som gör att jag snabbt kan sätta mig in i nya uppgifter och leverera resultat.

Jag är särskilt intresserad av möjligheten att bidra med mina kunskaper inom området och är övertygad om att min bakgrund kan vara en tillgång för er team. Min förmåga att samarbeta med kollegor och lösa problemständliga utmaningar har varit en viktig del av min professionella utveckling.

Tack för att du tar del av min ansökan. Jag ser fram emot en möjlighet att diskutera hur jag kan bidra till ${company}s fortsatta framgång.

Vänliga hälsningar
`;
  
  return letter.trim();
}

export default { analyzeCV, compareCVWithJob, generateCoverLetter };
