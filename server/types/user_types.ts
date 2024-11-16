
type UserInstance = {
    username: string;
    uniqueId: string;
    userImage: string;
    created: string;
    last_login: string;
    points: number;
    level: number;
    currentRoom: string;
};

type UpdateUser = {
    value: string;
    column: string;
}

export {
    UserInstance,
    UpdateUser
};