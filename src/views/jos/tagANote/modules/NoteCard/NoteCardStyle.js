import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color,font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  noteContentContainer: {
    padding: '5px 10px'
  },
  noteContentTitle: {
    display: 'flex',
    alignItems: 'center'
  },
  noteContentCreateUserLabel: {
    fontWeight: 'bold',
    marginRight: 40,
    wordBreak: 'break-all'
  },
  updateByLabel:{
    fontWeight: 'bold',
    marginRight:5
  },
  noteContentCreateDtmLabel: {
    color: COMMON_STYLE.labelColor,
    marginRight: 5
  },
  noteContentOtherUpdateDtmLabel: {
    display: 'inline-block',
    color: COMMON_STYLE.labelColor,
    fontStyle: 'italic',
    fontSize: 12
  },
  tooltip: {
    backgroundColor: '#6E6E6E',
    fontSize: '14px',
    fontFamily: font.fontFamily
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
  fabIcon: {
    width: '1rem',
    height: '1rem'
  },
  contentPre: {
    margin: '5px 1px',
    fontFamily: font.fontFamily,
    fontSize: font.fontSize,
    whiteSpace:'pre-wrap',
    wordBreak:'break-word'
  },
  btnRoot: {
    backgroundColor: color.cimsBackgroundColor
  }
});