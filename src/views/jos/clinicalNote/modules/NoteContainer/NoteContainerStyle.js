import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
  expansionPanelSummaryRoot: {
    backgroundColor: '#0579c8',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingLeft: 10
  },
  expansionPanelSummaryIcon: {
    padding: '6px 12px',
    color: color.cimsBackgroundColor,
    marginRight: -19
  },
  expansionPanelSummaryLabel: {
    fontWeight: 'bold',
    color: COMMON_STYLE.whiteTitle
  },
  border: {
    backgroundColor:color.cimsBackgroundColor,
    borderLeft:'1px solid rgba(0, 0, 0, 0.12)',
    borderRight:'1px solid rgba(0, 0, 0, 0.12)'
  },
  noteContentTitle: {
    display: 'flex',
    alignItems: 'center'
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
  noteContentContainer: {
    padding: '5px 10px'
  },
  label: {
    color: COMMON_STYLE.labelColor
  },
  currentBackgroud: {
    backgroundColor: color.cimsBackgroundColor
  },
  pastBackgroud: {
    backgroundColor: '#ccc'
  },
  noteContentOtherUpdateDtmLabel: {
    display: 'inline-block',
    fontStyle: 'italic',
    color: COMMON_STYLE.labelColor,
    fontSize: 12
  },
  noteContentCreateDtmLabel: {
    color: COMMON_STYLE.labelColor,
    marginRight: 5
  },
  noteContentCreateUserDeleteLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    color: COMMON_STYLE.labelColor
  },
  noteContentCreateUserLabel: {
    fontWeight: 'bold',
    marginRight: 5
  }
};