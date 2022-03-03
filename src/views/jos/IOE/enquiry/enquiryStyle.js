import zIndex from '@material-ui/core/styles/zIndex';
import {getState} from '../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  cellContent:{
    maxWidth:'8vw',
    whiteSpace: 'pre',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    display:'inherit',
    margin:'0px'
  },
  cellContentUserBy:{
    maxWidth:'6vw',
    whiteSpace: 'pre',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    display:'inherit',
    margin:'0px'
  },
  cellContentItem:{
    maxWidth:'5vw',
    whiteSpace: 'pre',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    display:'inherit',
    margin:'0px'
  },

  invalidateCellContent:{
    textDecoration:'line-through'
  },
  titleDiv: {
    padding: '16px',
    fontSize: ' 1.5rem',
    fontFamily: font.fontFamily
  },
  cardContent: {
    padding: '0px'
  },
  contentWrapper: {
    padding: '0px 16px 0px 16px',
    backgroundColor: color.cimsBackgroundColor
  },
  request_datetime_column: {
    width:93,
    fontSize:font.fontSize,
    fontFamily: font.fontFamily,
    // fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    marginRight:10
  },
  ioe_request_number_column: {
    width:140,
    fontSize:font.fontSize,
    fontFamily: font.fontFamily,
    // fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    marginRight:10
  },
  patientKey_column: {
    width:170,
    fontSize:font.fontSize,
    fontFamily: font.fontFamily,
    // fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    marginRight:10
  },
  formName_link:{
    whiteSpace: 'nowrap',
    overflow:'hidden',
    textOverflow:'ellipsis',
    display:'inline-block',
    width:'180px'
  },
  formName_column:{
    width:316,
    fontSize:font.fontSize,
    fontFamily: font.fontFamily,
    // fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    marginRight:10
  },
  serviceCd_column:{
    width:53,
    fontSize:font.fontSize,
    fontFamily: font.fontFamily,
    // fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    marginRight:10
  },
  clinicCd_column:{
    width:68,
    fontSize:font.fontSize,
    fontFamily: font.fontFamily,
    // fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    marginRight:10
  },
  test_column:{
    width:'180px',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    display:'inline-block'
  },
  specimen_column:{
    width: 200,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    display:'inline-block'
  },
  specimenCollectDatetime_column:{
    width:207,
    fontSize:font.fontSize,
    fontFamily: font.fontFamily,
    // fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    marginRight:10
  },
  rptRcvDatetime_column: {
    fontSize:font.fontSize,
    fontFamily: font.fontFamily,
    // fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:'hidden',
    marginRight:10
  },
  labNum_column: {
    fontSize:font.fontSize,
    fontFamily: font.fontFamily,
    // fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:'hidden'
  },
  label_div:{
    height:'135px',
    top:'0',
    position:'sticky',
    backgroundColor:color.cimsBackgroundColor,
    zIndex:10
    // paddingBottom:16
  },
  wrapper:{
    width: '99%',
    height: 'calc(100% - 167px)',
    position:'fixed'
  },
  tableDiv: {
    margin: '-2px 16px 0px 2px'
  },
  tooltip:{
    fontSize:font.fontSize,
    whiteSpace:'break-all'
  },
  byClinic:{
      marginTop:30
  },
  labelRoot: {
    fontSize: font.fontSize,
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    fontFamily: font.fontFamily,
    color: 'inherit',
    marginTop:5,
    whiteSpace:'break-all'
  },
  enquiryWrapper: {
    height: 65,
    display: 'flex',
    alignItems: 'center',
    minWidth: 725,
    marginRight: 5,
    paddingRight: 12
  },
  enquiryDiv: {
    paddingRight: 12,
    marginTop: -10
  },
  customWidth:{
    maxWidth: 500
  }
});
