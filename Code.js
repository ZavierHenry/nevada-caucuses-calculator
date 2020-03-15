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
  
  return maxPercentage
  
}

function rankToNumber_(rank) {
  switch (rank) {
    case 'ace':
      return 14;
    case 'king':
      return 13;
    case 'queen':
      return 12;
    case 'jack':
      return 11;
    default:
      return parseInt(rank)
  }
}

function suitToNumber_(suit) {
  switch (suit) {
    case 'clubs':
      return 1;
    case 'diamonds':
      return 2;
    case 'hearts':
      return 3;
    case 'spades':
      return 4;
    default:
      return -1;
  }
}

function toCard_(name) {
  
  if (name == null) return null;
  
  const regex = /([2-9]|10|jack|queen|king|ace) of (clubs|diamonds|hearts|spades)/;
  const groups = name.toLowerCase().match(regex);
  
  if (groups == null) {
    return null;
  }
  
  return {
    rank: rankToNumber_(groups[1]),
    suit: suitToNumber_(groups[2])
  }
  
}

function cardcmp_(card1, card2) {
  
  if (card1 == null || card2 == null) {
    return 0;
  } else if (card1.rank == card2.rank) {
    return card2.suit - card1.suit;
  } else {
    return card2.rank - card1.rank;
  }
}

/**
 * Calculates single delegate in a majority election
 * 
 * @param {[[number]]} count - Final preference votes
 * @param {[[string | object]]} cards - Cards to be used for tiebreaker
 *
 * @return {[[number | object]]} Allocation of delegates for each candidate
 * @customfunction
 */
function MAJORITYELECTIONDELEGATES(count, cards) {
  
  const candidates = count.map(function([x], i) {
    return {
      id: i,
      count: x == null ? 0 : x,
      delegateCount: 0,
      card: toCard_(cards[i][0])
    }
  })
  
  //sort in descending order with cards as tiebreaker
  candidates.sort((x, y) => x.count == y.count ? cardcmp_(x.card, y.card) : y.count - x.count)
  
  //if tiebreaker info is needed and missing, invalidate the delegate count of the tied candidates
  for (let i = 0; i < candidates.length && candidates[i].count == candidates[0].count; i++) {
    
    let candidate = candidates[i];
    if (i == 0) {
      candidate.delegateCount = 1;
      
    } else {
      
      let prevCandidate = candidates[i-1];
      if (prevCandidate.delegateCount == null) {
        candidate.delegateCount = null
      } else if (prevCandidate.card == null || candidate.card == null) {
        for (let j = 0; j <= i; j++) candidates[j].delegateCount = null;
      } 
    }
  }
  
  //return delegates with first candidate getting the delegate
  return candidates
     .sort((x, y) => x.id - y.id)
     .map(candidate => [candidate.delegateCount]);
                             
}

/**
 * Calculates delegates to be allocated to each candidate
 *
 * @param {[[number | object ]]} delegates - Caucus delegate decimals
 * @param {number} target - Number of delegates to be allocated
 * @param {[[string | object]]} - Cards to be used for tiebreakers
 * 
 * @return {[[number | object]]} Allocation of delegates for each candidate
 */
function RECONCILEDELEGATES(delegates, target, cards) {
  const candidates = delegates.map(function([x], i) {
    let weight = Math.round(x * 10000) / 10000;
    let count = Math.round(x);
    
    return {
      id: i,
      weight: weight,
      delegateCount: count,
      distance: count + 1 - x,
      card: toCard_(cards[i][0])
    }
  });
  
  
  if (candidates.every(x => x.weight == 0)) {
    return candidates.map(x => [x.delegateCount])
  }
  
  const difference = target - candidates.reduce((x, y) => x + y.delegateCount, 0);
  
  //return delegates if delegates are to be subtracted and every viable candidate has exactly 1 delegate
  if (difference < 0 && candidates.every(x => x.delegateCount == 1 || x.weight == 0)) {
    return candidates.map(x => [x.delegateCount]);
  }
  
  const absDifference = Math.abs(difference);
  
  //sort candidates by order in which delegates are to be added/subtracted
  const sortedCandidates = Array.from(candidates)
     .sort((x, y) => difference * (x.distance == y.distance ? cardcmp_(x.card, y.card) : x.distance - y.distance))
     
  
  let diff = absDifference;
  let startIndex = 0;
  
  //if tiebreaker info is needed and missing, invalidate the delegate count of the tied candidates
  let checkedCandidates = sortedCandidates
     .filter(x => x.weight > 0 || !(difference < 0 && x.delegateCount == 1))
  let remainder = absDifference % checkedCandidates.length;

  checkedCandidates = checkedCandidates.slice(0, remainder == 0 ? 0 : remainder)
  
  for (let i = 1; i < sortedCandidates.length; i++) {
    let candidate = sortedCandidates[i]
    let prevCandidate = sortedCandidates[i-1]
    
    if (candidate.distance != prevCandidate.distance || candidate.weight == 0 || (difference < 0 && candidate.delegateCount == 1) || i == sortedCandidates.length - 1) {
      let endIndex = i == sortedCandidates.length - 1 ? i + 1 : i;
      
      if (endIndex - startIndex > 1) {
        let startCandidate = sortedCandidates[startIndex]
        let endCandidate = sortedCandidates[endIndex-1]
        let bothInChecked = checkedCandidates.includes(startCandidate) && checkedCandidates.includes(endCandidate)
        let neitherInChecked = !checkedCandidates.includes(startCandidate) && !checkedCandidates.includes(endCandidate)
        
        if (!(bothInChecked || neitherInChecked)) {
          for (let k = startIndex; k < endIndex; k++) {
            if (sortedCandidates[k].card == null) {
              for (let j = startIndex; j < endIndex; j++) sortedCandidates[j].delegateCount = null;
              break;
            }
          }
        }
        
      }
      startIndex = i;
    }
  }
 
  //adds or subtracts delegates in order unless delegate count was invalidated or candidate would lose only delegate
  while (diff > 0) {
    
    for (const candidate of sortedCandidates) {
      if (diff <= 0) break;
      if (candidate.weight == 0) continue;
      
      if (!(difference < 0 && candidate.delegateCount == 1)) diff--;
      
      if (candidate.delegateCount != null && !(difference < 0 && candidate.delegateCount == 1)) {
        candidate.delegateCount += (difference > 0 ? 1 : -1)
      } 
      
    }
    
  }
  
  //reformats candidates in original candidate order and data type
  return sortedCandidates
     .sort((x, y) => x.id - y.id)
     .map(candidate => candidate.delegateCount == 0 && candidate.weight > 0 ? [1] : [candidate.delegateCount])
  
}


