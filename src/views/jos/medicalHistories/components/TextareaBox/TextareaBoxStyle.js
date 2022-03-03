import {getState} from '../../../../../store/util';
const { color,font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: '100%',
    borderRadius: 4
  },
  inputField: {
    width: '100%'
  },
  multilineInput: {
    backgroundColor: color.cimsBackgroundColor,
    padding: '5px 10px',
    borderRadius: 4
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor,
    borderRadius: 4
  },
  helperTextError: {
    marginTop: 0,
    fontSize: '14px !important',
    fontFamily: font.fontFamily,
    padding: '0 !important'
  },
  background: {
    backgroundColor: 'cornflowerblue'
  }
});