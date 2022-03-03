import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};
export const styles = () => ({
  paper: {
    minWidth: 700
  },
  dialogTitle: {
    lineHeight: 1.6,
    fontWeight: 'bold',
    fontSize: '1rem',
    fontFamily: font.fontFamily,
    paddingTop: '5px',
    paddingBottom: '5px',
    backgroundColor: '#b8bcb9',
    paddingLeft: 10
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
    backgroundColor: color.cimsBackgroundColor,
    textAlign:'end'
  },
  divPadding: {
    paddingLeft:5,
    paddingTop:10
  },
  divSecondPadding: {
    paddingLeft:7,
    paddingTop:10,
    paddingBottom:10
  }
});