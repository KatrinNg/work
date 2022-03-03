import { COMMON_STYLE }from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = () => ({
  card: {
    minWidth: 1255,
    overflowY: 'auto',
    height: 'calc(68vh - 78px)'
    // overflowX: 'auto'
  },
  cardContent: {
    backgroundColor: color.cimsBackgroundColor,
    paddingLeft: 0
  },
  form: {
    width: '100%',
    backgroundColor: color.cimsBackgroundColor
  },
  sup: {
    fontSize: 12,
    color: '#0579C8'
  },
  radioGroup: {
    display: 'inherit'
  },
  table: {
    borderRight: '1px solid #D5D5D5'
  },
  tableHeadFirstCell: {
    width: '50%',
    paddingRight: 5
  },
  width25: {
    ...standardFont,
    width: '25%',
    fontWeight: 'bold'
  },
  tableHeadCell: {
    ...standardFont,
    color: COMMON_STYLE.whiteTitle,
    fontWeight: 'bold'
  },
  tableRowFieldCell: {
    ...standardFont,
    fontWeight: 'bold',
    paddingRight: 5,
    color: color.cimsTextColor
  },
  topHeader: {
    color: COMMON_STYLE.whiteTitle,
    fontFamily: font.fontFamily,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    borderTopRightRadius: 5,
    borderTopLeftRadius:5
  },
  middleHeader: {
    color: COMMON_STYLE.whiteTitle,
    fontFamily: font.fontFamily,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8'
  },
  tableRowFieldCellIndent: {
    ...standardFont,
    fontWeight: 'bold',
    textIndent: '15px',
    color: color.cimsTextColor
  },
  tableCrossRow: {
    backgroundColor: '#D1EEFC'
  },
  tableRow: {
    height: 57
  },
  button:{
    marginLeft:8,
    minWidth:30
  },
  tableCellSpan: {
    padding:'0 5px',
    '&:last-child': {
      padding:'0 5px'
    }
  },
  firstLevelHeadCell: {
    paddingLeft: 15,
    '&:last-child':{
      paddingLeft: 15
    }
  },
  borderNone: {
    border: 'none'
  },
  borderLeftRight: {
    borderTop: 'none',
    borderBottom: 'none',
    borderLeft: '1px solid #d5d5d5',
    borderRight: '1px solid #d5d5d5'
  },
  remarkTitleTableRow: {
    height: 20
  },
  remarkTitleTableCell: {
    '&:last-child': {
      paddingTop: 5
    }
  },
  remarkTableCell: {
    height: 100
  },
  width50: {
    width: '50%'
  },
  AbpWrapper: {
    paddingLeft: 5,
    float: 'left'
  },
  BbpWrapper: {
    paddingLeft: 5,
    paddingTop: 20
  },
  paddingTop:{
    paddingTop:10
  },
  feetBorder:{
    borderRight: '1px solid',
    borderRightColor: '#D5D5D5'
  },
  input: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  }
});