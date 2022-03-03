import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: '100%'
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  },
  root: {
    padding: 0,
    textTransform: 'none',
    border: '1px solid #0579C8',
    minWidth: 46,
    marginLeft: 2,
    marginTop:3,
    height: 33,
    color:'#0579C8'
  },
  disabled: {
    boxShadow: 'none',
    backgroundColor: color.cimsDisableColor,
    border: '1px solid #d5d5d5'
  },
  itemWrapperDiv: {
    display: 'flex',
    flexDirection: 'row'
  },
  font_color:{
    color:'#0579C8'
  }
});