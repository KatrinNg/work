import { COMMON_STYLE } from '../../../constants/commonStyleConstant';
import {getState} from '../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const style = {
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    height: 25,
    borderRadius: 0
  },
  favorite_category: {
    color: 'rgba(0, 0, 0, 0.7)',
    width: 'calc(100%-20px)',
    padding: 5
  },
  left_Label: {
    padding: 6,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    display: 'flex',
    alignItems: 'center'
  },
  font_color: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: '#0579c8'
  },
  table_itself: {
    boxShadow:'0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)'
  },
  table_head: {
    height: 50,
    paddingLeft: '10px',
    fontStyle: 'normal',
    fontSize: '13px',
    fontWeight: 'bold',
    color:'white'
  },
  table_header: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    fontWeight: 600,
    color: COMMON_STYLE.whiteTitle,
    paddingTop: 5,
    paddingLeft: 8,
    position:'sticky!important',
    top:186,
    backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
  },
  button: {
    Float: 'center',
    backgroundColor: color.cimsBackgroundColor
  },
  saveAndeClear: {
    right: 0,
    Float: 'right'
  },
  bigContainer: {
    minWidth:600,
    backgroundColor: 'rgb(183,188,184)',
    padding: 5,
    boxShadow: '2px 2px 2px 2px lightgray',
    borderRadius: 5
  },
  topP: {
    marginBottom: -9,
    marginLeft: 5,
    marginTop: 0
  },
  table_row: {
    height: 31,
    cursor: 'pointer'
  },
  table_row_selected: {
    height: 31,
    cursor: 'pointer',
    backgroundColor: 'cornflowerblue'
  },
  table_cell: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    paddingLeft: '10px',
    width: 5,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  cell_text: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    paddingLeft: '30px',
    width: 20,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  table_cell_1: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    width: 5,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    // marginTop: theme.spacing(1),
    left: 0,
    right: 0
  },
  chip: {
    // margin: theme.spacing(0.5, 0.25),
  },
  container: {
    flexGrow: 1,
    position: 'relative'
  },
  inputRoot: {
    flexWrap: 'wrap'
  },
  inputInput: {
    width: 'auto',
    flexGrow: 1
  },
  filterInout: {
    // position: 'relative'
  },
  tbNoData: {
    fontFamily: font.fontFamily,
    fontSize: font.fontSize,
    fontWeight: 400,
    lineHeight: 1.6,
    padding:10,
    '&:last-child':{
      padding:10
    }
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 'fit-content'
  },
  validation: {
    color: '#fd0000',
    margin: '0',
    fontSize: '0.75rem',
    ali: 'left',
    marginTop: '8px',
    minHeight: '1em',
    display: 'block'
  },
  templatetitle: {
    color: '#404040',
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    marginRight: 5,
    marginTop:7
  },
  dialogTitle: {
    paddingTop: '5px',
    paddingBottom: '5px',
    backgroundColor: '#b8bcb9',
    color: '#404040',
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  dialogBorder: {
    backgroundColor:color.cimsBackgroundColor,
    borderBottom: '10px solid #b8bcb9',
    borderRight: '10px solid #b8bcb9',
    borderLeft: '10px solid #b8bcb9'
  },
  cardContainer: {
    borderRadius: 5,
    marginLeft:20,
    marginRight:36,
    marginTop:8,
    height: 'calc(100% - 10px)',
    overflowY: 'auto',
    backgroundColor:color.cimsBackgroundColor
  },
  cardHeader: {
    fontSize: '1.5rem',
    fontFamily: font.fontFamily
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
  tableCellBorder: {
    border: '1px solid rgba(224, 224, 224, 1)',
    whiteSpace:'break-spaces'
  },
  inputName: {
    //paddingLeft:10,
    //resize:'none',
    //height: 17,
    width: '100%',
    //border: '1px solid rgba(0,0,0,0.42)',
    // color: color.cimsTextColor,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  inputText:{
    padding: 10,
    resize:'none',
    minHeight:300 ,
    width: '99%',
    border: '1px solid rgba(180,180,180)',
    color: color.cimsTextColor,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    backgroundColor: color.cimsBackgroundColor,
    borderRadius: 5,
    '&:focus': {
      outline: '-webkit-focus-ring-color auto 0px',
      border: '2px solid #0579C8'
    }
  },
  fontLabel: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  customRowStyle :{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  headRowStyle:{
      backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
  },
  headCellStyle:{
      fontSize: font.fontSize,
      fontFamily: font.fontFamily,
      color:'white',
      overflow: 'hidden'
  },
  btn_div:{
    backgroundColor:color.cimsBackgroundColor,
    marginTop: 0
  },
  select_div:{
    backgroundColor:color.cimsBackgroundColor
  },
  label_div:{
    backgroundColor:color.cimsBackgroundColor,
    paddingBottom:16,
    paddingTop:16
  },
  topDiv:{
    top:0,
    position:'sticky'
  },
  tableDiv:{
    margin:'-6px 2px 0px 2px'
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  }
};
