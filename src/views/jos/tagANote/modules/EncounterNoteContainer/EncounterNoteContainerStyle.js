export const styles = () => ({
  pastEncounterDiv: {
    backgroundColor: '#ccc',
    paddingRight: 10,
    border: '1px solid rgba(0, 0, 0, 0.5)',
    borderLeft:'unset'
  },
  title: {
    fontWeight: 'bold',
    margin: 5,
    fontSize: 24
  },
  btnGroup: {
    float: 'right'
  },
  content: {
    overflowY: 'auto',
    position: 'relative'
  },
  primaryFab: {
    marginRight: 5,
    width: 25,
    height: 25,
    minHeight: 25,
    '&:hover': {
      backgroundColor: '#0098FF'
    }
  },
  backfabIcon: {
    width: '1rem',
    height: '1rem',
    paddingLeft: 7
  }
});