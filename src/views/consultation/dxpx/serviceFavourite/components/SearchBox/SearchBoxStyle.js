import { getState } from '../../../../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = () => ({
  labelWrapper: {
    paddingBottom: '1px'
  },
  textBoxWrapper: {
    width: '100%'
  },
  textBox: {
    ...standardFont,
    resize: 'none',
    border: '1px solid rgba(0,0,0,0.42)',
    height: '75px',
    width: 'calc(100% - 6px)',
    borderRadius: '5px',
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor,
    '&:focus': {
      outline: 'none',
      border: '2px solid #0579C8'
    },
    boxShadow:
      '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)'
  },
  label: {
    fontWeight: 'bold'
  },
  // V2
  paperRoot: {
    backgroundColor: color.cimsBackgroundColor,
    display: 'flex',
    alignItems: 'center',
    width: 400,
    height: 40,
    border: 'none',
    borderBottom: '1px solid rgba(0, 0, 0, 0.8)',
    boxShadow: 'none',
    margin: 5,
    borderRadius: 0
  },
  input: {
    flex: 1,
    marginTop: 10,
    paddingLeft: 7,
    marginLeft: -12
  },
  innerInput: {
    ...standardFont,
    color: color.cimsTextColor,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  },
  iconButton: {
    padding: 5,
    marginBottom: -9
  },
  displayNone: {
    display: 'none'
  },
  displayBlock: {
    display: 'block'
  }
});
