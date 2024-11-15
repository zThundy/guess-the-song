
type RegisterBody = {
    username: string;
    uniqueId: string;
    userImage: string;
    created: string|undefined;
    last_login: string|undefined;
    hasProperty: (key: string) => boolean;
};

type TableTransactions = [string, string];

type AlterTableTransaction = {
    table: string;
    column: string;
    type: string;
    default: string;
}

type AlterTableTransactions = AlterTableTransaction[];

type DeleteUsers = [string, string];

export {
    RegisterBody,
    TableTransactions,
    AlterTableTransactions,
    AlterTableTransaction,
    DeleteUsers
};