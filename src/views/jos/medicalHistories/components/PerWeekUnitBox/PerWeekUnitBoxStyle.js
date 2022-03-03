import {getState} from '../../../../../store/util';
const { color,font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    width: '100%',
    borderRadius: 4
  },
  inputField: {
    width: '95%',
    borderRadius: 4,
    backgroundColor: color.cimsBackgroundColor
  },
  helperTextError: {
    marginTop: 0,
    fontSize: '14px !important',
    fontFamily: font.fontFamily,
    padding: '0 !important'
  },
  background: {
    backgroundColor: 'cornflowerblue'
  },
  tooltip: {
    backgroundColor: '#6E6E6E',
    fontSize: '14px',
    fontFamily: font.fontFamily,
    maxWidth: 800,
    wordBreak: 'break-word'
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor,
    borderRadius: 4
  },
  fab: {
    '&:hover': {
      backgroundColor: '#0098FF'
    }
  },
  txtDisableBack: color.cimsDisableColor
});