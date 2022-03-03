
import { systemMessage } from "constants/MessageList";
const isRequired = (value) => {
    const tempError = [];
    if (value === undefined || value === null || value === '') {
        tempError.push(systemMessage.required);
    }
    return tempError;
};

export default function mapValidators(value, validators = [], ...reset) {
    
    let errorMessages = [];
    for (let i of validators) {
        
        if (i === 'isRequired') {
            const message = isRequired(value)
            errorMessages = errorMessages.concat(message);
            break;
        }

    }
    // console.log('mapValidators', errorMessages);
    return errorMessages;
}
