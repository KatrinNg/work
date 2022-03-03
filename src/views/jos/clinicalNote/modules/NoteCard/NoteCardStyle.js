import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { font } = getState(state => state.cimsStyle) || {};

export const styles = (theme) => ({
  noteContentContainer: {
    padding: '5px 10px'
  },
  noteContentTitle: {
    display: 'flex',
    alignItems: 'center'
  },
  noteContentCreateUserLabel: {
    fontWeight: 'bold',
    marginRight: 5
  },
  noteContentCreateUserDeleteLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    color: COMMON_STYLE.labelColor
  },
  noteContentCreateDtmLabel: {
    color: COMMON_STYLE.labelColor,
    marginRight: 5
  },
  noteContentOtherUpdateDtmLabel: {
    display: 'inline-block',
    fontStyle: 'italic',
    color: COMMON_STYLE.labelColor,
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
    color: theme.palette.cimsBackgroundColor,
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
    fontSize: theme.palette.textSize,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  },
  contentDeletePre:{
    margin: '5px 1px',
    fontFamily: font.fontFamily,
    fontSize: theme.palette.textSize,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    textDecoration: 'line-through'
  }
});