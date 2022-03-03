import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const drawerWidth = 236;
const drawerCloseWidth = 65;
export const styles = theme => ({
  wrapper: {
    height: '100%',
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
    minHeight: 48,
    paddingRight: 0
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
    marginTop: -52,
    float: 'left',
    height: 510
  },
  drawerPaperRoot: {
    position: 'unset'
  },
  drawerOpen: {
    backgroundColor: color.cimsBackgroundColor,
    width: drawerWidth,
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    backgroundColor: color.cimsBackgroundColor,
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: drawerCloseWidth
    }
  },
  font: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily
  },
  fontBold: {
    fontWeight: 'bold'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  listRoot: {
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  tooltip: {
    backgroundColor: '#6E6E6E',
    fontSize: '14px',
    fontFamily: font.fontFamily,
    maxWidth: 800,
    wordBreak: 'break-word'
  },
  selectedItem: {
    backgroundColor: '#DCDCDC'
  },
  marginRightNone: {
    marginRight: 0
  },
  avatar: {
    width: 40,
    height: 40,
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    backgroundColor: '#38d1ff'
  },
  moduleWrapper: {
    overflowX: 'auto',
    overflowY: 'hidden',
    height: 'inherit'
    // minHeight: 400
  },
  content: {
    float:'left',
    marginLeft: drawerCloseWidth,
    padding: 0,
    width: `calc(100% - ${drawerCloseWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  contentOpen: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  }
});