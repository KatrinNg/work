import {getState} from '../../../../../../../store/util';
const { color,font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  paper: {
    minWidth: 1200
  },
  root: {
    backgroundColor: color.cimsBackgroundColor
  },
  dialogTitle: {
    lineHeight: 1.6,
    fontWeight: 'bold',
    fontSize: '1.5rem',
    fontFamily: font.fontFamily,
    paddingTop: '5px',
    paddingBottom: '5px',
    backgroundColor: '#b8bcb9'
  },
  dialogContent: {
    padding: '10px 10px',
    paddingBottom: 5,
    backgroundColor: color.cimsBackgroundColor
    // overflowY: 'hidden'
  },
  dialogActions: {
    margin:0,
    padding:'0 15px',
    backgroundColor: color.cimsBackgroundColor
  },
  btnRoot: {
    textTransform: 'none',
    padding: '6px 0px'
  },
  btnSpan: {
    fontSize: font.fontSize
  },
  titleGrid: {
    textAlign: 'right',
    paddingRight: 15
  },
  titleLabel: {
    fontWeight: 'bold'
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  },
  disabledIcon: color.cimsDisableIconColor
});