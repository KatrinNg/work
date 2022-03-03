import { COMMON_STYLE } from '../../../../../../../../../../constants/commonStyleConstant';
import { getState } from '../../../../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};
export const styles=()=>({
    rootTable:{
        width:'100%',
        overflow:'hidden',
        overflowY:'auto'
    },
    tableHeadRow: {
        paddingLeft: '10px',
        fontStyle: 'normal',
        fontSize: font.fontSize,
        fontWeight: 'bold',
        height:50,
        '& td:last-child':{
            borderRight:'1px solid rgba(224, 224, 224, 1)'
        }
    },
    tableHeadCall:{
        fontSize: font.fontSize,
        fontWeight: 600,
        fontFamily: font.fontFamily,
        color: COMMON_STYLE.WHITE_TITLE,
        backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
        position: 'sticky',
        top: 0,
        borderTop: 0,
        border: '1px solid rgba(224, 224, 224, 1)'
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
        padding:'0 5px',
        border: '1px solid rgba(224, 224, 224, 1)',
        borderTop: '0px solid rgba(224, 224, 224, 1)',
        borderRight: '0 solid rgba(224, 224, 224, 1)',
        whiteSpace: 'pre-line',
        wordWrap: 'break-word',
        wordBreak: 'break-all'
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
    tableCellRow:{
        textAlign: 'center'
    }
});