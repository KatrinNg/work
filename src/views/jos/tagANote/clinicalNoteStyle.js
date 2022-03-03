import { COMMON_STYLE } from '../../../constants/commonStyleConstant';
import {getState} from '../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    height: 25,
    borderRadius: 0,
    backgroundColor:color.cimsBackgroundColor
  },
  table_header: {
    fontSize: font.fontSize,
    fontWeight: 600,
    fontFamily: font.fontFamily,
    color: 'white',
    padding: '0, 0, 0, 10'
  },
  left_warp: {
    padding: 5,
    backgroundColor: 'lightgray',
    height: 'calc(100vh - 324px)',
    minHeight: 690
  },
  right_warp: {
    paddingLeft: 5,
    paddingTop: 5
  },
  title: {
    fontSize: font.fontSize,
    fontWeight: 600,
    fontFamily: font.fontFamily,
    marginLeft: 10
  },
  table_title: {
    fontSize: '12pt',
    fontWeight: 600,
    fontFamily: font.fontFamily,
    marginLeft: 10
  },
  table: {
    backgroundColor: color.cimsBackgroundColor,
    border: '1px solid rgba(0,0,0,0.5)',
    marginBottom: 5,
    overflowY: 'auto'
  },
  table_row: {
    height: 31,
    cursor: 'pointer'
  },
  table_row_selected: {
    height: 31,
    cursor: 'pointer',
    backgroundColor: 'lightgoldenrodyellow'
  },
  table_head: {
    height: 30
  },
  button: {
    float: 'right'
  },
  alert: {
    border: '1px solid red'
  },
  alert_left: {
    backgroundColor: 'red',
    color: 'white',
    fontSize: 18,
    fontWeight: 600,
    height: 45,
    paddingTop: 25,
    textAlign: 'center',
    width: 80
  },
  alert_right: {
    paddingTop: 5,
    paddingLeft: 20,
    paddingBottom: 5
  },
  transfer: {
    padding: '10px 0 8px 15px'
  },
  transfer_box: {
    border: '1px solid rgba(0,0,0,0.42)',
    height: 108
  },
  diagnosis_search: {
    paddingLeft: 8,
    width: 'calc(100% - 8px)'
  },
  diagnosis_close: {
    float: 'right',
    height: 25
  },
  transfer_part2: {
    paddingTop: 50,
    textAlign: 'center'
  },
  clinical_note: {
    paddingLeft: 10
  },
  clinical_note_box: {
    border: '1px solid rgba(0,0,0,0.42)',
    height: 'calc(50vh - 269px)',
    minHeight: 269,
    width: 'calc(100% - 40px)',
    padding: 15,
    marginLeft: 10,
    fontFamily: font.fontFamily,
    fontSize: font.fontSize
    // fontWeight:'bold'
  },
  template_icon: {
    float: 'left',
    fontSize: '12pt',
    fontWeight: 600,
    fontFamily: font.fontFamily
  },
  template_button_group: {
    paddingLeft: 18
  },
  template_button: {
    height: 31
  },
  paper: {
    maxHeight: 200,
    transform: 'translate3d(18px, 3px, 0px)',
    width: 380
  },
  menu_all_list: {
    maxHeight: 150
  },
  menu_list_select: {
    paddingTop: 0,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  menu_list: {
    paddingTop: 0,
    fontSize: 14
  },
  mr15: {
    marginRight: 15,
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  menu: {
    top: 38,
    padding: 0
  },
  can_transfer: {
    color: 'black'
  },
  not_transfer: {
    color: 'lightgray'
  },
  diagnosis_problem_list: {
    maxHeight: 75,
    overflowY: 'auto'
  },
  select_diagnosis_problem: {
    backgroundColor: 'lightgray',
    cursor: 'pointer',
    paddingLeft: 8,
    height: 25,
    borderBottom: '1px solid rgba(0,0,0,0.42)',
    width: 'calc(100% - 8px)'
  },
  diagnosis_problem: {
    cursor: 'pointer',
    paddingLeft: 8,
    height: 25,
    borderBottom: '1px solid rgba(0,0,0,0.42)',
    width: 'calc(100% - 8px)'
  },
  diagnosis_problem_name: {
    height: 25,
    float: 'left',
    width: 'calc(100% - 110px)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  select_user:
  {
    color: 'rgba(0, 0, 0, 0.7)',
    width:'calc(100%-20px)',
    padding:5
  },
  formControl: {
    width: '96%'
},
  person_info_div:{
    width:'100%',
    // height:133
    marginTop: -4
  },
  span_left:{
    fontSize: font.fontSize,
    fontWeight: 600,
    fontFamily: font.fontFamily,
    marginLeft:20
    // marginTop:2
  },
  list_type:
  {
    color: 'rgba(0, 0, 0, 0.7)',
    width:'calc(100%-20px)'
    // padding:0
  },
  list_title: {
    fontSize: font.fontSize,
    fontWeight: 600,
    fontFamily: font.fontFamily,
    overflow: 'hidden',
    color:'#404040',
    paddingTop: 9
  },
  templateBackgroundColorChange:{
    fontSize: '12pt',
    fontWeight: 600,
    fontFamily: font.fontFamily,
    '&:hover': {
      background: '#0579c8'
    }
  },
  record_detail_fab: {
    height: 40,
    width: 40,
    marginLeft: 15
  },
  record_detail_fab_icon: {
    fontSize: 31
  },
  record_detail_fab_delete: {
    height: 40,
    width: 40,
    marginLeft: 15,
    backgroundColor: '#fd0000',
    '&:hover': {
      backgroundColor: '#fd0000'
    }
  },
  custom_paper: {
    minWidth: 175
  },
  record_module: {
    maxWidth: '26%',
    flexBasis: '26%'
  },
  textAreaFully: {
    marginRight: 16
  },
  templateIconBtn: {
    padding: 0
  },
  fontLabel : {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  fontGrey : {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color:'#B8BCB9'
  },
  fontLabelButton : {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    fontWeight:400
  },
  subTemplateBtn: {
    height: 26
  },
  subTemplateWrapper: {
    marginTop: -13
  },
  checkbox_sty:{
    paddingRight:5,
    marginLeft:10
  },
  checkBox_root:{
    marginRight:0,
    width:1000
  },
  btnAdd:{
    height: '20px',
    width: '20px',
    minHeight: '20px',
    marginRight:'10px'
  },
  divIcon:{
    display: 'contents'
  },
  collapse:{
    marginLeft:35,
    color: '#0579c8'
  },
  hidden:{
    visibility:'hidden'
  },
  visible:{
    visibility:'visible'
  },
  listItem:{
    paddingLeft:0,
    paddingRight:0,
    paddingTop:0,
    paddingBottom:0
  },
  listItemIcon:{
    color:'#b8bcb9',
    minWidth:0,
    paddingRight: 15
  },
  lensIcon:{
    color:'#b8bcb9',
    fontSize:15,
    padding:5
  },
  listSubheader:{
    paddingLeft:'10px',
    color:'#0579c8',
    fontSize: font.fontSize,
    lineHeight:'20px'
  },
  textPadding:{
    padding:'5px 0px 7px 0px'
  },
  // listItemSecondaryAction:{
  //   right:0,
  //   left:0
  // },
  listItemText:{
    margin:'0px',
    padding:'9px 0px 9px 0px'
  },
  checkBox_label:{
    color: color.cimsLabelColor,
    lineHeight: 1,
    transform: 'translate(0, 1.5px) scale(0.75)',
    top: 25,
    left: 10,
    position: 'absolute',
    width: 'max-content'
  },
  showTagNote_checkbox:{
    marginTop: 13,
    paddingBottom: 0
  },
  noteTypeAvatar: {
    float: 'right',
    fontSize: 'smaller',
    width: 25,
    height: 25,
    marginRight: 1,
    backgroundColor: '#80a7d5'
  },
  whiteAvatar:{
    float: 'left',
    fontSize: 'smaller',
    width: 25,
    height: 25,
    marginRight: 1,
    opacity:1
  },
  noteTypeAvatarLeft: {
    float: 'left',
    fontSize: 'smaller',
    width: 25,
    height: 25,
    marginRight: 1,
    backgroundColor: '#80a7d5'
  },
  tagnote_checkBox_label:{
    color: color.cimsLabelColor,
    lineHeight: 1,
    transform: 'translate(0, 1.5px) scale(0.75)',
    left: -22,
    top: 0,
    position: 'absolute',
    width: 'max-content'
  },
  grayFont:{
    // color:'gray'
    color:color.cimsTextColor,
    backgroundColor: color.cimsDisableColor
  },
  backgroundColorFont:{
    backgroundColor:color.cimsBackgroundColor
  },
  sizeSmall:{
    fontSize:'smaller'
  },
  medicalFormControl: {
    width: '100%',
    fontFamily: font.fontFamily
  },
  medicalGrid:{
    padding:'6px 12px',
    width:400,
    backgroundColor:color.cimsBackgroundColor
  },
  tableHead:{
    backgroundColor: COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    position:'sticky',
    top:0,
    fontWeight: 600,
    fontSize: font.fontSize,
    color: COMMON_STYLE.whiteTitle
  },
  tSplitDivP:{
    fontWeight: 'bold',
    fontSize: 16,
    margin: 0
  },
  tSplitDivPDiv:{
    textAlign: 'right',
    fontSize: 14,
    color: COMMON_STYLE.labelColor,
    marginRight: 22
  }
};