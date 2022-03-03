import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  errorHelper: {
    marginTop: 5,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  dropdown: {
    fontSize: font.fontSize,
    width: 620,
    fontFamily: font.fontFamily
  },
  menuListRoot: {
    backgroundColor:color.cimsBackgroundColor
  }
});
