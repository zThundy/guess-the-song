const BASE_URL = 'https://localhost:8443';
const { getCookie } = require('@helpers/cookies');

const listeners = [];

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

export function getRoomUsers(roomUniqueId) {
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

export function leaveRoom(roomUniqueId) {
  return fetch(`${BASE_URL}/rooms/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roomUniqueId: roomUniqueId,
      uniqueId: getCookie("uniqueId") || "",
    })
  })
    .then(response => response.json())
    .catch(error => console.log(error));
}

export function registerRoomsEventListeners(cb) {
  return fetch(`${BASE_URL}/events/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Connection": "keep-alive",
    },
    body: JSON.stringify({
      event: "rooms",
      uniqueId: getCookie("uniqueId") || "",
    })
  })
    .then(response => {
      // Get the readable stream from the response body
      const stream = response.body;
      // Get the reader from the stream
      const reader = stream.getReader();
      // Define a function to read each chunk
      const readChunk = () => {
        // Read a chunk from the reader
        reader.read()
          .then(({ value, done }) => {
            // Check if the stream is done
            if (done) {
              // Log a message
              console.log('Stream finished');
              // Return from the function
              return;
            }
            // Convert the chunk value to a string
            const chunkString = new TextDecoder().decode(value);
            // Log the chunk string
            console.log(chunkString);
            // Read the next chunk
            readChunk();
          })
          .catch(error => {
            // Log the error
            console.error(error);
          });
      };
      // Start reading the first chunk
      readChunk();
    })
    .catch(error => {
      // Log the error
      console.error(error);
    });
}

export function unregisterRoomsEventListeners() {
  return fetch(`${BASE_URL}/events/unsubscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event: "rooms",
      uniqueId: getCookie("uniqueId") || "",
    })
  })
    .then(response => response.json())
    .catch(error => console.log(error));
}

function _handleError(error) {
  if (error.key) return error;
  return { key: "GENERIC_ERROR" };
}