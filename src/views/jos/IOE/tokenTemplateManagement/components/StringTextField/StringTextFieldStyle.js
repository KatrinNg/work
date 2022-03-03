import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  errorHelper: {
    marginTop: 5,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  input: {
    fontSize:font.fontSize,
    width: '97%',
    fontFamily: font.fontFamily,
    margin:'10px 0px -10px 0px;',
    resize: 'none',
    whiteSpace: 'pre-wrap',
    borderRadius: 5,
    color: color.cimsTextColor,
    backgroundColor:color.cimsBackgroundColor,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    },
    '&:focus': {
      outline: '-webkit-focus-ring-color auto 0px',
      borderRadius: 5,
      border: '2px solid #0579C8'
    }
  }
});
