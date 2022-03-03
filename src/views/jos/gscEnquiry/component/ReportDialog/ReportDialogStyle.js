import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const styles = () => ({
  paper: {
    borderRadius: 10,
    maxWidth: '100%',
    minWidth: '45%',
    overflow: 'auto',
    maxHeight: 'calc(100vh - 80px)'
  },
  flexCenter:{
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'center',
    width: '95%'
  },
  right_warp: {
    paddingLeft: 5
    //paddingTop: 5
  },
  right_html: {
    height: 570,
    width: 845,
    backgroundColor: '#474747'
  },
  right_html_div: {
    width: '80%',
    marginLeft: '10%',
    textAlign: 'center'
  },
  right_html_div_label: {
    color: 'white',
    fontSize: '1.5rem'
  },
  btnDiv: {
    paddingLeft: 5,
    backgroundColor: color.cimsBackgroundColor
  },
  controlLabel: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor,
    '&$disabled':{
      color: COMMON_STYLE.disabledColor
    }
  },
  disabledLabel:{
    color: `${COMMON_STYLE.disabledColor} !important`
  },
  checkPadding:{
    margin: 0
  },
  inputField: {
    width: '100%'
  },
  multilineInput: {
    backgroundColor: color.cimsBackgroundColor,
    padding: '5px 10px',
    borderRadius: 4
  },
  inputProps: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor,
    borderRadius: 4
  },
  helperTextError: {
    marginTop: 0,
    fontSize: '14px !important',
    fontFamily: font.fontFamily,
    padding: '0 !important'
  },
  labelText: {
    fontWeight: 'bold',
    transform: 'translate(14px, -6px)',
    color: '#000000 !important'
  },
  divConten:{
    backgroundColor: color.cimsBackgroundColor,
    marginTop: 5,
    position: 'relative'
  }
});

export default styles;