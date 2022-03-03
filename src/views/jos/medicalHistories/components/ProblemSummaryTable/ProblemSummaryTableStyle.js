import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import { getState } from '../../../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

export const styles = () => ({
  tableContainer: {
    width: '100%',
    overflow: 'auto',
    maxHeight: 257
  },
  tableViewContainer: {
    maxHeight: 577
  },
  tableDivider: {
    marginTop: -16,
    marginLeft: -8,
    marginBottom: 4,
    backgroundColor: 'rgba(224, 224, 224, 1)'
  },
  tableHeadRow: {
    height: 32,
    paddingLeft: '10px',
    fontStyle: 'normal',
    fontSize: font.fontSize,
    fontWeight: 'bold'
  },
  tableHeadCell: {
    fontSize: font.fontSize,
    fontWeight: 600,
    fontFamily: font.fontFamily,
    color: COMMON_STYLE.whiteTitle,
    padding: '0 8px',
    // paddingLeft: 8,
    border: '1px solid rgba(224, 224, 224, 1)',
    borderTop: 0,
    backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    '&:last-child': {
      paddingLeft: 8,
      paddingRight: 8
    }
  },
  tableContentrow: {
    height: 32,
    cursor: 'pointer',
    display: 'table-row'
  },
  tableContentRowSelected: {
    backgroundColor: 'cornflowerblue'
  },
  tableContentCell: {
    color: color.cimsTextColor,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    padding: '0 10px',
    width: 5,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    wordBreak: 'break-all',
    border: '1px solid rgba(224, 224, 224, 1)',
    '&:last-child': {
      padding: '0 10px'
    }
  },
  displayLabel: {
    '-webkit-line-clamp': 3,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
    display: '-webkit-inline-box'
  },
  tooltip: {
    backgroundColor: '#6E6E6E',
    fontSize: '14px',
    fontFamily: font.fontFamily,
    maxWidth: 800,
    wordBreak: 'break-word',
    whiteSpace: 'pre-line',
    wordWrap: 'break-word'
  },
  detailLabel: {
    margin: '6px 0'
  },
  tableCellRow: {
    textAlign: 'center',
    backgroundColor: color.cimsBackgroundColor
  }
});
