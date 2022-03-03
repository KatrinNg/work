import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  paper: {
    minWidth: 1600
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
    padding: '10px 10px',
    paddingBottom: 5,
    backgroundColor: color.cimsBackgroundColor
    // overflowY: 'hidden'
  },
  dialogActions: {
    margin:0,
    padding:'0 15px',
    backgroundColor: color.cimsBackgroundColor
  }
});