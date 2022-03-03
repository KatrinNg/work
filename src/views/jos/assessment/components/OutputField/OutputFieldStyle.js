import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  unit_span: {
    marginLeft: 5,
    float: 'left'
  },
  field_outputbox: {
    fontSize: font.fontSize,
    fontFamily: 'Arial'
  },
  abnormal: {
    borderRadius: 5,
    width: 70,
    padding: '7px 14px 3px 14px',
    backgroundColor: color.cimsDisableColor,
    border: '1px solid',
    color: '#fd0000 !important',
    float: 'left',
    height: 27
  },
  normal: {
    borderRadius: 5,
    width: 70,
    padding: '7px 14px 3px 14px',
    backgroundColor: color.cimsDisableColor,
    float: 'left',
    border: '1px solid #c4c4c4',
    height: 27
  },
  unit_wrapper: {
    float: 'left',
    marginTop: '5px'
  }
});
