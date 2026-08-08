import { dbState } from '../db.js';

export function findMatchingSchemes(income, location, occupation, customOccupation) {
  const parsedIncome = Number(income) || 0;
  const userLoc = (location || '').toLowerCase();
  const activeOccupation = (occupation === 'Other' && customOccupation) ? customOccupation : occupation;
  const userOcc = (activeOccupation || '').toLowerCase();

  return dbState.schemes.map(scheme => {
    const matchExplanations = [];
    const missingRequirements = [];
    const ineligibilityReasons = [];

    let score = 50;

    const incomeCeiling = scheme.max_income_ceiling;
    if (parsedIncome <= incomeCeiling) {
      score += 25;
      matchExplanations.push(`Annual income of INR ${parsedIncome.toLocaleString('en-IN')} is within the scheme ceiling limit of INR ${incomeCeiling.toLocaleString('en-IN')}.`);
    } else {
      score -= 30;
      ineligibilityReasons.push(`Annual income of INR ${parsedIncome.toLocaleString('en-IN')} exceeds the maximum scheme ceiling of INR ${incomeCeiling.toLocaleString('en-IN')}.`);
    }

    const schemeOcc = scheme.target_occupation.toLowerCase();
    if (schemeOcc === 'all' || schemeOcc === userOcc || userOcc.includes(schemeOcc) || schemeOcc.includes(userOcc)) {
      score += 15;
      matchExplanations.push(`Applicant occupation (${activeOccupation}) aligns directly with target occupational sector (${scheme.target_occupation}).`);
    } else {
      score -= 10;
      ineligibilityReasons.push(`Target sector (${scheme.target_occupation}) differs from applicant sector (${activeOccupation}).`);
    }

    const schemeLoc = scheme.target_location.toLowerCase();
    if (schemeLoc === 'all regions' || schemeLoc === userLoc || userLoc.includes(schemeLoc) || schemeLoc.includes(userLoc)) {
      score += 10;
      matchExplanations.push(`Geographic residency sector (${location || 'Region'}) meets scheme territorial eligibility criteria.`);
    } else {
      ineligibilityReasons.push(`Scheme targets ${scheme.target_location} sector, whereas applicant is registered under ${location}.`);
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
