import { COMMON_STYLE } from '../../../../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
    tableHeadRow: {
        paddingLeft: '10px',
        fontStyle: 'normal',
        fontSize: font.fontSize,
        fontWeight: 'bold'
    },
    tableHeadCell: {
        fontSize: font.fontSize,
        fontWeight: 600,
        fontFamily: font.fontFamily,
        color: COMMON_STYLE.WHITE_TITLE,
        paddingLeft: 8,
        border: '1px solid rgba(224, 224, 224, 1)',
        borderTop: 0,
        backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        '&:last-child': {
            paddingLeft: 8,
            paddingRight: 8
        }
    },
    tableContentCell: {
        color: color.cimsTextColor,
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        padding: '0 10px',
        width: 5,
        whiteSpace: 'pre-line',
        wordWrap: 'break-word',
        wordBreak: 'break-all',
        border: '1px solid rgba(224, 224, 224, 1)',
        '&:last-child': {
            padding: '0 10px'
        }
    },
    textCenter: {
        color: color.cimsTextColor,
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        textAlign : 'center',
        border: '1px solid rgba(224, 224, 224, 1)'
    },
    textCenterWidth: {
        border: '1px solid rgba(224, 224, 224, 1)',
        textAlign : 'center',
        width: '5%'
    }
};