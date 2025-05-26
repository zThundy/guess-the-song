const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/db.sqlite');

// create a random script that will insert 1000 rows in the database
// INSERT INTO rooms(
//     id,
//     roomUniqueId,
//     roomOwner,
//     inviteCode,
//     roomName,
//     maxPlayers,
//     rounds,
//     isPrivate,
//     category,
//     genre,
//     difficulty,
//     created_at,
//     started
// ) VALUES (
//     1,
//     'room-1',
//     'user-1',
//     'invite-code-1',
//     'Room 1',
//     4,
//     3,
//     0,
//     'category-1',
//     'genre-1',
//     2,
//     datetime('now'),
//     0
// );

for (let i = 2; i <= 100; i++) {
    db.run(`INSERT INTO rooms(
        id,
        roomUniqueId,
        roomOwner,
        inviteCode,
        roomName,
        maxPlayers,
        rounds,
        isPrivate,
        category,
        genre,
        difficulty,
        created_at,
        started
    ) VALUES (
        ${i},
        'room-${i}',
        'user-${i}',
        ${Math.random().toString().substring(2, 7)},
        'Room ${i}',
        ${Math.floor(Math.random() * 10) + 1},
        ${Math.floor(Math.random() * 10) + 1},
        ${Math.floor(Math.random() * 2)},
        'category-${Math.floor(Math.random() * 10) + 1}',
        'genre-${Math.floor(Math.random() * 10) + 1}',
        ${Math.floor(Math.random() * 5) + 1},
        datetime('now'),
        ${Math.floor(Math.random() * 2)}
    )`);
}