import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: 'inherit',
    height: 'inherit'
    // width: 'calc(100% - 22px)',
    // height: 'calc(100% - 167px)',
    // position: 'fixed'
  },
  cardWrapper: {
    height: 'inherit',
    borderRadius: 5,
    // marginLeft:20,
    // marginRight:20,
    // marginTop:8,
    // height: 'calc(92% - 17px)',
    overflowY: 'auto',
    backgroundColor: color.cimsBackgroundColor
  },
  cardContent: {
    height: 'calc(100% - 20px)',
    paddingTop: 10,
    '&:last-child':{
      paddingBottom: 10
    }
  },
  expansionPanelSummaryRoot: {
    backgroundColor: '#0579c8',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  expansionPanelSummaryIcon: {
    padding: '6px 12px',
    color: '#ffffff',
    marginRight: -19
  },
  expansionPanelSummaryLabel: {
    fontWeight: 'bold',
    color: '#ffffff'
  }
});