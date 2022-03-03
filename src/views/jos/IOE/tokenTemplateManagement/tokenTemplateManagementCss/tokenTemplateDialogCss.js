import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const style = {
  inputStyle: {
    fontWeight: 400,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  templateDetailStyle: {
    fontWeight: 'bold',
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  fullWidth: {
    width: '100%'
  },
  checkBoxGrid: {
    marginTop: '-10px'
  },
  normalFont: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  searchGrid: {
    maxWidth: '39%',
    marginTop: -8
  },
  validation: {
    color: '#fd0000',
    margin: '0',
    fontSize: '0.75rem',
    float: 'left',
    // marginTop: '8px',
    minHeight: '1em',
    display: 'block',
    marginTop: 4,
    marginLeft: 12
  },
  templateDetailValidation: {
    color: '#fd0000',
    margin: '0',
    fontSize: '0.75rem',
    float: 'left',
    // marginTop: '8px',
    minHeight: '1em',
    display: 'block',
    marginTop: 4
  },

  templateDetailValidationFail: {
    margin: '0',
    fontSize: '0.75rem',
    float: 'left',
    // marginTop: '8px',
    minHeight: '1em',
    display: 'block',
    marginTop: 4,
    height: 18
  },

  normal_input: {
    float: 'left'
  },
  fontLabel: {
    fontSize: font.fontSize
  },
  checkBoxSty: {
    margin: 0,
    padding: '5px 14px'
  },
  inputProps: {
    fontSize: font.fontSize,
    color: color.cimsTextColor,
    fontFamily: font.fontFamily
  }
};