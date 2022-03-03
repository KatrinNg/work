export const styles = theme => ({
  paper: {
    minWidth: 800
  },
  dialogTitle: {
    borderTopLeftRadius:'5px',
    borderTopRightRadius:'5px',
    paddingTop: '5px',
    paddingBottom: '5px',
    backgroundColor: '#b8bcb9',
    color: '#404040',
    fontSize: '24px',
    fontWeight: 500,
    lineHeight: 1.6,
    fontFamily: 'Arial'
  },
  dialogContent: {
    backgroundColor:'white',
    padding: '0px 14px 0px',
    '&:first-child': {
      paddingTop: 0
    }
  },
  btnRoot: {
    margin: theme.spacing()
  },
  btnLabel: {
    fontSize: '16px',
    fontFamily: 'Arial',
    textTransform: 'capitalize'
  },
  btnIcon: {
    paddingRight: '3px'
  },
  gridWrapper: {
    boxSizing: 'border-box',
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: '15px'
  },
  gridXs12: {
    marginTop: '2vh'
  },
  dialogAcitons:{
    margin:0,
    backgroundColor: 'white',
    padding:'8px 4px'
  },
  dialogBorder:{
    backgroundColor: '#b8bcb9',
    padding:'0px 10px 10px 10px'
  }
});
