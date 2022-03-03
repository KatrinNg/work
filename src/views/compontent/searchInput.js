import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  Paper,
  InputBase,
  IconButton,
  Popper,
  MenuItem,
  Typography,
  CircularProgress,
  Grid
} from '@material-ui/core';
import { Search, Clear } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import clsx from 'clsx';

const style = {
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '15px',
    border: '1px solid rgba(0,0,0,0.42)',
    height: 25,
    width: 500
  },
  rootFocus: {
    border: '1px solid #0579c8'
  },
  iconButton: {
    padding: 10
  },
  popper: {
    zIndex: 1301
  },
  paper: {
    marginTop: -5,
    maxHeight: 200,
    position: 'absolute',
    transform: 'translate3d(-231px, 3px, 0px)'
  },
  menu: {
    width: 500,
    maxHeight: 150,
    overflowY: 'auto'
  },
  menu_list: {
    fontSize: '12pt',
    paddingTop: 2,
    paddingBottom: 3,
    height: 'auto',
    whiteSpace: 'inherit',
    minHeight: 'unset'
  },
  menu_list_select: {
    fontSize: '12pt',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingTop: 2,
    paddingBottom: 3,
    height: 'auto',
    whiteSpace: 'inherit',
    minHeight: 'unset'
  },
  mr15: {
    wordBreak: 'break-all',
    marginRight: 15,
    minWidth: 330,
    minHeight: 24,
    fontSize: 14
  },
  search_root: {
    marginLeft: 8,
    flex: 1,
    fontSize: '12pt'
  },
  search_input: {
    textTransform: 'uppercase'
  }
};
class SearchInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      count: -1,
      isOnMenu: false,
      isOnInput: false,
      value: '',
      keepDataSelected: false,
      openSearchProgress: false,
      isInputFocus: false,
      notRunFunc: false
    };
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (nextProps.dataList !== this.props.dataList) {
      this.setState({ count: -1 });
    }
    if (this.state.openSearchProgress) {
      this.setState({ openSearchProgress: false });
    }
    if((nextProps.openIdleDialog!==this.props.openIdleDialog)&&nextProps.openIdleDialog==true){
      this.resetSearchBar();
      this.focusSearchInput();
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(prevState.open === true && this.state.open === false){
      this.props.clearDataList && this.props.clearDataList();
    }
  }

  // enter search
  search = () => {
    if (this.state.value) {
      this.setState({ openSearchProgress: true });
      if (!this.props.disabledDropdown && this.props.onChange((this.state.value || '').toUpperCase()) !== false) {
        this.setState({ open: true });
      }
    } else {
      this.setState({ open: true });
    }
    //must not trigger the focus function
    this.setState({ notRunFunc: true }, () => {
      this.anchorel.focus();
      this.setState({ notRunFunc: false });
    });
  };

  // Change search value
  handleToggle = e => {
    let value = e.target.value;
    if (!this.props.continuousSpace) {
      value = value.replace(/(\s)\1+/g, '$1');
    }
    value = value.replace(/(\s)\1+/g, '$1');
    if (value && value !== '' && value.length >= this.props.limitValue) {
      this.setState({ openSearchProgress: true });
      this.props.onChange(value.toUpperCase());
      if (!this.props.disabledDropdown) {
        this.setState({ open: true });
      }
    }
    else if (value.length === 0) {
      if (this.props.resetList && typeof this.props.resetList === 'function') {
        this.props.resetList();
      }
    }
    else {
      this.setState({ open: false });
    }
    this.setState({ value: value });
  };

  // whichone choose
  handleClose = item => {
    this.props.onSelectItem(item);
    if (this.props.keepData) {
      let str = this.getSelectedString(item);
      this.setState({ open: false, value: str, keepDataSelected: true });
    } else {
      this.setState({ open: false, value: '' });
    }
  };

  // keyboard event
  keyDown = e => {
    if (this.state.open) {
      let temp = _.cloneDeep(this.state.count);
      let dataList = this.props.dataList || [];
      let len = dataList.length; //patient count
      if (e.keyCode === 40) {
        if (temp > -2 && temp < len - 1) {
          temp = temp + 1;
        } else if (temp === len - 1) {
          temp = -2;
        } else {
          temp = 0;
        }
      }
      if (e.keyCode === 38) {
        if (temp > 0 && temp < len) {
          temp = temp - 1;
        } else if (temp === -1) {
          temp = -2;
        } else if (temp === 0) {
          temp = -2;
        } else {
          temp = len - 1;
        }
      }
      if (e.keyCode === 13) {
        if (temp === -2) {
          this.handleNotFound();
          temp = -1;
        } else if (temp === -1) {
          temp = -1;
        } else {
          this.handleClose(this.props.dataList[temp]);
          temp = -1;
        }
      }
      if (temp > 3) {
        document.getElementById(this.props.id + '_Container').scrollTop = (temp - 3) * 30;
        //this.refs.myInput.scrollTop = (temp - 3) * 35;
      } else if (temp > 0 && temp <= 3) {
        //this.refs.myInput.scrollTop = 0;
        document.getElementById(this.props.id + '_Container').scrollTop = 0;
      }
      this.setState({ count: temp });
    } else {
      if (e.keyCode === 13) {
        this.search();
      }
    }
  };

  itemKeyDown = (e, item) => {
    if (e.keyCode === 13) {
      this.props.onSelectItem(item);
      if (this.props.keepData) {
        let str = this.getSelectedString(item);
        this.setState({ open: false, value: str, keepDataSelected: true });
      } else {
        this.setState({ open: false, value: '' });
      }
    }
  }

  handleNotFound = (e) => {
    this.setState({ open: false, value: '', keepDataSelected: false });
    if (this.props.handleNotFound) {
      this.props.handleNotFound(e);
    }
  }

  closeSearchData = (e) => {
    this.setState({ open: false, value: '', keepDataSelected: false });
    if (this.props.closeSearchData) {
      this.props.closeSearchData(e);
    }
  }

  handleMenuMouseOver = () => {
    this.setState({ isOnMenu: true });
  }

  handleMenuMouseLeave = () => {
    this.setState({ isOnMenu: false });
  }

  getSelectedString(item) {
    let str = '';
    if (this.props.displayField != null) {
      this.props.displayField.forEach((displayField, index) => {
        if(item[displayField]){
          str = str + (index === 0 ? item[displayField] : ', ' + item[displayField]);
        }else{
          str = str +  item[displayField];
        }
      });
    } else {
      str = item;
    }
    return str;
  }

  resetSearchBar = () => {
    this.setState({ open: false, value: '', keepDataSelected: false });
  }

  focusSearchInput = () => {
    this.setState({ notRunFunc: true }, () => {
      this.anchorel.focus();
      this.setState({ notRunFunc: false });
    });
  }

  handleInputFocus = (e) => {
    this.setState({ isInputFocus: true });
    if (!this.state.notRunFunc) {
      this.props.onInputFocus && this.props.onInputFocus(e);
    }
  }

  handleInputBlur = (e) => {
    if (!this.state.keepDataSelected && !this.state.isOnMenu) {
      this.setState({ open: false, value: '', keepDataSelected: false });
      if (this.props.onBlur) {
        this.props.onBlur(e);
      }
    }
    this.setState({ isInputFocus: false });
  }

  getSearchStr=()=>{
    return this.state.value;
  }

  render() {
    const { classes,noneElevation } = this.props;
    return (
      <Paper
          className={clsx(classes.root, { [classes.rootFocus]: this.state.isInputFocus })}
          elevation={noneElevation?null:1}
          onMouseOver={this.handleMenuMouseOver}
          onMouseLeave={this.handleMenuMouseLeave}
      >
        <Grid
            component="form"//Cancel AutoFill in Google Browser
            autoComplete="off"//Cancel AutoFill in Google Browser
            container
            justify="space-between"
            alignItems="center"
        >
          <InputBase
              id={this.props.id + '_inputBase'}
              classes={{
                root: classes.search_root,
                input: classes.search_input
              }}
              ref={'inputBase'}
              inputRef={node => this.anchorel = node}
              autoComplete="off"
              onChange={this.handleToggle}
              onBlur={this.handleInputBlur}
              onFocus={this.handleInputFocus}
              placeholder={this.props.inputPlaceHolder||''}
              value={this.state.value}
              onKeyDown={this.keyDown}
              readOnly={this.state.keepDataSelected}
          />
          {/* Stop form auto submit */}
          <input type="text" style={{ display: 'none' }} />
          {/* Stop form auto submit */}
          <IconButton
              id={this.props.id + '_BUTTON'}
              onClick={this.state.keepDataSelected ? this.closeSearchData : this.search}
              className={classes.iconButton}
              aria-label="Search"
              color={'primary'}
          >
            {this.state.openSearchProgress ? (
              <CircularProgress size={20} />
            ) : (
                this.state.keepDataSelected ? <Clear /> : <Search />
              )}
          </IconButton>
        </Grid>
        <Popper
            open={this.state.open}
            anchorEl={this.anchorel}
            className={classes.popper}
        >
          <Paper className={classes.paper}>
            <Typography ref="myInput" id={this.props.id + '_Container'} className={classes.menu}>
              {
                this.props.formatType === 'drug' ?
                  this.props.dataList && this.props.dataList.map((item, index) => (
                    <MenuItem
                        id={this.props.id + '_MenuItem_' + index}
                        key={index}
                        onClick={() => this.handleClose(item)}
                        className={
                        this.state.count === index
                          ? classes.menu_list_select
                          : classes.menu_list
                      }
                        onKeyDown={this.itemKeyDown(item)}
                    >
                      <Typography variant="inherit" className={classes.mr15}>
                        {
                          this.props.displayField != null ? this.props.displayField.map((displayField, index2) =>
                            <Typography variant="inherit" className={classes.mr15} key={index2}>
                              {item[displayField]}
                              {
                                Object.prototype.toString.call(displayField) === '[object Array]' && displayField.length > 0 ?
                                  <Typography variant="inherit" className={classes.mr15}>
                                    {this.props.childField != null ? this.props.childField.map((childField, index3) => {
                                      return index3 === 0 ? item[childField] : '-' + item[childField];
                                    })
                                      : null}
                                  </Typography>
                                  : null
                              }
                            </Typography>

                          ) : item}
                      </Typography>
                    </MenuItem>
                  ))
                  :
                  this.props.dataList && this.props.dataList.map((item, index) => (
                    <MenuItem
                        id={this.props.id + '_MenuItem_' + index}
                        key={index}
                        onClick={() => this.handleClose(item)}
                        className={
                        this.state.count === index
                          ? classes.menu_list_select
                          : classes.menu_list
                      }
                        onKeyDown={this.itemKeyDown(item)}
                    >
                      <Typography variant="caption" component="span" className={classes.mr15}>
                        {
                          this.props.displayField != null ? this.props.displayField.map((displayField, index2) => {
                            if(item[displayField]){
                              return index2 === 0 ? item[displayField] : ', ' + item[displayField];
                            }else{
                              return  item[displayField];
                            }

                          }) : item}
                      </Typography>
                    </MenuItem>
                  ))
              }
            </Typography>
            {
              !this.state.openSearchProgress ?
                <MenuItem
                    id={this.props.id + '_lastMenuItem'}
                    onClick={this.handleNotFound}
                    style={{
                    borderTop: '1px solid rgba(0, 0, 0, 0.42)'
                  }}
                    className={
                    this.state.count === -2
                      ? classes.menu_list_select
                      : classes.menu_list
                  }
                >
                  {this.props.lastSelectionName || 'Close'}
                </MenuItem> : null
            }
          </Paper>
        </Popper>
      </Paper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
      openIdleDialog: state.common.openIdleDialog

  };
};

const dispatchToProps = {
};

SearchInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired
};

SearchInput.defaultProps = {
  onChange: () => { },
  onSelectItem: () => { }
};

export default withRouter(connect(mapStateToProps, dispatchToProps)(withStyles(style)(SearchInput)));