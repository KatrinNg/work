import { getState } from '../../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

export const styles = {
  form_wrapper: {
    minWidth: '1150px'
  },
  title_span: {
    ...standardFont,
    paddingTop: '5px',
    paddingRight: '2px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  field_grid_wrapper: {
    maxWidth: '90%'
  },
  label_assessment: {
    ...standardFont,
    fontWeight: 'bold',
    paddingTop: '5px',
    minWidth: '170px'
  },
  field_wrapper: {
    display: 'inherit',
    // minHeight: 90
    minHeight:61
  },
  //Test Start
  field_wrapperBP:{
    display: 'inherit',
    minHeight:90
  },
  btnGridBP: {
    paddingRight: 2,
    maxWidth: 62,
    margin:'29px 0',
    textAlign: 'center'
  },
  //Test End
  assessment_grid_wrapper: {
    backgroundColor: '#D1EEFC'
  },
  field_title_div: {
    display: 'inline-flex'
  },
  btn_wrapper: {
    // height: '30px',
    width: '100%',
    marginBottom: 14
  },
  btn_wrapper_BP: {
    width: '100%',
    marginBottom: 29
  },
  item_wrapper: {
    marginLeft: -5
    // paddingLeft: '10px'
  },
  fabButtonDelete: {
    marginTop: 1,
    float: 'right',
    height: '28px',
    width: '28px',
    minHeight: '28px',
    backgroundColor: '#FD0000',
    '&:hover': {
      backgroundColor: '#fd0000'
    }
  },
  icon: {
    fontSize: '24px'
  },
  btnAdd: {
    height: '28px',
    width: '28px',
    minHeight: '28px',
    '&:hover': {
      backgroundColor: '#0098FF'
    }
  },
  btnGrid: {
    paddingRight: 2,
    maxWidth: 62,
    // minWidth: '45px',
    // margin: '29px 0',
    margin:'14px 0',
    textAlign: 'center'
  },
  unionFieldWrapper: {
    flexBasis: '25%',
    maxWidth: '25%',
    minWidth: 270
  }
};
