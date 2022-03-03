import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  textField: {
    width: '100%'
  },
  input: {
    width: '100%',
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  },
  paddingRightNone: {
    paddingRight: 0
  }
});