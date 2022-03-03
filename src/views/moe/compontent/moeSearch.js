import React, { Component } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  MenuItem,
  Typography,
  Grid,
  ListItem,
  List,
  Collapse,
  Avatar
} from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import minus from '../../../images/moe/elbow-end-minus-lg2.gif';
import plus from '../../../images/moe/elbow-end-plus-lg2.gif';


function calHeight() {
  let availHeight = screen.availHeight;
  if (availHeight <= 720) {
    return 190;
  }
  if (availHeight <= 900 && availHeight > 720) {
    return 320;
  }
  return 450;
}

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
  },
  popper: {
    backgroundColor: '#fff',
    boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
    marginTop: 10,
    position: 'absolute',
    left: 10,
    top: 25,
    width: 'calc(100% - 20px)',
    zIndex: 1100
  },
  menu: {
    // maxHeight: 450,
    maxHeight: calHeight(),
    overflowY: 'auto'
  },
  menu_list: {
    fontSize: '12pt',
    paddingTop: 2,
    paddingBottom: 3
  },
  menu_list_select: {
    fontSize: '12pt',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingTop: 2,
    paddingBottom: 3
  },
  mr15: {
    marginRight: 15,
    minWidth: 330
  },
  listRoot: {
    // padding: '5px 0 0 0',
    padding: 0,
    margin: 0,
    width: '100%'
  },
  listItemRoot: {
    minHeight: 30,
    padding: '0 0 0 10px',
    margin: 0,
    lineHeight: 1,
    cursor: 'pointer'
  },
  iconTotalWidth: {
    paddingLeft: '20px'
  },
  indentationFont: {
    textIndent: '2em'
  }
});

function ItemIcon(props) {
  const { id, onClick, ...rest } = props;
  return (
    <IconButton id={id} style={{ padding: '5px' }} onClick={onClick} {...rest}>
      <Avatar src={props.open ? minus : plus}
          style={{
          width: 15,
          height: 15,
          borderRadius: '5%',
          // padding: '0 5px 0 0',
          margin: 0
        }}
      />
    </IconButton>
  );
}

class MoeSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      count: 0,
      isOnMenu: false,
      isOnInput: false,
      refresh: false,
      value: ''
    };
  }

  componentWillMount() {
    document.addEventListener('click', this.handleClick);
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.dataList !== this.props.dataList) {
      this.setState({ count: 0 });
    }
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick);
  }

  handleClick = (event) => {
    let dom = document.getElementById(this.props.id + '_moeSearch');
    if (dom && !dom.contains(event.target)) {
      this.setState({ open: false });//20190811 Do not clean input value when loss focus by Louis Chen
    }
  }

  // enter search
  search = () => {
    if (this.props.onChange) {
      if (this.state.value && this.state.value.trim().length > 0) {
        this.props.onChange(this.state.value);
        if (!this.props.disabledDropdown) {
          this.setState({ open: true });
        }
      }
    }
  };

  // Change search value
  handleToggle = e => {
    let value = e.target.value;
    if (value && value.trim().length >= this.props.limitValue) {
      if (this.props.onChange) {
        this.props.onChange(value.trim());
        if (!this.props.disabledDropdown) {
          this.setState({ open: true, value: value });
        }
      }
    } else {
      this.setState({ open: false, value: value });
    }

  };
  // whichone choose
  handleClose = (item, childItem) => {
    this.props.onSelectItem(item, childItem, this.state.value);
    this.setState({ open: false, value: '' });
  };

  itemKeyDown = (e, item) => {
    if (e.keyCode === 13) {
      this.props.onSelectItem(item);
      this.setState({ open: false });
    }
  }

  keyDownSearch = (e) => {
    if (this.state.open) {
      let temp = _.cloneDeep(this.state.count);
      let dataList = this.props.dataList || [];
      let len = 0; //count

      //Get the selected item
      let parentItem = null;
      let childItem = null;
      for (let i = 0; i < dataList.length; i++) {
        len += 1;
        if (len === temp) {
          parentItem = dataList[i];
          childItem = null;
        }
        if (dataList[i].open && dataList[i].children && dataList[i].children.length > 0) {
          // len += dataList[i].children.length;
          for (let j = 0; j < dataList[i].children.length; j++) {
            len += 1;
            if (len === temp) {
              parentItem = dataList[i];
              childItem = dataList[i].children[j];
            }
          }
        }
      }
      if (e.keyCode === 40) {
        if (temp > -1 && temp < len) {
          temp = temp + 1;
        } else if (temp === len) {
          temp = -1;
        } else {
          temp = 1;
        }
      }
      if (e.keyCode === 38) {
        if (temp > 1 && temp <= len) {
          temp = temp - 1;
        } else if (temp === 1) {
          temp = -1;
        } else if (temp === 0) {
          temp = -1;
        } else {
          temp = len;
        }
      }
      if (e.keyCode === 13) {
        if (temp === -1) {
          this.handleClose();
          temp = -1;
        } else {
          // this.handleClose(this.props.dataList[temp]);
          this.handleClose(parentItem, childItem);
          temp = 0;
        }
      }
      if (temp > 3) {
        //Highlight element
        let curSelectElement = document.getElementById(this.props.id + '_listItem' + temp);
        //list container
        let containerObj = document.getElementById(this.props.id + '_Container');

        //Calculate the height of the scroll bar
        if (e.keyCode === 38) {
          curSelectElement = document.getElementById(this.props.id + '_listItem' + (temp + 1));
          let lastScrollTop = containerObj.scrollTop;
          let scrollTop = lastScrollTop > 0 ? lastScrollTop - (curSelectElement ? curSelectElement.clientHeight : 0) : 0;
          containerObj.scrollTop = scrollTop;
        }
        if (e.keyCode === 40) {
          let lastScrollTop = containerObj.scrollTop;
          let scrollTop = lastScrollTop + curSelectElement.clientHeight;
          containerObj.scrollTop = scrollTop;
        }
      } else if (temp > 0 && temp <= 3) {
        document.getElementById(this.props.id + '_Container').scrollTop = 0;
      } else if (temp === -1) {
        //When free text is selected, the height of the roll bar equals the height of the container
        let containerObj = document.getElementById(this.props.id + '_Container');
        containerObj.scrollTop = containerObj.scrollHeight;

      }
      this.setState({ count: temp });
    } else
      if (e.keyCode === 13) {
        if (this.state.value && this.state.value.trim().length > 0 && this.state.value.trim().length < this.props.limitValue) {
          this.search();
        }
      }
  }

  handleNotFound = (e) => {
    this.setState({ open: false });
    let searchValue = this.state.value;
    // this.props.updateSearchBarValue('', false);
    if (this.props.handleNotFound) {
      this.props.handleNotFound(e, searchValue);
    }
  }

  closeSearchData = (e) => {
    this.setState({ open: false, value: '' });
    if (this.props.closeSearchData) {
      this.props.closeSearchData(e);
    }
  }

  handleOnBlur = (e) => {
    if (!this.state.isOnMenu) {
      if (this.props.onBlur) {
        this.props.onBlur(e);
      }
    }
  }

  handleOnClick = (e) => {
    this.handleToggle(e);
    this.search();
  }//20190811 Create handle on focus function by Louis Chen

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
        str = str + (index === 0 ? item[displayField] : ', ' + item[displayField]);
      });
    } else {
      str = item;
    }
    return str;
  }
  collapseClick = (item) => {
    this.props.collapseClick(item);
    this.setState({ refresh: false });
  }
  render() {
    const { classes, separator, childArrayField, id } = this.props;
    const separatorFlag = separator ? separator : ',';
    let selectedIndex = 0;
    return (
      <Paper
          id={id + '_moeSearch'}
          style={{
          position: 'relative',
          ...this.props.style
        }}
          className={classes.root}
          elevation={1}
          onMouseOver={this.handleMenuMouseOver}
          onMouseLeave={this.handleMenuMouseLeave}
          onBlur={this.props.keepDataSelected ? null : this.handleOnBlur}
      >
        <Grid
            component="form"//Cancel AutoFill in Google Browser
            autoComplete="off"//Cancel AutoFill in Google Browser
            container
            justify="space-between"
            alignItems="center"
        >
          <InputBase
              id={id + '_inputKeyboardInputBase'}
              className={classes.input}
              inputRef={node => {
              this.anchorel = node;
            }}
              fullWidth
              autoComplete={'off'}
              onChange={this.handleToggle}
              placeholder={this.props.inputPlaceHolder}
              value={this.state.value}
              onKeyDown={this.keyDownSearch}
              readOnly={this.props.keepDataSelected}
              onClick={(e) => { this.handleOnClick(e); }}//20190811 create handle on focus function by Louis Chen
              inputProps={{
              maxLength: this.props.inputMaxLength
            }}
          />
          <IconButton
              id={id + '_searchBtnIconButton'}
              onClick={this.props.keepDataSelected ? this.closeSearchData : this.search}
              className={classes.iconButton}
              aria-label="Search"
              color={'primary'}
          >
            <input type="text" defaultValue="" style={{display: 'none'}} />{/*Cancel AutoFill in Google Browser*/}
            <Search />
          </IconButton>
        </Grid>
        {this.state.open ?
          <Typography
              component={'div'}
              className={classes.popper}
              style={{
              ...this.props.style
            }}
          >
            <Typography component={'div'} ref="myInput" id={this.props.id + '_Container'} className={classes.menu}>
              <List
                  component="nav"
                  classes={{ root: classes.listRoot }}
                  id={id + '_navList'}
              >
                {this.props.subItem ?
                  this.props.dataList && this.props.dataList.map((item, index) => {
                    selectedIndex += 1;
                    return (
                      <Typography component={'div'} key={'menu_' + index}>
                        <ListItem button
                            classes={{ root: classes.listItemRoot }}
                          // onKeyDown={() => this.itemKeyDown(item)}
                            id={id + '_listItem' + selectedIndex}
                          // onClick={() => this.handleClose(item)}
                            className={
                            this.state.count === selectedIndex
                              ? classes.menu_list_select
                              : classes.menu_list
                          }
                            style={{ alignItems: 'flex-start' }}
                        >
                          {childArrayField
                            && item[childArrayField]
                            && item[childArrayField].length > 0 ?
                            <ItemIcon id={id + '_collapseItemIcon' + index} open={item.open}
                                onClick={() => this.collapseClick(item)}
                            />
                            : <div className={classes.iconTotalWidth}></div>}
                          <Typography className={classes.listRoot} //Added by Mankit expand item's selection area
                              id={id + '_parentItemTypography' + index}
                              onClick={() => this.handleClose(item)}
                          >

                            {this.props.displayField != null ? this.props.displayField.map((displayField, displayFieldIndex) => {
                              return (displayField.name === childArrayField || !item[displayField.name] ?
                                null :
                                (displayFieldIndex === 0 ?
                                  <span key={displayFieldIndex} style={displayField.style}>
                                    {/* If a custom rendering exists, execution takes precedence */}
                                    {displayField.customRender ? displayField.customRender(item, item[displayField.name]) : item[displayField.name]}
                                  </span>
                                  :
                                  <span key={displayFieldIndex} style={displayField.style}>
                                    {separatorFlag + displayField.customRender ? displayField.customRender(item, item[displayField.name]) : item[displayField.name]}
                                  </span>));
                            }) : item}
                          </Typography>
                        </ListItem>
                        {childArrayField
                          && item[childArrayField]
                          && item[childArrayField].length > 0
                          && item[childArrayField].map((childItem, childIndex) => {
                            selectedIndex += 1;
                            return this.props.childDisplayField != null &&
                              <Collapse in timeout="auto" unmountOnExit style={{ padding: 0, margin: 0, display: item.open ? 'block' : 'none' }} key={childIndex}>
                                <List component="div" disablePadding
                                    classes={{ root: classes.listRoot }}
                                    id={id + '_listItem' + selectedIndex}
                                    className={
                                    this.state.count === selectedIndex
                                      ? classes.menu_list_select
                                      : classes.menu_list
                                  }
                                >

                                  <ListItem button classes={{ root: classes.listItemRoot }}
                                      className={classes.indentationFont}
                                      id={id + '_childItemListItem_' + childIndex}
                                    // onKeyDown={() => this.itemKeyDown(childItem)}
                                      onClick={() => this.handleClose(item, childItem)}
                                  // 20191218 - MK massage the display of predefined dosage
                                  >
                                  {childItem.dosageEng ? <b style={{marginRight:'5px'}}>{childItem.dosageEng}</b> : null}
                                  {childItem.dosageEng ? separatorFlag : null}
                                  {
                                    this.props.childDisplayField.map((thirdItem, thirdIndex) => {
                                    let maxFieldLen = this.props.childDisplayField.length;
                                    let formattedResult = (childItem[thirdItem.name] && thirdIndex > 0) ? childItem[thirdItem.name] : null;
                                    return formattedResult ? formattedResult + (thirdIndex < maxFieldLen - 1 ? separatorFlag : '') : null;
                                  })
                                  }
                                  </ListItem>
                                </List>
                              </Collapse>;
                          }
                          )
                        }
                      </Typography>
                    );
                  })
                  :
                  this.props.dataList && this.props.dataList.map((item, index) => (
                    <MenuItem
                        id={id + '_MenuItem' + index}
                        key={index}
                        onClick={() => this.handleClose(item)}
                        className={
                        this.state.count === (index + 1)
                          ? classes.menu_list_select
                          : classes.menu_list
                      }
                        onKeyDown={() => this.itemKeyDown(item)}
                    >
                      <Typography variant="inherit" className={classes.mr15}>
                        {
                          this.props.displayField != null ? this.props.displayField.map((displayField, _index) => {
                            return _index === 0 ? item[displayField] : separatorFlag + item[displayField];
                          }) : item}
                      </Typography>
                    </MenuItem>
                  ))
                }
              </List>
              {this.props.freeText && this.state.value &&
                <ListItem button classes={{ root: classes.listItemRoot }}
                    className={this.state.count === -1
                    ? classes.menu_list_select
                    : classes.menu_list
                  }
                  // onClick={this.handleNotFound}
                    onClick={() => this.handleClose()}
                    id={id + '_freeTextListItem'}
                >
                  <Typography variant="inherit" className={`${classes.mr15} ${classes.iconTotalWidth}`}>
                    {this.state.value} <i>{this.props.freeText}</i>
                  </Typography>
                </ListItem>
              }
            </Typography>

            {this.props.hideCloseButton || this.props.freeText ? null :
              // this.state.openSearchProgress ? null :
              <MenuItem
                  onClick={this.handleNotFound}
                  style={{
                  borderTop: '1px solid rgba(0, 0, 0, 0.42)'
                }}
                  className={
                  this.state.count === -1
                    ? classes.menu_list_select
                    : classes.menu_list
                }
                  id={id + '_lastSelectionNameMenuItem'}
              >
                {this.props.lastSelectionName || 'Close'}
              </MenuItem>
            }
          </Typography>
          : null}
      </Paper>
    );
  }
}

export default withStyles(style)(MoeSearch);
