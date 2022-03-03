import {getState} from '../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: 'calc(100% - 22px)',
    height: 'calc(100% - 167px)',
    position: 'fixed'
  },
  cardWrapper: {
    margin: '8px 0px 0px 20px',
    marginRight: 20,
    height: 'calc(100% - -8px)',
    backgroundColor: color.cimsBackgroundColor
    // overflowY: 'auto'
  },
  selectLabel: {
    float: 'left',
    paddingTop: '3px',
    paddingRight: '10px',
    fontFamily: font.fontFamily,
    fontWeight: 'bold'
  },
  tableWrapper: {
    padding: '0px 16px 0px 16px',
    backgroundColor: color.cimsBackgroundColor
  },
  topBtnContainer: {
    marginBottom: 10
  },
  btnSpan: {
    fontSize: font.fontSize,
    textTransform: 'capitalize',
    color:'#0579c8'
  },
  table: {
    width: '100%'
  },
  titleDiv: {
    padding: '16px',
    fontSize: ' 1.5rem',
    fontFamily: font.fontFamily
  },
  toolBar: {
    padding: '0px',
    minHeight: 40,
    backgroundColor: color.cimsBackgroundColor
  },
  iconBtn: {
    color: 'inherit'
  },
  cardContent: {
    padding: '0px'
  },
  btnAdd: {
    padding: '0xp'
  },
  btnDiv:{
    margin:'10px'
  },
  fixedBottom: {
    color: '#6e6e6e',
    position:'fixed',
    bottom: 0,
    width: '100%',
    zIndex: 100,
    backgroundColor: color.cimsBackgroundColor,
    right: 30
  },
  fontLabel: {
    fontSize: font.fontSize
  }
});
