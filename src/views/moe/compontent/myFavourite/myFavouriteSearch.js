import React, { Component } from 'react';
import {
  Grid,
  InputBase,
  IconButton,
  Paper
}
  from '@material-ui/core';
import {
  updateMyFavSearchInputVal
} from '../../../../store/actions/moe/myFavourite/myFavouriteAction';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
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

class MyFavouriteSearch extends Component {
  componentWillUnmount() {
    this.props.updateMyFavSearchInputVal({ favKeyword: '' });
  }

  // Change search value
  handleToggle = e => {
    let value = e.target.value;
    if (value !== undefined && value !== null && (value.trim().length >= this.props.limitValue || value === '')) {
      this.props.onChange(value);
    }
    this.props.updateMyFavSearchInputVal({ favKeyword: value });
  }

  handleKeyboardDown = e => {
    if (e.keyCode === 13) {
      this.handleSearchClick();
    }
  }

  //Click search icon
  handleSearchClick = () => {
    let value = this.props.favKeyword;
    if (value !== undefined && value !== null && (value.trim().length !== 0 || value === '')) {
      this.props.onChange(value);
    }
  }

  render() {
    const { classes, id } = this.props;
    return (
      <Paper
          style={{ ...this.props.style }}
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
              value={this.props.favKeyword}
              fullWidth
              autoComplete={'off'}
              onChange={this.handleToggle}
              placeholder={this.props.inputPlaceHolder}
              onKeyDown={this.handleKeyboardDown}
              inputProps={{
              maxLength: this.props.inputMaxLength
            }}
          />
          <IconButton
              id={id + '_searchBtnIconButton'}
              aria-label="Search"
              color={'primary'}
              className={classes.iconButton}
              onClick={this.handleSearchClick}
          >
            <Search />
          </IconButton>
        </Grid>
      </Paper>
    );
  }
}

const mapStateToProps = (state) => ({
  favKeyword: state.moeMyFavourite.favKeyword
});

const mapDispatchToProps = {
  updateMyFavSearchInputVal
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(MyFavouriteSearch));
