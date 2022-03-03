import { COMMON_STYLE }from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const style = () => ({
  card: {
    minWidth: 1069,
    overflowY: 'auto',
    height: 'calc(68vh - 78px)'
  },
  cardContent: {
    backgroundColor: color.cimsBackgroundColor
  },
  form: {
    padding:10,
    width: '100%',
    backgroundColor: color.cimsBackgroundColor
  },
  leftHeader: {
    color: COMMON_STYLE.whiteTitle,
    fontFamily:font.fontFamily,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    borderTopLeftRadius: 5
  },
  radioGroup: {
    display: 'inherit'
  },
  textBox: {
    ...standardFont,
    resize: 'none',
    border: '1px solid rgba(0,0,0,0.42)',
    height: '300px',
    width: 'calc(100% - 30px)',
    borderRadius: '5px',
    color: color.cimsTextColor,
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
  borderNone: {
    border: 'none'
  },
  tableRow: {
    height: 57
  },
  tableRowFieldCell: {
    ...standardFont,
    color: color.cimsTextColor,
    borderColor: color.cimsBackgroundColor,
    fontWeight: 'bold',
    padding: '5px'
  },
  width50: {
    width: '50%'
  },
  sup: {
    fontSize: 12,
    color: '#0579C8'
  },
  checkboxGrid:{
    paddingLeft: 35
  },
  checkPadding: {
    margin: 0
    // padding: '0 10px 0 0'
  },
  selectLabel: {
    ...standardFont,
    float: 'left',
    paddingTop: '3px',
    paddingRight: '10px',
    fontWeight: 'bold',
    marginLeft:6
  },
  disable:{
    ...standardFont,
    borderColor: color.cimsBackgroundColor,
    fontWeight: 'bold',
    paddingRight: 5,
    color: COMMON_STYLE.disabledColor
  },
  controlLabel: {
    ...standardFont,
    color: color.cimsTextColor,
    '&$disabled':{
      color: COMMON_STYLE.disabledColor
    }
  },
  disabledLabel: {
    color: `${COMMON_STYLE.disabledColor} !important`
  }
});