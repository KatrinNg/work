import {getState} from '../../../../../../../store/util';
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
    display: 'inline-flex',
    paddingTop: '10px',
    paddingLeft: '7px'
  },
  extraContentLabel: {
    verticalAlign: 'sub',
    color: color.cimsTextColor,
    fontSize: font.fontSize
  },
  coreWrapper: {
    float: 'left'
  },
  inputWrapper: {
    display: 'inline',
    float: 'left'
  },
  abpWrapper: {
    paddingLeft: 5
  },
  bbpWrapper: {
    paddingLeft: 5,
    paddingTop: 20
  },
  abiWrapper: {
    display: 'inline',
    float: 'left',
    marginLeft:19
  },
  icon: {
    fontSize: 50,
    transform: 'rotate(90deg)',
    marginLeft: -15,
    marginTop: 36
  },
  normalInput: {
    width: 80
  },
  abiInput: {
    marginTop:29,
    width:120
  },
  bottomWrapper: {
    float: 'left'
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