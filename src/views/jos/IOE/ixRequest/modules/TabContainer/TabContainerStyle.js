import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const drawerWidth = 160;
// const drawerWidth = 240;

export const styles = theme => ({
  wrapper: {
    position:'relative',
    clear: 'both'
  },
  appBar: {
    zIndex: 2,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  toolBar: {
    minHeight: 16
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36
  },
  hide: {
    display: 'none'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  drawerRoot: {
    position: 'absolute',
    marginTop: 0,
    float: 'left',
    height: 510
    // height: 615
    // height: 'calc(62vh - 10px)'
  },
  drawerPaperRoot: {
    position: 'unset'
  },
  drawerOpen: {
    width: drawerWidth,
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: 68
    },
    backgroundColor:color.cimsBackgroundColor
  },
  popper: {
    opacity: 1
  },
  listRoot: {
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  marginRightNone: {
    marginRight: 0
  },
  content: {
    float:'left',
    marginLeft: 74,
    padding: 10,
    // height: 550,
    paddingLeft: 0,
    paddingRight: 5,
    paddingBottom: 0,
    // height: 'calc(56vh - 15px)',
    width: 'calc(88% - -4px)'
  },
  contentOpen: {
    marginLeft: drawerWidth,
    width: 'calc(92% - 135px)'
  },
  tooltip: {
    backgroundColor: '#6E6E6E',
    fontSize: '14px',
    fontFamily: font.fontFamily
  },
  selectedItem: {
    backgroundColor: '#DCDCDC'
  },
  font: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    overflow: 'visible',
    whiteSpace: 'pre-wrap'
  },
  fontBold: {
    fontWeight: 'bold'
  },
  specimenWrapper: {
    maxWidth: '25%',
    flexBasis: '25%',
    padding: '0 5px',
    borderRight: '3px solid rgba(0, 0, 0, 0.22)'
  },
  testWrapper: {
    maxWidth: '75%',
    flexBasis: '75%',
    padding: '0 5px',
    borderRight: '1px solid rgba(0, 0, 0, 0.22)'
  },
  fullWrapper: {
    padding: '0 5px',
    borderRight: '1px solid rgba(0, 0, 0, 0.22)'
  },
  fabWrapper: {
    maxWidth: 50,
    flexBasis: 50
  },
  fabGird: {
    height: 400
    // height: 510
  },
  fab: {
    marginBottom: 20,
    '&:hover': {
      backgroundColor: '#0098FF'
    }
  },
  actionWrapper: {
    float: 'right'
  },
  avatar: {
    width: 30,
    height: 30,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    backgroundColor: '#38d1ff'
  },
  tabSpan: {
    fontSize: font.fontSize,
    textTransform: 'none'
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  label: {
    float: 'left',
    paddingRight: 10
  },
  floatLeft: {
    float: 'left'
  },
  rootCheckbox: {
    padding: 0
  }
});
