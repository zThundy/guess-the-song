const BASE_URL = 'https://localhost:8443';
import { getCookie } from 'helpers/cookies';

function getBase() {
  fetch(`${BASE_URL}`)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));
}

function userAction() {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetch(`${BASE_URL}/account/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: getCookie("username") || "",
          uniqueId: getCookie("uniqueId") || "",
        })
      })

      if (result.ok) return resolve(await result.json());
      return reject(_handleError(await result.json()));
    } catch (error) {
      reject({ key: "GENERIC_ERROR" });
      console.log(error.message);
    }
  })
}

function updateUsername() {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetch(`${BASE_URL}/account/username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: getCookie("username") || "",
          uniqueId: getCookie("uniqueId") || "",
        })
      });

      if (result.ok) return resolve(await result.json());
      return reject(_handleError(await result.json()));
    } catch (error) {
      reject({ key: "GENERIC_ERROR" });
      console.log(error.message);
    }
  });
}

function updateUserImage() {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetch(`${BASE_URL}/account/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userImage: getCookie("userImage") || "",
          uniqueId: getCookie("uniqueId") || "",
        })
      });

      if (result.ok) return resolve(await result.json());
      return reject(_handleError(await result.json()));
    } catch (error) {
      reject({ key: "GENERIC_ERROR" });
      console.log(error);
    }
  });
}

function getLobbies(offset) {
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

function createRoom(data) {
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

function validateInviteCode(inviteCode) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetch(`${BASE_URL}/rooms/validateInviteCode`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inviteCode: inviteCode,
          uniqueId: getCookie("uniqueId") || "",
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

function getRoomUsers(roomUniqueId) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetch(`${BASE_URL}/rooms/users/${roomUniqueId}`)
      if (result.ok) return resolve(await result.json());
      return reject(_handleError(await result.json()));
    } catch (error) {
      reject({ key: "GENERIC_ERROR" });
      console.log(error);
    }
  });
}

function leaveRoom(roomUniqueId) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetch(`${BASE_URL}/rooms/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomUniqueId: roomUniqueId,
          uniqueId: getCookie("uniqueId") || "",
        })
      })

      if (result.ok) return resolve(await result.json());
      return reject(_handleError(await result.json()));
    } catch (error) {
      reject({ key: "GENERIC_ERROR" });
      console.log(error);
    }
  })
}

function startGame(roomUniqueId) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetch(`${BASE_URL}/rooms/start/${roomUniqueId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomUniqueId: roomUniqueId,
          uniqueId: getCookie("uniqueId") || "",
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

function getGenres() {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetch(`${BASE_URL}/create/genres`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })

      if (result.ok) return resolve(await result.json());
      return reject(_handleError(await result.json()));
    } catch (error) {
      reject({ key: "GENERIC_ERROR" });
      console.log(error);
    }
  });
}

function getCategories() {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetch(`${BASE_URL}/create/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })

      if (result.ok) return resolve(await result.json());
      return reject(_handleError(await result.json()));
    } catch (error) {
      reject({ key: "GENERIC_ERROR" });
      console.log(error);
    }
  });
}

function _handleError(error) {
  if (error.key) return error;
  return { key: "GENERIC_ERROR" };
}

export default {
  getBase,
  userAction,
  updateUsername,
  updateUserImage,
  getLobbies,
  createRoom,
  validateInviteCode,
  getRoomUsers,
  leaveRoom,
  startGame,
  getGenres,
  getCategories
}