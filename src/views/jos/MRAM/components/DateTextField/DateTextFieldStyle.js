import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
  fullwidth: {
    width: '100%'
  },
  helper_error: {
    marginTop: 1,
    fontSize: `${font.fontSize} !important`,
    fontFamily: font.fontFamily,
    padding: '0 !important'
  },
  input: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  }
};