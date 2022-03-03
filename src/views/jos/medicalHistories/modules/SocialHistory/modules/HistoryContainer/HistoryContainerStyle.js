import {getState} from '../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  btnRoot: {
    textTransform: 'none',
    padding: '6px 0px'
  },
  btnSpan: {
    fontSize: font.fontSize
  },
  divBack:{
    backgroundColor:color.cimsBackgroundColor
  },
  disabledIcon: color.cimsDisableIconColor
});