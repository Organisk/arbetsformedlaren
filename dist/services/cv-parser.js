export function extractSkills(cvText) {
    if (!cvText)
        return [];
    const text = cvText.toLowerCase();
    const skillKeywords = [
        'python', 'javascript', 'typescript', 'java', 'c#', 'c++', 'go', 'rust', 'php',
        'ruby', 'scala', 'kotlin', 'swift', 'react', 'angular', 'vue', 'svelte',
        'next.js', 'express', 'sql', 'postgresql', 'mysql', 'mongodb', 'redis',
        'elasticsearch', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
        'git', 'agile', 'scrum', 'devops', 'ci/cd', 'machine learning', 'ai',
        'data analysis', 'r', 'jest', 'pytest', 'unit testing',
    ];
    const foundSkills = new Set();
    for (const skill of skillKeywords) {
        const regex = new RegExp('\\b' + skill + '\\b', 'i');
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
export function matchCVagainstJob(cv, jobMustHave, jobOccupation, cvOccupation) {
    const reasons = [];
    const missing = [];
    let score = 0;
    // Skills match (40% weight)
    const cvSkillsSet = new Set(cv.skills.map(s => s.toLowerCase()));
    const jobSkillsSet = new Set(jobMustHave.skills.map(s => s.toLowerCase()));
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
    const cvLanguagesSet = new Set(cv.languages.map(l => l.toLowerCase()));
    const jobLanguagesSet = new Set(jobMustHave.languages.map(l => l.toLowerCase()));
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
    if (jobOccupation && cvOccupation) {
        const occupationMatch = jobOccupation.toLowerCase() === cvOccupation.toLowerCase();
        if (occupationMatch) {
            score += 15;
            reasons.push('Rätt yrkesroll');
        }
        else {
            const relatedRoles = ['projektledare', 'chef', 'utvecklare'];
            if (relatedRoles.some(r => jobOccupation.toLowerCase().includes(r) || cvOccupation.toLowerCase().includes(r))) {
                score += 8;
                reasons.push('Relaterad yrkesroll');
            }
            else {
                missing.push('Yrkesroll');
            }
        }
    }
    // Experience match (20% weight)
    const cvYears = parseInt(cv.work_experiences[0] || '0', 10);
    const jobYears = parseInt(jobMustHave.work_experiences[0] || '0', 10);
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
    const cvEducation = cv.education.join(', ');
    const jobEducation = jobMustHave.education.join(', ');
    if (jobEducation && cvEducation) {
        const eduKeywords = jobEducation.split(',').filter(k => k.trim().length > 0);
        const matchedEdus = eduKeywords.filter(k => cvEducation.toLowerCase().includes(k.toLowerCase()));
        if (matchedEdus.length > 0) {
            const eduRatio = matchedEdus.length / eduKeywords.length;
            const eduScore = Math.round(eduRatio * 10);
            score += eduScore;
            if (eduRatio > 0) {
                reasons.push(matchedEdus.length + '/' + eduKeywords.length + ' utbildningsområden matchar');
            }
        }
        else {
            missing.push('Utbildning');
        }
    }
    // Cap score at 100
    const finalScore = Math.min(score, 100);
    return {
        score: finalScore,
        reasons,
        missing: missing.slice(0, 5),
    };
}
