
type RoomInstance = {
    roomOwner: string;
    roomName: string;
    maxPlayers: number;
    rounds: number;
    isPrivate: boolean;
    category: string;
    genre: string;
    difficulty: number;
    inviteCode: string;
    roomUniqueId: string;
};

type RoomList = RoomInstance[];

export {
    RoomInstance,
    RoomList
};