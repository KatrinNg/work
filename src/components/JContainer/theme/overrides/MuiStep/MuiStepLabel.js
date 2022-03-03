import palette from '../../palette';

export default {
    label: {
        color: palette.grey.default,
        fontSize: '1rem',       //16px
        '&$active': {
            color: palette.primary.main
        }
    }
};