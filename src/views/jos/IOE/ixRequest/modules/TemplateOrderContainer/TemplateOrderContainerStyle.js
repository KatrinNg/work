import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: '100%',
    height: 335,
    // height: 345,
    overflowY: 'hidden',
    paddingRight: 5
  },
  wrapperHidden: {
    height: 435
  },
  cardContainer: {
    columnCount: '3',
    columnGap: 0,
    height: 370,
    paddingTop: 5
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
    fontSize: font.fontSize,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center'
  },
  itemTypography: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  selectAllBar: {
    paddingTop: 5,
    paddingLeft: 13
  },
  hidden: {
    display: 'none'
  },
  formGroupRow: {
    width: '100%'
  },
  formControlRoot: {
    width: '100%'
  },
  formControlLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%'
  },
  itemFormControlRoot: {
    width: '100%',
    alignItems: 'unset'
  },
  itemFormControlLabel: {
    width: '100%'
  },
  rootCheckbox: {
    padding: '0 5px'
  },
  infoIcon: {
    color: '#0579c8',
    cursor: 'auto',
    paddingLeft: 5,
    position: 'relative'
  },
  tooltipItemSpan: {
    fontSize: '14px',
    fontFamily: font.fontFamily
  },
  tooltipItemSpanLabel: {
    fontSize: '14px',
    fontFamily: font.fontFamily,
    fontWeight:'bold'
  }
});
