
import palette from '../../palette';

export default {
    root: {
        // margin: -4
    },
    colorPrimary: {
        '&$checked': {
            color: palette.primary.main
        },
        '&$disabled': {
            color: palette.grey.default
        }
    },
    colorSecondary: {
        '&$disabled': {
            color: palette.grey.default
        }
    }
};