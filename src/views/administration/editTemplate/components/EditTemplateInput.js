import React, { Component } from 'react';
import { Paper, TextField, Popper, MenuItem, Typography, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import { connect } from 'react-redux';
import { updateSearchBarValue } from '../../../../store/actions/common/commonAction';

import { getState } from '../../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

let standardFont = {
  fontSize: font.fontSize,
  fontFamily: font.fontFamily
};

const style = {
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    margin: 5,
    border: '1px solid rgba(0,0,0,0.42)',
    height: 25,
    width: 400,
    backgroundColor: color.cimsBackgroundColor
  },
  input: {
    marginLeft: 8,
    flex: 1
  },
  innerInput: {
    ...standardFont,
    color: color.cimsTextColor,
    '&::placeholder': {
      color: color.cimsPlaceholderColor,
      opacity: 1
    }
  },
  iconButton: {
    padding: 10
  },
  paper: {
    zIndex: 1,
    // left: 0,
    // right: 0,
    marginTop: 3,
    maxHeight: 200,
    marginLeft: -20,
    position: 'absolute',
    transform: 'translate3d(-180px, 3px, 0px)',
    backgroundColor: color.cimsBackgroundColor
  },
  menu: {
    width: 390,
    maxHeight: 150,
    overflowY: 'auto'
  },
  menu_list: {
    ...standardFont,
    color: color.cimsTextColor,
    paddingTop: 2,
    paddingBottom: 3,
    height: 'auto',
    whiteSpace: 'inherit',
    backgroundColor: color.cimsBackgroundColor
  },
  menu_list_select: {
    ...standardFont,
    color: color.cimsTextColor,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingTop: 2,
    paddingBottom: 3,
    height: 'auto',
    whiteSpace: 'inherit'
  },
  mr15: {
    wordBreak: 'break-all',
    marginRight: 15,
    minWidth: 330,
    minHeight: 24,
    fontSize: 14
  }
  // container: {
  //   flexGrow: 1,
  //   position: 'relative'
  // }
};
class EditTemplateInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      count: -1,
      isOnMenu: false,
      isOnInput: false,
      val: this.props.searchInputvalue,
      DisplayNameType: false,
      displayName: this.props.searchInputvalue
    };
  }
  componentDidMount() {
    if (this.props.addflag) document.getElementById(this.props.sequence + '_inputBase').focus();
  }

  // componentDidUpdate() {
  //   if(this.props.addflag)
  //   document.getElementById(this.props.sequence + '_inputBase').focus()
  // }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.dataList !== this.props.dataList) {
      this.setState({ count: -1 });
    }
    if (nextProps.searchInputvalue !== this.props.searchInputvalue) {
      this.setState({ val: nextProps.searchInputvalue });
    }
  }

  componentWillUnmount() {
    // this.props.updateSearchBarValue('', false);
  }

  // enter search
  search = () => {
    if (this.props.onChange) {
      if (this.state.val) {
        this.props.onChange(this.state.val);
        if (!this.props.disabledDropdown) {
          this.setState({ open: true });
        }
      } else {
        this.setState({ open: true });
      }
    }
  };

  // Change search value
  handleToggle = (e) => {
    let value = e.target.value;
    let valBoolSearch = false;
    let resultVal = value.split(' ');
    for (let index = 0; index < resultVal.length; index++) {
      const element = resultVal[index];
      if (element.length >= this.props.limitValue) {
        valBoolSearch = true;
        break;
      }
    }
    if (valBoolSearch) {
    // if (value && value !== '' && value.length >= this.props.limitValue) {
      this.props.onChange(value);
      this.setState({ open: true });
    } else {
      this.setState({ open: false });
    }
    this.setState({ val: value });
    if (this.props.onSelectItem !== undefined) {
      this.props.onSelectItem(value);
    }
  };
  // whichone choose
  handleClose = (item) => {
    document.getElementById(this.props.id + '_inputBase').focus();
    this.props.onSelectItem(item);
    if (this.props.keepData) {
      let str = this.getSelectedString(item);
      this.setState({ open: false });
      this.props.updateSearchBarValue(str, true);
    } else {
      this.setState({ open: false });
      this.props.updateSearchBarValue('');
    }
    this.setState({
      val: item.termDisplayName
    });
  };

  // keyboard event
  keyDown = (e) => {
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
      } else if (e.keyCode === 9) {
        this.setState({ open: false });
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
        this.setState({ open: false });
        this.props.updateSearchBarValue(str, true);
      } else {
        this.setState({ open: false });
        this.props.updateSearchBarValue('');
      }
    }
  };

  handleNotFound = (e) => {
    this.setState({ open: false });
    this.props.updateSearchBarValue('', false);
    if (this.props.handleNotFound) {
      this.props.handleNotFound(e);
    }
  };

  closeSearchData = (e) => {
    this.setState({ open: false });
    this.props.updateSearchBarValue('', false);
    if (this.props.closeSearchData) {
      this.props.closeSearchData(e);
    }
  };

  handleOnBlur = (e) => {
    if (!this.state.isOnMenu) {
      this.setState({ open: false });
      this.props.updateSearchBarValue('', false);
      if (this.props.onBlur) {
        this.props.onBlur(e);
      }
    }
  };

  handleMenuMouseOver = () => {
    this.setState({ isOnMenu: true });
  };

  handleMenuMouseLeave = () => {
    this.setState({ isOnMenu: false });
  };

  getSelectedString(item) {
    let str = '';
    if (this.props.displayField != null) {
      this.props.displayField.forEach((displayField, index) => {
        str = str + (index === 0 ? item[displayField] : ', ' + item[displayField]);
      });
    } else {
      str = item;
    }
    return str;
  }

  handleDisplayName = (e) => {
    let value = e.target.value;
    this.setState({ displayName: value });
    this.props.onSelectItem(value);
  };

  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.root} elevation={1} onMouseLeave={this.handleMenuMouseLeave} onMouseOver={this.handleMenuMouseOver}>
        <Grid
            alignItems="center" //Cancel AutoFill in Google Browser
            autoComplete="off" //Cancel AutoFill in Google Browser
            container
            justify="space-between"
        >
          <TextField
              autoComplete="off"
              className={classes.input}
              id={this.props.id + '_inputBase'}
              inputProps={{
                maxLength: 1000
              }}
              InputProps={{
                disableUnderline: true,
                classes: { input: classes.innerInput }
              }}
              inputRef={(node) => {
                this.anchorel = node;
              }}
              onBlur={this.props.keepDataSelected ? null : this.handleOnBlur}
              onChange={this.handleToggle}
              onKeyDown={this.keyDown}
              style={{ display: this.props.dataList === null ? 'none' : 'display' }}
              value={this.state.val}
          />
        </Grid>

        <Popper anchorEl={this.anchorel} open={this.state.open} style={{ zIndex: 3000 }}>
          <Paper className={classes.paper}>
            <Typography className={classes.menu} id={this.props.id + '_Container'} ref="myInput">
              {this.props.formatType === 'drug'
                ? this.props.dataList &&
                  this.props.dataList.map((item, index) => (
                    <MenuItem
                        className={this.state.count === index ? classes.menu_list_select : classes.menu_list}
                        id={this.props.id + '_MenuItem_' + index}
                        key={index}
                        onClick={() => this.handleClose(item)}
                        onKeyDown={this.itemKeyDown(item)}
                    >
                      <Typography className={classes.mr15} variant="inherit">
                        {this.props.displayField != null
                          ? this.props.displayField.map((displayField) => (
                              <Typography className={classes.mr15} key={index} variant="inherit">
                                {item[displayField]}
                                {Object.prototype.toString.call(displayField) === '[object Array]' && displayField.length > 0 ? (
                                  <Typography className={classes.mr15} variant="inherit">
                                    {this.props.childField != null
                                      ? this.props.childField.map((childField) => {
                                          return index === 0 ? item[childField] : '-' + item[childField];
                                        })
                                      : null}
                                  </Typography>
                                ) : null}
                              </Typography>
                            ))
                          : item}
                      </Typography>
                    </MenuItem>
                  ))
                : this.props.dataList &&
                  this.props.dataList.map((item, index) => (
                    <MenuItem
                        className={this.state.count === index ? classes.menu_list_select : classes.menu_list}
                        id={this.props.id + '_MenuItem_' + index}
                        key={index}
                        onClick={() => this.handleClose(item)}
                        onKeyDown={this.itemKeyDown(item)}
                    >
                      <Typography className={classes.mr15} component="span" variant="caption">
                        {this.props.displayField != null
                          ? this.props.displayField.map((displayField, i) => {
                              return i === 0 ? item[displayField] : ', ' + item[displayField];
                            })
                          : item}
                      </Typography>
                    </MenuItem>
                  ))}
            </Typography>
            {this.props.openSearchProgress ? null : (
              <MenuItem
                  className={this.state.count === -2 ? classes.menu_list_select : classes.menu_list}
                  id={this.props.id + '_lastMenuItem'}
                  onClick={this.handleNotFound}
                  style={{
                    borderTop: '1px solid rgba(0, 0, 0, 0.42)'
                  }}
              >
                {this.props.lastSelectionName || 'Close'}
              </MenuItem>
            )}
          </Paper>
        </Popper>
      </Paper>
    );
  }
}

function mapStateToProps(state) {
  return {
    // openSearchProgress: state.common.openSearchProgress,//no searchProgress in common state anymore, please check
    value: state.common.searchBarValue,
    keepDataSelected: state.common.keepDataSelected
  };
}

const mapDispatchToProps = {
  updateSearchBarValue
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(EditTemplateInput));
