import {getState} from '../../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
    root: {
        display: 'flex' ,
        alignItems: 'center'
    },
    labelPad:{
        paddingRight: 10
    },
    Other:{
        width:'40%'
    },
    disabledColor:{
        backgroundColor: '#e0e0e0'
    },
    multilineInput: {
        minHeight:39,
        backgroundColor: color.cimsBackgroundColor,
        padding: '5px 10px',
        borderRadius: 4
    },
    inputProps:{
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        color: color.cimsTextColor,
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
    },
    spanTitle:{
        paddingLeft: 15,
        color: 'red',
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        fontWeight: 'bold'
    }
};