import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    maxHeight: 500,
    maxWidth: 300,
    overflow: 'auto'
  },
  logContainer: {
    margin: '10px 10px 0 10px'
  },
  logCreateUserLabel: {
    fontWeight: 'bold',
    marginRight: 5
  },
  logCreateDtmLabel: {
    color: COMMON_STYLE.labelColor,
    marginRight: 5
  },
  contentPre: {
    color: color.cimsTextColor,
    margin: '5px 1px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  deleteContentPre: {
    color: color.cimsTextColor,
    margin: '5px 1px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    textDecoration: 'line-through',
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  }
});