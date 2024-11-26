const BASE_URL = 'https://localhost:8443';
const { getCookie } = require('@helpers/cookies');

export function getBase() {
  fetch(`${BASE_URL}`)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));
}

export function userAction() {
  return fetch(`${BASE_URL}/account/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: getCookie("username") || "",
      uniqueId: getCookie("uniqueId") || "",
    })
  })
    .then(response => response.json())
    .catch(error => console.log(error));
}

export function updateUsername() {
  return fetch(`${BASE_URL}/account/username`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: getCookie("username") || "",
      uniqueId: getCookie("uniqueId") || "",
    })
  })
    .then(response => response.json())
    .catch(error => console.log(error));
}

export function updateUserImage() {
  return fetch(`${BASE_URL}/account/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userImage: getCookie("userImage") || "",
      uniqueId: getCookie("uniqueId") || "",
    })
  })
    .then(response => response.json())
    .catch(error => console.log(error));
}

export function getLobbies(offset) {
  return new Promise(async (resolve, reject) => {
    try {
      const httpParams = new URLSearchParams();
      httpParams.append('offset', offset);
      httpParams.append("count", true);
      const result = await fetch(`${BASE_URL}/rooms/all?${httpParams.toString()}`)

      if (result.ok) return resolve(await result.json());
      return reject(_handleError(await result.json()));
    } catch (error) {
      reject({ key: "GENERIC_ERROR" });
      console.log(error);
    }
  });
}

export function createRoom(data) {
  return fetch(`${BASE_URL}/rooms/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roomUniqueId: "",
      roomName: data.roomName,
      roomOwner: getCookie("uniqueId"),
      category: data.category.name,
      maxPlayers: data.maxPlayers,
      genre: data.genre.name,
      difficulty: data.difficulty,
      players: data.players,
      rounds: data.rounds,
      isPrivate: data.isPrivate,
    })
  })
    .then(response => response.json())
    .catch(error => console.log(error));
}

export function validateInviteCode(inviteCode) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetch(`${BASE_URL}/rooms/validateInviteCode`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inviteCode: inviteCode
        })
      })

      if (result.ok) return resolve(await result.json());
      return reject(_handleError(await result.json()));
    } catch (error) {
      reject({ key: "GENERIC_ERROR" });
      console.log(error);
    }
  });
}

export function getLanguage(lang) {
  return fetch(`${BASE_URL}/language/${lang}`)
    .then(response => response.json())
    .catch(error => {
      console.log(error);
      if (error.status === 404) return error.json();
      if (error.status === 400) return error.json();
      return { key: "GENERIC_ERROR" };
    });
}

function _handleError(error) {
  if (error.key) return error;
  return { key: "GENERIC_ERROR" };
}