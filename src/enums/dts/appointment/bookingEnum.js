export const PageStatus = {
    VIEW: 'VIEW',
    SEARCHING: 'SEARCHING',
    BOOKING: 'BOOKING',
    EDIT: 'EDIT',
    CONFIRMED: 'CONFIRMED'
};

export const BookingMessageLevelError = 'B';
export const BookingMessageLevelConfirm = 'C';
export const BookingMessageLevelInfo = 'I';

// export const BookingMessageTypeError = 'BLOCK';
// export const BookingMessageTypeConfirm = 'ASK_FOR_CONFIRM';
// export const BookingMessageTypeInfo = 'INFO';

export const BookingMessageLevel = [
    { code: BookingMessageLevelError, description: 'Error' },
    { code: BookingMessageLevelConfirm, description: 'Please confirm' },
    { code: BookingMessageLevelInfo, description: 'Information' }
];