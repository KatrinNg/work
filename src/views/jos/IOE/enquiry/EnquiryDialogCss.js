import { COMMON_STYLE }from 'constants/commonStyleConstant';
import {getState} from '../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const style = {
  paper: {
    borderRadius:5,
    minWidth: 1100
  },
  dialogTitle: {
    backgroundColor: '#b8bcb9',
    borderTopLeftRadius:'5px',
    borderTopRightRadius:'5px',
    paddingLeft: '24px',
    padding: '10px 24px 0px 0px',
    color: '#404040',
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.6,
    fontFamily: font.fontSize
  },
  headRowStyle:{
    backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
    color:'white'
  },
  headCellStyle:{
    color:'white',
    overflow: 'hidden',
    fontSize:'1.125rem'
  },
  fontLabel: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  buttonGroup: {
    textAlign:'right',
    marginRight:20
  },
  label:{
    fontSize:font.fontSize
  },
  length1:{
    marginLeft: 100
  },

  CardPosition:{
    height:700,
    overflow:'auto',
    //width:1050,
    marginLeft: 23
  },
  paperTable:{
    width:'100%',
    overflow:'auto',
    minHeight:'700px'
  },
  dialogText:{
    border: '10px solid #b8bcb9',
    backgroundColor: color.cimsBackgroundColor
  }
};


