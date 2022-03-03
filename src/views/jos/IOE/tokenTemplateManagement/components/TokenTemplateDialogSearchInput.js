import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  IconButton,
  Popper,
  MenuItem,
  Typography,
  CircularProgress,
  Grid,
  Tooltip,
  TextField
} from '@material-ui/core';
import { Clear,ArrowDropDown} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import {styles} from './TokenTemplateDialogSearchStyle';
import {trim,debounce} from 'lodash';
import { InfiniteLoader, List } from 'react-virtualized';

class TokenTemplateDialogSearchInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      isOnMenu: false,
      isOnInput: false,
      value: this.props.value,
      keepDataSelected: false,
      openSearchProgress: false,
      dataList: [],
      notCleanValue:false,
      itemSelectedValue:''
    };
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const { dataList,value} = this.props;
    let { openSearchProgress } = this.state;
    if (nextProps.dataList !== dataList) {
      this.setState({
        dataList: nextProps.dataList
      });
    }
    if(nextProps.value!==value){
      this.setState({
        value: nextProps.value
      });
    }
    if (openSearchProgress) {
      this.setState({
        openSearchProgress: false
      });
    }
  }

  // enter search
  search = () => {
    let {value} = this.state;
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
    onChange&&onChange(value);
  },600);

  // Change search value
  handleToggle = e => {
    const { limitValue = 0, handleInputOnchange, closeSearchData } = this.props;
    let value = trim(e.target.value);
    if (!!value&& value.length >= limitValue) {
      closeSearchData&&closeSearchData();
      this.setState({
        openSearchProgress: true,
        open: true
      });
      this.debounceChange(value);
      // onChange&&onChange(value);
      // if (!this.props.disabledDropdown) {
      //   this.setState({ open: true });
      // }
    } else {
      closeSearchData&&closeSearchData();
      handleInputOnchange && handleInputOnchange(value);
      this.setState({
        open: false,
        dataList: []
      });
    }
    this.setState({ value: e.target.value });
  };

  // whichone choose
  handleItemSelected = item => {
    const {keepData,onSelectItem,id,handleInputOnchange,closeSearchData} = this.props;
    document.getElementById(`search_input_base_${id}`).focus();
    onSelectItem&&onSelectItem(item);
    // if (keepData) {
      let str = this.getSelectedString(item);
      closeSearchData&&closeSearchData();
      this.setState({
        open: false,
        value: str,
        keepDataSelected: false,
        cleanValue:true,
        itemSelectedValue:str
      });
      handleInputOnchange && handleInputOnchange(str);
    // }
    // else {
    //   this.setState({
    //     open: false,
    //     value: ''
    //   });
    // }
  };

  // keyboard event
  keyDown = e => {
    if (e.keyCode === 13) {
      // Enter
      this.search();
    }
  };
  itemKeyDown = (e, item) => {
    const {onSelectItem} = this.props;
    if (e.keyCode === 13) {
      onSelectItem&&onSelectItem(item);
        let str = this.getSelectedString(item);
        this.setState({
          open: false,
          value: str,
          keepDataSelected: true
        });
      // else {
      //   this.setState({
      //     open: false,
      //     value: ''
      //   });
      // }
    }
  }

  handleClose = (e) => {
    let {onClose} = this.props;
    this.setState({
      open: false,
      value: '',
      keepDataSelected: false,
      dataList: []
    });
    onClose&&onClose(e);
  }

  closeSearchData = (e) => {
    let {onChange,closeSearchData} = this.props;
    this.setState({
      open: false,
      value: '',
      keepDataSelected: false,
      dataList: []
    });
    closeSearchData&&closeSearchData();
    onChange&&onChange('');
  }

  handleOnBlur = (e) => {
    const {handleBlur,handleInputOnchange} = this.props;
    let {isOnMenu,notCleanValue,itemSelectedValue,value} = this.state;
    let valueInput = value === '' ? this.props.value : value;
    //console.log('bbc' + itemSelectedValue + '---' + value);
    if (!isOnMenu) {
      if(notCleanValue){
        if(itemSelectedValue!=value){
            this.setState({
              open: false,
              value: '',
              keepDataSelected: false,
              dataList: []
          });
        }
        this.setState({
            open: false,
            // value: '',
            keepDataSelected: false,
            dataList: []
        });
      }else{
        handleInputOnchange && handleInputOnchange(valueInput);
        this.setState({
          open: false,
          value: valueInput,
          //itemSelectedValue: this.props.value,
          keepDataSelected: false,
          dataList: []
        });
      }
      handleBlur&&handleBlur(e);
    }else{
      if(notCleanValue){
        if(itemSelectedValue!=value){
            this.setState({
              open: false,
              value: '',
              keepDataSelected: false,
              dataList: []
          });
        }
        this.setState({
            open: false,
            // value: '',
            keepDataSelected: false,
            dataList: []
        });
      }
    }
  }

  handleMenuMouseOver = () => {
    this.setState({ isOnMenu: true });
  }

  handleMenuMouseLeave = () => {
    this.setState({ isOnMenu: false });
  }

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
    let {dataList} = this.state;
    return !!dataList[index];
  }

  updateState=(obj)=>{
    this.setState({
      ...obj
    });
  }

  handleLoadMoreRows = () => {
    // const { handleSearchBoxLoadMoreRows } = this.props;
    // let { value,dataList } = this.state;
    // return handleSearchBoxLoadMoreRows(startIndex,stopIndex,value,dataList,this.updateState);
    return null;
  }

  handleRowRenderer = ({ index, key, style }) => {
    const { classes,id='',displayField } = this.props;
    let {dataList} = this.state;
    let item = dataList[index];
    if (!!item) {
      let displayText = '';
      displayText = displayField != null ? displayField.map((displayField, index) => {
        return index === 0 ? item[displayField] : ', ' + item[displayField];
      }) : item;
      let  myArray = item[displayField].split('');
      let tooltipValue='';
      for(let i=0;i<myArray.length;i++)
        {
         if(i%80==0&&i!=0)
            {
                tooltipValue+='\n';
                tooltipValue+=myArray[i];
            }
            else{
                tooltipValue+=myArray[i];
            }
        }
      return (
        <MenuItem
            className={classes.menu_list}
            id={`${id}_menu_item_${index}`}
            key={key}
            onClick={() => {this.handleItemSelected(item);}}
            onKeyDown={(e)=>{this.itemKeyDown(e,item);}}
            style={style}
        >
          <Typography className={classes.fontLabel}
              component="span"
              noWrap
              variant="caption"
          >
            <Tooltip
                classes={{
                  'popper': classes.popper,
                  'tooltip': classes.tooltip
                }}
                placement="bottom-start"
                title={`${tooltipValue}`}
            >
              <label className={classes.label}>{displayText}</label>
            </Tooltip>
          </Typography>
        </MenuItem>
      );
    }else{
      return null;
    }
  }

  handleDropDown = () => {
    const { onChange } = this.props;
    if (this.state.open)
      this.setState({ open: false });
    else {
      this.setState({ open: true });
      onChange && onChange('');
      this.anchorel.focus();
    }
  }

  render() {
    const { classes,id='',inputPlaceHolder='',totalNums=9000,pageSize=20,containerStyle=null } = this.props;
    let {
      open,
      value,
      openSearchProgress,
      dataList=[],
      keepDataSelected
    } = this.state;

    let inputProps = {
      inputProps: {
        maxLength: 1000,
        className: classes.inputProps
      },
      InputProps: {
        disableUnderline: true,
        classes: {
          input: classes.inputPlaceholder
        }
      }
    };

    return (
      <Paper
          style={containerStyle}
          className={classes.root}
          component="div"
          elevation={1}
          onMouseLeave={this.handleMenuMouseLeave}
          onMouseOver={this.handleMenuMouseOver}
      >
        <Grid
            alignItems="center"//Cancel AutoFill in Google Browser
            autoComplete="off"
            container
            justify="space-between"
        >
          <Paper className={classes.inputPaper}>
            {/* <Search className={classes.searchIcon} /> */}
            <TextField
                autoComplete="off"
                className={classes.input}
                id={`search_input_base_${id}`}
                // inputProps={{
                //   maxLength: 1000,
                //   style:{
                //     //marginBottom:26,
                //     fontSize: '1.125rem',
                //     color:'rgb(0, 0, 0)'
                //   }
                // }}
                // InputProps={{
                //     disableUnderline: true,
                //     classes:{
                //       input:classes.inputPlaceholder
                //     }
                // }}
                {...inputProps}
                inputRef={node => {
                    this.anchorel = node;
                }}
                onBlur={keepDataSelected ? null : this.handleOnBlur}
                onChange={this.handleToggle}
                onKeyDown={this.keyDown}
                placeholder={inputPlaceHolder}
                // style={{ display: this.props.dataList === null ? 'none' : 'display' }}
                ref={'inputBase'}
                value={value}
                // variant="outlined"
            />

            <IconButton
                aria-label="Search"
                className={classes.iconButton}
                // onClick={keepDataSelected ? this.closeSearchData : this.search}
                id={`search_btn_${id}`}
                onClick={this.closeSearchData}
                style={{padding: '0px 5px'}}
            >
              {/* {openSearchProgress ? (
                <CircularProgress size={24} />
              ) : (
                value.length === 0 ? <div style={{width:24}}/> : <Clear size={24} />
                // keepDataSelected ? <Clear /> : <Search />
              )} */}
              {openSearchProgress ? (
                <CircularProgress style={{width:24}} size={20} />
              ) : (
                value.length === 0 ? <div style={{width:24}}/> : <Clear />
              )}
            </IconButton>
            <IconButton id="template_btn_add"
                onClick={this.handleDropDown}
                style={{ textTransform: 'none',padding:0}}
            >
            <ArrowDropDown  />
            </IconButton>

          </Paper>
        </Grid>
        <Popper
            anchorEl={this.anchorel}
            className={classes.popperStyle}
            open={open}
        >
          <Paper className={classes.paper}>
            <Typography className={classes.menu}
                component="div"
                id={`search_menu_item_wrapper_${id}`}
                ref="myInput"
            >
              {
                openSearchProgress ? null :
                dataList.length === 0 ? null :
                <InfiniteLoader
                    isRowLoaded={this.handleIsRowLoaded}
                    loadMoreRows={this.handleLoadMoreRows}
                    minimumBatchSize={pageSize}
                    rowCount={totalNums}
                    threshold={10}
                >
                  {({ onRowsRendered, registerChild }) => (
                    <List
                        height={240}
                        id={`search_menu_item_container_${id}`}
                        onRowsRendered={onRowsRendered}
                        ref={registerChild}
                        rowCount={dataList.length}
                        rowHeight={40}
                        rowRenderer={this.handleRowRenderer}
                        width={548}
                    />
                  )}
                </InfiniteLoader>
              }
            </Typography>
            <MenuItem
                className={classes.menu_list+' '+classes.closeButton}
                // onClick={this.handleClose}
                id={`search_box_last_item_${id}`}
            >
              {`${dataList.length} of ${dataList.length}`}
            </MenuItem>
            {/* {
              openSearchProgress ? null :
                <MenuItem
                    id={`search_box_last_item_${id}`}
                    onClick={this.handleClose}
                    style={{
                      borderTop: '1px solid rgba(0, 0, 0, 0.42)'
                    }}
                    className={classes.menu_list}
                >
                  Close
                </MenuItem>
            } */}
          </Paper>
        </Popper>
      </Paper>
    );
  }
}

TokenTemplateDialogSearchInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired
};

TokenTemplateDialogSearchInput.defaultProps = {
  onChange: () => {},
  onSelectItem: () => {}
};

export default withStyles(styles)(TokenTemplateDialogSearchInput);
