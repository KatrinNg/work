import { getState } from '../../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = {
  settingWrapperDiv: {
    // width: '100%'
  },
  fullWidth: {
    marginBottom:22,
    display:'flow-root'
  },
  checkBoxGrid: {
    marginTop: 0
  },
  normalFont: {
    ...standardFont,
    width:280
  },
  serviceLabel: {
    ...standardFont,
    float: 'left',
    paddingTop: '3px',
    paddingRight: '10px',
    fontWeight: 'bold'
  },
  detail_warp: {
    height: '100%',
    width: '100%'
  },
  wrapper: {
    height: 'calc(100% - 100px)',
    overflowY: 'hidden',
    paddingRight: '10px'
  },
  fixedDiv: {
    minWidth:1100,
    paddingLeft: 10,
    width:'98%'
  },
  titleFont:{
    color: color.cimsTextColor,
    fontSize: '1.5rem',
    fontFamily: font.fontFamily
  },
  serviceFont: {
    ...standardFont,
    padding: 10,
    fontWeight:'bold'
  },
  cardContainer: {
    columnCount: '3',
    height: 'calc(100% - 50px)',
    columnGap: '10px',
    minHeight:'710px'
  }
};
