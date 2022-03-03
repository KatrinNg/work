import { COMMON_STYLE } from '../../../constants/commonStyleConstant';
import { getState } from '../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const style = {
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
  table_itself: {
    marginTop: -20
  },
  bigContainer: {
    borderRadius: 5,
    marginLeft: 20,
    marginRight: 36,
    marginTop: 8,
    height: 'calc(100% - 10px)',
    overflowY: 'auto',
    backgroundColor: color.cimsBackgroundColor
    // boxShadow:0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)
  },
  customRowStyle: {
    ...standardFont,
    height: '38px',
    whiteSpace: 'pre',
    wordBreak: 'break-word',
    color: color.cimsTextColor
  },
  headRowStyle: {
    backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
  },
  headCellStyle: {
    ...standardFont,
    color: COMMON_STYLE.whiteTitle,
    backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    overflow: 'hidden',
    fontWeight: 'bold',
    position: 'sticky !important',
    top: 158
  },
  wrapper: {
    width: 'calc(100% - 22px)',
    height: 'calc(100% - 167px)',
    position: 'fixed',
    backgroundColor: color.cimsBackgroundColor
  },
  fixedBottom: {
    margin: '10px',
    color: '#6e6e6e',
    position: 'fixed',
    bottom: 0,
    width: '100%',
    zIndex: 100,
    backgroundColor: color.cimsBackgroundColor,
    right: 30
  },
  cardHeader: {
    top: 0,
    position: 'sticky',
    fontFamily: font.fontFamily,
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor
  },
  topDiv: {
    top: 63,
    position: 'sticky',
    height: 96,
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor
  },
  tableDiv: {
    margin: '-6px 2px 0px 2px'
  }
};
