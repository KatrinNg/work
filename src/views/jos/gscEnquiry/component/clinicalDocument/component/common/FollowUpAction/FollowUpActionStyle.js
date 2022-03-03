import { getState } from '../../../../../../../../store/util';
import { COMMON_STYLE } from '../../../../../../../../constants/commonStyleConstant';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
    contentTop: {
        padding: '10px 20px',
        overflow: 'hidden'
    },
    topText: {
        fontSize: 20
    },
    topInput: {
        height: 30
    },
    btnLeftRoot: {
        backgroundColor: color.cimsBackgroundColor,
        minWidth: 90
    },
    centerBox: {
        height: 265,
        overflow: 'hidden',
        overflowY: 'auto',
        marginTop: 20
    },
    centerBoxList: {
        borderBottom: '1px solid #ccc',
        padding: '8px!important',
        backgroundColor: '#fff',
        '&:hover': {
            cursor: 'pointer'
        }
    },
    tableBox: {
        marginTop: 20,
        overflow: 'auto'
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
    tableContentCell: {
        fontSize: font.fontSize,
        padding: '0 10px',
        width: 5,
        whiteSpace: 'pre-line',
        wordWrap: 'break-word',
        wordBreak: 'break-all',
        border: '1px solid rgba(224, 224, 224, 1)',
        '&:last-child': {
            padding: '5px 10px'
        }
    },
    tableCellRow: {
        textAlign: 'center',
        backgroundColor: color.cimsBackgroundColor
    },
    tableContentRowSelected: {
        backgroundColor: COMMON_STYLE.TABLE_SELECT_ROW_BACKGROUNDCOLOR
    },
    // selectRow:{
    //     backgroundColor:'#EEF5FB'
    // },
    displayLabel: {
        // '-webkit-line-clamp': 1,
        // '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
        display: '-webkit-inline-box',
        color: color.cimsTextColor
    },
    tooltip: {
        backgroundColor: COMMON_STYLE.disabledColor,
        fontSize: '14px',
        fontFamily: font.fontFamily,
        // maxWidth: 1000
        whiteSpace: 'pre-line',
        wordWrap: 'break-word',
        wordBreak: 'break-all'
    },
    inputField: {
        width: '100%'
    },
    multilineInput: {
        backgroundColor: color.cimsBackgroundColor,
        padding: '5px 10px',
        borderRadius: 4,
        minHeight: 36
    },
    inputProps: {
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        color: color.cimsTextColor,
        borderRadius: 4
    }
};