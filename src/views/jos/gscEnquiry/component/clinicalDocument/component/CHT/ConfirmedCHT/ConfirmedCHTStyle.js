import {getState} from '../../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
    wrapper: {
        width: '100%',
        borderRadius: 4
    },
    inputField: {
        width: '100%'
    },
    multilineInput: {
        backgroundColor: color.cimsBackgroundColor,
        padding: '2px 10px',
        // borderRadius: 4,
        minHeight: 36
    },
    inputProps: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        color: color.cimsTextColor,
        borderRadius: 4
    },
    formControlLabel: {
        marginRight: 5,
        marginLeft: 0
    },
    checkBoxStyle: {
        color: color.cimsLabelColor
    },
    normalFont: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        color: color.cimsTextColor
    },
    disabledLabel: {
        color: `${color.cimsLabelColor} !important`
    }
};