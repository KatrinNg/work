import Enum from '../../../enums/enum';

export const contactHistoryType = {
    TEL: { code: 'Tel', disp: 'Tel'},
    SMS: { code: Enum.CONTACT_MEAN_SMS, disp: 'SMS'},
    EMAIL: { code: Enum.CONTACT_MEAN_EMAIL, disp: 'Email'},
    MAIL: { code: 'Mail', disp: 'Mail'}
};