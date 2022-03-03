import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Paper, IconButton, Popper, MenuItem, Typography, CircularProgress, Grid, Tooltip, TextField } from '@material-ui/core';
import { Search, Clear, Add } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './FuzzySearchBoxStyle';
import { trim, debounce, find } from 'lodash';
import _ from 'lodash';
import { InfiniteLoader, List } from 'react-virtualized';

class FuzzySearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      isOnMenu: false,
      isOnInput: false,
      value: '',
      keepDataSelected: false,
      openSearchProgress: false,
      dataList: [],
      addButtonMark: true,
      count: -1
    };
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const { dataList } = this.props;
    let { openSearchProgress, value } = this.state;

    if (nextProps.dataList !== dataList) {
      this.setState({
        dataList: nextProps.dataList,
        count: -1
      });
      let tempObj = find(nextProps.dataList, (item) => {
        return item.termDisplayName === value;
      });
      if (tempObj != undefined) {
        this.setState({
          addButtonMark: true
        });
      } else {
        this.setState({
          addButtonMark: false
        });
      }
    }
    if (openSearchProgress) {
      this.setState({
        openSearchProgress: false
      });
    }
  }

  // enter search
  search = () => {
    let { value } = this.state;
    let tempVal = trim(value);
    this.setState({
      openSearchProgress: true,
      open: true
    });
    this.debounceChange(tempVal);
    this.anchorel.focus();
  };

  debounceChange = debounce(function (value) {
    const { onChange } = this.props;
    onChange && onChange(value);
  }, 1000);

  // Change search value
  handleToggle = (e) => {
    const { limitValue = 0, closeSearchData } = this.props;
    let value = trim(e.target.value);
    document.addEventListener('click', this.hideList);
    let valBoolSearch = false;
    let resultVal = value.split(' ');
    for (let index = 0; index < resultVal.length; index++) {
      const element = resultVal[index];
      if (element.length >= limitValue) {
        valBoolSearch = true; break;
      }
    }
    if(valBoolSearch){
    // if (!!value && value.length >= limitValue) {
      closeSearchData && closeSearchData();
      this.setState({
        openSearchProgress: true,
        open: true
      });
      this.debounceChange(value);
    } else {
      this.setState({
        open: false,
        dataList: []
      });
      closeSearchData && closeSearchData();
    }
    this.setState({ value: e.target.value });
  };

  // whichone choose
  handleItemSelected = (item) => {
    const { keepData, onSelectItem, id, closeSearchData } = this.props;
    document.getElementById(`search_input_base_${id}`).focus();
    onSelectItem && onSelectItem(item);
    if (keepData) {
      let str = this.getSelectedString(item);
      closeSearchData && closeSearchData();
      this.setState({
        open: false,
        value: str,
        keepDataSelected: true
      });
    } else {
      closeSearchData && closeSearchData();
      this.setState({
        open: false,
        value: ''
      });
    }
  };

  // keyboard event
  keyDown = (e) => {
    if (this.state.open) {
      let temp = _.cloneDeep(this.state.count);
      let dataList = this.state.dataList || [];
      let len = dataList.length; //patient count
      if (e.keyCode === 40) {
        temp = this.pressArrowDown(temp, len);
      } else if (e.keyCode === 38) {
        temp = this.pressArrowUp(temp, len);
      } else if (e.keyCode === 13) {
        if (temp == -1) {
          this.search();
        } else {
          this.handleItemSelected(dataList[temp]);
          temp = -1;
        }
      }

      this.setState({ count: temp });
    } else {
      if (e.keyCode === 13) {
        // Enter
        this.search();
      }
    }
  };

  pressArrowDown = (temp, len) => {
    if (temp > -2 && temp < len - 1) {
      temp = temp + 1;
    } else if (temp === len - 1) {
      temp = len - 1;
    } else {
      temp = 0;
    }
    if (len > 6) {
      const { id } = this.props;
      if (temp === 0) {
        document.getElementById('search_menu_item_container_' + id).scrollTop = 1;
      } else if (len - 6 === temp) {
        document.getElementById('search_menu_item_container_' + id).scrollTop = temp * 40 - 5;
      } else if (len - 1 >= temp && len - 6 < temp) {
        document.getElementById('search_menu_item_container_' + id).scrollTop = (len - 6) * 40 - 5 + (temp - (len - 6));
      } else {
        document.getElementById('search_menu_item_container_' + id).scrollTop = temp * 40;
      }
    }
    return temp;
  };

  pressArrowUp = (temp, len) => {
    if (temp > 0 && temp < len) {
      temp = temp - 1;
    } else if (temp === 0) {
      temp = 0;
    } else {
      temp = len - 1;
    }
    if (len > 6) {
      const { id } = this.props;
      if (temp === 0) {
        document.getElementById('search_menu_item_container_' + id).scrollTop = 1;
      } else if (len - 1 >= temp && len - 6 < temp) {
        document.getElementById('search_menu_item_container_' + id).scrollTop = (len - 6) * 40 - 5 + (temp - (len - 6));
      } else {
        document.getElementById('search_menu_item_container_' + id).scrollTop = temp * 40;
      }
    }
    return temp;
  };

  itemKeyDown = (e, item) => {
    const { keepData, onSelectItem } = this.props;
    if (e.keyCode === 13) {
      onSelectItem && onSelectItem(item);
      if (keepData) {
        let str = this.getSelectedString(item);
        this.setState({
          open: false,
          value: str,
          keepDataSelected: true
        });
      } else {
        this.setState({
          open: false,
          value: ''
        });
      }
    }
  };

  handleClose = (e) => {
    let { onClose } = this.props;
    this.setState({
      open: false,
      value: '',
      keepDataSelected: false,
      dataList: []
    });
    onClose && onClose(e);
  };

  closeSearchData = (e) => {
    let { closeSearchData, insertCloseLog, type } = this.props;
    this.setState({
      open: false,
      value: '',
      keepDataSelected: false,
      dataList: [],
      addButtonMark: true
    });
    closeSearchData && closeSearchData();
    insertCloseLog && insertCloseLog(type);
  };

  addSearchData = (e) => {
    const { handleAddSearchData, prbleMark } = this.props;
    let addText = this.state.value;
    let clickAddMark = false;
    if (prbleMark) {
      clickAddMark = true;
    }
    handleAddSearchData && handleAddSearchData(addText, clickAddMark);
    this.setState({
      open: false,
      value: '',
      keepDataSelected: false,
      dataList: [],
      addButtonMark: true
    });
  };

  hideList = () => {
    const { closeSearchData } = this.props;
    let { isOnMenu } = this.state;
    if (!isOnMenu) {
      // closeSearchData && closeSearchData();
      this.setState({
        open: false,
        value: '',
        keepDataSelected: false,
        dataList: []
      });
      document.removeEventListener('click', this.hideList);
    }
  };

  handleOnFocus = () => {
    document.addEventListener('click', this.hideList);
  };

  handleMenuMouseOver = () => {
    this.setState({ isOnMenu: true });
  };

  handleMenuMouseLeave = () => {
    this.setState({ isOnMenu: false });
  };

  getSelectedString(item) {
    const { displayField } = this.props;
    let str = '';
    if (displayField != null) {
      displayField.forEach((displayField, index) => {
        str = str + (index === 0 ? item[displayField] : ', ' + item[displayField]);
      });
    } else {
      str = item;
    }
    return str;
  }

  handleIsRowLoaded = ({ index }) => {
    let { dataList } = this.state;
    return !!dataList[index];
  };

  updateState = (obj) => {
    this.setState({
      ...obj
    });
  };

  handleLoadMoreRows = ({ startIndex, stopIndex }) => {
    const { handleSearchBoxLoadMoreRows } = this.props;
    let { value, dataList } = this.state;
    return handleSearchBoxLoadMoreRows(startIndex, stopIndex, value, dataList, this.updateState);
  };

  handleRowRenderer = ({ index, key, style }) => {
    const { classes, id = '', displayField } = this.props;
    let { dataList } = this.state;
    let item = dataList[index];
    if (!!item) {
      let displayText = '';
      this.setState({ indexObj: { index, key, style } });
      displayText =
        displayField != null
          ? displayField.map((displayField, index) => {
              return index === 0 ? item[displayField] : ', ' + item[displayField];
            })
          : item;
      return (
        <MenuItem
            id={`${id}_menu_item_${index}`}
            key={key}
            style={style}
            onClick={() => {
              this.handleItemSelected(item);
            }}
            onKeyDown={(e) => {
              this.itemKeyDown(e, item);
            }}
            className={this.state.count === index ? classes.menu_list_select : classes.menu_list}
        >
          <Typography variant="caption" component="span" className={classes.mr15} noWrap>
            <Tooltip
                title={`${displayText}`}
                classes={{
                  popper: classes.popper,
                  tooltip: classes.tooltip
                }}
            >
              <label className={classes.label}>{displayText}</label>
            </Tooltip>
          </Typography>
        </MenuItem>
      );
    } else {
      return null;
    }
  };

  render() {
    const { classes, id = '', inputPlaceHolder = '', disabled = false, totalNums = 0, pageSize = 20 } = this.props;
    let { open, value, openSearchProgress, dataList = [] } = this.state;

    return (
      <Paper className={classes.root} elevation={1} onMouseOver={this.handleMenuMouseOver} onMouseLeave={this.handleMenuMouseLeave} component="div">
        <Grid
            autoComplete="off" //Cancel AutoFill in Google Browser
            container
            justify="space-between"
            alignItems="center"
        >
          <Paper className={classes.inputPaper}>
            <Search className={classes.searchIcon} />
            <TextField
                autoComplete="off"
                className={classes.input}
                id={`search_input_base_${id}`}
                inputProps={{
                  maxLength: 1000
                  // style: { fontSize: '1rem', fontFamily: 'Arial' }
                }}
                InputProps={{
                  classes: {
                    input: classes.innerInput
                  },
                  disableUnderline: true
                }}
                inputRef={(node) => {
                  this.anchorel = node;
                }}
                ref={'inputBase'}
                onChange={this.handleToggle}
                onKeyDown={this.keyDown}
                value={value}
                placeholder={inputPlaceHolder}
                onFocus={this.handleOnFocus}
                disabled={disabled}
            />

            <IconButton
                id={`add_btn_${id}`}
                onClick={this.addSearchData}
                className={classes.iconButton}
                aria-label="Add"
                style={{ display: !disabled && !this.state.addButtonMark && this.state.value !== '' ? 'inline-block' : 'none' }}
            >
              <Add />
            </IconButton>

            <IconButton id={`search_btn_${id}`} onClick={this.closeSearchData} className={classes.iconButton} aria-label="Search">
              {openSearchProgress ? <CircularProgress size={20} /> : value.length === 0 ? null : <Clear />}
            </IconButton>
          </Paper>
        </Grid>
        <Popper open={open} anchorEl={this.anchorel} style={{ zIndex: 10 }}>
          <Paper className={classes.paper}>
            <Typography ref="myInput" component="div" id={`search_menu_item_wrapper_${id}`} className={classes.menu}>
              {openSearchProgress ? null : dataList.length === 0 ? null : dataList.length > 6 ? (
                <InfiniteLoader isRowLoaded={this.handleIsRowLoaded} loadMoreRows={this.handleLoadMoreRows} minimumBatchSize={pageSize} threshold={10} rowCount={totalNums}>
                  {({ onRowsRendered, registerChild }) => (
                    <List
                        id={`search_menu_item_container_${id}`}
                        height={240}
                        width={548}
                        rowHeight={40}
                        ref={registerChild}
                        rowCount={dataList.length}
                        rowRenderer={this.handleRowRenderer}
                        onRowsRendered={onRowsRendered}
                    />
                  )}
                </InfiniteLoader>
              ) : (
                this.props.dataList &&
                this.props.dataList.map((item, index) => (
                  <MenuItem
                      id={this.props.id + '_menu_item_' + index}
                      key={index}
                      onClick={() => {
                      this.handleItemSelected(item);
                    }}
                      className={this.state.count === index ? classes.menu_list_select : classes.menu_list}
                      onKeyDown={(e) => this.itemKeyDown(e, item)}
                  >
                    <Typography variant="caption" component="span" className={classes.mr15}>
                      {this.props.displayField != null
                        ? this.props.displayField.map((displayField, index) => {
                            return index === 0 ? item[displayField] : ', ' + item[displayField];
                          })
                        : item}
                    </Typography>
                  </MenuItem>
                ))
              )}
            </Typography>
            <MenuItem id={`search_box_last_item_${id}`} className={classes.menu_list + ' ' + classes.closeButton}>
              {`${dataList.length} of ${totalNums}`}
            </MenuItem>
          </Paper>
        </Popper>
      </Paper>
    );
  }
}

FuzzySearchBox.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired
};

FuzzySearchBox.defaultProps = {
  onChange: () => {},
  onSelectItem: () => {}
};

export default withStyles(styles)(FuzzySearchBox);
