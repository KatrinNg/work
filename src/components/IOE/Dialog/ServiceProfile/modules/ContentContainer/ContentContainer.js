import React, { Component } from 'react';
import { withStyles, Grid, Tabs, Tab, Typography, TextField } from '@material-ui/core';
import { styles } from './ContentContainerStyle';
import TabContainer from '../TabContainer/TabContainer';
import classNames from 'classnames';
import OrderContainer from '../OrderContainer/OrderContainer';
import * as utils from '../../utils/dialogUtils';
import InfoDialog from '../InfoDialog/InfoDialog';
import * as serviceProfileConstants from '../../../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import SearchIxDialog from '../SearchIxDialog/SearchIxDialog';
import CIMSButton from '../../../../../Buttons/CIMSButton';
import {trim} from 'lodash';

class ContentContainer extends Component {
  constructor(props){
    super(props);
    let { lab2FormMap,frameworkMap=new Map(),updateStateWithoutStatus } = props;
    let defaultTabValue = null;
    let defaultFormValue = null;
    if (lab2FormMap.size > 0) {
      let i = 0;
      for (let [labId, formIds] of lab2FormMap) {
        defaultTabValue = labId;
        defaultFormValue = formIds[0];
        if (++i===1) {
          break;
        }
      }
    }
    let formObj = frameworkMap.has(defaultTabValue)?frameworkMap.get(defaultTabValue).formMap.get(defaultFormValue):null;
    let valObj = utils.initMiddlewareObject(formObj);
    updateStateWithoutStatus&&updateStateWithoutStatus({
      middlewareObject:valObj
    });
    this.state={
      isOpen:false,
      tabValue: serviceProfileConstants.DIALOG_TOP_TABS[0].value, //current tab
      labValue: defaultTabValue,
      selectedFormId: defaultFormValue,
      infoTargetLabId: defaultTabValue,
      infoTargetFormId: defaultFormValue,
      orderNumber:serviceProfileConstants.ORDER_NUMBER_OPTIONS[0].value //default 1
    };
  }

  handleOrderNumberChange = event => {
    const { handleOrderNumberChange } = this.props;
    this.setState({
      orderNumber:event.value
    });
    handleOrderNumberChange&&handleOrderNumberChange(event.value);
  }

  handleResetOrderNumber = () => {
    this.setState({
      orderNumber:serviceProfileConstants.ORDER_NUMBER_OPTIONS[0].value
    });
  }

  generateTab = () => {
    const { classes } = this.props;
    let { tabValue } = this.state;
    let tabs = [];
    serviceProfileConstants.DIALOG_TOP_TABS.forEach(option => {
      tabs.push(
        <Tab
            key={option.value}
            value={option.value}
            classes={{
              selected:classes.tabSelect
            }}
            className={tabValue===option.value?'tabSelected':'tabNavigation'}
            label={
              <Typography
                  className={classNames(classes.tabSpan,{
                    [classes.tabSpanSelected]: tabValue===option.value
                  })}
              >
                {option.label}
              </Typography>
            }
        />
      );
    });
    return tabs;
  }

  handleSearchIxChanged = event => {
    const { updateStateWithoutStatus } = this.props;
    updateStateWithoutStatus&&updateStateWithoutStatus({
      searchIx: event.target.value
    });
  }

  handleSearchIxBlur = event => {
    const { updateStateWithoutStatus } = this.props;
    updateStateWithoutStatus&&updateStateWithoutStatus({
      searchIx: trim(event.target.value)
    });
  }

  handleSearchIxByEnter = event => {
    if (event.keyCode === 13) {
      const { handleSearchDialogOpen } = this.props;
      handleSearchDialogOpen&&handleSearchDialogOpen();
    }
  }

  handleSearchBtnClick = () => {
    const { handleSearchDialogOpen,insertIxProfileLog,searchIx,dialogTitle } = this.props;
    insertIxProfileLog && insertIxProfileLog(`[${dialogTitle} Dialog] Action: Click 'Search' button (Search by Test/Specimen: ${searchIx})`, '');
    handleSearchDialogOpen&&handleSearchDialogOpen();
  }

  updateGroupingContainerState = (obj) => {
    this.setState({
      ...obj
    });
  }

  handleInfoDialogCancel = () =>{
    this.setState({
      isOpen:false
    });
  }

