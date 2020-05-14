setupDisplay();

const implicitGrantResp = location.hash.substring(1).split('&');
const accessToken = implicitGrantResp.find(str => str.indexOf('access_token') === 0).split('=')[1];

const minPrefix = 'min_';
const maxPrefix = 'max_';
const tgtPrefix = 'target_';

const classicalVal = 'classical';
const newAgeVal    = 'new-age';
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

let uId;
let postResp;
let tracks;

//makes a playlist, returns a Promise
function generatePlaylist(){
  return Promise.resolve(getUserId(accessToken))
    .then(() => makeNewPlaylist(uId));
}

//gets the recommended tracks based on the user set inputs, returns a promise
//mutates the variable "tracks"
function getTracks(){
  if(!uId) return;
  
  return fetch('https://api.spotify.com/v1/recommendations' + '?' + getOSqueryString() + '&market=US&limit=100', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  })
    .then(resp => resp.json())
    .then(parseRespObj)
    .then(recTracks => tracks = recTracks);
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

//returns a string representing the non-disabled input values set by the user
//string can be added to the queryString
function getOSqueryString(){
  let paramArray = [];
  let optionSettings = getOptionSettings();
  for(let prop in optionSettings){
    paramArray.push(`${optionSettingsPrefixes[prop]}${prop}=${optionSettings[prop]}`);
  }
  
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
}

//helper function for .toFixed in setupDisplay
function floatStep(input){
  let value = Number(input.getAttribute('step'));
  if(Math.floor(value) === value) return 0; //no decimal portion
  
  return 1; //has decimal portion keep 1 number after decimal
}
