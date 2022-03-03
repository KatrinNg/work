import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    float: 'left',
    padding: '5px 5px'
  },
  floatLeft: {
    float: 'left'
  },
  label: {
    float: 'left',
    fontWeight: 'bold',
    paddingRight: 10
  },
  activeWrapper: {
    paddingLeft: 100,
    marginTop: -15
  },
  checkbox: {
    padding: 0
  },
  required: {
    color: '#ff0000'
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  errorWrapper: {
    height: 18
  },
  helperError: {
    marginTop: 2,
    fontSize: `${font.fontSize} !important`,
    fontFamily: font.fontFamily,
    padding: '0 !important',
    marginLeft: 133
  },
  errorIcon: {
    fontSize: 14,
    width: '1rem',
    height: '1rem'
  },
  inputProps: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  }
});