import { COMMON_STYLE } from '../../../../../../constants/commonStyleConstant';
import { getState } from '../../../../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

export const styles = () => ({
  paper: {
    borderRadius: 10,
    maxWidth: '100%',
    minWidth: '96%',
    overflow: 'auto',
    maxHeight: 'calc(100vh - 80px)'
  },
  dialogTitle: {
    backgroundColor: '#b8bcb9',
    borderTopLeftRadius: '5px',
    borderTopRightRadius: '5px',
    paddingLeft: '24px',
    padding: '10px 24px 7px 0px',
    color: '#404040',
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.6,
    fontFamily: font.fontFamily
  },
  label: {
    fontWeight: 'bold',
    paddingRight: 4,
    paddingLeft: 10,
    fontSize: font.fontSize
  },
  leftHeader: {
    backgroundColor: '#0579C8',
    color: '#FFFFFF',
    marginTop: 2,
    paddingBottom: 6
  },
  label_right: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  left_warp: {
    backgroundColor: 'lightgray',
    height: 726,
    minHeight: 650
  },
  record_module: {
    maxWidth: '26%',
    flexBasis: '26%'
  },
  right_warp: {
    paddingLeft: 5
    //paddingTop: 5
  },
  right_html: {
    margiTop: -19,
    marginLeft: 5,
    height: 725,
    backgroundColor: '#474747'
  },
  right_html_div: {
    width: '80%',
    marginLeft: '10%',
    textAlign: 'center'
  },
  right_html_div_label: {
    color: 'white',
    fontSize: '1.5rem'
  },
  table: {
    backgroundColor: color.cimsBackgroundColor,
    border: '1px solid rgba(0,0,0,0.5)',
    marginBottom: 5,
    overflow: 'auto'
  },
  title: {
    fontSize: font.fontSize,
    fontWeight: 600,
    fontFamily: font.fontFamily,
    marginLeft: 5
  },
  save_div: {
    height: '11%',
    marginLeft: 5,
    marginTop: 5
  },
  textarea: {
    width: '100%',
    resize: 'none',
    float: 'left',
    height: 70,
    border: '1px solid rgba(0,0,0,0.42)',
    borderRadius: '5px',
    color: color.cimsTextColor,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    backgroundColor: color.cimsBackgroundColor,
    '&:focus': {
      outline: 'none',
      border: '2px solid #0579C8'
    },
    boxShadow:
      '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)'
  },
  record_detail_fab_icon: {
    fontSize: 31
  },
  toolTip: {
    margin: 16,
    marginLeft: 30
  },
  checkBox_root: {
    marginRight: 0
  },
  table_width: {
    width: '200%'
  },
  table_header: {
    backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    fontSize: font.fontSize,
    fontWeight: 'bold',
    fontFamily: font.fontFamily,
    color: COMMON_STYLE.whiteTitle,
    padding: '0, 0, 0, 10',
    position: 'sticky',
    top: -1,
    paddingLeft: 4
  },
  table_cellIoe: {
    fontSize: font.fontSize,
    paddingLeft: 4,
    fontFamily: font.fontFamily
  },
  table_cell: {
    fontSize: font.fontSize,
    paddingLeft: 4,
    fontFamily: font.fontFamily
  },
  btnDiv: {
    paddingLeft: 5,
    backgroundColor: color.cimsBackgroundColor
  },
  table_row_selected: {
    height: 44,
    lineHeight: 44,
    cursor: 'pointer',
    backgroundColor: 'lightgoldenrodyellow'
  },
  table_row: {
    height: 44,
    lineHeight: 44,
    cursor: 'pointer'
  },
  templateDetailValidation: {
    color: '#fd0000',
    margin: '0',
    fontSize: font.fontSize,
    float: 'left',
    minHeight: '1em',
    display: 'block',
    marginTop: 4,
    marginLeft: 6
  },
  checkbox_sty: {
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: 16
  },
  actionBack: {
    backgroundColor: color.cimsBackgroundColor
  },
  actionSty: {
    fontWeight: 600,
    marginLeft: 15
  },
  fontLabel: {
    fontSize: font.fontSize
  },
  tableNoDataLabel: {
    fontSize: font.fontSize
  },
  fontCaution: {
    color: 'red',
    fontWeight: 'bold',
    wordBreak: 'break-word'
  }
});
