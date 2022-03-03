import {getState} from '../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    height: '100%'
    // width: 'calc(100% - 22px)',
    // height: 'calc(100% - 206px)',
    // position: 'fixed',
    // minWidth: 1280
  },
  cardWrapper: {
    height: '100%',
    margin: '-6px 0px 0px 0px',
    overflowX: 'auto',
    backgroundColor:color.cimsBackgroundColor
  },
  cardContent: {
    minWidth: 1700,
    padding: 5,
    paddingTop: 6,
    '&:last-child':{
      paddingBottom: 5,
      backgroundColor:color.cimsBackgroundColor
    }
  },
  btnGroup: {
    color: '#6e6e6e',
    position:'fixed',
    bottom: 0,
    width: '100%',
    zIndex: 100,
    backgroundColor: color.cimsBackgroundColor,
    right: 30
    // margin: 10
  },
  remark: {
    margin: 0
  },
  itefSign:{
    color: '#0579c8'
  },
  iteoSign:{
    color: '#4caf50'
  },
  specimenCollctionDiv: {
    paddingRight: 12,
    marginTop: 1
  },
  specimenCollctionWrapper: {
    height: 65,
    display: 'flex',
    alignItems: 'center',
    minWidth: 725
    // marginRight: 5,
    // paddingRight: 12
  }
});