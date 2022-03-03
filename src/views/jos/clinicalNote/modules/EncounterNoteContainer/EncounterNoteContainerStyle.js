import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = () => ({
  pastEncounterDiv: {
    backgroundColor: '#ccc',
    paddingRight: 10,
    border: '1px solid rgba(0, 0, 0, 0.5)',
    borderLeft:'unset'
  },
  title: {
    fontWeight: 'bold',
    margin: '5px 0',
    fontSize: font.fontSize
  },
  btnGroup: {
    float: 'right'
  },
  LabelGroup:{
    float:'Left',
    color:'red',
    marginTop:5
  },
  content: {
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative'
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
  backfabIcon: {
    width: '1rem',
    height: '1rem',
    paddingLeft: 7
  },
  btnRoot: {
    backgroundColor: color.cimsBackgroundColor
  }
});