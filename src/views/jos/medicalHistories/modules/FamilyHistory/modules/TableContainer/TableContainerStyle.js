import {getState} from '../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
  container: {
    backgroundColor: color.cimsBackgroundColor
  },
  btnRoot: {
    textTransform: 'none',
    padding: '6px 0px'
  },
  btnSpan: {
    fontSize: font.fontSize
  },
  label: {
    fontWeight: 'bold'
  },
  disabledIcon: color.cimsDisableIconColor
};