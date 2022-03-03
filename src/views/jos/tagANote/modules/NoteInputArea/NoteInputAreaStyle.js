import { getState } from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  primaryFab: {
    marginRight: 5,
    width: 25,
    height: 25,
    minHeight: 25,
    '&:hover': {
      backgroundColor: '#0098FF'
    }
  },
  leftLableDetail: {
    marginTop: 7,
    marginRight: 13
  },
  inputStyle: {
    fontFamily: font.fontFamily,
    fontWeight: 200,
    fontSize: font.fontSize
  },
  textField: {
    width: '100%'
  },
  leftLableTitle: {
    marginTop: 10,
    marginRight: 33
  },
  tagNoteButton: {
    backgroundColor: '#0579c8',
    color: 'white'
  },
  labelErrorMsg: {
    color: 'red',
    fontSize: font.fontSize,
    marginLeft: 15,
    marginTop: 0
  }
});