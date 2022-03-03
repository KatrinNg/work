export const styles = () => ({
  wrapper: {
    // width: 'calc(100% - 22px)',
    // height: 'calc(100% - 167px)',
    // position: 'fixed'
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  cardWrapper: {
    borderRadius: 5,
    marginRight:10,
    height: '100%'
    // height: 'calc(98% - 98px)',
    // overflowY: 'auto'
  },
  cardContent: {
    height: '100%',
    padding: 0,
    '&:last-child':{
      paddingBottom: 0
    }
  }
});