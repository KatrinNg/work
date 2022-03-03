import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    maxHeight: 500,
    maxWidth: 300,
    overflow: 'auto',
    backgroundColor: color.cimsBackgroundColor
  },
  logContainer: {
    margin: '10px 10px 0 10px'
  },
  logCreateUserLabel: {
    color: color.cimsTextColor,
    fontWeight: 'bold',
    marginRight: 5
  },
  logCreateDtmLabel: {
    color: COMMON_STYLE.labelColor,
    marginRight: 5
  },
  contentPre: {
    color: color.cimsTextColor,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    margin: '5px 1px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  }
});