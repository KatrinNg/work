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
    width: '100%'
  },
  header: {
    color: COMMON_STYLE.whiteTitle,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },
  radioGroup: {
    display: 'inherit',
    fontSize: font.fontSize
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
  tableRowFieldCell: {
    ...standardFont,
    color: color.cimsTextColor,
    fontWeight: 'bold',
    paddingRight: 5
  },
  tableRow: {
    height: 57
  },
  width50: {
    width: '50%'
  },
  borderNone: {
    border: 'none'
  },
  textBox: {
    ...standardFont,
    resize: 'none',
    border: '1px solid rgba(0,0,0,0.42)',
    height: '75px',
    width: 'calc(100% - 10px)',
    borderRadius: '5px',
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor,
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
  tableCrossRow: {
    backgroundColor: '#D1EEFC'
  },
  levelGrid: {
    margin: 5
  },
  levelLabel: {
    ...standardFont,
    color: color.cimsTextColor,
    float: 'left',
    fontWeight: 'bold',
    marginRight: 10,
    marginTop:7
  },
  levelSelect: {
    float: 'left',
    width: 300
  },
  firstLevelHeadCell: {
    paddingLeft: 50
  },
  paddingLeft5: {
    paddingLeft: 5
  },
  middleHeader: {
    color: COMMON_STYLE.whiteTitle,
    padding: '5px 0 5px 20px',
    backgroundColor: '#0579C8'
  },
  tableCell : {
    ...standardFont
  },
  checkBoxStyle:{
    margin:0
    // padding:'5px 14px'
  },
  normalFont: {
    ...standardFont,
    color: color.cimsTextColor
  },
  disabledLabel: {
    color: `${color.cimsLabelColor} !important`
  }
});