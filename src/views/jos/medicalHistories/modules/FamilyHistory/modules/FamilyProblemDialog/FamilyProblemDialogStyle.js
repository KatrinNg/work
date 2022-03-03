import {getState} from '../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  paper: {
    minWidth: 1700,
    maxWidth: '90%',
    height: '85%'
  },
  dialogTitle: {
    lineHeight: 1.6,
    fontWeight: 'bold',
    fontSize: '1.5rem',
    fontFamily: font.fontFamily,
    paddingTop: '5px',
    paddingBottom: '5px',
    backgroundColor: '#b8bcb9'
  },
  dialogContent: {
    padding: '10px 10px',
    paddingBottom: 5,
    backgroundColor: color.cimsBackgroundColor,
    height: '100%'
  },
  contentPaper: {
    color: color.cimsTextColor,
    backgroundColor:color.cimsBackgroundColor,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  dialogActions: {
    margin:0,
    padding:'0 15px',
    backgroundColor:color.cimsBackgroundColor
  },
  titleGrid: {
    textAlign: 'right',
    paddingRight: 15
  },
  titleLabel: {
    fontWeight: 'bold'
  },
  relationshipLabel: {
    paddingLeft: 10,
    fontWeight: 'bold'
  }
});