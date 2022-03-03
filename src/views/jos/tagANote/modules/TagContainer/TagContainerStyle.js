import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  pastEncounterDiv: {
    backgroundColor: color.cimsBackgroundColor,
    paddingRight: 10,
    borderRight: '1px solid #000'
  },
  title: {
    fontWeight: 'bold',
    fontSize:22,
    margin: 5,
    display:'inline-block'
  },
  btnGroup: {
    float: 'right'
  },
  gridContainer:{
    marginTop:20
  },
  content: {
    overflowY: 'auto',
    margin:'30px 0px 50px 28px'
  },
  leftLableTitle:{
    marginTop:10,
    marginRight:7
  },
  leftLableDetail:{
    marginTop:7
  },
  leftLableType:{
    marginTop:20
  },
  inputStyle: {
    fontFamily: font.fontFamily,
    fontWeight: 200,
    fontSize: font.fontSize
  },
  inputDetailStyle: {
    fontFamily: font.fontFamily,
    fontWeight: 200,
    fontSize: font.fontSize
  },
  expansionPanelSummaryIcon: {
    padding: '6px 12px',
    color: color.cimsBackgroundColor,
    marginRight: -19
  },
  expansionPanelSummaryLabel: {
    fontWeight: 'bold',
    color: color.cimsBackgroundColor
  },
  primaryFab: {
    marginRight: 5,
    width: 25,
    height: 25,
    minHeight: 25,
    color: color.cimsBackgroundColor,
    '&:hover': {
      backgroundColor: '#0098FF'
    }
  },
  backfabIcon: {
    width: '1rem',
    height: '1rem',
    paddingLeft: 7
  },
  border: {
    backgroundColor: color.cimsBackgroundColor,
    borderLeft:'1px solid rgba(0, 0, 0, 0.12)',
    borderRight:'1px solid rgba(0, 0, 0, 0.12)'
  },
  fontLabel: {
    fontSize: font.fontSize
  },
  tagNoteButton:{
   backgroundColor:'#0579c8',
   color:'white'
  },
  tagNoteTestArea:{
    borderRadius: 4,
    padding: 5,
    marginTop: 5,
    color: color.cimsTextColor,
    fontFamily: font.fontFamily,
    fontSize: font.fontSize,
    width: '100%',
    resize: 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    minHeight:160
    //minWidth:451
  },
  textField:{
    width: '100%'
  },
  paperBackColor:{
    backgroundColor: color.cimsBackgroundColor
  },
  showPastEncounter:{
      marginLeft:62,
      marginTop:-42
  },hidePastEncounter:{
    marginLeft:0
  },
  labelErrorMsg: {
    color: 'red',
    fontSize: font.fontSize,
    marginBottom: -5,
    marginLeft: 20
  }
});