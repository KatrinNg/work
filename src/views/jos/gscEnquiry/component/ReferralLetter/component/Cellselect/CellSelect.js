import React from 'react';
import {
  TextField,
  MenuItem
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

const styles = ()=>(
    {
        editableInput: {
            display: 'block',
            width: '100%',
            background: '#dde5fe',
            boxSizing: 'border-box',
            outline: 'none',
            font: 'inherit',
            border: 0,
            minHeight: '30px',
            lineHeight: '30px'
        }
    }
);
class CellSelect extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {classes, options,customStyle={},disabled,onChange, ...others} = this.props;
    let defaultOptionValue = options ? options[0] : '';
    let defStyle = Object.assign({},{
        width: 'auto',
        padding: '4px',
        boxSizing: 'border-box',
        display: 'flex',
        borderRadius: '4px'
    },customStyle);
    if (disabled){
      defStyle.backgroundColor = '#fafafa';
    }
    return(
        <TextField
            variant="standard"
            select
            size="larger"
            value={defaultOptionValue}
            InputProps={{
              className: classes.editableInput,
              disableUnderline: true
            }}
            SelectProps={{style:defStyle}}
            fullWidth
            onChange={onChange}
            disabled={disabled}
            {...others}
        >
          {
            options.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))
          }
        </TextField>
    );
  }
}

export default withStyles(styles)(CellSelect);