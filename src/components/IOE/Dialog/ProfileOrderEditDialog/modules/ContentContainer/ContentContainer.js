import React, { Component } from 'react';
import { withStyles, Grid, Tabs, Tab, Typography, TextField } from '@material-ui/core';
import { styles } from './ContentContainerStyle';
import TabContainer from '../TabContainer/TabContainer';
import classNames from 'classnames';
import * as serviceProfileConstants from '../../../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import SearchIxDialog from '../../../ServiceProfile/modules/SearchIxDialog/SearchIxDialog';
import CIMSButton from '../../../../../Buttons/CIMSButton';
import {trim} from 'lodash';

class ContentContainer extends Component {
  constructor(props){
    super(props);
    this.state={
      isOpen:false,
      tabValue: serviceProfileConstants.DIALOG_TOP_TABS[0].value, //current tab
      searchIx: '',
      searchIsOpen:false
    };
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

  handleSearchDialogOpen = () => {
    this.setState({
      searchIsOpen: true
    });
  }

  handleSearchDialogClose = () => {
    this.setState({
      searchIsOpen: false
    });
  }

  handleSearchIxChanged = event => {
    this.setState({
      searchIx: event.target.value
    });
  }

  handleSearchIxBlur = event => {
    this.setState({
      searchIx: trim(event.target.value)
    });
  }

  handleSearchIxByEnter = event => {
    if (event.keyCode === 13) {
      this.handleSearchDialogOpen();
    }
  }

  handleSearchBtnClick = () => {
    const{insertIxProfileLog,dialogTitle}=this.props;
    this.handleSearchDialogOpen();
    insertIxProfileLog&&insertIxProfileLog(`[${dialogTitle} Dialog] [${dialogTitle} Order Dialog] Action: Click 'Search' button (Search by Test/Specimen: ${this.state.searchIx})`,'');
  }

  updateGroupingContainerState = (obj) => {
    this.setState({
      ...obj
    });
  }

  render() {
    let {
      classes,
      ioeFormMap,
      lab2FormMap,
      frameworkMap,
      updateState,
      middlewareObject,
      dropdownMap,
      orderIsEdit,
      openCommonMessage,
      updateStateWithoutStatus,
      targetLabId,
      targetFormId,
      insertIxProfileLog,
      dialogTitle
    } = this.props;
    let {
      searchIx,
      tabValue,
      searchIsOpen
    } = this.state;
    let tabContainerProps = {
      ioeFormMap,
      selectedLabId:targetLabId,
      selectedFormId:targetFormId,
      frameworkMap,
      lab2FormMap,
      dropdownMap,
      middlewareObject,
      openCommonMessage,
      updateState,
      insertIxProfileLog,
      updateStateWithoutStatus
    };

    let searchDialogProps = {
      dialogTitle:`[${dialogTitle} Dialog] [${dialogTitle} Order Dialog]`,
      editMode:true,
      frameworkMap,
      isOpen:searchIsOpen,
      searchIx,
      orderIsEdit,
      middlewareObject,
      updateState,
      updateStateWithoutStatus,
      insertIxProfileLog,
      handleSearchDialogCancel: this.handleSearchDialogClose,
      updateGroupingContainerState:this.updateGroupingContainerState
    };

    let inputProps = {
      autoCapitalize:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        className:classes.inputProps
      },
      InputProps:{
        classes: {
          input: classes.input
        }
      }
    };

    return (
      <Grid container>
        <Grid item xs={12}>
          {/* labs */}
          <Tabs
              classes={{root:classes.tabs}}
              indicatorColor="primary"
              value={tabValue}
              onChange={()=>{}}
          >
            {this.generateTab()}
          </Tabs>
          {/* search ix */}
          <div className={classes.searchBar}>
            <div className={classes.flexCenter}>
              <label className={classes.label}>Search Ix from Discipline:</label>
              <TextField
                  id="input_ix_profile_order_dialog_search_ix"
                  placeholder="Search by Test / Specimen"
                  onChange={this.handleSearchIxChanged}
                  onBlur={this.handleSearchIxBlur}
                  onKeyUp={this.handleSearchIxByEnter}
                  value={searchIx}
                  {...inputProps}
              />
              <CIMSButton
                  id="btn_ix_profile_order_dialog_search_ix"
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
        {/* Search dialog */}
        <SearchIxDialog {...searchDialogProps} />
      </Grid>
    );
  }
}

export default withStyles(styles)(ContentContainer);
