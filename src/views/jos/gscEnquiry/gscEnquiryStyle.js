import { COMMON_STYLE } from '../../../constants/commonStyleConstant';
import { getState } from '../../../../src/store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
    root:{
        height:'100%',
        overflow:'hidden',
        backgroundColor: color.cimsBackgroundColor
    },
    cardContainer: {
        flex: 'auto',
        boxSizing: 'border-box',
        height: 'calc(100% - 44px)',
        paddingBottom: '44px !important',
        overflowY: 'auto',
        overflowX: 'hidden',
        width: '100%',
        margin: 5
    },
    wrapper: {
        width:'inherit',
        // height: 'calc(100% - 167px)',
        position:'fixed'
    },
    topDiv:{
        margin: '-2px 10px 0px 0px'
    },
    tabDiv: {
        boxSizing: 'content-box',
        margin: '5px 20px 0px 0px',
        overflow: 'auto'
    },
    tableHeadRow: {
        paddingLeft: '10px',
        fontStyle: 'normal',
        fontSize: font.fontSize,
        fontWeight: 'bold'
    },
    tabHeadSelect: {
        marginTop: 5
    },
    tableContentRow: {
        cursor: 'pointer',
        display: 'table-row',
        backgroundColor: color.cimsBackgroundColor
    },
    tableContentRowSelected: {
        backgroundColor: COMMON_STYLE.TABLE_SELECT_ROW_BACKGROUNDCOLOR
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
    tableCellRow: {
        textAlign: 'center',
        padding:6,
        backgroundColor: color.cimsBackgroundColor
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
    displayLabel: {
        '-webkit-line-clamp': 1,
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
        display: '-webkit-inline-box'
    },
    footDiv: {
        left: 0,
        right: 0,
        bottom: 0,
        height: 60,
        padding: '0px 12px',
        zIndex: '100',
        display: 'flex',
        position: 'fixed',
        borderTop: '1px solid rgb(230, 230, 230)',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: color.cimsBackgroundColor
    }
});