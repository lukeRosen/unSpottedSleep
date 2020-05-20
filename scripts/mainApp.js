//some constants-------------------
const itemsToEnableFromTop = 3;

const minPrefix = 'min_';
const maxPrefix = 'max_';
const tgtPrefix = 'target_';

const classicalVal  = 'classical';
const newAgeVal     = 'new-age';
const sleepVal      = 'sleep';
const popAndRockVal = 'pop,rock';

const optionSettingsPrefixes = {
  energy:           maxPrefix,
  danceability:     maxPrefix,
  tempo:            maxPrefix,
  instrumentalness: minPrefix,
  acousticness:     minPrefix,
  valence:          tgtPrefix,
  popularity:       tgtPrefix,
  speechiness:      maxPrefix,
  loudness:         tgtPrefix,
  mode:             tgtPrefix,
  key:              tgtPrefix,
}
//end of constants-----------------

setupDisplay();
[...document.body.querySelectorAll('.toggleBlock')].slice(itemsToEnableFromTop).forEach(elem => elem.click());

const implicitGrantResp = location.hash.substring(1).split('&');
const accessToken = implicitGrantResp.find(str => str.indexOf('access_token') === 0).split('=')[1];

let uId;
let postResp;
let tracks;

//setting up event handler to fill in candidates for the candidate pool
document.querySelector('.layer-options .forward').addEventListener('click', populateCandidatePool);

//beginning of functions----------------------------------------------------
//makes a new playlist with randomly sampled songs from the candidate pool for meeting the set sleep timer duration
//this should be called AFTER getUserId(accessToken) and getTracks(getSelectedGenre()),
//since they mutate and set "uId" and "tracks"
async function setSleepTimer(){

  await generatePlaylist().catch(err => alert(`Sorry :( Error message was: ${err.message}`));
  
  let toPublish = generateSleepSongs(tracks, getSleepTimerDuration());
  
  let response = await fetch(`https://api.spotify.com/v1/playlists/${postResp.id}/tracks`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({uris: toPublish})
  });
  
  response = await response.json();
  if(response.hasOwnProperty('error')){
    alert('Sorry, and error occured. Message was: ' + response.error.message);
    throw response;
  }
  
  //should resolve returned promise with undefined if completed without errors
}

//used to produce an array with the URIs of randomly sampled tracks from the
//given candidates to meet the specified time given
//takes in "candidates", the array of tracks that are to be sampled from
//and "totalMinutes", the number of minutes to populate tracks to meet
//returns an array of the uris for the tracks to be included for the sleep timer
//if successful, otherwise throws an exception
function generateSleepSongs(candidates, totalMinutes){
  if(candidates.length < 1){
    alert('Warning! The candidate list is empty.');
    throw('Empty Candidate List');
  }

  let storage = [];

  let storageLength = 0;
  let candidatesCopy = [...candidates];
  let candidatesLength;
  let timeLeft = totalDuration * 60 * 1000; //minutes to seconds, then seconds to milliseconds
  let tempSwap;

  while(timeLeft > 0){
    candidatesLength = candidates.length - (storageLength % candidates.length);
    
    let nextIndex = Math.floor(Math.random() * candidatesLength);
    
    storage.push(candidatesCopy[nextIndex].uri);
    timeLeft -= candidatesCopy[nextIndex].time;
    
    tempSwap = candidatesCopy[nextIndex];
    candidatesCopy[nextIndex] = candidatesCopy[candidatesLength - 1];
    candidatesCopy[candidatesLength - 1] = tempSwap

    storageLength += 1;
  }

  return storage;
}

//makes a playlist, returns a Promise
function generatePlaylist(){
  return Promise.resolve(getUserId(accessToken))
    .then(() => makeNewPlaylist(uId));
}

//takes in one of the constant [genre]Val strings defined above
//gets the recommended tracks based on the user set inputs, returns a promise
//mutates the variable "tracks"
function getTracks(genre){
  if(!uId) return;
  
  let genreString = 'seed_genres=' + genre;
  let paramString = getOSqueryString();
  return fetch('https://api.spotify.com/v1/recommendations' + '?' + genreString + '&' + paramString, {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  })
    .then(resp => resp.json())
    .then(parseRespObj)
    .then(recTracks => tracks = recTracks);
}

