import fetch from 'node-fetch';
const API_BASE_URL = 'https://jobsearch.api.jobtechdev.se';
/**
 * Search jobs using the JobSearch API
 */
export async function searchJobs(filters) {
    const params = new URLSearchParams();
    if (filters.q)
        params.append('q', filters.q);
    if (filters.location)
        params.append('location', filters.location);
    if (filters.radius)
        params.append('radius', String(filters.radius));
    if (filters.size)
        params.append('size', String(filters.size));
    if (filters.page)
        params.append('page', String(filters.page));
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
    const data = await response.json();
    return data.hits.map((hit) => ({
        id: hit.id || '',
        external_id: hit.external_id || null,
        headline: hit.headline || 'Okänd annons',
        company: hit.employer?.name || 'Okänd arbetsgivare',
        municipality: hit.workplace_address?.municipality || '',
        county: hit.workplace_address?.region || '',
        employment_type: hit.employment_type?.label || '',
        duration: hit.duration?.label || '',
        scope_of_work: hit.scope_of_work || 0,
        lat: hit.workplace_address?.coordinates?.[1] || 0, // [lon, lat] -> lat
        lon: hit.workplace_address?.coordinates?.[0] || 0, // [lon, lat] -> lon
        must_skills: hit.must_have?.skills?.map((s) => s.label || s.concept_id || '') || [],
        must_languages: hit.must_have?.languages?.map((l) => l.label || l.concept_id || '') || [],
        must_education: hit.must_have?.education_level?.map((e) => e || '') || [],
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
export async function searchByLocation(query, location, radius) {
    return searchJobs({
        q: query,
        location: location,
        radius: radius || 40,
    });
}
/**
 * Get a single job by external ID
 */
export async function getJobByExternalId(externalId) {
    try {
        const results = await searchJobs({ q: `external_id:${externalId}` });
        return results.length > 0 ? results[0] : null;
    }
    catch (error) {
        console.error(`Error fetching job ${externalId}:`, error);
        return null;
    }
}
/**
 * Health check
 */
export async function healthCheck() {
    try {
        await searchJobs({ q: 'test' });
        return true;
    }
    catch {
        return false;
    }
}
export default { searchJobs, searchByLocation, getJobByExternalId, healthCheck };
