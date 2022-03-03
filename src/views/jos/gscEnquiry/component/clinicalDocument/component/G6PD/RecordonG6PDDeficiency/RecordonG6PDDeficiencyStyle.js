import {getState} from '../../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};
import { COMMON_STYLE }from './../../../../../../../../constants/commonStyleConstant';


let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

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
    root: {
        display: 'flex' ,
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box'
    },
    flexStart: {
        display: 'flex' ,
        alignItems: 'start',
        padding: '20px',
        boxSizing: 'border-box'
    },
    labelPad:{
        paddingRight: '10px'
    },
    paraHeight: {
        height: '30px'
    },
    selectHeight: {
        height: '30px',
        width: '200px',
        lineHeight: '30px'
    },
    inputHeight: {
        height: '30px',
        paddingRight: '10px'
    },
    flexCenRight: {
        display: 'flex',
        alignItems: 'center',
        paddingRight: '10px'
    },
    flexCenter: {
        display: 'flex',
        alignItems: 'center'
    },
    actionPadd: {
        padding: '4px 0'
    },
    otherWiAndHe: {
        width: '400px',
        height: '300px'
    },

    inputField: {
        width: '100%'
    },
    multilineInput: {
        backgroundColor: color.cimsBackgroundColor,
        padding: '2px 10px',
        borderRadius: 4,
        minHeight: 36
    },
    inputProps: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        color: color.cimsTextColor,
        borderRadius: 4
    },
    disabledLabel: {
        color: `${COMMON_STYLE.disabledColor} !important`
    },
    normalFont: {
        ...standardFont,
        color: color.cimsTextColor,
        '&.Mui-disabled': {
            color: color.cimsLabelColor
        }
    }
};