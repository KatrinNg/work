import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
  paper: {
    borderRadius:5,
    minWidth: '85%',
    maxWidth: '100%',
    height: 800
  },
  dialogTitle: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    paddingLeft: '24px',
    padding: '0px 24px 0px 0px',
    color: color.cimsTextColor,
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.6,
    fontFamily: font.fontFamily,
    cursor: 'move',
    backgroundColor: color.cimsBackgroundColor,
    height: 8
  },
  formControlCss: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: 'gray',
    padding: '0px 10px 10px 10px'
  },
  formControl2Css: {
    backgroundColor: color.cimsBackgroundColor
  },
  formControl: {
    width: 212
  },
  divContent: {
    borderRadius: 4,
    padding: '0px 8px 8px 8px',
    backgroundColor: color.cimsBackgroundColor,
    minWidth: 1140
  }
};