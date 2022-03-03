import {getState} from '../../../../../../store/util';
import { COMMON_STYLE }from '../../../../../../constants/commonStyleConstant';
const { color, font } = getState(state => state.cimsStyle) || {};
const drawerWidth = 240;


export const styles  = (theme) => ({
  // content: {
  //   backgroundColor:'white',
  //   height: 820
  // },
  headerTitle: {
    display:'flex',
    justifyContent:'space-between',
    color:'white',
    padding: 4,
    backgroundColor:'#5B9BD5'
  },
  headerBtn: {
    width:'40%',
    marginLeft:10
  },
  tabSpan: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    fontWeight: 'bold',
    color: '#404040'
  },
  tabContent: {
    height: '65%',
    border: '1px solid rgba(0, 0, 0, 0.22)',
    borderTop: 'unset',
    borderRadius: '0 0 5px 5px'
  },
  btnLeftRoot: {
    minWidth: 185
  },
  btnRightRoot: {
    minWidth: 100
  },
  moduleWrapper: {
    overflowX: 'hidden',
    overflowY: 'auto',
    height: 'inherit'
  },
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
    }),
    height: 725
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
    overflowX: 'hidden',
    height: 635
  },
  content: {
    backgroundColor: theme.palette.cimsBackgroundColor,
    marginLeft: 74,
    // padding: 10,
    // minWidth: 920,
    minHeight: 640,
    // height: 'calc(69vh - 15px)',
    width: 'calc(97% - 24px)',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
    // overflowX: 'auto',
    // overflowY: 'hidden'
  },
  contentOpen: {
    marginLeft: drawerWidth,
    width: 'calc(94% - 143px)',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  contentWrapper: {
    // height: 'calc(68vh - 78px)',
    // width: 'calc(95% - 33px)'
  },
  selectedItem: {
    backgroundColor: '#DCDCDC'
  },
  paper: {
    maxWidth: '64%',
    minWidth: '800px'
  },
  formControlCss: {
    overflow: 'auto'
  },
  formControl2Css: {
    maxHeight: 'calc(100% - 140px)',
    overflow: 'auto'
  },
  checkBoxStyle:{
    color:color.cimsLabelColor
  },
  normalFont: {
    fontSize: font.fontSize,
    fontFamily: font.fontFamily,
    color: color.cimsTextColor,
    '&.Mui-disabled': {
      color: color.cimsLabelColor
    }
  },
  disabledLabel: {
    color: `${color.cimsLabelColor} !important`
  },
  btnDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  }
});