import palette from '../../palette';

export default {
    colorPrimary: {
        '&$checked': {
            color: palette.primary.main
            //backgroundColor:'#D1EEFC'
        }

    },
    switchBase: {
        color: palette.white
    },
    track: {
        opacity: 'unset',       //0.5
        backgroundColor: palette.text.secondary
        // '&$checked': {
        //     backgroundColor: '#D1EEFC'
        // }
    }
};