// import { getState } from '../../../../store/util';
// const { color, font } = getState((state) => state.cimsStyle) || {};

export const styles = (theme) => ({
  card: {
    color: theme.palette.cimsTextColor,
    backgroundColor: theme.palette.cimsBackgroundColor,
    '& input:-webkit-autofill': {
      boxShadow: 'inset 0 0 0 1000px rgb(250,250,250, 0) !important',
      WebkitBackgroundClip: 'text'
    }
  },
  gridWrapper: {
    // height:'calc(100% - 87px)',
    marginBottom: 0,
    overflowX: 'auto',
    padding: 0
  },
  fontTitle: {
    // fontStyle: 'Arial',
    fontSize: '1.5rem',
    paddingLeft:4
  },
  cardContent: {
    height:'100%',
    padding:'0!important'
    // paddingRight:0,
    // paddingLeft:0,
    // '&:last-child':{
    //   paddingBottom: 10,
    //   paddingTop: 0
    // }
  },
  title: {
    margin: '5px 0',
    fontSize: 24,
    fontWeight: 'bold'
  }
});

