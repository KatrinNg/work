import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
  left_Label:
  {
    fontSize: font.fontSize,
    padding: 6,
    fontWeight:600
  },
  font_color: {
    fontSize: font.fontSize,
    color: '#0579c8'
  },
  bigContainer: {
    borderRadius: 5
  },
  table_row_selected: {
    cursor: 'pointer',
    backgroundColor: 'cornflowerblue'
  },
  customRowStyle: {
    height: '38px'
  },
  action_btn:{
    textTransform:'none',
    marginTop:15
  },
  errorHelper: {
    marginTop: 5,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  input: {
    width: 225
  },
  btnSpan: {
    textTransform: 'capitalize',
    fontSize: '1rem',
    color:'#0579c8'
  },
  dialogTitle: {
    backgroundColor:'#b8bcb9',
    padding:'10px 10px 10px 10px',
    color: '#404040',
    fontWeight: 500,
    lineHeight: 1.6,
    fontSize: '1.5rem',
    fontFamily: font.fontFamily
  },
  toolBar: {
    padding: '0px',
    minHeight: 40
  },
  divBorder:{
    padding:'0px 10px 10px 10px',
    backgroundColor:'#b8bcb9'
  },
  dialogContent:{
    backgroundColor:color.cimsBackgroundColor
  },
  fontLabel: {
    fontSize: font.fontSize
  }
};