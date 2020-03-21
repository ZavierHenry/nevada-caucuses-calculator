function precinctLevel_(voters) {
  
  if (voters <= 400) {
    return 5;
    
  } else if (voters > 400 && voters <= 600) {
    return 8;
    
  } else if (voters > 600 && voters <= 800) {
    return 10;
    
  } else if (voters > 800 && voters <= 1400) {
    return 15;
    
  } else if (voters > 1400 && voters <= 2000) {
    return 20;
    
  } else if (voters > 2000 && voters <= 3000) {
    return 30;
    
  } else if (voters > 3000 && voters <= 4000) {
    return 35;
    
  } else {
    return 50;
    
  }
  
};

/**
 * Finds number of delegates apportioned to a caucus site
 *
 * @param {number} countyVoters - Number of registered voters in the county
 * @param {number} precinctVoters - Number of registed voters in the precinct
 *
 * @return {number} Number of delegates apportioned
 * @customfunction
 */
function DELEGATEVOTES(countyVoters, precinctVoters) {
  let delegates = precinctVoters / precinctLevel_(countyVoters);
  
  if (countyVoters > 1400) {
    delegates = Math.round(delegates)
  } else {
    delegates = Math.floor(delegates)
  }
  
  return Math.max(delegates, 1);
  
}


/**
 * Finds viability threshold of a caucus precinct
 *
 * @param {[[number]]} percentages - Percentage of the total initial vote for each candidate
 * @param {number} delegates - Number of delegates allocated for the precinct
 *
 * @return {number|string} Viability threshold or 'MAJORITY' meaning conduct vote based on majority vote
 * @customfunction
 */
function VIABILITYTHRESHOLD(percentages, delegates) {
  let initThreshold;
  switch (delegates) {
    case 1:
      initThreshold = 0.5;
      break;
    case 2:
      initThreshold = 0.25;
      break;
    case 3:
      initThreshold = 1/6;
      break;
    default:
      initThreshold = 0.15
  }
  
  if (initThreshold == 0.5) return initThreshold;
  
  let maxPercentage = 0;
  for (const percentage of percentages) {
    if (percentage[0] >= initThreshold) return initThreshold;
    maxPercentage = Math.max(maxPercentage, percentage[0])
  }
  
  return 0.5 * maxPercentage
  
}