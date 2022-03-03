import { COMMON_STYLE } from '../../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  paper: {
    minWidth: 1100
  },
  dialogTitle: {
    lineHeight: 1.6,
    fontWeight: 'bold',
    fontSize: '1.5rem',
    fontFamily: font.fontFamily,
    paddingTop: '5px',
    paddingBottom: '5px',
    backgroundColor: '#b8bcb9'
  },
  dialogContent: {
    padding: '10px 24px',
    backgroundColor: color.cimsBackgroundColor,
    overflowY: 'hidden'
  },
  dialogActions: {
    margin:'0px' ,
    padding:'0 10px' ,
    backgroundColor:color.cimsBackgroundColor
  },
  numberSpan: {
    fontWeight: 'bold',
    paddingLeft: 16
  },
  headRowStyle:{
    height: 50
  },
  headCellStyle:{
    color: COMMON_STYLE.whiteTitle,
    overflow: 'hidden',
    fontWeight: 'bold',
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    position:'sticky !important',
    top:0,
    backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
  },
  customRowStyle:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 20
  },
  searchLabel: {
    marginRight: 10
  },
  searchBtn: {
    float:'right'
  },
  actionWrapper:{
    marginRight: 12
  },
  searchDiv: {
    position: 'sticky',
    backgroundColor: color.cimsBackgroundColor
  },
  tableDiv: {
    maxHeight: 600,
    overflowY: 'auto',
    marginTop: -1
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  },
  input: {
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  }
});