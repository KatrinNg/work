import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
  fullWidth: {
    width: '100%'
  },
  unit_wrapper: {
    display: 'inline-grid'
  },
  unit_span: {
    fontSize:'1rem',
    marginTop: '8px',
    marginLeft: '5px'
  },
  abnormal: {
    color: '#fd0000 !important'
  },
  helper_error: {
    marginTop: 0,
    fontSize: '1rem !important',
    fontFamily: 'Arial',
    padding: '0 !important'
  },
  time_field: {
    width: 'inherit'
  },
  time_helper_error: {
    marginTop: 1,
    fontSize: '1rem !important',
    fontFamily: 'Arial',
    padding: '0 !important'
  },
  time_field_wrapper: {
    width: '120px',
    paddingTop: '2px'
  },
  string_field_wrapper: {
    // width: '120px',
    paddingTop: '5px',
    display: 'initial',
    float: 'left'
  },
  double_wrapper_1: {
    display: 'initial',
    float: 'left'
  },
  double_wrapper_2: {
    display: 'initial',
    paddingLeft: '5px'
  },
  normal_input: {
    width: '100px'
  },
  normal_inputRemark:{
    width:'100%',
    minWidth:100
  },
  helper_wrapper: {
    paddingLeft: '115px'
  },
  error_icon: {
    fontSize: '14px',
    width:'1rem',
    height:'1rem'
  },
  input: {
    fontSize: font.fontSize,
    fontFamily: 'Arial',
    color: color.cimsTextColor,
    whiteSpace: 'break-spaces'
  }
};
