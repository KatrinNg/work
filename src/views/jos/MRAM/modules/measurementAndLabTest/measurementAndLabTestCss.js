import { COMMON_STYLE }from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const style = {
  paper: {
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor,
    ...standardFont
  },
  sup: {
    color:'blue',
    fontSize: 12,
    fontFamily: font.fontFamily,
    fontWeight:'bold'
  },
  span: {
    fontSize:'inherit',
    fontWeight:'bold',
    padding:'5px 10px 30px 10px'
  },
  divRow: {
    display:'inline-flex'
    //paddingTop: 10
  },
  divBodyLeft: {
    display:'inline-flex',
    textAlign:'right'
    //paddingTop: 10
  },
  leftHeader: {
    color: COMMON_STYLE.whiteTitle,
    fontFamily : 'inherit',
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    borderTopLeftRadius: 5
  },
  rightHeader: {
    color: COMMON_STYLE.whiteTitle,
    fontFamily : 'inherit',
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    borderTopRightRadius: 5
  },
  divBmi:{
    border: '2px solid rgb(196, 196, 196)',
    display:'inline',
    float:'left',
    minWidth: 140,
    marginTop:10
  },
  divBmiWarning:{
    border: '2px solid #fd0000',
    display:'inline',
    float:'left',
    minWidth: 140,
    marginTop:10
  },
  divWhr:{
    border: '2px solid rgb(196, 196, 196)',display:'inline',
    float:'left',
    minWidth: 140,
    marginTop:15
  },
  textBox: {
    resize: 'none',
    border: '1px solid rgba(0,0,0,0.42)',
    height: '100px',
    width: 'calc(100% - 6px)',
    borderRadius: '5px',
    color: color.cimsTextColor,
    ...standardFont,
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
  },
  validation_left_span : {
    paddingLeft:'92px',
    color: '#fd0000',
    margin: '0',
    fontSize: '0.75rem',
   // marginTop: '8px',
    minHeight: '1em'
  },
  validation_right_span : {
    paddingLeft:'32px',
    color: '#fd0000',
    margin: '0',
    fontSize: '0.75rem',
   // marginTop: '8px',
    minHeight: '1em'
  },
  row_span : {
    height:'17px'
  },
  customRowStyle: {
    ...standardFont,
    color: color.cimsTextColor
  },
  headRowStyle:{
    height:'40px',
    ...standardFont
  },
  headCellStyle:{
    ...standardFont,
    color: COMMON_STYLE.whiteTitle,
    backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    overflow: 'hidden',
    fontWeight: 'bold'
  },
  mergeTypeSharpIcon : {
    fontSize:'50px',
    transform: 'rotate(90deg)',
    marginTop:35
  },
  defultFont:{
    ...standardFont,
    fontWeight:'bold'
  },
  error_icon: {
    // fontSize: '14px'
    width: '1.125rem',
    height: '1.125rem'
  },
  helper_error: {
    fontSize: '10pt !important'
  },
  bloodPressure_error: {
    marginTop: 0,
    fontSize: '10pt !important',
    fontFamily: font.fontFamily,
    padding: '0 !important',
    marginLeft:'15%'
  },
  card:{
    minWidth: 1350,
    overflowY: 'auto',
    height: 'calc(68vh - 78px)',
    backgroundColor: color.cimsBackgroundColor
  },
  bottom:{
    paddingBottom:0
  },
  bmiError:{
    marginTop: 0,
    fontSize: '10pt !important',
    fontFamily: font.fontFamily,
    padding: '0 !important',
    display: 'inline-block'
  },
  paddingTop:{
    paddingTop:10
  },
  labRetrievalBorder:{
    borderLeft:'1px solid #d5d5d5'
  },
  abnormal:{
    color: '#fd0000'
  },
  lableSpan:{
    fontSize:'inherit',
    fontWeight:'bold',
    paddingLeft:4
  },
  bodyRight:{
    marginTop:4
  },
  input: {
    ...standardFont,
    color: color.cimsTextColor,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  },
  textareaDisabled: {
    backgroundColor: color.cimsDisableColor
  }
};