import { COMMON_STYLE }from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const normalFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const style = {
  paper: {
    borderRadius:5,
    minWidth: 1030,
    backgroundColor: color.cimsBackgroundColor,
    color: color.cimsTextColor,
    ...normalFont
  },
  cardContent: {
    backgroundColor: color.cimsBackgroundColor
  },
  dialogTitle: {
    backgroundColor: '#b8bcb9',
    borderTopLeftRadius:'5px',
    borderTopRightRadius:'5px',
    paddingLeft: '24px',
    padding: '10px 24px 7px 0px',
    color: color.cimsTextColor,
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.6
    // fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif'
  },
  headRowStyle:{
    backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
  },
  headCellStyle:{
    color: COMMON_STYLE.whiteTitle,
    backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    overflow: 'hidden',
    fontSize:'1.125rem',
    top: -1,
    position: 'sticky !important'
  },
  fontLabel: {
    ...normalFont
  },
  buttonGroup: {
    padding: '0px 60px'
  },
  label:{
    ...normalFont,
    paddingLeft: 17
  },
  length1:{
    marginLeft: 100
  },
  bodyCellStyle:{
    ...normalFont,
    color: color.cimsTextColor
  },
  paperTable:{
    paddingTop: 0,
    width:'100%',
    overflow:'auto',
    maxHeight: 420,
    backgroundColor: color.cimsBackgroundColor
  },
  cardHearder: {
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor,
    paddingBottom: 16
  },
  btnGroup: {
    float: 'right',
    paddingRight: 10
  },
  tableDiv: {
    margin: '-6px 2px 0px 2px'
  }
};