const cacheEntries = 60;
const resultsUrl = "https://web.archive.org/web/20200226034915if_/https://nevadacaucusresults.com/results/nv_caucus_precinct_results.json"

function fetchPrecinctNevadaResults_() {
  
  let cache = CacheService.getScriptCache()
  let results = new Array(cacheEntries)
  
  //check for each cache chunk
  for (let i = 0; i < cacheEntries; i++) {
    const key = `nevada_results_${i}`
    let chunk = cache.get(key)
    if (chunk == null) break;
    results[i] = chunk
  }
  
  //assemble chunks and return if no chunks have been invalidated
  if (results[cacheEntries-1] != undefined) {
    return JSON.parse(results.join(''))
  }
  
  let resp = UrlFetchApp.fetch(resultsUrl)
  results = resp.getContentText();
  if (results == null || results.length == 0) return null;
  
  let chunkSize = Math.ceil(results.length / cacheEntries)
  
  //split JSON results into chunks and save to cache
  for (let i = 0; i < cacheEntries; i++) {
    let key = `nevada_results_${i}`
    let slice = results.slice(chunkSize * i, chunkSize * (i+1))
    cache.put(key, slice)
  }
  
  return JSON.parse(results)
  
}


function queryNevadaResults_(county, precinct, key) {
  let precinctKey = `${county} - ${precinct}`
  let results = fetchPrecinctNevadaResults_()
  if (results == null) throw "Problem getting results from Nevada site"
  return parseInt(results[precinctKey][key])
}


/*
 * Gets 2020 Nevada Caucuses first alignment count from the given county, precinct, and candidate name
 * 
 * @param {string} county - Nevada county
 * @param {number | string} precinct - Nevada county precinct or strip caucus location
 * @param {string} name - candidate name
 *
 * @return {number} Total attendance
 */
function GETFIRSTALIGNMENTCOUNT(county, precinct, name) {
  let names = name.split(" ")
  let key = names[names.length-1].toLowerCase() + "_first_alignment"
  return queryNevadaResults_(county, precinct, key);
}


/*
 * Gets 2020 Nevada Caucuses final alignment count from the given county, precinct, and candidate name
 *
 * @param {string} county - Nevada county
 * @param {number | string} precinct - Nevada county precinct or strip caucus location
 * @param {string} name - candidate name
 *
 * @return {number} Total attendance
 */
function GETFINALALIGNMENTCOUNT(county, precinct, name) {
  let names = name.split(" ")
  let key = names[names.length-1].toLowerCase() + "_final_alignment"
  return queryNevadaResults_(county, precinct, key);
}


/*
 * Gets 2020 Nevada Caucuses total attendance from the given county and precinct
 * 
 * @param {string} county - Nevada county
 * @param {number | string} precinct - Nevada county precinct or strip caucus location
 *
 * @return {number} Total attendance
 */
function GETTOTALATTENDANCE(county, precinct) {
  return queryNevadaResults_(county, precinct, "total_attendance")
}


/*
 * Gets county delegates for the given county, precinct, and candidate name
 *
 * @param {string} county - Nevada county
 * @param {number | string} precinct - Nevada county precinct or strip caucus location
 * @param {string} name - candidate name
 *
 * @return {number} Total delegates
 * @customfunction
 */
function GETCOUNTYDELEGATES(county, precinct, name) {
  let names = name.split(" ")
  let key = names[names.length-1].toLowerCase() + "_county_delegates"
  return queryNevadaResults_(county, precinct, key)
}





