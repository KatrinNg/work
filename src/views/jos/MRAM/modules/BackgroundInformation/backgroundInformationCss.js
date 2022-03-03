import { cyan } from '@material-ui/core/colors';
import { COMMON_STYLE }from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = {
  normalFont: {
    ...standardFont,
    marginLeft:-10
  },
  inputStyle: {
    ...standardFont,
    fontWeight: 600,
    marginRight:15
  },
  selectLabel: {
    ...standardFont,
    float:'left',
    paddingTop:'3px',
    paddingRight:'10px',
    fontWeight: 600
  },
  divHeader:{
    marginLeft:10,
    borderRadius:0,
    backgroundColor:'rgb(5,121,200)',
    color:color.cimsBackgroundColor,
    width:'98%'
  },
  self_monitoring_box: {
    border: '1px solid rgba(0,0,0,0.42)',
    padding: 15,
    marginLeft: 10,
    paddingBottom:30
  },
  right_box: {
    border: '1px solid rgba(0,0,0,0.42)',
    minHeight: 190,
    padding: 15
  },
  card: {
    minWidth: 1480,
    overflowX: 'none',
    overflowY: 'auto',
    height: 'calc(68vh - 78px)',
    backgroundColor: color.cimsBackgroundColor
  },
  leftHeader: {
    color: COMMON_STYLE.whiteTitle,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    borderTopLeftRadius: 5
  },
  checkBoxGrid:{
    marginLeft:11
  },
  dmText:{
    ...standardFont,
    width: '100%',
    float: 'left'
  },
  gridContainer:{
    marginLeft: 35
  },
  gridContainerSecond:{
    marginLeft: 35,
    marginTop: 10
  },
  gridSup:{
    fontSize: 12,
    color: 'rgb(5,121,200)'
  },
  leftSpan:{
    ...standardFont,
    marginRight:15
  },
  socialHistoryGrid:{
    paddingBottom:20,
    paddingTop:10
  },
  rightHeader: {
    color: COMMON_STYLE.whiteTitle,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    borderTopRightRadius: 5
  },
  headerNoRegistration:{
    color: COMMON_STYLE.whiteTitle,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8'
  },
  gridLableLeft: {
    marginTop: 5
  },
  gridLable:{
    marginTop:10
  },
  formControlLabel:{
    marginTop: -10
  },
  affectedSibling:{
    ...standardFont,
    width: '100%',
    float: 'left',
    marginLeft: -6,
    paddingLeft: 6,
    paddingRight: 0
  },
  gridTotal:{
    marginTop: 8,
    marginLeft:-5
  },
  yearDiagnosisHt:{
    ...standardFont,
    width: '100%',
    float: 'left'
  },
  radioGroupContainer:{
    marginLeft: 35,
    marginTop: 10
  },
  disableInputStyle:{
    ...standardFont,
    fontWeight: 600,
    marginRight:15,
    color:COMMON_STYLE.disabledColor
  },
  disableLeftSpan:{
    ...standardFont,
    // marginRight:10,
    marginRight:15,
    color:COMMON_STYLE.disabledColor
  },
  disabledPunctuationTotal:{
    ...standardFont,
    color:COMMON_STYLE.disabledColor
  },
  punctuationTotal:{
    ...standardFont
  },
  tableCell : {
    ...standardFont
  },
  leftLableCenter:{
    marginTop:7
  },
  formGroup: {
    marginLeft: 10
  },
  checkBoxStyle:{
    marginLeft: 5,
    marginRight: 5
  },
  paper: {
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor,
    ...standardFont
  },
  disabled: {
    backgroundColor: color.cimsDisableColor
  },
  disabledLabel: {
    color: `${COMMON_STYLE.disabledColor} !important`
  },
  input: {
    ...standardFont,
    color: color.cimsTextColor,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  },
  textarea: {
    ...standardFont,
    resize:'none',
    width:'100%',
    minHeight:80,
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor
  },
  textBox: {
    resize: 'none',
    border: '1px solid rgba(0,0,0,0.42)',
    height: '75px',
    width: 'calc(100% - 6px)',
    borderRadius: '5px',
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    '&:hover': {
        outline: 'none',
        border: '1px solid black'
      },
    '&:focus': {
      outline: 'none',
      border: '2px solid #0579C8'
    },
    boxShadow:
      '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)'
  }
};