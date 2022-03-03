import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  abnormal: {
    color: '#fd0000 !important'
  },
  helper_error: {
    marginTop: 0,
    fontSize: `${font.fontSize} !important`,
    fontFamily: font.fontFamily,
    padding: '0 !important'
  },
  error_icon: {
    // fontSize: '14px'
    width: '1.125rem',
    height: '1.125rem'
  },
  wrapper: {
    display: 'initial',
    float: 'left'
  },
  extraContent: {
    display:'inline-flex',
    paddingTop:'10px',
    paddingLeft:'7px'
  },
  extraContentLabel:{
    verticalAlign:'sub',
    fontSize: font.fontSize,
    color: color.cimsTextColor
  },
  input: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  },
  disabled: {
    backgroundColor: color.cimsDisableColor
  }
});