//returns a promise that resolves with undefined if successful
//used to populate the candidate pool ul element with the
//potential track names that will be randomly selected w/ replacement
//for the playlist to be generated
async function populateCandidatePool(){
  tracks = [];
  if(!uId) await getUserId(accessToken);
  await getTracks(getSelectedGenre());
  
  let ulElem = document.querySelector('.candidatePool ul');
  let currentLiElems = ulElem.querySelectorAll('li');
  for(const liElem of currentLiElems){
    ulElem.removeChild(liElem);
  }
  
  for(const track of tracks){
    let newLi = document.createElement('li');
    newLi.textContent = track['name'];
    
    ulElem.appendChild(newLi);
  }
}

//simplifies the recommended tracks response from the api
function parseRespObj(respObj){
  let tracksArr = respObj.tracks;
  tracksArr = tracksArr
    .filter(track => track.is_playable)
    .map(track => {
      let retObj = {};
      retObj['name'] = track['name'];
      retObj['time'] = track['duration_ms'];
      retObj['uri']  = track['uri'];

      return retObj;
    });
  
  return tracksArr;
}

//returns the amount of time in minutes as a Number
//represents how long (at least) the playlist/songs should play for
//set by the user on the timer layer
function getSleepTimerDuration(){
  return Number(document.querySelector('.sleepTimerDurationSetting input').value);
}

//returns a string that can be used as input to getTracks()
//the string represents the user's selected genre, the selectable values come from the constants defined above
function getSelectedGenre(){
  for(radio of document.querySelectorAll('.genre input[type="radio"]')){
    if(radio.checked) return radio.value;
  }
  
  return undefined; //probably won't happen... hopefuly
}

//returns a string representing the non-disabled input values set by the user and additional end param values
//string can be added to the queryString
function getOSqueryString(){
  let paramArray = [];
  let optionSettings = getOptionSettings();
  for(let prop in optionSettings){
    paramArray.push(`${optionSettingsPrefixes[prop]}${prop}=${optionSettings[prop]}`);
  }
  
  paramArray.push('market=from_token', 'limit=100');
  return paramArray.join('&');
}

//gets non-disabled input values set by the user
function getOptionSettings(){
  let inputElems = document.querySelectorAll('.inputOption:not(.off) input');
  let optionSettings = {};
  for(let input of inputElems){
      optionSettings[input.getAttribute('id')] = Number(input.value);
  }
  
  return optionSettings;
}

//will mutate/set uId in globalThis
function getUserId(accessToken){
  if(!accessToken){
    console.warn('No access token found. Aborting getUserId()');
    return;
  }
  
  return fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }})
    .then(response => response.json())
    .then(obj => {
      arr = obj.uri.split(':');
      uId = arr[arr.length - 1];})
    .catch(err => console.error(`An error occured. Message was: ${err.message}`));
}

//will mutate/set postResp in globalThis
function makeNewPlaylist(uId){
  if(!uId){
    console.warn('No user id found. Aborting makeNewPlaylist()');
    return;
  }
  
  return fetch(`https://api.spotify.com/v1/users/${uId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken
    },
    body: JSON.stringify({
      name: 'unSpottedSleep',
      public: false,
      description: 'Currently you\'ll probably want to delete this, or else it\'ll stack up.'
    })
  })
    .then(response => response.json())
    .then(obj => postResp = obj)
    .catch(err => console.error(`An error occured in making a new playlist. Message was: ${err.message}`));
}

//for setting up the numeric HUD
function setupDisplay(){
  var inputs = document.body.querySelectorAll('.inputOption');

  for(const input of inputs){
    let display = input.querySelector('.valDisplay');
    let inputElem = input.querySelector('input');
    let toggle = input.querySelector('.toggleBlock');

    display.textContent = Number(inputElem.value).toFixed(floatStep(inputElem));
    inputElem.addEventListener('input', () => display.textContent = Number(inputElem.value).toFixed(floatStep(inputElem)));

    toggle.addEventListener('click', () => {
      inputElem.disabled = !inputElem.disabled;
      input.classList.toggle('off');
    })
  }
  
  let sleepDurationSettingElem = document.querySelector('.sleepTimerDurationSetting');
  let display = sleepDurationSettingElem.querySelector('.valDisplay');
  let summaryDisplay = document.querySelector('.layer-summary .summaryTime');
  let inputElem = sleepDurationSettingElem.querySelector('input[type="range"]');
  inputElem.addEventListener('input', () => {
    display.textContent = Number(inputElem.value);
    summaryDisplay.innerHTML = inputElem.value + ' minutes';
  });
  display.textContent = Number(inputElem.value);
  summaryDisplay.innerHTML = inputElem.value + ' minutes';
}

//helper function for .toFixed in setupDisplay
function floatStep(input){
  let value = Number(input.getAttribute('step'));
  if(Math.floor(value) === value) return 0; //no decimal portion
  
  return 1; //has decimal portion keep 1 number after decimal
}
