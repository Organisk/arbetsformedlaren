export function extractSkills(cvText) {
    if (!cvText)
        return [];
    const text = cvText.toLowerCase();
    const skillKeywords = [
        'python', 'javascript', 'typescript', 'java', 'c sharp', 'go', 'rust', 'php',
        'ruby', 'scala', 'kotlin', 'swift', 'react', 'angular', 'vue', 'svelte',
        'next.js', 'express', 'sql', 'postgresql', 'mysql', 'mongodb', 'redis',
        'elasticsearch', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
        'git', 'agile', 'scrum', 'devops', 'ci/cd', 'machine learning', 'ai',
        'data analysis', 'r', 'jest', 'pytest', 'unit testing',
    ];
    const foundSkills = new Set();
    for (const skill of skillKeywords) {
        // Escape special regex characters in skill name
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('\\b' + escapedSkill + '\\b', 'i');
        if (regex.test(text)) {
            foundSkills.add(skill);
        }
    }
    return Array.from(foundSkills);
}
export function extractExperienceYears(cvText) {
    if (!cvText)
        return 0;
    const patterns = [
        /(\d+)\s*[Åå]\s*år/i,
        /(\d+)\s*-\s*(\d+)\s*[Åå]\s*år/i,
        /(\d+)\+?\s*years?/i,
        /(\d+)\s*year[s]?\s*of\s*experience/i,
    ];
    let maxYears = 0;
    for (const pattern of patterns) {
        const matches = cvText.match(pattern);
        if (matches) {
            for (const match of matches) {
                const num = parseInt(match, 10);
                if (num > maxYears)
                    maxYears = num;
            }
        }
    }
    return maxYears;
}
export function extractOccupationalRoles(cvText) {
    if (!cvText)
        return [];
    const text = cvText.toLowerCase();
    const roleKeywords = [
        'project manager', 'it-projektledare', 'chef', 'utvecklare', 'programmerare',
        'systemutvecklare', 'arkitekt', 'testare', 'devops', 'scrum master',
        'product owner', 'project leader', 'team lead', 'group leader',
    ];
    const foundRoles = new Set();
    for (const role of roleKeywords) {
        const regex = new RegExp(role, 'i');
        if (regex.test(text)) {
            foundRoles.add(role);
        }
    }
    return Array.from(foundRoles);
}
export function extractEducation(cvText) {
    if (!cvText)
        return [];
    const text = cvText.toLowerCase();
    const educationKeywords = [
        'högskola', 'universitet', 'master', 'kandidate', 'biologe', 'examen',
        'högre utbildning', 'yrkeshögskola', 'gymnasium', 'gångskola',
    ];
    const foundEducation = new Set();
    for (const edu of educationKeywords) {
        const regex = new RegExp(edu, 'i');
        if (regex.test(text)) {
            foundEducation.add(edu);
        }
    }
    return Array.from(foundEducation);
}
export function extractLanguages(cvText) {
    if (!cvText)
        return [];
    const text = cvText.toLowerCase();
    const languageKeywords = [
        'svenska', 'engelska', 'finska', 'norska', 'danska',
        'tyska', 'franska', 'spanska', 'italska', 'ryska',
    ];
    const foundLanguages = new Set();
    for (const lang of languageKeywords) {
        const regex = new RegExp(lang, 'i');
        if (regex.test(text)) {
            foundLanguages.add(lang);
        }
    }
    return Array.from(foundLanguages);
}
export function parseCV(cvText) {
    return {
        skills: extractSkills(cvText),
        work_experiences: [extractExperienceYears(cvText).toString()],
        education: extractEducation(cvText),
        occupational_roles: extractOccupationalRoles(cvText),
        languages: extractLanguages(cvText),
    };
}
export function matchCVagainstJob(cv, job, userLocation, maxRadiusKm = 40) {
    const reasons = [];
    const missing = [];
    let score = 0;
    // Skills match (40% weight)
    const cvSkillsSet = new Set(cv.skills.map(s => s.toLowerCase().trim()));
    const jobSkillsSet = new Set(job.must_skills.map(s => s.toLowerCase().trim()));
    if (jobSkillsSet.size > 0) {
        const skillsMatch = Array.from(cvSkillsSet).filter(s => jobSkillsSet.has(s));
        const skillsRatio = skillsMatch.length / jobSkillsSet.size;
        const skillsScore = Math.round(skillsRatio * 40);
        score += skillsScore;
        if (skillsRatio > 0) {
            reasons.push(skillsMatch.length + '/' + jobSkillsSet.size + ' efterfrågade kompetenser matchar');
            if (skillsRatio >= 0.8) {
                reasons.push('Hög kompetensmatchning');
            }
            else if (skillsRatio >= 0.5) {
                reasons.push('God kompetensmatchning');
            }
            else {
                const missingSkills = Array.from(jobSkillsSet).filter(s => !cvSkillsSet.has(s));
                if (missingSkills.length > 0) {
                    missing.push(...missingSkills.slice(0, 3));
                }
            }
        }
    }
    // Languages match (5% weight)
    const cvLanguagesSet = new Set(cv.languages.map(l => l.toLowerCase().trim()));
    const jobLanguagesSet = new Set(job.must_languages.map(l => l.toLowerCase().trim()));
    if (jobLanguagesSet.size > 0) {
        const langMatch = Array.from(cvLanguagesSet).filter(l => jobLanguagesSet.has(l));
        const langRatio = langMatch.length / jobLanguagesSet.size;
        const langScore = Math.round(langRatio * 5);
        score += langScore;
        if (langRatio > 0) {
            reasons.push(langMatch.length + '/' + jobLanguagesSet.size + ' efterspråk matchar');
        }
    }
    // Occupation match (15% weight)
    if (cv.occupational_roles.join(', ') && job.occupation) {
        const cvLower = cv.occupational_roles.join(', ').toLowerCase().trim();
        const jobLower = job.occupation.toLowerCase().trim();
        if (cvLower === jobLower) {
            score += 15;
            reasons.push('Rätt yrkesroll');
        }
        else {
            const relatedRoles = ['projektledare', 'chef', 'utvecklare'];
            if (relatedRoles.some(r => cvLower.includes(r) || jobLower.includes(r))) {
                score += Math.round(15 * 0.6);
                reasons.push('Relaterad yrkesroll');
            }
            else {
                missing.push('Yrkesroll');
            }
        }
    }
    // Experience match (20% weight)
    const cvYears = parseInt(cv.work_experiences[0] || '0', 10);
    const jobYears = parseInt(job.scope_of_work > 0 ? '5' : '0', 10); // scope_of_work is 0-100 scale
    if (jobYears > 0 && cvYears > 0) {
        const expRatio = Math.min(cvYears / jobYears, 1.0);
        const expScore = Math.round(expRatio * 20);
        score += expScore;
        if (expRatio >= 1.0) {
            reasons.push('Rätt senioritetsnivå');
        }
        else if (expRatio >= 0.5) {
            reasons.push('Delvis matchad erfarenhet');
        }
        else {
            missing.push('Saknad erfarenhet');
        }
    }
    // Education match (10% weight)
    if (job.must_education && job.must_education.length > 0) {
        const cvEducation = cv.education.join(', ');
        const jobEducation = job.must_education;
        const cvSet = new Set(cvEducation.toLowerCase().split(', '));
        const jobSet = new Set(jobEducation.map(e => e.toLowerCase()));
        const matchedEdus = Array.from(jobSet).filter(k => cvSet.has(k));
        if (matchedEdus.length > 0) {
            const eduRatio = matchedEdus.length / jobSet.size;
            const eduScore = Math.round(eduRatio * 10);
            score += eduScore;
            if (eduRatio > 0) {
                reasons.push(matchedEdus.length + '/' + jobEducation.length + ' utbildningsområden matchar');
            }
        }
        else {
            missing.push('Utbildning');
        }
    }
    // Location match (10% weight)
    let locationScore = 0;
    let distanceKm = null;
    let withinRadius = false;
    if (userLocation && userLocation.lat !== null && userLocation.lon !== null && job.lat !== null && job.lon !== null) {
        const toRad = (deg) => deg * Math.PI / 180;
        const lat1 = toRad(userLocation.lat);
        const lat2 = toRad(job.lat);
        const deltaLat = toRad(job.lat - userLocation.lat);
        const deltaLon = toRad(job.lon - userLocation.lon);
        const a = Math.sin(deltaLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
        const c = 2 * Math.asin(Math.sqrt(a));
        const earthRadiusKm = 6371;
        distanceKm = Math.round(earthRadiusKm * c);
        withinRadius = distanceKm <= maxRadiusKm;
        if (withinRadius) {
            locationScore = Math.round(10 * (1 - distanceKm / maxRadiusKm));
            reasons.push(distanceKm + ' km från angiven position');
        }
    }
    score += locationScore;
    const totalScore = Math.min(score, 100);
    return {
        totalScore,
        skillsScore: 0,
        experienceScore: Math.round(score / 6) || 0, // Simplified - would calculate properly
        occupationScore: 0, // Would be calculated separately
        educationScore: 0, // Would be calculated separately
        languagesScore: 0, // Would be calculated separately
        locationScore,
        distanceKm,
        withinRadius,
        reasons,
        missing: missing.slice(0, 5),
        matchedSkills: [],
        matchedLanguages: [],
        matchedEducation: [],
    };
}
