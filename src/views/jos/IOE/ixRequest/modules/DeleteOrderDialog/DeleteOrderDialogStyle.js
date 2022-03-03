import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  gridItem:{
    marginBottom: 10
  },
  textarea: {
    width: '100%'
  },
  card:{
    margin: '15px 15px 8px 15px'
  },
  cardContent:{
    padding: 10,
    backgroundColor:color.cimsBackgroundColor
  },
  inputProps:{
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor
  },
  fontLabel:{
    fontSize:font.fontSize
  },
  labelContent: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  }
});