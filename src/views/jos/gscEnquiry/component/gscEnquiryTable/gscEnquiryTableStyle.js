import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import { getState } from '../../../../../../src/store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
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
    tabHeadSelect: {
        marginTop: 5
    },
    tableCellRow: {
        textAlign: 'center',
        padding:6,
        backgroundColor: color.cimsBackgroundColor
    },
    tableContentRow: {
        cursor: 'pointer',
        display: 'table-row',
        backgroundColor: color.cimsBackgroundColor
    },
    tableContentRowSelected: {
        backgroundColor: COMMON_STYLE.TABLE_SELECT_ROW_BACKGROUNDCOLOR
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
    iconTableCell:{
        textAlign: 'center'
    },
    tooltip: {
        backgroundColor: COMMON_STYLE.disabledColor,
        fontSize: '14px',
        maxWidth: 800,
        fontFamily: font.fontFamily,
        whiteSpace: 'pre-line',
        wordWrap: 'break-word',
        wordBreak: 'break-all'
    },
    sortLabel: {
        color: '#fff !important',
        width: '100%'
    },
    sortActiveLabel: {
        color: '#fff !important',
        width: '100%'
    },
    displayLabel: {
        '-webkit-line-clamp': 1,
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
        display: '-webkit-inline-box'
    },
    sortLabelIcon: {
        color: '#7F8C8D !important',
        width: '16px',
        height: '16px'
    }
});