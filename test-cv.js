import('./dist/services/cv-parser.js').then(module => {
  const { parseCV, matchCVagainstJob } = module;
  
  const cvText = 'IT Project Manager med 5 ars erfarenhet av projektledning inom IT-sektorn. Erfarenhet av agile och scrum-metodik. Programmering i JavaScript TypeScript och React. Erfarenhet av AWS och molntjanster. Utbildning Master i datateknik fran KTH. Sprak Engelska flytande Svenska morsmalt.';
  
  const parsed = parseCV(cvText);
  console.log('Parsed CV:');
  console.log('  Skills:', parsed.skills);
  console.log('  Work experiences:', parsed.work_experiences);
  console.log('  Education:', parsed.education);
  console.log('  Occupational roles:', parsed.occupational_roles);
  console.log('  Languages:', parsed.languages);
  
  const jobMustHave = {
    skills: ['JavaScript', 'TypeScript', 'React', 'AWS'],
    languages: ['English', 'Swedish'],
    work_experiences: ['3-5 ar'],
    education: ['Master'];
  };
  
  const result = matchCVagainstJob(parsed, jobMustHave, 'Projektledare, IT', 'IT Project Manager');
  console.log('\nMatch result:');
  console.log('  Score:', result.score);
  console.log('  Reasons:', result.reasons);
  console.log('  Missing:', result.missing);
}).catch(err => console.error('Error:', err));
