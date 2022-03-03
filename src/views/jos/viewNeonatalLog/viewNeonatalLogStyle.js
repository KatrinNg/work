import { COMMON_STYLE } from '../../../constants/commonStyleConstant';
import { getState } from '../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
    root: {
        height: '100%',
        overflow: 'auto'
    },
    rootTable:{
        width:'99%',
        overflow:'hidden',
        overflowY:'auto',
        marginLeft:8
    },
    wrapper:{
        width:'100%'
    },
    tableHeadRow: {
        paddingLeft: '10px',
        fontStyle: 'normal',
        fontSize: font.fontSize,
        fontWeight: 'bold'
    },
    tableHeadCall:{
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
    tableRow:{
        cursor: 'pointer',
        display: 'table-row',
        backgroundColor: color.cimsBackgroundColor,
        '& td:last-child':{
            borderRight:'1px solid rgba(224, 224, 224, 1)'
        }
    },
    tableCall:{
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
    tableContentRowSelected: {
        backgroundColor: COMMON_STYLE.TABLE_SELECT_ROW_BACKGROUNDCOLOR
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
        overflow: 'hidden',
        display: '-webkit-inline-box',
        '-webkit-line-clamp': 1,
        '-webkit-box-orient': 'vertical'
    },
    tableCellRow: {
        textAlign: 'center',
        padding: 6,
        backgroundColor: color.cimsBackgroundColor
    }
});