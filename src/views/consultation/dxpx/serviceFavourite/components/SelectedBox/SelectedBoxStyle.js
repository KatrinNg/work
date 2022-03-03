import { COMMON_STYLE } from '../../../../../../constants/commonStyleConstant';
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
    color: color.cimsTextColor,
    fontWeight: 'bold'
  },
  wrapper: {
    height: '84px',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: '10px',
    backgroundColor: color.cimsBackgroundColor
  },
  chip: {
    maxWidth: '208px',
    margin: '5px 3px'
  },
  tooltip: {
    ...standardFont,
    marginTop: '2px',
    backgroundColor: '#6E6E6E',
    // fontSize: '14px',
    // fontFamily: 'Arial',
    maxWidth: 'none',
    whiteSpace:'pre-wrap'
  },
  label:{
    ...standardFont,
    color: COMMON_STYLE.whiteTitle,
    display:'inline-block',
    overflow:'hidden',
    textOverflow:'ellipsis',
    whiteSpace:'pre-wrap'
  }
});

