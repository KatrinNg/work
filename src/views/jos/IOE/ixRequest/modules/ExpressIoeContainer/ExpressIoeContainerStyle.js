import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    // height: 450,
    overflowX: 'hidden',
    paddingRight: 5
  },
  wrapperHidden: {
    // height: 486
  },
  cardContainer: {
    display:'flex'
  },
  cardContainerHidden: {
    height: 486
  },
  card: {
    marginLeft: 10,
    marginRight: 10,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    boxShadow: 'none',
    height: 'max-content'
  },
  cardContent: {
    padding: '5px 10px',
    '&:last-child':{
      paddingBottom: '5px',
      backgroundColor: color.cimsBackgroundColor
    }
  },
  groupNameTitle: {
    cursor: 'default',
    fontSize: font.fontSize,
    fontWeight: 'bold'
  },
  itemWrapperDiv: {
    display: 'flex',
    flexDirection: 'row'
  },
  itemTypography: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  checkBoxDiv: {
    float: 'left'
  },
  checkBoxDivWithSign: {
    width: 52
  },
  formItemDiv: {
    paddingLeft: 5,
    width: '100%'
  },
  title: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  hiddenTitle: {
    display: 'none'
  },
  checkBoxWrapper: {
    float: 'left'
  },
  signWrapper: {
    float: 'left',
    paddingTop: 2
  },
  ITEFSign: {
    color: '#0579c8'
  },
  ITEOSign: {
    color: '#4caf50'
  },
  font_color: {
    fontSize: font.fontSize,
    color: '#0579c8'
  },
  add_input_text:{
    fontSize: font.fontSize
  },
  inputName: {
    //paddingLeft:10,
    //resize:'none',
    // height:'30px',
    // width: '80%',
    //border: '1px solid rgba(0,0,0,0.42)',
    // color: color.cimsTextColor,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  input:{
   height:30
  }
});
