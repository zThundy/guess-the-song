
type RegisterBody = {
    username: string;
    uniqueId: string;
    userImage: string;
    hasProperty: (key: string) => boolean;
};

export {
    RegisterBody
};