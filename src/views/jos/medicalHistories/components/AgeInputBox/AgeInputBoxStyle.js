import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: '100%',
    borderRadius: 4
  },
  inputField: {
    width: '100%',
    borderRadius: 4,
    backgroundColor: color.cimsBackgroundColor
  },
  helperTextError: {
    marginTop: 0,
    fontSize: '14px !important',
    fontFamily: font.fontFamily,
    padding: '0 !important'
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor,
    borderRadius: 4
  },
  background: {
    backgroundColor: 'cornflowerblue'
  }
});