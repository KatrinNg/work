
import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  errorHelper: {
    marginTop: 5,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  dropdown: {
    fontSize:font.fontSize,
    width: '170px'
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  }
});
