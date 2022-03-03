import {getState} from '../../../../../../../store/util';
const { color,font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: '100%'
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  }
});