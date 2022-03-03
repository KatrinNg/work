import _, { cloneDeep, isEmpty } from 'lodash';
import moment from 'moment';
export const produce = (base, processFunction) => {
    if (typeof base === 'function') {
        return (prevState) => {
            return updateState(base)(prevState);
        };
    } else {
        return updateValue(base, processFunction);
    }
};
export const updateValue = (base, processFunction) => {
    let newBase = _.cloneDeep(base);
    processFunction(newBase);
    return newBase;
};

export const updateState = (processFunction) => (prevState) => {
    let newBase = _.cloneDeep(prevState);
    processFunction(newBase);
    return newBase;
};

export const generateRandomId = (length = 20) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

export const isString = (value) => {
    return typeof value === 'string' && value.constructor === String
}

export const getTimeWithTimeZone = (dateString) => {
    // adding 28800 second to the utc timestamp, and force frontend to display in utc timezone.
    const currentTimestamp = new Date(dateString).getTime() + 28800 * 1000;
    return moment(currentTimestamp).utc();
};

export const getSearchParams = (search,params) => {
    if (!search || !params) return ''
    const paramsMap = {};
    let temp = search?.substr(1, search.length - 1)?.split('&') || [];
    temp.forEach(element => {
        const t = element.split('=');
        paramsMap[t[0]] = t[1];
    });
    return paramsMap[params] || ''
}