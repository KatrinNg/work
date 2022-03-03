import {getState} from '../../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
    wrapper: {
        backgroundColor: color.cimsBackgroundColor,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 8,
        marginRight: 8
    },
    flexCenter: {
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center',
        width: '95%'
    },
    content: {
        display:'flex',
        height: 24,
        padding: 10,
        alignItems: 'center'
    },
    title:{
        padding: 10
    },
    titleLabel:{
        fontSize: 30,
        color: color.cimsTextColor,
        fontWeight: 600
    },
    inputProps: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        backgroundColor: color.cimsBackgroundColor,
        borderRadius: 4
    },
    normalFont: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        color: color.cimsTextColor,
        '&.Mui-disabled': {
            color: color.cimsLabelColor
        }
    },
    disabledLabel: {
        color: `${color.cimsLabelColor} !important`
    }
};