import { COMMON_STYLE }from '../../../../../../constants/commonStyleConstant';
import { getState } from '../../../../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = () => ({
  fieldSetWrapper: {
    background: color.cimsBackgroundColor,
    border: '2px solid #b8bcb9',
    borderRadius: '5px',
    width: '100%',
    minWidth: '880px'
  },
  legend: {
    ...standardFont,
    fontWeight: 'bold'
  },
  wrapper: {
    height: '307px',
    overflowY: 'hidden',
    paddingRight: '10px',
    background: color.cimsBackgroundColor
  },
  cardContainer: {
    columnCount: '1',
    height: 290,
    columnGap: '10px',
    display: 'table-caption'
    // columnWidth: 393
  },
  card: {
    marginBottom: '10px',
    // breakInside: 'avoid',
    boxSizing: 'border-box',
    boxShadow: 'none',
    border: '1px solid #0579C8'
  },
  cardContent: {
    ...standardFont,
    padding: '5px 10px',
    background: color.cimsBackgroundColor,
    color: color.cimsTextColor,
    '&:last-child': {
      paddingBottom: '5px'
    }
  },
  groupNameTitle: {
    ...standardFont,
    cursor: 'default',
    fontWeight: 'bold'
  },
  templateDisplayTitle: {
    ...standardFont,
    '&:hover': {
      cursor: 'pointer',
      color: '#0579C8'
    }
  },
  selectedTemplateDisplayTitle: {
    ...standardFont,
    color: COMMON_STYLE.whiteTitle,
    '&:hover': {
      cursor: 'pointer'
    }
  },
  tooltip: {
    backgroundColor: '#6E6E6E',
    ...standardFont,
    // fontSize: '14px',
    // fontFamily: 'Arial',
    maxWidth: 'none',
    whiteSpace: 'pre-wrap'
  },
  selectedTemplateWrapper: {
    backgroundColor: '#0579C8'
  },
  title: {
    ...standardFont,
    fontStyle: 'normal'
  }
});
