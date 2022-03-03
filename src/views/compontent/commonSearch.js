import React, { useState, useEffect } from 'react';
import {
  Grid,
  InputBase,
  IconButton,
  Paper
}
  from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Search } from '@material-ui/icons';


const style = () => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '15px',
    border: '1px solid rgba(0,0,0,0.42)',
    height: 25,
    position: 'relative'
  },
  input: {
    marginLeft: 8,
    flex: 1,
    fontSize: '12pt'
  },
  iconButton: {
    padding: 10
  }
});

const CommonSearch = React.forwardRef(function CommonSearch(props, ref) {
  const [value, setValue] = useState('');

  useEffect(() => {
      setValue(props.value);
  }, [props.value]);

  const handleToggle = e => {
    let _value = e.target.value;
    if (_value !== undefined && _value !== null && (_value.trim().length >= props.limitValue || _value === '')) {
      props.onChange(_value);
    }
    setValue(e.target.value);
  };
  const handleSearchClick = () => {
    if (value !== undefined && value !== null && (value.trim().length !== 0 || value === '')) {
      props.onChange(value);
    }
  };

  const handleKeyboardDown = e => {
    if(e.keyCode === 13){
      handleSearchClick();
    }
  };

  const { classes, id } = props;
  return <Paper
      style={{ ...props.style }}
      className={classes.root}
         >
    <Grid
        container
        justify="space-between"
        alignItems="center"
    >
      <InputBase
          id={id + '_inputKeyboardInputBase'}
          className={classes.input}
          value={value}
          fullWidth
          ref={ref}
          autoComplete={'off'}
          onChange={handleToggle}
          placeholder={props.inputPlaceHolder}
          onKeyDown={handleKeyboardDown}
          inputProps={{
          maxLength: props.inputMaxLength
        }}
      />
      <IconButton
          id={id + '_searchBtnIconButton'}
          aria-label="Search"
          color={'primary'}
          className={classes.iconButton}
          onClick={handleSearchClick}
      >
        <Search />
      </IconButton>
    </Grid>
  </Paper>;
});

export default withStyles(style)(CommonSearch);
