export const KEYS = {
    ACCESS_TOKEN: 'ACCESS_TOKEN',
    REFRESH_TOKEN: 'REFRESH_TOKEN',
};

export const getItem = (key, defaultValue) => {
    try {
        const temp = JSON.parse(localStorage.getItem(key)) || defaultValue;
        return temp;
    } catch (error) {
        console.log('index.js get localStorage item fail, returning the default value');
    }
};

export const setItem = (key, value) => {
    try {
        const temp = JSON.stringify(value);
        localStorage.setItem(key, temp);
        return true;
    } catch (error) {
        console.log('index.js setting localStorage item failed');
        return false;
    }
};
