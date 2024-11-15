
type Room = {
    roomOwner: string;
    inviteCode: string;
    roomName: string;
    maxPlayers: number;
    rounds: number;
    isPrivate: boolean;
    category: string;
    genre: string;
    difficulty: number;
    hasProperty: (key: string) => boolean;
};

type RoomList = Room[];

export {
    Room,
    RoomList
};