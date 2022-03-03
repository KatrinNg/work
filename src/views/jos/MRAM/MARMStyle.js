import { COMMON_STYLE }from '../../../constants/commonStyleConstant';
const drawerWidth = 240;

export const styles = (theme) => ({
  cardContent: {
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: theme.palette.cimsBackgroundColor,
    color: theme.palette.cimsTextColor
  },
  title: {
    color: COMMON_STYLE.whiteTitle
  },
  appBar: {
    zIndex: 2,
    color: theme.palette.cimsBackgroundColor,
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
    marginTop: -49,
    float: 'left'
    // height: 'calc(74vh - 10px)'
  },
  drawerPaperRoot: {
    backgroundColor: theme.palette.cimsBackgroundColor,
    color: theme.palette.cimsTextColor,
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
      width: theme.spacing(9) + 1
    }
  },
  listRoot: {
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  content: {
    backgroundColor: theme.palette.cimsBackgroundColor,
    marginLeft: 74,
    padding: 10,
    // minWidth: 920,
    minHeight: 650,
    height: 'calc(69vh - 15px)',
    width: 'calc(97% - 33px)',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
    // overflowX: 'auto',
    // overflowY: 'hidden'
  },
  contentOpen: {
    marginLeft: drawerWidth,
    width: 'calc(94% - 149px)',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  contentWrapper: {
    // height: 'calc(68vh - 78px)',
    // width: 'calc(95% - 33px)'
  },
  moduleWrapper: {
    overflowX: 'auto',
    overflowY: 'hidden',
    height: 'inherit',
    minHeight: 400,
    backgroundColor: theme.palette.cimsBackgroundColor,
    color: theme.palette.cimsTextColor
  },
  bottomGropContainer: {
    paddingBottom: 10
    // paddingRight: 48
  },
  btnGroup: {
    margin: '0 70px 0 70px'
  },
  timeWrapper: {
    minWidth: 925
  },
  timeGroupDiv: {
    minWidth: 750
  },
  timeTitle: {
    paddingTop: 10,
    float: 'left',
    fontWeight: 'bold',
    color: theme.palette.cimsTextColor
  },
  timeSpan: {
    color: 'red'
  },
  timeRemark: {
    float: 'left',
    paddingTop: 10,
    marginLeft: 30,
    fontWeight: 'bold',
    color: theme.palette.cimsTextColor
  },
  timeRemarkSpan: {
    color: '#0579C8'
  },
  bottomGroup: {
    minWidth: 685,
    color: theme.palette.cimsTextColor,
    position:'fixed',
    bottom: 0,
    width: '100%',
    zIndex: 100,
    backgroundColor: theme.palette.cimsBackgroundColor
  },
  marginRightNone: {
    marginRight: 0
  },
  tooltip: {
    backgroundColor: '#707070'
  },
  selectedItem: {
    backgroundColor: '#DCDCDC'
  },
  input: {
    '&::placeholder': {
      color: `${theme.palette.cimsPlaceholderColor} !important`
    }
  }
});

