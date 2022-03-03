import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};
export const styles = {
  paper: {
    borderRadius:5,
    minWidth: '64%',
    maxWidth: '100%',
    overflowY:'unset'
  },
  dialogTitle: {
    backgroundColor: '#5B9BD5', //'#5B9BD5',
    borderTopLeftRadius:5,
    borderTopRightRadius:5,
    paddingLeft: '24px',
    padding:'8px 24px 8px 0px',
    color: 'white', // color.cimsTextColor,
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.6,
    fontFamily: font.fontFamily,
    cursor: 'move'
  },
  formControlCss: {
    borderBottomLeftRadius:5,
    borderBottomRightRadius:5,
    // backgroundColor:'#5B9BD5',
    padding: '0px 10px 10px 10px'
  },
  formControl2Css: {
    backgroundColor: color.cimsBackgroundColor
  },
  formControl:{
    width:212
  }
};