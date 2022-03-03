import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  tabSpan: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    fontWeight: 'bold',
    color: '#404040'
  },
  tabSpanSelected: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    '&:hover':{
      color: '#404040'
    }
  },
  tabSelect: {
    backgroundColor: '#0579c8'
  },
  label: {
    fontWeight: 'bold',
    paddingRight: 10
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  tabs: {
    width: 800,
    float: 'left'
  },
  searchBar: {
    float: 'right'
  },
  searchBtn: {
    margin: '0 8px'
  },
  divHidden: {
    display: 'none'
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  },
  input: {
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  }
});