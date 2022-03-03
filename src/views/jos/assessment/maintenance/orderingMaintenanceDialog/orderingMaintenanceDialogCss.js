import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import { getState } from '../../../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = {
  left_Label: {
    ...standardFont,
    color: color.cimsTextColor,
    padding: 6,
    fontWeight: 600
  },
  font_color: {
    ...standardFont,
    color: '#0579c8'
  },
  dialogTitle: {
    backgroundColor: '#b8bcb9',
    padding: '10px 10px 10px 10px',
    color: color.cimsTextColor,
    fontWeight: 500,
    lineHeight: 1.6,
    fontSize: '1.5rem',
    fontFamily: font.fontFamily
  },
  dialogContent: {
    marginBottom: 47,
    backgroundColor: color.cimsBackgroundColor
  },
  fontLabel: {
    ...standardFont
  },
  customRowStyle: {
    ...standardFont,
    color: color.cimsTextColor,
    paddingTop: 4,
    paddingBottom: 0
  },
  headCellStyle: {
    ...standardFont,
    color: COMMON_STYLE.whiteTitle,
    // color: color.cimsBackgroundColor,
    overflow: 'hidden',
    fontWeight: 'bold',
    position: 'sticky !important',
    backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    top: 62,
    paddingTop: 11
  },
  titleDiv: {
    position: 'sticky',
    top: 0,
    backgroundColor: color.cimsBackgroundColor,
    marginTop: -15
  },
  btnGroup: {
    marginLeft: -7,
    backgroundColor: color.cimsBackgroundColor
  }
};
