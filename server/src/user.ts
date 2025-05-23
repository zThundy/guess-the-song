
import {
    UserInstance,
    UpdateUser
} from '../types/user_types';

import db from './sql';

export default class User {
    public uniqueId: string = '';
    public username: string = '';
    public userImage: string = '';
    public created: string = '';
    public last_login: string = '';
    public points: number = 0;
    public level: number = 0;
    public currentRoom: string = '';

    private lastSave: Date = new Date();
    // maybe circular on currentRoom????

    constructor(uniqueId: string|undefined|null, username: string|undefined|null, userImage: string|undefined|null) {
        this.username = username || '';
        this.uniqueId = uniqueId || '';
        this.userImage = userImage || '';

        this.lastSave = new Date();
        // save user to db every 5 minutes using lastSave
        setInterval(() => {
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate.getTime() - this.lastSave.getTime());
            const diffMinutes = Math.ceil(diffTime / (1000 * 60));
            if (diffMinutes >= 5) {
                this.save();
            }
        }, 5 * 60 * 1000); // 5 minutes

        console.log('User added as class.');
    }

    save() {
        console.log(`Saving user ${this.username}, ${this.uniqueId}`);
        db.updateUser(this.get());
        db.updateUserData(this.get());
        db.updateLastLogin(this.get());

        this.lastSave = new Date();
        return this;
    }

    update(data: UpdateUser) {
        try {
            if (data.column in this) {
                console.log(`Updating ${data.column} to ${data.value}`);
                (this as any)[data.column] = data.value;
            } else {
                console.error(`Invalid column: ${data.column}`);
            }
            return this;
        } catch (e) {
            console.error('Error updating user:', e);
        }
    }

    get() {
        return this;
    }

    getColumn(column: string) {
        if (column in this) {
            return (this as any)[column];
        } else {
            console.error(`Invalid column: ${column}`);
        }
    }

    delete(data: any) {
        console.log('User deleted.');
    }

    /**
     * Function to check if user exists in the database,
     * if it does, then update the user's data, else create a new user.
     * @param data UserInstance
     */
    async validateUser() {
        console.log(`Validating user ${this.username}, ${this.uniqueId}`);

        if (await db.doesUserExist(this.uniqueId)) {
            let dbUser = await db.getUser(this.uniqueId);
            let dbUserData = await db.getUserData(this.uniqueId);
            dbUser = dbUser[0];
            dbUserData = dbUserData[0];

            if (dbUser.username !== this.username) {
                this.update({ column: 'username', value: dbUser.username });
            }

            if (dbUser.userImage !== this.userImage) {
                this.update({ column: 'userImage', value: dbUser.userImage });
            }

            if (dbUserData.points !== this.points) {
                this.update({ column: 'points', value: dbUserData.points });
            }

            if (dbUserData.level !== this.level) {
                this.update({ column: 'level', value: dbUserData.level });
            }

            if (dbUser.created !== this.created) {
                this.update({ column: 'created', value: dbUser.created_at });
            }

            if (dbUser.last_login !== this.last_login) {
                this.update({ column: 'last_login', value: dbUser.last_login });
            }

            console.log('User validated.');
        } else {
            if (this.username.length === 0) {
                this.update({ column: 'username', value: 'User-' + Math.random().toString(36).substring(2, 8) });
            }

            if (this.userImage.length === 0) {
                this.update({ column: 'userImage', value: '' });
            } else {
                const regExp = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
                if (this.userImage.length > 0 && !regExp.test(this.userImage)) {
                    this.update({ column: 'userImage', value: '' });
                }
            }

            if (this.uniqueId.length === 0) {
                this.update({ column: 'uniqueId', value: Math.random().toString(36).substring(2, 180) });
            }
            
            this.created = new Date().toISOString().slice(0, 19).replace('T', ' ');
            this.last_login = new Date().toISOString().slice(0, 19).replace('T', ' ');

            db.createUser(this.get());
            console.log('User created in databse.');
        }
    }
}
