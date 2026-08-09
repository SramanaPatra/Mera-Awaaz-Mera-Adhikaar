import { dbState } from '../db.js';

export function findMatchingSchemes(income, location, occupation, customOccupation, age, gender) {
  const parsedIncome = Number(income) || 0;
  const userLoc = (location || '').toLowerCase();
  const activeOccupation = (occupation === 'Other' && customOccupation) ? customOccupation : occupation;
  const userOcc = (activeOccupation || '').toLowerCase();
  const userAge = Number(age) || 30;
  const userGender = (gender || 'All').toLowerCase();

  return dbState.schemes.map(scheme => {
    const matchExplanations = [];
    const missingRequirements = [];
    const ineligibilityReasons = [];

    let score = 50;

    const incomeCeiling = scheme.max_income_ceiling;
    if (parsedIncome > 0 && parsedIncome <= incomeCeiling) {
      score += 25;
      matchExplanations.push(`Annual income of INR ${parsedIncome.toLocaleString('en-IN')} is within scheme ceiling of INR ${incomeCeiling.toLocaleString('en-IN')}.`);
    } else if (parsedIncome > incomeCeiling) {
      score -= 30;
      ineligibilityReasons.push(`Annual income of INR ${parsedIncome.toLocaleString('en-IN')} exceeds scheme ceiling limit.`);
    }

    const schemeOcc = scheme.target_occupation.toLowerCase();
    if (schemeOcc === 'all' || schemeOcc === userOcc || userOcc.includes(schemeOcc) || schemeOcc.includes(userOcc)) {
      score += 15;
      matchExplanations.push(`Applicant occupation category (${activeOccupation || 'General'}) aligns with target sector (${scheme.target_occupation}).`);
    } else {
      score -= 10;
      ineligibilityReasons.push(`Target sector (${scheme.target_occupation}) differs from applicant sector (${activeOccupation}).`);
    }

    const schemeLoc = scheme.target_location.toLowerCase();
    if (schemeLoc === 'all regions' || schemeLoc === 'all' || schemeLoc === userLoc || userLoc.includes(schemeLoc) || schemeLoc.includes(userLoc)) {
      score += 10;
      matchExplanations.push(`Geographic residency sector meets scheme territorial eligibility criteria.`);
    } else {
      ineligibilityReasons.push(`Scheme targets ${scheme.target_location} sector.`);
    }

    if (scheme.min_age && scheme.max_age) {
      if (userAge >= scheme.min_age && userAge <= scheme.max_age) {
        score += 10;
        matchExplanations.push(`Applicant age (${userAge} years) satisfies scheme age bracket (${scheme.min_age}-${scheme.max_age} years).`);
      } else {
        score -= 20;
        ineligibilityReasons.push(`Applicant age (${userAge} years) outside target age bracket (${scheme.min_age}-${scheme.max_age} years).`);
      }
    }

    if (scheme.target_gender && scheme.target_gender.toLowerCase() !== 'all') {
      if (userGender === scheme.target_gender.toLowerCase()) {
        score += 15;
        matchExplanations.push(`Gender criterion (${scheme.target_gender}) directly matches applicant profile.`);
      } else {
        score -= 40;
        ineligibilityReasons.push(`Scheme is exclusively designed for ${scheme.target_gender} applicants.`);
      }
    }

    scheme.document_checklist.forEach(doc => {
      missingRequirements.push(`Verification required: ${doc}`);
    });

    let finalScore = Math.min(Math.max(score, 15), 98);

    return {
      ...scheme,
      matchScore: finalScore,
      matchExplanations,
      missingRequirements,
      ineligibilityReasons,
      isEligible: finalScore >= 60
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
