import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = theme => ({
  paper: {
    minWidth: 600
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
    padding: '10px 24px',
    backgroundColor: color.cimsBackgroundColor
    // overflowY: 'hidden'
  },
  dialogActions: {
    margin:'0px' ,
    padding:'0 10px' ,
    backgroundColor:color.cimsBackgroundColor
  },
  btnRoot: {
    margin: theme.spacing()
  },
  btnLabel: {
    fontSize: '16px',
    fontFamily: font.fontFamily,
    textTransform: 'capitalize'
  },
  errorCard: {
    border: '1px solid #FD0000 !important'
  },
  card: {
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    boxShadow: 'none',
    border: '1px solid #0579C8',
    height: 'max-content'
  },
  cardContent: {
    padding: '5px 10px',
    '&:last-child':{
      paddingBottom: '5px',
      backgroundColor:color.cimsBackgroundColor
    }
  },
  groupNameTitle: {
    cursor: 'default',
    fontSize: font.fontSize,
    fontWeight: 'bold'
  },
  questionWrapper: {
    clear: 'both'
  },
  componentWrapper: {
    float: 'left'
  },
  requiredFlag: {
    color: '#FD0000'
  },
  displayNone: {
    display: 'none'
  },
  errorSpan: {
    fontSize: 14,
    color: '#FD0000',
    fontWeight: 100
  },
  errorTip: {
    color: '#FD0000',
    paddingLeft: 10
  }
});
