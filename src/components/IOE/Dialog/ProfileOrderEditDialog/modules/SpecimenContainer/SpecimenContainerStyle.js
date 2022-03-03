import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    height: 528,
    overflowY: 'hidden',
    paddingRight: 5
  },
  wrapperHidden: {
    height: 535
  },
  cardContainer: {
    columnCount: '1',
    columnGap: 0,
    height: 515,
    paddingTop: 5
  },
  cardContainerHidden: {
    height: 510
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
      backgroundColor:color.cimsBackgroundColor,
      paddingBottom: '5px'
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
    textAlign: 'center',
    paddingTop: 5
  },
  hiddenTitle: {
    display: 'none'
  }
});