import palette from '../../palette';

export default {
    root: {
        padding: 5,
        borderRadius: '5px 5px 0 0',
        color: palette.primaryColor,
        '&:hover': {
            backgroundColor: palette.primaryColor,
            color: palette.white
        }
    },
    textColorInherit: {
        color: palette.primaryColor
    }
};