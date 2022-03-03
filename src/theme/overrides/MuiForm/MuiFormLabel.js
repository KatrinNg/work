import palette from '../../palette';

export default {
    root: {
        color:palette.cimsLabelColor,
        '&$focus': {
            color: palette.text.secondary
        },
        '&$disabled':{
            color:palette.cimsPlaceholderColor
        }
    }
};