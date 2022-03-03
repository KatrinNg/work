import {getState} from '../../../../../store/util';
const { color,font } = getState(state => state.cimsStyle) || {};

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
    fontSize: '14px !important',
    fontFamily: font.fontFamily,
    padding: '0 !important',
    margin: 0
  },
  background: {
    backgroundColor: 'cornflowerblue'
  }
});