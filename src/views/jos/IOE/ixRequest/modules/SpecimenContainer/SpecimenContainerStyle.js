import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    height: 350,
    overflowY: 'hidden',
    paddingRight: 5
  },
  wrapperHidden: {
    height: 348
  },
  cardContainer: {
    columnCount: '1',
    columnGap: 0,
    height: 384,
    paddingTop: 10
  },
  cardContainerHidden: {
    height: 386
  },
  card: {
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    breakInside: 'avoid',
    boxShadow: 'none',
    border: '1px solid #0579C8'
  },
  cardContent: {
    padding: '5px 10px',
    '&:last-child':{
      paddingBottom: '5px',
      backgroundColor:color.cimsBackgroundColor
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
  }
});