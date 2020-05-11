const implicitGrantResp = location.hash.substring(1).split('&');
const accessToken = implicitGrantResp.find(str => str.indexOf('access_token') === 0).split('=')[1];

let uId;
let postResp;

(new Promise.resolve(getUserId(accessToken)))
  .then(() => makeNewPlaylist(uId))
  .finally(() => console.log('Completed.'));

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
      name: 'unSpottedSleep Playlist',
      public: false,
      description: 'Currently you\'ll probably want to delete this, or else it\'ll stack up.'
    })
  })
    .then(response => response.json())
    .then(obj => postResp = obj)
    .catch(err => console.error(`An error occured in making a new playlist. Message was: ${err.message}`));
}
