import { COMMON_STYLE }from '../../../../constants/commonStyleConstant';
import { getState } from '../../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = theme => ({
  tableHeadRow: {
    ...standardFont,
    height: 32,
    paddingLeft: '10px' ,
    fontStyle: 'normal',
    fontWeight: 'bold'
  },
  tableHeadCell: {
    ...standardFont,
    color: COMMON_STYLE.whiteTitle,
    fontWeight: 600,
    // color: color.cimsBackgroundColor,
    paddingLeft:8,
    border: '1px solid rgba(224, 224, 224, 1)',
    borderTop: 0,
    backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    '&:last-child':{
      paddingLeft: 8,
      paddingRight: 8
    }
  },
  tableContentrow: {
    cursor: 'pointer',
    display: 'table-row'
  },
  tableContentCell:{
    ...standardFont,
    color: color.cimsTextColor,
    padding: '0 10px',
    wordWrap: 'break-word',
    wordBreak: 'break-all',
    border: '1px solid rgba(224, 224, 224, 1)',
    '&:last-child':{
      padding: '0 10px'
    }
  },
  odd: {
    backgroundColor: theme.palette.cimsBackgroundColor
  },
  event: {
    backgroundColor: '#D1EEFC'
  },
  bigContainer: {
    borderRadius: 5,
    marginTop: 8,
    //height: 'calc(100% - 10px)',
    overflowY: 'auto',
    backgroundColor: theme.palette.cimsBackgroundColor,
    color: theme.palette.cimsTextColor
  },
  wrapper: {
    width: 'calc(100% - 13px)',
    height: 'calc(100% - 167px)',
    position: 'fixed',
    color: theme.palette.cimsTextColor,
    backgroundColor: theme.palette.cimsBackgroundColor
  },
  topDiv: {
    top: 0,
    position: 'sticky',
    height: 96,
    backgroundColor: theme.palette.cimsBackgroundColor
  },
  fontTitle: {
    fontStyle: font.fontFamily,
    fontSize: '1.5rem',
    paddingLeft: 4
  },
  tableDivider: {
    marginTop: -16,
    marginLeft: -8,
    marginBottom: 4,
    backgroundColor: 'rgba(224, 224, 224, 1)'
  },
  inputLabel: {
    color: `${theme.palette.cimsLabelColor} !important`
  },
  paginationRoot: {
    fontSize: theme.palette.textSize,
    color: theme.palette.cimsTextColor
  },
  caption: {
    color: theme.palette.cimsTextColor,
    fontSize: theme.palette.textSize
  },
  menuItem: {
    backgroundColor: theme.palette.cimsBackgroundColor,
    color: theme.palette.cimsTextColor,
    fontSize: theme.palette.textSize
  }
});