import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
    tableContainer: {
        width: '100%',
        overflow: 'auto',
        maxHeight: 257
    },
    tableViewContainer: {
        maxHeight: 577
    },
    tableDivider: {
        marginTop: -16,
        marginLeft: -8,
        marginBottom: 4,
        backgroundColor: 'rgba(224, 224, 224, 1)'
    },
    tableHeadRow: {
        height: 32,
        paddingLeft: '10px',
        fontStyle: 'normal',
        fontSize: font.fontSize,
        fontWeight: 'bold'
    },
    tableHeadCell: {
        fontSize: font.fontSize,
        fontWeight: 600,
        fontFamily: font.fontFamily,
        color: COMMON_STYLE.whiteTitle,
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
    tableContentrow: {
        height: 68,
        cursor: 'pointer',
        display: 'table-row',
        backgroundColor: color.cimsBackgroundColor
    },
    tableContentRowSelected: {
        backgroundColor: 'cornflowerblue'
    },
    tableContentCell: {
        fontSize: font.fontSize,
        padding: '0 10px',
        whiteSpace: 'pre-line',
        wordWrap: 'break-word',
        wordBreak: 'break-all',
        border: '1px solid rgba(224, 224, 224, 1)',
        '&:last-child': {
            padding: '0 10px'
        }
    },
    displayLabel: {
        '-webkit-line-clamp': 1,
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
        display: '-webkit-inline-box',
        color: color.cimsTextColor
    },
    tooltip: {
        backgroundColor: COMMON_STYLE.labelColor,
        fontSize: '14px',
        fontFamily: font.fontFamily,
        maxWidth: 800,
        wordBreak: 'break-word'
    },
    tableCellRow: {
        textAlign: 'center',
        backgroundColor: color.cimsBackgroundColor
    }
});