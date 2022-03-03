
import { COMMON_STYLE } from '../../../../constants/commonStyleConstant';
import {getState} from '../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  cardWrapper: {
    margin: '8px 0 0 20px',
    marginRight: 36,
    borderRadius: 5,
    height: 'calc(100% - 311px)',
    overflowY: 'auto',
    position: 'fixed',
    backgroundColor:color.cimsBackgroundColor
  },
  table: {
    width: '100%'
  },
  titleDiv: {
    padding: '16px',
    fontSize: ' 1.5rem',
    fontFamily: font.fontFamily
  },
  cardContent: {
    paddingTop: 0,
    backgroundColor:color.cimsBackgroundColor
  },
  tableWrapper: {
    padding: '0px 16px 0px 16px',
    backgroundColor: 'white'
  },
  left_Label: {
    fontSize: font.fontSize,
    padding: 6,
    fontWeight:600
  },
  divFirst:{
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5
  },
  gridContainer:{
    marginTop: -10,
    marginLeft:-8
  },
  gridFuzzy:{

  },
  headRowStyle:{
    backgroundColor:'#7BC1D9'
  },
  headCellStyle:{
    backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    color: COMMON_STYLE.whiteTitle,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    overflow: 'hidden',
    fontWeight: 'bold',
    position:'sticky !important',
    top:105,
    zIndex: 100
  },
  JosTable:{
    // marginTop:20,
    // marginLeft:-2
  },
  cimsButton:{
    marginRight:10
  },
  cimsButtonDiv:{
    marginTop:24
  },
  selectLabel: {
    fontSize:font.fontSize,
    float: 'left',
    paddingTop: '3px',
    paddingRight: '10px',
    fontFamily: font.fontFamily,
    fontWeight: 'bold',
    marginLeft:6
  },
  fontLabel: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily

  },
  customRowStyle :{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    whiteSpace: 'pre'
  },
  specimenCollctionWrapper: {
    height: 65,
    display: 'flex',
    alignItems: 'center',
    minWidth: 725,
    marginRight: 5,
    paddingRight: 12
  },
  specimenCollctionDiv: {
    paddingRight: 12,
    marginTop: -10
  },
  customButton: {
    margin: '0 12px 0 0'
  },
  cardHeader: {
    top: 0,
    position: 'sticky',
    backgroundColor: color.cimsBackgroundColor,
    zIndex: 100
  },
  topDiv: {
      top:63,
      position:'sticky',
      height: 37,
      backgroundColor: color.cimsBackgroundColor,
      zIndex: 100,
      paddingBottom: 10
  },
  tableDiv: {
      margin: '0 2px 0 2px',
      position:'sticky'
  }
});