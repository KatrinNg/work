import { COMMON_STYLE }from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = () => ({
  card: {
    minWidth: 1069,
    overflowX: 'auto',
    overflowY: 'auto',
    height: 'calc(68vh - 78px)'
  },
  cardContent: {
    backgroundColor: color.cimsBackgroundColor
  },
  paper: {
    backgroundColor: color.cimsBackgroundColor
  },
  form: {
    width: '100%',
    backgroundColor: color.cimsBackgroundColor
  },
  header: {
    color: COMMON_STYLE.whiteTitle,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    borderTopLeftRadius: 5,
    fontFamily:font.fontFamily
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
    fontWeight: 'bold'
  },
  firstLevelHeadCell: {
    paddingLeft: 50
  },
  secondLevelHeadCell: {
    paddingLeft: 75
  },
  tableRowFieldCell: {
    ...standardFont,
    fontWeight: 'bold',
    paddingRight: 5,
    color: color.cimsTextColor
  },
  input: {
    ...standardFont,
    width: '100%'
  },
  tableRow: {
    height: 57
  },
  width50: {
    width: '50%'
  },
  borderNone: {
    // border: 'none',
    whiteSpace:'inherit',
    fontFamily: font.fontFamily
  },
  tableCrossRow: {
    backgroundColor: '#D1EEFC'
  },
  riskText:{
    color: color.cimsTextColor,
    fontFamily:font.fontFamily,
    fontWeight:'bold',
    fontSize:'1rem'
  },
  tableText:{
    paddingRight:6
  },
  innerInput: {
    ...standardFont,
    color: color.cimsTextColor,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  }
});