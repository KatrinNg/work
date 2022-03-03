import { getState } from '../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = (theme) => ({
  inputLabel: {
    ...standardFont,
    color: `${color.cimsLabelColor} !important`
  },
  table: {
    backgroundColor: color.cimsBackgroundColor,
    // border: '1px solid rgba(0,0,0,0.5)',
    marginBottom: 5,
    overflowY: 'auto'
  },
  formControl: {
    width: '100%'
  },
  list_title: {
    ...standardFont,
    backgroundColor: color.cimsBackgroundColor,
    color: color.cimsTextColor,
    fontWeight: 600
  },
  boxSelect: {
    color: color.cimsTextColor
    // width: 'calc(100%-20px)',
  },
  SelectFormControl: {
    marginTop: -5,
    minWidth: 120
  },
  procedureAvatar: {
    color: color.cimsBackgroundColor,
    backgroundColor: '#F8D186'
  },
  diagnosisAvatar: {
    color: color.cimsBackgroundColor,
    backgroundColor: '#38d1ff'
  },
  iconBtn: {
    color: 'inherit'
  },
  historyCheckbox: {
    padding: '0px 0px 0px 10px'
  },
  btnDiagnosisSerivceFavourite: {
    [theme.breakpoints.between('xs', 'md')]: {
      float: 'left'
    }
  },
  localTerm: {
    marginTop: '17px'
  },
  localTermCheckbox: {
    padding: 5
  },
  label: {
    ...standardFont,
    float: 'left',
    padding: '10px 0px 0px 0px'
  },
  floatLeft: {
    float: 'left'
  },
  buttonColor: {
    maxWidth: 96,
    flexDirection: 'inherit'
  },
  buttonReadColor: {
    maxWidth: 96,
    // color: color.cimsLabelColor,
    flexDirection: 'inherit'
  },
  selectMenu: {
    ...standardFont,
    color: color.cimsTextColor
  },
  statusSelect: {
    height: 28,
    width: 135,
    fontWeight: 'normal'
  },
  historyDetailsField: {
    marginLeft: -15
  },
  textAreaBorder:{
    '&:focus': {
      outline: 'none',
      border: '2px solid #0579C8',
      borderRadius: 5
    }
  },
  historyButtomRoot: {
    height: 34,
    position: 'fixed',
    width: '398px',
    bottom: 0,
    backgroundColor: color.cimsBackgroundColor
  },
  buttonRoot: {
    textTransform: 'none',
    fontWeight: 400
  },
  buttonSizeSmall: {
    margin: '8px 0',
    padding: '4px 12px'
  },
  buttonDisabled: {
    borderColor: theme.palette.action.disabledBackground
  },
  buttonDisabledSpecial: {
    borderColor: theme.palette.action.disabledBackground,
    backgroundColor: 'grey !important'
  },
  buttonLabelWhite: {
    color: 'white'
  },
  buttonLabelRed: {
    color: 'red'
  }
});
