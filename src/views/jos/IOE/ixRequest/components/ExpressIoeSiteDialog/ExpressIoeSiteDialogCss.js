import { getState } from '../../../../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const style = {
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    height: 25,
    borderRadius: 0
  },
  validation: {
    color: '#fd0000',
    margin: '0',
    fontSize: '0.75rem',
    ali: 'left',
    marginTop: '8px',
    minHeight: '1em',
    display: 'block'
  },
  templatetitle: {
    ...standardFont,
    color: color.cimsTextColor
  },
  dialogTitle: {
    paddingTop: '5px',
    paddingBottom: '5px',
    backgroundColor: '#b8bcb9',
    color: color.cimsTextColor,
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  dialogBorder: {
    backgroundColor: color.cimsBackgroundColor,
    borderBottom: '10px solid #b8bcb9',
    borderRight: '10px solid #b8bcb9',
    borderLeft: '10px solid #b8bcb9'
  },
  inputName: {
    width: '100%'
  },
  inputText: {
    ...standardFont,
    padding: 10,
    marginTop: 2,
    resize: 'none',
    minHeight: 300,
    width: '99%',
    border: '1px solid rgba(0,0,0,0.42)',
    color: color.cimsTextColor,
    backgroundColor: color.cimsBackgroundColor
  },
  topDiv: {
    top: 0,
    position: 'sticky'
  },
  tableDiv: {
    margin: '-6px 2px 0px 2px'
  },
  input: {
    ...standardFont,
    color: color.cimsTextColor
  }
};
