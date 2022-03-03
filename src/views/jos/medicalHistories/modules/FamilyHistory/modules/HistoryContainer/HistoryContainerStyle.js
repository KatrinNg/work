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
  btnGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor:color.cimsBackgroundColor
  },
  form: {
    width: '15%',
    float: 'left',
    minWidth: 200,
    paddingLeft: 10
  },
  disabledIcon: color.cimsDisableIconColor
});