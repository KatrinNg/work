import { COMMON_STYLE } from '../../../constants/commonStyleConstant';
import { getState } from '../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const style = {
  rootWrapper: {
    backgroundColor: color.cimsBackgroundColor,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    position: 'relative'
  },
  input: {
    ...standardFont,
    color: color.cimsTextColor,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  },
  left_Label: {
    ...standardFont,
    color: color.cimsTextColor,
    padding: 6
  },
  font_color: {
    ...standardFont,
    color: '#0579c8'
  },
  table_head: {
    height: 50,
    paddingLeft: '10px'
  },
  table_header: {
    ...standardFont,
    fontWeight: 600,
    color: COMMON_STYLE.whiteTitle,
    // paddingTop:18,
    paddingLeft: 8,
    border: '1px solid rgba(224, 224, 224, 1)',
    backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    position: 'sticky !important',
    zIndex: 2,
    top: -1
  },
  button: {
    Float: 'center',
    backgroundColor: color.cimsBackgroundColor
  },
  table_row: {
    height: 63,
    cursor: 'pointer',
    backgroundColor: color.cimsBackgroundColor
  },
  table_row_selected: {
    height: 63,
    cursor: 'pointer',
    backgroundColor: 'cornflowerblue'
  },
  table_cell: {
    paddingLeft: '10px',
    width: 5,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    wordBreak: 'break-all',
    border: '1px solid rgba(224, 224, 224, 1)'
  },
  cell_text: {
    textAlign: 'left',
    paddingLeft: '10px',
    padding: '0px 0px 0px 0px',
    width: 20,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    wordBreak: 'break-all',
    border: '1px solid rgba(224, 224, 224, 1)'
  },
  table_cell_1: {
    width: 5,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    wordBreak: 'break-all',
    border: '1px solid rgba(224, 224, 224, 1)'
  },
  paperTable: {
    width: '100%',
    marginTop: 20,
    overflow: 'auto',
    maxHeight: '300px'
  },
  validation: {
    color: '#fd0000',
    margin: '0',
    fontSize: '0.75rem',
    ali: 'left',
    // marginTop: '8px',
    minHeight: '1em',
    display: 'block'
  },
  validation_span: {
    color: '#fd0000',
    margin: '0',
    fontSize: '0.75rem',
    ali: 'left',
    // marginTop: '8px',
    minHeight: '1em',
    marginLeft: '12px',
    lineHeight: '3.2'
  },
  textField: {
    width: '62%'
  },
  btnDiv: {
    margin: '10px',
    borderBottomLeftRadius: '5px',
    borderBottomRightRadius: '5px'
  },
  fontLabel: {
    ...standardFont,
    color: color.cimsTextColor,
    fontStyle: 'normal'
  },
  label: {
    ...standardFont,
    float: 'left',
    padding: '8px 0px 0px 0px'
  },
  floatLeft: {
    float: 'left'
  },
  localTermCheckbox: {
    padding: 5,
    margin: 0
  }
};
