/**
 * Matching Engine - Core matching logic for job seeker profiles vs job ads
 * 
 * Uses weighted scoring based on:
 * - Skills (40%)
 * - Experience/Seniority (20%)
 * - Occupation match (15%)
 * - Education (10%)
 * - Languages (5%)
 * - Geographic distance (10%)
 * 
 * Provides transparent explanations for each match.
 */

// Type interfaces (kept inline to avoid import issues)
interface ParsedCV {
  skills: string[];
  work_experiences: string[];
  education: string[];
  occupational_roles: string[];
  languages: string[];
  seniority?: string;
}

interface NormalizedJob {
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

interface MatchResult {
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

/**
 * Calculate skills match score (0-100)
 * Based on intersection of CV skills vs job required skills
 */
function calculateSkillsScore(cvSkills: string[], jobRequiredSkills: string[]): {
  score: number;
  matched: string[];
  missing: string[];
} {
  if (jobRequiredSkills.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }

  const cvSet = new Set(cvSkills.map(s => s.toLowerCase().trim()));
  const jobSet = new Set(jobRequiredSkills.map(s => s.toLowerCase().trim()));

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of jobSet) {
    if (cvSet.has(skill)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const ratio = matched.length / jobSet.size;
  const score = Math.round(ratio * 40);

  return { score, matched, missing };
}

/**
 * Calculate experience/seniority match score (0-100)
 * Based on years of experience matching job requirements
 */
function calculateExperienceScore(
  cvYears: number,
  jobRequiredYears: number
): { score: number; message: string } {
  if (jobRequiredYears === 0) {
    return { score: 20, message: 'Inger erfarenhetskrav' };
  }

  const ratio = Math.min(cvYears / jobRequiredYears, 1.0);
  const score = Math.round(ratio * 20);

  let message: string;
  if (ratio >= 1.0) {
    message = 'Rätt senioritetsnivå';
  } else if (ratio >= 0.7) {
    message = 'Delvis matchad erfarenhet';
  } else if (ratio > 0) {
    message = 'Delvis erfarenhet matchar';
  } else {
    message = 'Saknad erfarenhet';
  }

  return { score, message };
}

/**
 * Calculate occupation match score (0-100)
 * Based on exact or related occupation match
 */
function calculateOccupationScore(
  cvOccupation: string,
  jobOccupation: string
): { score: number; message: string; related: boolean } {
  if (!cvOccupation || !jobOccupation) {
    return { score: 0, message: 'Ingen yrkesroll angiven', related: false };
  }

  const cvLower = cvOccupation.toLowerCase().trim();
  const jobLower = jobOccupation.toLowerCase().trim();

  // Exact match
  if (cvLower === jobLower) {
    return { score: 15, message: 'Rätt yrkesroll', related: true };
  }

  // Check for related roles using simple keyword overlap
  const commonKeywords = cvLower.split(' ').filter(w => w.length > 2)
    .filter(w => jobLower.includes(w));

  if (commonKeywords.length > 0) {
    return { score: Math.round(15 * 0.6), message: 'Delvis relaterad yrkesroll', related: true };
  }

  return { score: 0, message: 'Ingen yrkesroll matchar', related: false };
}

/**
 * Calculate education match score (0-100)
 * Based on education level and field match
 */
function calculateEducationScore(
  cvEducation: string[],
  jobRequiredEducation: string[]
): { score: number; matched: string[]; missing: string[] } {
  if (jobRequiredEducation.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }

  const cvSet = new Set(cvEducation.map(e => e.toLowerCase().trim()));
  const jobSet = new Set(jobRequiredEducation.map(e => e.toLowerCase().trim()));

  const matched: string[] = [];
  const missing: string[] = [];

  for (const edu of jobSet) {
    if (cvSet.has(edu)) {
      matched.push(edu);
    } else {
      missing.push(edu);
    }
  }

  const ratio = matched.length / jobSet.size;
  const score = Math.round(ratio * 10);

  return { score, matched, missing };
}

/**
 * Calculate languages match score (0-100)
 * Based on required vs provided languages
 */
function calculateLanguagesScore(
  cvLanguages: string[],
  jobRequiredLanguages: string[]
): { score: number; matched: string[]; missing: string[] } {
  if (jobRequiredLanguages.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }

  const cvSet = new Set(cvLanguages.map(l => l.toLowerCase().trim()));
  const jobSet = new Set(jobRequiredLanguages.map(l => l.toLowerCase().trim()));

  const matched: string[] = [];
  const missing: string[] = [];

  for (const lang of jobSet) {
    if (cvSet.has(lang)) {
      matched.push(lang);
    } else {
      missing.push(lang);
    }
  }

  const ratio = matched.length / jobSet.size;
  const score = Math.round(ratio * 5);

  return { score, matched, missing };
}

/**
 * Calculate geographic distance score (0-100)
 * Based on distance between user location and job location
 */
function calculateLocationScore(
  userLat: number | null,
  userLon: number | null,
  jobLat: number | null,
  jobLon: number | null,
  maxRadiusKm: number
): { score: number; distanceKm: number | null; withinRadius: boolean } {
  if (userLat === null || userLon === null || jobLat === null || jobLon === null) {
    return { score: 0, distanceKm: null, withinRadius: false };
  }

  // Haversine formula
  const toRad = (deg: number) => deg * Math.PI / 180;

  const lat1 = toRad(userLat);
  const lat2 = toRad(jobLat);
  const deltaLat = toRad(jobLat - userLat);
  const deltaLon = toRad(jobLon - userLon);

  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));

