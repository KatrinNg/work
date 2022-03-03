import { COMMON_STYLE }from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = () => ({
  normalFont: {
    ...standardFont,
    '&$disabled': {
      color: COMMON_STYLE.labelColor
    }
  },
  card: {
    minWidth: 1519,
    overflowY: 'auto',
    height: 'calc(68vh - 78px)'
    // overflowX: 'auto'
  },
  cardContent: {
    backgroundColor: color.cimsBackgroundColor,
    paddingLeft: 0
  },
  form: {
    backgroundColor: color.cimsBackgroundColor,
    width: '100%'
  },
  leftHeader: {
    color: COMMON_STYLE.whiteTitle,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    borderTopLeftRadius: 5,
    fontFamily: font.fontFamily
  },
  rightHeader: {
    color: COMMON_STYLE.whiteTitle,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    borderTopRightRadius: 5,
    fontFamily: font.fontFamily
  },
  radioGroup: {
    display: 'inherit'
  },
  table: {
    borderRight: '1px solid #D5D5D5'
  },
  tableHeadFirstCell: {
    width: '28%',
    paddingRight: 5
  },
  tableHeadCell: {
    ...standardFont,
    color: COMMON_STYLE.whiteTitle,
    fontWeight: 'bold',
    width: '30%'
  },
  tableRowFieldCell: {
    ...standardFont,
    fontWeight: 'bold',
    paddingRight: 5,
    color: color.cimsTextColor
  },
  sup: {
    fontSize: 12,
    color: '#0579C8'
  },
  input: {
    width: '100%'
  },
  tableRow: {
    height: 57
  },
  fullwidth: {
    width: '100%'
  },
  width50: {
    width: '50%',
    borderLeft: 0
  },
  borderNone: {
    border: 'none'
  },
  textBox: {
    ...standardFont,
    resize: 'none',
    border: '1px solid rgba(0,0,0,0.42)',
    height: '75px',
    width: 'calc(100% - 6px)',
    borderRadius: '5px',
    color: color.cimsTextColor,
    '&:focus': {
      outline: 'none',
      border: '2px solid #0579C8'
    },
    boxShadow:
      '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)'
  },
  tableCrossRow: {
    backgroundColor: '#D1EEFC'
  },
  paddingRightNone: {
    paddingRight: 0
  },
  tableCellSpan: {
    padding:'0 5px',
    '&:last-child': {
      padding:'0 5px'
    }
  },
  eyesBorder:{
    borderRight: '1px solid',
    borderRightColor: '#D5D5D5'
  },
  checkBoxStyle: {
    margin: 0,
    marginLeft: 5,
    marginRight: 5
  },
  disabled: {
    color: COMMON_STYLE.disabledColor
  },
  backgroud: {
    backgroundColor: color.cimsBackgroundColor
  }
});