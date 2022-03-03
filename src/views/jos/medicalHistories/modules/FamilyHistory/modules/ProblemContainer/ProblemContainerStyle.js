import { getState } from '../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
  fieldSetWrapper: {
    background: color.cimsBackgroundColor,
    border: '2px solid #b8bcb9',
    borderRadius: '5px',
    padding: '3px 0 0 0'
  },
  legend: {
    fontWeight: 'bold',
    fontSize: font.fontSize
  },
  card: {
    marginBottom: '10px',
    breakInside: 'avoid',
    boxSizing: 'border-box',
    boxShadow: 'none',
    border: '1px solid #0579C8'
  },
  cardList: {
    display: 'flex',
    paddingRight: '10px'
  },
  cardColumn: {
    paddingLeft: '10px',
    backgroundClip: 'padding-box'
  },
  cardContent: {
    padding: '5px 10px',
    backgroundColor: color.cimsBackgroundColor,
    color: color.cimsTextColor,
    '&:last-child':{
      paddingBottom: '5px'
    }
  },
  groupNameTitle: {
    cursor: 'default',
    fontSize: font.fontSize,
    fontWeight: 'bold',
    color: color.cimsTextColor
  },
  tooltip: {
    backgroundColor: '#6E6E6E',
    fontSize: '14px',
    fontFamily: font.fontFamily,
    maxWidth: 800,
    wordBreak: 'break-word'
  },
  textDisplayTitle: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    '&:hover':{
      cursor: 'pointer',
      color:'#0579C8'
    }
  },
  textDisplayDefaultTitle: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    '&:hover':{
      cursor: 'default',
      color:'#0579C8'
    }
  },
  myMasonryGrid: {
    display: 'flex',
    width: 'auto',
    paddingRight: 10
  },
  myMasonryGridColumn: {
    paddingLeft: 10,
    backgroundClip: 'padding-box'
  }
};