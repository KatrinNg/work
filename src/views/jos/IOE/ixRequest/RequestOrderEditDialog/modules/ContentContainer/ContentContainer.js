import React, { Component } from 'react';
import { withStyles, Grid, Tabs, Tab, Typography, TextField } from '@material-ui/core';
import { styles } from './ContentContainerStyle';
import * as constants from '../../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import {trim} from 'lodash';
import classNames from 'classnames';
import CIMSButton from '../../../../../../../components/Buttons/CIMSButton';
import TabContainer from '../TabContainer/TabContainer';
import SearchIxDialog from '../../../modules/SearchIxDialog/SearchIxDialog';

class ContentContainer extends Component {
  constructor(props){
    super(props);
    this.state={
      searchIx: '',
      searchIsOpen: false,
      tabValue: constants.PRIVILEGES_DOCTOR_TABS[0].value
    };
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

  handleSearchIxByEnter = event => {
    if (event.keyCode === 13) {
      this.setState({
        searchIsOpen: true
      });
    }
  }

  handleSearchIxBlur = event => {
    this.setState({
      searchIx: trim(event.target.value)
    });
  }

  handleSearchBtnClick = () => {
    const{insertIxRequestLog}=this.props;
    this.setState({
      searchIsOpen: true
    });
    let {searchIx}=this.state;
    let val = searchIx.length > 0 ? searchIx : '';
    insertIxRequestLog && insertIxRequestLog(`[Edit Ix Request Order Dialog] Action: Click 'Search' button (Searching test/specimen: ${val})`, '');
  }

  generateTab = () => {
    const { classes } = this.props;
    let { tabValue } = this.state;
    let tabs = [],topTabs=[constants.PRIVILEGES_DOCTOR_TABS[0]];
    topTabs.forEach(option => {
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

  updateGroupingContainerState = (obj) => {
    this.setState({
      ...obj
    });
  }

  render() {
    let {
      classes,
      ioeFormMap,
      basicInfo,
      contentVals,
      itemMapping,
      frameworkMap,
      lab2FormMap,
      dropdownMap,
      middlewareObject,
      orderIsEdit,
      openCommonMessage,
      updateState,
      updateStateWithoutStatus,
      insertIxRequestLog
    } = this.props;
    let {
      searchIx,
      searchIsOpen,
      tabValue
    } = this.state;
    let tabContainerProps = {
      ioeFormMap,
      itemMapping,
      contentVals,
      selectedLabId:contentVals.labId,
      selectedSubTabId:contentVals.selectedSubTabId,
      frameworkMap,
      lab2FormMap,
      dropdownMap,
      middlewareObject,
      openCommonMessage,
      updateState,
      updateStateWithoutStatus
    };

    let searchDialogProps = {
      insertIxRequestLog,
      editMode:true,
      basicInfo,
      frameworkMap,
      isOpen:searchIsOpen,
      searchIx,
      orderIsEdit,
      middlewareObject,
      dialogType:'[Edit Ix Request Order Dialog] [Search Result Dialog]',
      updateState,
      updateStateWithoutStatus,
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
      InputProps: {
        classes: {
          input: classes.input
        }
      }
    };

    return (
      <Grid container>
        <Grid item xs={12}>
          {/* top labs */}
          <Tabs
              classes={{root:classes.tabs}}
              indicatorColor="primary"
              value={tabValue}
          >
            {this.generateTab()}
          </Tabs>
          {/* search ix */}
          <div className={classNames(classes.searchBar)}>
            <div className={classes.flexCenter}>
              <label className={classes.label}>Search Ix from Discipline:</label>
              <TextField
                  id="input_ix_request_edit_search"
                  placeholder="Search by Test / Specimen"
                  onChange={this.handleSearchIxChanged}
                  onKeyUp={this.handleSearchIxByEnter}
                  onBlur={this.handleSearchIxBlur}
                  value={searchIx}
                  {...inputProps}
              />
              <CIMSButton
                  id="btn_ix_request_edit_search"
                  className={classes.searchBtn}
                  onClick={this.handleSearchBtnClick}
              >
                Search
              </CIMSButton>
            </div>
          </div>
          <TabContainer {...tabContainerProps}/>
        </Grid>
        {/* Search dialog */}
        <SearchIxDialog {...searchDialogProps} />
      </Grid>
    );
  }
}

export default withStyles(styles)(ContentContainer);
