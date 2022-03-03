import React from 'react';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { getState } from '../../store/util';
const { color } = getState(state => state.cimsStyle) || {};

const customTheme= (theme)=>{
  return createMuiTheme({
    ...theme,
    overrides: {
      MuiButton:{
        root:{
          textTransform:'none',
          fontSize: '0.875rem',
          backgroundColor: '#ffffff',
          '&$disabled': {
            boxShadow: 'none',
            backgroundColor:color.cimsDisableColor
          }
        },
        outlinedPrimary:{
          '&:hover':{
            backgroundColor:theme.palette.primary.main,
            color:theme.palette.primary.contrastText
          },
          boxShadow:'2px 2px #6e6e6e'
        },
        sizeSmall:{
          padding: '3px 9px',
          fontSize: '0.8125rem'
        },
        sizeLarge:{
          padding: '7px 21px',
          fontSize: '0.9375rem'
        }
      }
    }
  });
};

const JButton=({children,...resProps})=>{
  const defaultProps={
    variant:'outlined',
    color:'primary'
  };
  const props={...defaultProps,...resProps};
  return (
    <MuiThemeProvider theme={customTheme}>
      <Button {...props}>{children}</Button>
    </MuiThemeProvider>);
};

export default JButton;
