import {getState} from '../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    height: 400,
    overflowY: 'hidden',
    paddingRight: 5
  },
  wrapperHidden: {
    height: 435
  },
  cardContainer: {
    columnCount: '3',
    columnGap: 0,
    height: 384,
    paddingTop: 10
  },
  cardContainerHidden: {
    height: 410
  },
  card: {
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    boxShadow: 'none',
    border: '1px solid #0579C8',
    height: 'max-content'
  },
  cardContent: {
    padding: '5px 10px',
    '&:last-child':{
      paddingBottom: '5px',
      backgroundColor: color.cimsBackgroundColor
    }
  },
  groupNameTitle: {
    cursor: 'default',
    fontSize: font.fontSize,
    fontWeight: 'bold'
  },
  itemWrapperDiv: {
    display: 'flex',
    flexDirection: 'row'
  },
  itemTypography: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  checkBoxDiv: {
    float: 'left'
  },
  checkBoxDivWithSign: {
    width: 52
  },
  formItemDiv: {
    paddingLeft: 5,
    width: '100%'
  },
  title: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  hiddenTitle: {
    display: 'none'
  },
  checkBoxWrapper: {
    float: 'left'
  },
  signWrapper: {
    float: 'left',
    paddingTop: 2
  },
  ITEFSign: {
    color: '#0579c8'
  },
  ITEOSign: {
    color: '#4caf50'
  }
});
