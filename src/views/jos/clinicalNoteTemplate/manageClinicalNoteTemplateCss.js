import { COMMON_STYLE } from '../../../constants/commonStyleConstant';
import { getState } from '../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const style = {
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    height: 25,
    borderRadius: 0
  },
  favorite_category: {
    color: color.cimsTextColor,
    width: 'calc(100%-20px)',
    padding: 5
  },
  left_Label: {
    ...standardFont,
    padding: 6,
    color: color.cimsTextColor,
    display: 'flex',
    alignItems: 'center'
  },
  font_color: {
    ...standardFont,
    color: '#0579c8'
  },
  table_itself: {
    boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)'
  },
  table_head: {
    height: 50,
    paddingLeft: '10px',
    fontStyle: 'normal',
    fontSize: '13px',
    fontWeight: 'bold'
    // color: color.cimsBackgroundColor
  },
  table_header: {
    ...standardFont,
    fontWeight: 600,
    color: COMMON_STYLE.whiteTitle,
    paddingTop: 5,
    paddingLeft: 8,
    position: 'sticky!important',
    top: 186,
    backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
  },
  table_row: {
    height: 31,
    cursor: 'pointer',
    backgroundColor: color.cimsBackgroundColor
  },
  table_row_selected: {
    height: 31,
    cursor: 'pointer',
    backgroundColor: 'cornflowerblue'
  },
  table_cell: {
    ...standardFont,
    color: color.cimsTextColor,
    paddingLeft: '10px',
    width: 5,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  cell_text: {
    ...standardFont,
    color: color.cimsTextColor,
    paddingLeft: '30px',
    width: 20,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  table_cell_1: {
    ...standardFont,
    color: color.cimsTextColor,
    width: 5,
    whiteSpace: 'pre-line',
    wordWrap: 'break-word',
    wordBreak: 'break-all'
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    // marginTop: theme.spacing(1),
    left: 0,
    right: 0
  },
  chip: {
    // margin: theme.spacing(0.5, 0.25),
  },
  container: {
    flexGrow: 1,
    position: 'relative'
  },
  inputRoot: {
    flexWrap: 'wrap'
  },
  inputInput: {
    width: 'auto',
    flexGrow: 1
  },
  filterInout: {
    // position: 'relative'
  },
  tbNoData: {
    ...standardFont,
    fontWeight: 400,
    lineHeight: 1.6,
    padding: 10,
    '&:last-child': {
      padding: 10
    }
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 'fit-content'
  },
  validation: {
    color: '#fd0000',
    margin: '0',
    fontSize: '0.75rem',
    ali: 'left',
    marginTop: '8px',
    minHeight: '1em',
    display: 'block'
  },
  templatetitle: {
    ...standardFont,
    color: color.cimsTextColor
  },
  dialogTitle: {
    paddingTop: '5px',
    paddingBottom: '5px',
    backgroundColor: '#b8bcb9',
    color: color.cimsTextColor,
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  dialogBorder: {
    backgroundColor: color.cimsBackgroundColor,
    borderBottom: '10px solid #b8bcb9',
    borderRight: '10px solid #b8bcb9',
    borderLeft: '10px solid #b8bcb9'
  },
  cardContainer: {
    borderRadius: 5,
    marginLeft: 20,
    marginRight: 36,
    marginTop: 8,
    height: 'calc(100% - 10px)',
    overflowY: 'auto',
    backgroundColor: color.cimsBackgroundColor
  },
  cardHeader: {
    fontSize: '1.5rem',
    fontFamily: font.fontFamily
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
  tableCellBorder: {
    border: '1px solid rgba(224, 224, 224, 1)',
    whiteSpace: 'break-spaces'
  },
  inputName: {
    width: '100%'
  },
  inputText: {
    ...standardFont,
    padding: 10,
    marginTop: 2,
    resize: 'none',
    minHeight: 300,
    width: '99%',
    border: '1px solid rgba(0,0,0,0.42)',
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor
  },
  fontLabel: {
    ...standardFont
  },
  customRowStyle: {
    ...standardFont
  },
  headRowStyle: {
    backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
  },
  headCellStyle: {
    ...standardFont,
    // color: color.cimsBackgroundColor,
    overflow: 'hidden'
  },
  btn_div: {
    backgroundColor: color.cimsBackgroundColor,
    marginTop: 0,
    marginBottom: 4
  },
  select_div: {
    backgroundColor: color.cimsBackgroundColor
  },
  label_div: {
    fontSize: '1.5rem',
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor,
    paddingBottom: 16,
    paddingTop: 16
  },
  topDiv: {
    top: 0,
    position: 'sticky'
  },
  tableDiv: {
    margin: '-6px 2px 0px 2px'
  },
  input: {
    ...standardFont,
    color: color.cimsTextColor
  }
};
