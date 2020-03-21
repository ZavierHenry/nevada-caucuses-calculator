
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