  render() {
    let {
      classes,
      ioeFormMap,
      searchIsOpen,
      searchIx,
      lab2FormMap,
      frameworkMap,
      updateState,
      temporaryStorageMap,
      middlewareObject,
      dropdownMap,
      orderIsEdit,
      deletedStorageMap,
      isNew,
      selectedOrderKey,
      openCommonMessage,
      closeCommonMessage,
      updateStateWithoutStatus,
      handleSearchDialogClose,
      selectionAreaIsEdit,
      infoEditMode,
      infoEditMiddlewareObject,
      insertIxProfileLog,
      dialogTitle
    } = this.props;
    let {
      labValue,
      selectedFormId,
      isOpen,
      infoTargetLabId,
      infoTargetFormId,
      tabValue,
      orderNumber
    } = this.state;
    let tabContainerProps = {
      dialogTitle,
      ioeFormMap,
      selectionAreaIsEdit,
      orderNumber,
      selectedLabId:labValue,
      selectedFormId,
      frameworkMap,
      lab2FormMap,
      dropdownMap,
      middlewareObject,
      temporaryStorageMap,
      orderIsEdit,
      selectedOrderKey,
      openCommonMessage,
      closeCommonMessage,
      updateState,
      updateStateWithoutStatus,
      insertIxProfileLog,
      updateGroupingContainerState:this.updateGroupingContainerState,
      handleOrderNumberChange:this.handleOrderNumberChange,
      handleResetOrderNumber:this.handleResetOrderNumber
    };
    let orderContainerProps = {
      dialogTitle,
      isNew,
      dropdownMap,
      deletedStorageMap,
      frameworkMap,
      temporaryStorageMap,
      lab2FormMap,
      updateState,
      updateStateWithoutStatus,
      insertIxProfileLog,
      updateGroupingContainerState:this.updateGroupingContainerState
    };
    let infoDialogProps = {
      orderNumber,
      isOpen,
      orderIsEdit,
      selectedOrderKey,
      dialogTitleResult: dialogTitle,
      dialogTitle: 'Other Order Information',
      selectedLabId:infoTargetLabId,
      selectedFormId:infoTargetFormId,
      frameworkMap,
      middlewareObject,
      infoEditMode,
      infoEditMiddlewareObject,
      temporaryStorageMap,
      updateState,
      updateStateWithoutStatus,
      insertIxProfileLog,
      handleInfoDialogCancel: this.handleInfoDialogCancel,
      handleResetOrderNumber:this.handleResetOrderNumber
    };
    let searchDialogProps = {
      dialogTitle:`[${dialogTitle} Dialog]`,
      frameworkMap,
      isOpen:searchIsOpen,
      searchIx,
      orderIsEdit,
      middlewareObject,
      updateState,
      updateStateWithoutStatus,
      insertIxProfileLog,
      handleSearchDialogCancel: handleSearchDialogClose,
      updateGroupingContainerState:this.updateGroupingContainerState
    };

    let inputProps = {
      autoCapitalize:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        className: classes.inputProps
      },
      InputProps:{
        classes: {
          input: classes.input
        }
      }
    };

    return (
      <Grid container>
        <Grid item xs={10}>
          {/* labs */}
          <Tabs
              classes={{root:classes.tabs}}
              indicatorColor="primary"
              value={tabValue}
              onChange={()=>{}}
              // onChange={this.handleTabChange}
          >
            {this.generateTab()}
          </Tabs>
          {/* search ix */}
          <div className={classes.searchBar}>
            <div className={classes.flexCenter}>
              <label className={classes.label}>Search Ix from Discipline:</label>
              <TextField
                  id="input_service_profile_dialog_search_ix"
                  placeholder="Search by Test / Specimen"
                  onChange={this.handleSearchIxChanged}
                  onBlur={this.handleSearchIxBlur}
                  onKeyUp={this.handleSearchIxByEnter}
                  value={searchIx}
                  {...inputProps}
              />
              <CIMSButton
                  id="btn_service_profile_dialog_search_ix"
                  className={classes.searchBtn}
                  onClick={this.handleSearchBtnClick}
              >
                Search
              </CIMSButton>
            </div>
          </div>
          {/* forms */}
          <TabContainer {...tabContainerProps} />
        </Grid>
        {/* orders */}
        <Grid item xs={2}>
          <OrderContainer {...orderContainerProps} />
        </Grid>
        {/* Info dialog */}
        <InfoDialog {...infoDialogProps} />
        {/* Search dialog */}
        <SearchIxDialog {...searchDialogProps} />
      </Grid>
    );
  }
}

export default withStyles(styles)(ContentContainer);