  const earthRadiusKm = 6371;
  const distanceKm = Math.round(earthRadiusKm * c);

  const withinRadius = distanceKm <= maxRadiusKm;
  const score = withinRadius
    ? Math.round(10 * (1 - distanceKm / maxRadiusKm))
    : 0;

  return { score, distanceKm, withinRadius };
}

/**
 * Main matching function that combines all weighted scores
 * and generates transparent explanations
 */
export function matchCVagainstJob(
  cv: ParsedCV,
  job: NormalizedJob,
  userLocation: { lat: number; lon: number } | null,
  maxRadiusKm: number = 40
): MatchResult {
  // Calculate individual component scores

  // Skills: from CV parsed skills vs job must_skills
  const { score: skillsScore, matched: matchedSkills, missing: skillsMissing } =
    calculateSkillsScore(cv.skills, job.must_skills);

  // Experience: from CV work experience years vs job scope_of_work
  const cvYears = parseInt(cv.work_experiences[0] || '0', 10);
  const { score: experienceScore, message: experienceMessage } =
    calculateExperienceScore(cvYears, job.scope_of_work);

  // Occupation: cv occupational roles vs job occupation
  const { score: occupationScore, message: occupationMessage, related } =
    calculateOccupationScore(
      cv.occupational_roles.join(', '),
      job.occupation
    );

  // Education: cv education vs job must_education
  const { score: educationScore, matched: matchedEducation, missing: educationMissing } =
    calculateEducationScore(cv.education, job.must_education || []);

  // Languages: cv languages vs job must_languages
  const { score: languagesScore, matched: matchedLanguages, missing: languagesMissing } =
    calculateLanguagesScore(cv.languages, job.must_languages || []);

  // Location: geographic distance
  const { score: locationScore, distanceKm, withinRadius } =
    calculateLocationScore(
      userLocation?.lat ?? null,
      userLocation?.lon ?? null,
      job.lat,
      job.lon,
      maxRadiusKm
    );

  // Calculate total score
  const totalScore = skillsScore + experienceScore + occupationScore + educationScore + languagesScore + locationScore;
  const cappedTotalScore = Math.min(totalScore, 100);

  // Generate reasons list
  const reasons: string[] = [];

  // Add skills reason
  if (matchedSkills.length > 0) {
    reasons.push(`${matchedSkills.length} efterfrågade kompetenser matchar`);
  }
  if (skillsMissing.length > 0 && skillsMissing.length <= 3) {
    reasons.push(`Saknad kompetens: ${skillsMissing.join(', ')}`);
  } else if (skillsMissing.length > 3) {
    reasons.push(`Saknad kompetens: ${skillsMissing.slice(0, 3).join(', ')} och ${skillsMissing.length - 3} fler`);
  }

  // Add experience reason
  reasons.push(experienceMessage);

  // Add occupation reason
  reasons.push(occupationMessage);

  // Add education reason
  if (educationMissing.length > 0) {
    reasons.push(`Saknad utbildning: ${educationMissing.join(', ')}`);
  }

  // Add languages reason
  if (languagesMissing.length > 0) {
    reasons.push(`Saknad språk: ${languagesMissing.join(', ')}`);
  }

  // Add location reason
  if (distanceKm !== null) {
    reasons.push(`${distanceKm} km från angiven position`);
  }

  return {
    totalScore: cappedTotalScore,
    skillsScore,
    experienceScore,
    occupationScore,
    educationScore,
    languagesScore,
    locationScore,
    distanceKm,
    withinRadius,
    reasons,
    missing: [...skillsMissing, ...educationMissing, ...languagesMissing],
    matchedSkills,
    matchedLanguages,
    matchedEducation,
  };
}
