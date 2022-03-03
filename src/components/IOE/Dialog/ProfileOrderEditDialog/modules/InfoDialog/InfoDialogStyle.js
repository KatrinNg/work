export const styles = theme => ({
  paper: {
    minWidth: 600
  },
  dialogTitle: {
    lineHeight: 1.6,
    fontWeight: 'bold',
    fontSize: '1.5rem',
    fontFamily: 'Arial',
    paddingTop: '5px',
    paddingBottom: '5px',
    backgroundColor: '#b8bcb9'
  },
  dialogContent: {
    padding: '10px 24px',
    backgroundColor: 'white',
    overflowY: 'hidden',
    paddingBottom: 2
  },
  dialogActions: {
    margin:'0px' ,
    padding:'0 10px' ,
    backgroundColor:'white'
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
    fontFamily: 'Arial',
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
    fontFamily: 'Arial',
    textTransform: 'capitalize'
  }
});
