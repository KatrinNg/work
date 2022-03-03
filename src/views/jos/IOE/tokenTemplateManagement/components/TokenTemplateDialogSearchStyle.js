import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
    root: {
      alignItems: 'center',
      height: 30,
      border: 'none',
      borderBottom: '1px solid rgba(0, 0, 0, 0.8)',
      boxShadow: 'none',
      // margin: 5,
      width: 400,
      borderRadius: 0,
      backgroundColor: color.cimsBackgroundColor
    },
    input: {
      flex: 1,
      fontSize: '12pt',
      marginTop: -2,
      paddingLeft: 7,
      marginLeft: -12,
      width: 335,
      color: color.cimsLabelColor
    },
    iconButton: {
      padding: 5,
      marginBottom: '-10px'
    },
    inputPaper: {
      height: 30,
      border: 'none',
      boxShadow: 'none',
      borderRadius: 0,
      backgroundColor: color.cimsBackgroundColor
    },
    inputPlaceholder:{
      '&::placeholder': {
        color: color.cimsPlaceholderColor,
        opacity: 1
      }
    },
    paper: {
      marginLeft:36,
      marginTop: 5,
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
      fontSize: '12pt',
      paddingTop: 2,
      paddingBottom: 3,
      height: 'auto',
      whiteSpace: 'inherit',
      backgroundColor: color.cimsBackgroundColor,
      '&:hover': {
        backgroundColor: 'rgba(237,237,237)'
      }
    },
    mr15: {
      wordBreak: 'break-all',
      marginRight: 15,
      // minWidth: 330,
      minHeight: 24,
      fontSize: '14pt',
      width: 500,
      paddingBottom: 5,
      fontFamily: 'Roboto'
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
      fontSize: 15,
      whiteSpace:'pre-wrap',
      maxWidth:'none'
    },
    label: {
      fontSize:'1.125rem',
      cursor: 'pointer',
      whiteSpace:'pre'
    },
    popperStyle:{
      zIndex:1300
    },
    inputProps: {
      fontSize: font.fontSize,
      fontFamily: font.fontFamily,
      color: color.cimsTextColor
    },
    fontLabel: {
      maxHeight: 40
    }
  });
