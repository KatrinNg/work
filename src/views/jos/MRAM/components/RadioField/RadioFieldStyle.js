import { COMMON_STYLE }from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  radioGroupDiv:{
    marginLeft:10
  },
  radioGroup: {
    display: 'inherit'
  },
  normalFont: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor,
    marginRight: 10
  },
  disabledLabel: {
    color: `${COMMON_STYLE.disabledColor} !important`
  }
});