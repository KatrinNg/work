import { COMMON_STYLE } from '../../../constants/commonStyleConstant';
import { getState } from '../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
  listItemIcon:{
    color: color.cimsLabelColor,
    minWidth:0,
    paddingRight: 15
  },
  fontGrey : {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsLabelColor
  },
  listItemText:{
    margin:'0px',
    padding:'9px 0px 9px 0px'
  },
  checkbox_sty:{
    paddingRight:5,
    marginLeft:10
  },
  fontLabel : {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  textPadding:{
    padding:'5px 0px 7px 0px'
  },
  listItem:{
    paddingLeft:0,
    paddingRight:0,
    paddingTop:0,
    paddingBottom:0
  },
  checkBox_label:{
    color: color.cimsLabelColor,
    lineHeight: 1,
    transform: 'translate(0, 1.5px) scale(0.75)',
    top: 0,
    left: 0,
    position: 'absolute',
    width: 'max-content'
  },
  showTagNote_checkbox:{
    marginLeft:10,
    marginTop: 10,
    paddingBottom: 0
  },
  whiteAvatar:{
    float: 'left',
    fontSize: 'smaller',
    width: 25,
    height: 25,
    marginRight: 1,
    opacity:1
  },
  noteTypeAvatar: {
    float: 'right',
    fontSize: 'smaller',
    width: 25,
    height: 25,
    marginRight: 1,
    backgroundColor: '#80a7d5'
  },
  noteTypeAvatarLeft: {
    float: 'left',
    fontSize: 'smaller',
    width: 25,
    height: 25,
    marginRight: 1,
    backgroundColor: '#80a7d5'
  },
  sizeSmall:{
    fontSize:'smaller'
  },
  tableHead: {
    color: COMMON_STYLE.whiteTitle,
    backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    position:'sticky',
    top:0,
    fontWeight: 600,
    fontSize: font.fontSize
  },
  chipOutlined: {
    backgroundColor:'#E57736',
    color: color.cimsBackgroundColor
  },
  mainLabel: {
    fontWeight:'bold',
    fontSize:font.fontSize,
    margin:0,
    color:color.cimsTextColor
  },
  subLabel: {
    textAlign:'right',
    fontSize:14,
    color:COMMON_STYLE.labelColor,
    marginRight:10
  },
  encounterTypeShortName: {
    fontWeight:'bold',
    fontSize:font.fontSize,
    wordBreak:'break-word',
    color:color.cimsTextColor
  },
  popBottomGrid: {
    position:'fixed',
    bottom:0,
    backgroundColor:color.cimsBackgroundColor
  },
  labelDisabled: {
    '&.Mui-disabled': {
      color: color.cimsLabelColor
    }
  }
};