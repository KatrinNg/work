import { COMMON_STYLE }from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const style = (theme) => ({
  cardContent: {
    backgroundColor: color.cimsBackgroundColor
  },
  wrapper: {
    backgroundColor: color.cimsBackgroundColor
  },
  divider:{
    height:2
  },
  radioGroup: {
    display: 'inherit'
  },
  leftHeader: {
    color: COMMON_STYLE.whiteTitle,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    borderTopLeftRadius: 5,
    marginTop:2,
    borderTopRightRadius:5
  },
  font: {
    ...standardFont,
    fontWeight: 600,
    color: color.cimsTextColor
  },
  answerFont: {
    ...standardFont,
    fontWeight:'normal',
    color: color.cimsTextColor
  },
  Checkbox:{
    ...standardFont,
    marginLeft:50,
    width:'16%',
    fontWeight: 600
  },
  textArea:{
    ...standardFont,
    marginTop:8,
    marginLeft:64,
    width:'82%',
    resize: 'none',
    '&:hover': {
        outline: 'none',
        border: '1px solid black'
      },
      '&:focus': {
        outline: 'none',
        border: '2px solid #0579C8'
      },
    backgroundColor: color.cimsBackgroundColor
  },
  otherInformation:{
    marginLeft:24,
    marginTop:4,
    width:'auto',
    paddingBottom:4
  },
  button:{
    marginLeft:8,
    minWidth:30
  },
  card: {
    minWidth: 1069,
    overflowX: 'auto',
    overflowY: 'auto',
    height: 'calc(68vh - 78px)'
  },
  contentHeader: {
    color: COMMON_STYLE.whiteTitle,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    marginTop:2
  },
  wordWrap:{
    whiteSpace:'normal'
  },
  input: {
    ...standardFont,
    color: color.cimsTextColor,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  },
  width50: {
    width: '50%'
  },
  textAreaMargin: {
    padding: 5,
    marginLeft: 56
  }
});
