import {getState} from '../../../../../../store/util';
const { font,color } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  flexCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  label: {
    float: 'left',
    paddingRight: 10
  },
  floatLeft: {
    float: 'left'
  },
  paddingLeftDiv: {
    paddingLeft: 15
  },
  marginBottomDiv: {
    marginBottom: 5
  },
  clinicNoLabel: {
    paddingLeft:5,
    minWidth: 120
  },
  fullWidth: {
    width: '100%'
  },
  rootCheckbox: {
    padding: 0
  },
  requiredSpan: {
    color: '#FD0000'
  },
  inputStyle:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  }
});