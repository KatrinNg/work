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
    backgroundColor: color.cimsBackgroundColor,
    overflowY: 'hidden',
    paddingBottom: 2
  },
  dialogActions: {
    margin:'0px' ,
    padding:'0 10px' ,
    backgroundColor:color.cimsBackgroundColor
  },
  pagerContent:{
    backgroundColor: color.cimsBackgroundColor
  },
  itemWrapper: {
    width: '100%',
    display: 'flex',
    alignItems:' center',
    margin:'5px 0',
    '&:last-child':{
      marginBottom: 10
    }
  },
  itemNameGrid:{
    maxWidth: '28%',
    flexBasis: '28%'
  },
  itemNameTypography: {
    fontFamily: font.fontFamily,
    fontWeight: 'bold',
    padding: '0 10px'
  },
  itemGrid: {
    width: '105%'
  },
  btnRoot: {
    margin: theme.spacing()
  },
  btnLabel: {
    fontSize: '16px',
    fontFamily: font.fontFamily,
    textTransform: 'capitalize'
  }
});
