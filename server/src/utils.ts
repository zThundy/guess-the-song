
export function hasProperty(o: object, k: string) {
    console.log(`Checking if object has property: ${k} in`, o);
    if (typeof o !== 'object' || o === null) {
        console.error('Provided value is not a valid object:', o);
        return false;
    }
    return Object.keys(o).includes(k);
};

export const makeRandomString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}