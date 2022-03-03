import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: 'inherit',
    borderRadius: 4
  },
  inputProps: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    backgroundColor: color.cimsBackgroundColor,
    borderRadius: 4
  }
});
