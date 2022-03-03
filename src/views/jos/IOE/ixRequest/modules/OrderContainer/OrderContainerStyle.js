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
    height: 423
  },
  itemTypography: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  tooltipItemSpan: {
    fontSize: '14px',
    fontFamily: font.fontFamily
    // whiteSpace: 'pre'
  },
  tooltipItemTitleSpan: {
    fontSize: '14px',
    fontFamily: font.fontFamily,
    fontWeight:'bold'
  },
  tooltip: {
    backgroundColor: '#6E6E6E',
    fontSize: '14px',
    fontFamily: font.fontFamily,
    wordBreak:'break-word'
  },
  primaryFab: {
    marginRight: 8,
    '&:hover': {
      backgroundColor: '#0098FF'
    }
  },
  deleteFab: {
    marginRight: -10,
    backgroundColor: '#FD0000',
    '&:hover': {
      backgroundColor: '#FD0000'
    }
  },
  card: {
    marginBottom: 10,
    boxShadow: 'none',
    border: '1px solid #0579C8'
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
      paddingBottom: 5,
      backgroundColor:color.cimsBackgroundColor
    }
  },
  header: {
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
  },
  statusSubmitted:{
    color:'blue',
    marginLeft:6
  },
  statusInvalidated:{
    color:'red',
    marginLeft:6
  },
  statusReportReturned:{
    color:'black',
    marginLeft:6
  }
});
