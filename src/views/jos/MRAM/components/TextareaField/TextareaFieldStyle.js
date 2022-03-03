import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  textBox: {
    resize: 'none',
    border: '1px solid rgba(0,0,0,0.42)',
    height: '75px',
    width: 'calc(100% - 6px)',
    borderRadius: '5px',
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    '&:hover': {
        outline: 'none',
        border: '1px solid black'
      },
    '&:focus': {
      outline: 'none',
      border: '2px solid #0579C8'
    },
    boxShadow:
      '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)'
  },
  disabled: {
    backgroundColor: color.cimsDisableColor
  }
});