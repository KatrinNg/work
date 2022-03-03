import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  errorHelper: {
    marginTop: 5,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  inputProps: {
    width: 225,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  },
  input: {
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  }
});
