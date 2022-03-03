import {getState} from '../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: 'inherit',
    height: 'inherit',
    overflowX: 'auto',
    minWidth: 1585
  },
  cardWrapper: {
    height: 'inherit',
    borderRadius: 5
    // overflowY: 'auto'
  },
  cardContent: {
    height: 'calc(100% - 20px)',
    paddingTop: 10,
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor,
    '&:last-child':{
      paddingBottom: 10
    }
  }
});