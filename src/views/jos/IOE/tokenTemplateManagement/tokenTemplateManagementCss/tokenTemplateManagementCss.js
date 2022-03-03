import { COMMON_STYLE }from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const style = {
    bigContainer: {
        borderRadius: 5,
        marginLeft:20,
        marginRight:36,
        marginTop:8,
        height: 'calc(100% - 10px)',
        overflowY: 'auto',
        backgroundColor:color.cimsBackgroundColor
        // boxShadow:0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)
    },
    left_Label: {
        fontSize: font.fontSize,
        padding: 6,
        fontWeight:600
    },
    font_color: {
      fontSize: font.fontSize,
      fontFamily: font.fontFamily,
      color: '#0579c8'
    },
    customRowStyle :{
      fontSize: font.fontSize,
      fontFamily: font.fontFamily,
      whiteSpace:'pre'
    },
    headRowStyle:{
        backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
    },
    headCellStyle:{
        fontSize:font.fontSize,
        fontFamily: font.fontFamily,
        color: COMMON_STYLE.whiteTitle,
        overflow: 'hidden',
        fontWeight: 'bold',
        position:'sticky !important',
        top:141,
        backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
    },
    wrapper: {
        width: 'calc(100% - 22px)',
        height: 'calc(100% - 167px)',
        position: 'fixed'
    },
    fixedBottom: {
        margin:'10px',
        color: '#6e6e6e',
        position:'fixed',
        bottom: 0,
        width: '100%',
        zIndex: 100,
        backgroundColor: color.cimsBackgroundColor,
        right: 30
    },
    fontLabel: {
      fontSize: font.fontSize,
      fontFamily: font.fontFamily
    },
    cardHeader: {
        top: 0,
        position: 'sticky',
        backgroundColor: color.cimsBackgroundColor
    },
    cardContent:{
        paddingTop: 0,
        backgroundColor: color.cimsBackgroundColor
    },
    topDiv: {
        top:63,
        position:'sticky',
        height: 71,
        backgroundColor: color.cimsBackgroundColor
    },
    tableDiv: {
        margin: '12px 2px 0px 2px'
    },
    labelDiv:{
        marginBottom: 0,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
        backgroundColor: color.cimsBackgroundColor
    },
    btnDiv:{
        marginTop: 0,
        marginLeft: 0,
        backgroundColor: color.cimsBackgroundColor
    },
    btnRoot:{
        textTransform:'none'
    }
};