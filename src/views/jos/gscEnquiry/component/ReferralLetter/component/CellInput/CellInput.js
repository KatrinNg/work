import React from 'react';
import {
  TextField
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  baseInput: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    font: 'inherit',
    padding: '4px',
    border: 0,
    height: '100%',
    minHeight: '30px',
    lineHeight: '30px',
    borderRadius: 4,
    disableUnderline: 'underline'
  },
  editableInput: {
    background: '#dde5fe'
  },
  uneditableInput: {
    backgroundColor: 'transparent'
  }
});

class CellInput extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { classes, border = false, disabled, readOnly, rows = 1,multiline=false,style, ...others } = this.props;
    let isMultiLine = multiline ? multiline : rows > 1;
    let classList = [classes.baseInput];
    let inputStyle ={...style};
    if(border){
      classList.push(classes.border);
    }

    if (readOnly || disabled){
      console.log(readOnly,disabled);
      classList.push(classes.uneditableInput);
      inputStyle.backgroundColor = '#fafafa';
    }else {
      classList.push(classes.editableInput);
    }
    return (
        <TextField
            variant={border ? 'outlined' : 'standard'}
            fullWidth
            rows={rows}
            readOnly={readOnly || disabled}
            size="small"
            multiline={isMultiLine}
            disabled={disabled}
            inputProps={{
              className: classList.join(' '),
              disableUnderline: true
            }}
            InputProps={{
              className: classList.join(' '),
              disableUnderline: true,
              style: inputStyle
            }}
            {...others}
        />
    );
  }
}

export default withStyles(styles)(CellInput);
