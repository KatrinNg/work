
import { getState } from '../../../../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};
let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles=()=>({
    tips: {
        fontSize: '15px',
        fontFamily: font.fontFamily
    },
    label: {
        ...standardFont,
        color: color.cimsTextColor,
        padding: '0 8px'
    },
    textField:{
        display:'flex',
        alignItems: 'center'
    },
    helperTextError: {
        marginTop: 0,
        fontSize: '14px !important',
        // fontFamily: font.fontFamily,
        padding: '0 !important'
    },
    background: {
        backgroundColor: 'cornflowerblue'
    },
    faulTolerantHeight: {
        marginBottom: -23
    }
});