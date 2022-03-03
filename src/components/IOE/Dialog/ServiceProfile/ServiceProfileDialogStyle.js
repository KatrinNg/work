import {getState} from '../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  paper: {
    minWidth: 1700
  },
  dialogTitle: {
    lineHeight: 1.6,
    fontWeight: 'bold',
    fontSize: '1.5rem',
    fontFamily: font.fontSize,
    paddingTop: '5px',
    paddingBottom: '5px',
    backgroundColor: '#b8bcb9'
  },
  dialogContent: {
    padding: '10px 24px',
    backgroundColor: color.cimsBackgroundColor,
    overflowY: 'hidden'
  },
  dialogActions: {
    margin:0,
    padding:10,
    paddingTop: '5px',
    backgroundColor: color.cimsBackgroundColor
  },
  remark: {
    margin: 0,
    marginLeft: 14
  },
  itefSign:{
    color: '#0579c8'
  },
  iteoSign:{
    color: '#4caf50'
  },
  gridContainer:{
    backgroundColor:color.cimsBackgroundColor
  }
});