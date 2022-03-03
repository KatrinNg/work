import {getState} from '../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const style = {
  paper: {
    borderRadius:5,
    minWidth: 850
  },
  dialogTitle: {
    backgroundColor: '#b8bcb9',
    borderTopLeftRadius:'5px',
    borderTopRightRadius:'5px',
    paddingLeft: '24px',
    padding: '10px 24px 7px 0px',
    color: color.cimsTextColor,
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  titlelabel:{
    color:'#0579c8'
  },
  CardPosition:{
    marginLeft: 27,
    marginTop: 20,
    width:795,
    backgroundColor: color.cimsBackgroundColor
  },
  radioGroup:{
    marginBottom: 20
  },
  radioPosition:{
    marginBottom: 20,
    marginTop: -25
  },
  normalFont: {
    color: color.cimsTextColor,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  btnRoot: {
    backgroundColor: color.cimsBackgroundColor
  }
};