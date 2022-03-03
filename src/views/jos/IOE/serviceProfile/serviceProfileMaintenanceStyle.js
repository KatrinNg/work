import { COMMON_STYLE }from '../../../../constants/commonStyleConstant';
import {getState} from '../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  font_color: {
    fontSize: font.fontSize,
    color: '#0579c8'
  },
  font_disabled: {
    color: 'rgba(0, 0, 0, 0.26)'
  },
  headRowStyle:{
    height: 50
    // backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
  },
  headCellStyle:{
    color: COMMON_STYLE.whiteTitle,
    overflow: 'hidden',
    fontWeight: 'bold',
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    position:'sticky!important',
    top:159,
    backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
  },
  customRowStyle:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    whiteSpace: 'pre',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  wrapper: {
    width: 'calc(100% - 22px)',
    height: 'calc(100% - 167px)',
    position: 'fixed'
  },
  fixedBottom: {
    color: '#6e6e6e',
    position:'fixed',
    bottom: 0,
    width: '100%',
    zIndex: 100,
    backgroundColor: color.cimsBackgroundColor,
    right: 30,
    margin: 10
  },
  cardWrapper: {
    margin: '8px 0px 0px 20px',
    marginRight: 20,
    height: 'calc(100% - -8px)',
    overflowY: 'auto',
    backgroundColor: color.cimsBackgroundColor
  },
  favouriteCategoryLabel: {
    padding: 6,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    display: 'flex',
    alignItems: 'center'
  },
  favoriteCategory: {
    color: 'rgba(0, 0, 0, 0.7)',
    padding: 5,
    minWidth: 200,
    backgroundColor:color.cimsBackgroundColor
  },
  actionBtn: {
    textTransform: 'none'
  },
  label: {
    fontSize: '1.5rem',
    fontFamily: font.fontFamily,
    paddingLeft: 5
  },
  titleDiv: {
    // top:0,
    // position:'sticky',
    backgroundColor:color.cimsBackgroundColor,
    paddingBottom:16,
    paddingTop:16
  },
  favouriteCategoryDiv: {
    // top:68,
    // position:'sticky',
    backgroundColor:color.cimsBackgroundColor
  },
  actionDiv: {
    // top:118,
    // position:'sticky',
    backgroundColor:color.cimsBackgroundColor,
    marginTop: 0
  },
  tableDiv: {
    margin: '-6px 2px 0px 2px'
    // overflowY:'scroll',
    // maxHeight:760
  },
  cardContent: {
    paddingTop: 0
  },
  topDiv:{
    top:0,
    position:'sticky',
    height: 160,
    backgroundColor: color.cimsBackgroundColor
  },
  tooltip: {
    opacity: 1,
    // marginLeft: '-50%',
    whiteSpace:'pre-wrap'
  },
  tooltipDivStyle:{
    backgroundColor:color.cimsBackgroundColor
  }
});