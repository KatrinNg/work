import { makeStyles } from '@material-ui/styles';

const styledBy = (property, mapping, type) => (props) => {
  const temp = props[property]||'default'
  let c = mapping[temp];
  
  if (props.variant === 'contained' && type === 'color' && (temp !=='default' && temp !=='cancel')) {
    c = '#fff'
  }
  if (props.variant === 'outlined' && type === 'backgroundColor') {
    c = '#fff'
  }
  return c
};

const styledByHover = (property, mapping, type) => (props) => {
  let c = mapping[props[property]||'default'];
  if (props.variant === 'outlined' && type === 'backgroundColor') {
    c = '#fff'
  }
  return c
};

export default makeStyles((theme) => ({
  root: {
    color: styledBy("color", {
      default: '#999999',
      cancel: 'rgba(80,162,139,0.500)',
      primary: "#3ab395",
    }, 'color'),
    fontSize: 14,
    textTransform: "none",
    borderRadius: 8,
    border: styledBy("color", {
      default: '1px solid #999999',
      cancel: '1px solid #a8e2d3',
      primary: "1px solid #3ab395",
    },'border'),
    minWidth: 82,
    // height: 36,
    // margin: ` 16px 16px 16px 32px`,
    boxShadow: 'none',
    backgroundColor: styledBy("color", {
      default: '#fff',
      cancel: '#e3fdf7',
      primary: "#3ab395",
    }, 'backgroundColor'),
    '&.Mui-disabled': {
      color: '#fff',
      border: '1px solid #b5b5b6',
      backgroundColor: '#b5b5b6',
    },
    "&:hover": {
      backgroundColor: styledByHover("color", {
        default: '#fff',
        cancel: '#e3fdf7',
        primary: "#3ab395",
      }, 'backgroundColor'),
      boxShadow: 'none',
     
    },
  }
}));


