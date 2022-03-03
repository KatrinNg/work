import { getState } from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: '100%'
  },
  inputProps: {
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
    height: 24,
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
  inputRoot:{
    padding:0,
    textTransform: 'none',
    color:'#0579C8',
    border: '1px solid #0579C8',
    minWidth: 46,
    marginLeft: 4,
    marginTop: 3,
    height: 24
  },
  font_color:{
    color:'#0579C8'
  },
  label: {
    wordBreak: 'break-word',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '-webkit-line-clamp': 3,
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical'
  },
  tooltip: {
    backgroundColor: '#6E6E6E',
    fontSize: '14px',
    fontFamily: font.fontFamily,
    wordBreak:'break-word'
  }
});