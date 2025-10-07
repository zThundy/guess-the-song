const BASE_URL = 'https://localhost:8443';
import { getCookie } from 'helpers/cookies';

// Generic GET and POST helpers. All other functions should use these two.
async function apiGet(path, params = {}) {
  try {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${BASE_URL}${normalizedPath}`);

    // If params provided, append as query string
    if (params && Object.keys(params).length) {
      Object.keys(params).forEach(key => {
        // skip undefined
        if (params[key] !== undefined && params[key] !== null) url.searchParams.append(key, params[key]);
      });
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) return await res.json();

    // try to parse JSON error body, fall back to text
    let errBody = null;
    try {
      errBody = await res.json();
    } catch (parseErr) {
      try {
        errBody = await res.text();
      } catch (textErr) {
        errBody = null;
      }
    }

    throw { status: res.status, statusText: res.statusText, body: errBody };
  } catch (err) {
    throw _handleError(err);
  }
}

async function apiPost(path, body = {}) {
  try {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const res = await fetch(`${BASE_URL}${normalizedPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (res.ok) return await res.json();

    // try to parse JSON error body, fall back to text
    let errBody = null;
    try {
      errBody = await res.json();
    } catch (parseErr) {
      try {
        errBody = await res.text();
      } catch (textErr) {
        errBody = null;
      }
    }

    throw { status: res.status, statusText: res.statusText, body: errBody };
  } catch (err) {
    throw _handleError(err);
  }
}

function getBase() {
  // small helper to hit base url (keeps original behaviour of logging response)
  apiGet('/')
    .then(data => console.log(data))
    .catch(err => console.log(err));
}

function userAction() {
  return apiPost('/account/validate', {
    username: getCookie('username') || '',
    uniqueId: getCookie('uniqueId') || ''
  });
}

function updateUsername() {
  return apiPost('/account/username', {
    username: getCookie('username') || '',
    uniqueId: getCookie('uniqueId') || ''
  });
}

function updateUserImage() {
  return apiPost('/account/image', {
    userImage: getCookie('userImage') || '',
    uniqueId: getCookie('uniqueId') || ''
  });
}

function getLobbies(offset) {
  return apiGet('/rooms/all', { offset, count: true });
}

function createRoom(data) {
  return apiPost('/rooms/validate', {
    roomUniqueId: '',
    roomName: data.roomName,
    roomOwner: getCookie('uniqueId'),
    category: data.category.name,
    maxPlayers: data.maxPlayers,
    genre: data.genre.name,
    difficulty: data.difficulty,
    players: data.players,
    rounds: data.rounds,
    isPrivate: data.isPrivate
  });
}

function validateInviteCode(inviteCode) {
  return apiPost('/rooms/validateInviteCode', {
    inviteCode,
    uniqueId: getCookie('uniqueId') || ''
  });
}

function getRoomUsers(roomUniqueId) {
  return apiGet(`/rooms/users/${roomUniqueId}`);
}

function leaveRoom(roomUniqueId) {
  return apiPost('/rooms/leave', {
    roomUniqueId,
    uniqueId: getCookie('uniqueId') || ''
  });
}

function startGame(roomUniqueId) {
  return apiPost(`/rooms/start/${roomUniqueId}`, {
    roomUniqueId,
    uniqueId: getCookie('uniqueId') || ''
  });
}

function getGenres() {
  return apiGet('/create/genres');
}

function getCategories() {
  return apiGet('/create/categories');
}

function _handleError(error) {
  // Normalize different error shapes into a consistent object with a `key`.
  if (!error) return { key: 'GENERIC_ERROR' };

  // Native Error (network failures, DNS, CORS, etc.)
  if (error instanceof Error) return { key: 'NETWORK_ERROR', message: error.message };

  // If server returned a wrapped object that already contains a key, pass it through
  if (error.key) return error;

  // If we have an HTTP-style object with status and optional body
  if (error.status) {
    const status = error.status;
    const body = error.body;

    // If server provided structured error in body with key, trust it
    if (body && typeof body === 'object') {
      if (body.key) return body;
      if (body.message) return { key: 'SERVER_ERROR', message: body.message, status };
      // return body content as additional info
      return { key: 'SERVER_ERROR', status, body };
    }

    // body may be a plain string
    if (typeof body === 'string') return { key: 'SERVER_ERROR', status, message: body };

    // Map common HTTP statuses to keys
    switch (status) {
      case 400: return { key: 'BAD_REQUEST', status };
      case 401: return { key: 'UNAUTHORIZED', status };
      case 403: return { key: 'FORBIDDEN', status };
      case 404: return { key: 'NOT_FOUND', status };
      case 422: return { key: 'VALIDATION_ERROR', status };
      case 500: return { key: 'SERVER_ERROR', status };
      default: return { key: 'HTTP_ERROR', status, statusText: error.statusText || null };
    }
  }

  // Fallback: if error looks like a plain object with message
  if (typeof error === 'object') {
    if (error.message) return { key: 'ERROR', message: error.message };
    return { key: 'GENERIC_ERROR', details: error };
  }

  // Any other fallback
  return { key: 'GENERIC_ERROR' };
}

export default {
  // low-level
  apiGet,
  apiPost,
  // high-level wrappers (kept for backward compatibility)
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