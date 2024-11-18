import { Http } from '@mui/icons-material';

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

export function getLobbies(offset) {
  const httpParams = new URLSearchParams();
  httpParams.append('offset', offset);
  httpParams.append("count", true);

  return fetch(`${BASE_URL}/rooms/all?${httpParams.toString()}`)
    .then(response => response.json())
    .catch(error => console.log(error));
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
  return fetch(`${BASE_URL}/rooms/validateInviteCode`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inviteCode: inviteCode
    })
  })
    .then(response => response.json())
    .catch(error => console.log(error));
}