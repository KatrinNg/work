import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  title: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    fontWeight: 'bold'
  },
  orderWrapper: {
    padding: 10,
    overflowY: 'auto',
    height: 608
  },
  itemTypography: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  tooltipItemSpan: {
    fontSize: '14px',
    fontFamily: font.fontFamily
  },
  tooltipItemTitleSpan: {
    fontSize: '14px',
    fontFamily: font.fontFamily,
    fontWeight:'bold'
  },
  tooltip: {
    backgroundColor: '#6E6E6E',
    fontSize: '14px',
    fontFamily: font.fontFamily
  },
  primaryFab: {
    '&:hover': {
      backgroundColor: '#0098FF'
    }
  },
  deleteFab: {
    backgroundColor: '#FD0000',
    '&:hover': {
      backgroundColor: '#FD0000'
    }
  },
  card: {
    marginBottom: 10,
    boxShadow: 'none',
    border: '1px solid #0579C8',
    backgroundColor:color.cimsBackgroundColor
  },
  cardHeader: {
    padding: '0 10px',
    paddingLeft: 5,
    backgroundColor: '#0579C8'
  },
  cardContent: {
    padding: '5px 10px',
    paddingLeft: 5,
    '&:last-child':{
      paddingBottom: 5
    }
  },
  header: {
    marginTop: 12,
    paddingLeft: 10
  },
  itemWrapper: {
    minHeight: 65
  },
  lastGridItem: {
    marginRight: -10
  },
  orderTitle: {
    fontWeight: 'bold',
    color: '#ffffff'
  }
});
