import { COMMON_STYLE } from '../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};

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
    backgroundColor: color.cimsBackgroundColor,
    borderLeft:'1px solid rgba(0, 0, 0, 0.12)',
    borderRight:'1px solid rgba(0, 0, 0, 0.12)'
  },
  label: {
    color: COMMON_STYLE.labelColor
  },
  currentBackgroud: {
    backgroundColor: color.cimsBackgroundColor
  },
  pastBackgroud: {
    backgroundColor: '#ccc'
  }
};