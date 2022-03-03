import {getState} from '../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: '100%',
    display: 'initial',
    float: 'left'
  },
  helper_error: {
    marginTop: 0,
    fontSize: `${font.fontSize} !important`,
    fontFamily: font.fontFamily,
    padding: '0 !important'
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color:color.cimsTextColor
  }
});