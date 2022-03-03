import { getState } from '../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = () => ({
  root: {
    alignItems: 'center',
    height: 40,
    border: 'none',
    borderBottom: '1px solid rgba(0, 0, 0, 0.8)',
    boxShadow: 'none',
    margin: 5,
    width: 255,
    // width: 400,
    borderRadius: 0,
    float:'left',
    backgroundColor:'inherit'
  },
  input: {
    ...standardFont,
    flex: 1,
    marginTop: 10,
    paddingLeft: 7,
    marginLeft: -12,
    width: 178
    // width: 303
  },
  innerInput: {
    ...standardFont,
    color: color.cimsTextColor,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  },
  iconButton: {
    padding: '5px 0',
    // padding: 5,
    marginBottom: 15
  },
  inputPaper: {
    height: 40,
    border: 'none',
    boxShadow: 'none',
    borderRadius: 0,
    backgroundColor:'inherit'
  },
  paper: {
    marginTop: -10,
    width: 550,
    // maxHeight: 200,
    position: 'absolute',
    transform: 'translate3d(-200px, 3px, 0px)'
  },
  searchIcon: {
    paddingTop: 12,
    paddingLeft: 10
  },
  menu: {
    // width: 390,
    maxHeight: 240,
    overflowY: 'auto',
    borderTop: '1px solid',
    borderLeft: '1px solid',
    borderRight: '1px solid',
    borderTopRightRadius: '5px',
    borderTopLeftRadius: '5px'
  },
  menu_list: {
    ...standardFont,
    paddingTop: 2,
    paddingBottom: 3,
    height: 'auto',
    whiteSpace: 'inherit',
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor,
    '&:hover': {
      backgroundColor: 'rgba(237,237,237)'
    }
  },
  menu_list_select: {
    ...standardFont,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingTop: 2,
    paddingBottom: 3,
    height: 'auto',
    whiteSpace: 'inherit'
    // minHeight: 'unset'
  },
  mr15: {
    ...standardFont,
    wordBreak: 'break-all',
    marginRight: 15,
    // minWidth: 330,
    minHeight: 24,
    // width: 500,
    paddingBottom: 5
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
    ...standardFont
  },
  label: {
    cursor: 'pointer'
  }
});
