import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};


export const styles = () => ({
  root: {
    alignItems: 'center',
    // height: 40,
    border: 'none',
    borderBottom: '1px solid rgba(0, 0, 0, 0.8)',
    boxShadow: 'none',
    // float:'left',
    // margin: 5,
    // width: 255,
    borderRadius: 0
  },
  input: {
    flex: 15,
    fontSize: font.fontSize,
    // marginTop: 10,
    paddingLeft: 7,
    marginLeft: -12
    // width: 178
  },
  iconButton: {
    padding: '5px 0'
    // marginBottom: 15
  },
  inputPaper: {
    // height: 40,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    border: 'none',
    boxShadow: 'none',
    borderRadius: 0,
    backgroundColor:color.cimsBackgroundColor
  },
  paper: {
    marginTop: -3,
    width: 550,
    position: 'absolute',
    transform: 'translate3d(-200px, 3px, 0px)'
  },
  searchIcon: {
    paddingTop: 12,
    paddingLeft: 10
  },
  menu: {
    maxHeight: 240,
    overflowY: 'auto',
    borderTop: '1px solid',
    borderLeft: '1px solid',
    borderRight: '1px solid',
    borderTopRightRadius: '5px',
    borderTopLeftRadius: '5px',
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor
  },
  menu_list: {
    fontSize: font.fontSize,
    paddingTop: 2,
    paddingBottom: 3,
    height: 'auto',
    whiteSpace: 'inherit',
    backgroundColor: color.cimsBackgroundColor,
    '&:hover': {
      backgroundColor: 'rgba(237,237,237)'
    }
  },
  menu_list_select: {
    fontSize: font.fontSize,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingTop: 2,
    paddingBottom: 3,
    height: 'auto',
    whiteSpace: 'inherit'
  },
  mr15: {
    wordBreak: 'break-all',
    marginRight: 15,
    minHeight: 24,
    fontSize: font.fontSize,
    paddingBottom: 5,
    fontFamily: font.fontFamily
  },
  closeButton: {
    borderTop: '1px solid rgba(0, 0, 0, 0.42)',
    borderLeft: '1px solid',
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderBottomRightRadius: '5px',
    borderBottomLeftRadius: '5px'
  },
  popper: {
    opacity: 1
  },
  tooltip: {
    fontSize: 15
  },
  label: {
    cursor: 'pointer'
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  }
});
