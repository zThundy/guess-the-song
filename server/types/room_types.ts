
type RoomInstance = {
    roomOwner: string;
    inviteCode: string;
    roomName: string;
    maxPlayers: number;
    rounds: number;
    isPrivate: boolean;
    category: string;
    genre: string;
    difficulty: number;
};

type RoomList = RoomInstance[];

export {
    RoomInstance,
    RoomList
};