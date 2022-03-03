import React, { Component } from 'react';
import {styles} from './TabContainerStyle';
import { withStyles, AppBar, Toolbar, Typography, Drawer, Divider, List, ListItem, ListItemText, Grid } from '@material-ui/core';
import classNames from 'classnames';
import CIMSMultiTabs from '../../../../../../../components/Tabs/CIMSMultiTabs';
import CIMSMultiTab from '../../../../../../../components/Tabs/CIMSMultiTab';
import * as constants from '../../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import * as utils from '../../../utils/ixUtils';
import TestContainer from '../TestContainer/TestContainer';
import SpecimenContainer from '../SpecimenContainer/SpecimenContainer';
import _ from 'lodash';

class TabContainer extends Component {
  constructor(props){
    super(props);
    this.state = {
      open: false
    };
  }

  handleDrawerClick = labId => {
    let { lab2FormMap,frameworkMap,updateStateWithoutStatus,contentVals } = this.props;
    let defaultFormId = lab2FormMap.get(labId)[0];
    let formObj = frameworkMap.get(labId).formMap.get(defaultFormId);
    let valObj = utils.initMiddlewareObject(formObj);

    updateStateWithoutStatus&&updateStateWithoutStatus({
      middlewareObject:valObj,
      backUpMiddlewareObject:_.cloneDeep(valObj),
      contentVals:{
        ...contentVals,
        labId,
        selectedSubTabId: defaultFormId,
        infoTargetLabId: labId,
        infoTargetFormId: defaultFormId
      }
    });

  };

  generateDrawerList = () => {
    const { classes,selectedLabId,frameworkMap } = this.props;
    let list = [];
    if (!!frameworkMap.size&&frameworkMap.size>0) {
      for (let labId of frameworkMap.keys()) {
        list.push(
          <ListItem
              id={`edit_ix_request_${labId}`}
              key={labId}
              button
              style={{padding: '3px'}}
              onClick={() => {this.handleDrawerClick(labId);}}
              className={classNames({
                [classes.selectedItem]: labId === selectedLabId
              })}
          >
            <ListItemText
                style={{textAlign: 'center'}}
                primary={
                  <Typography className={classes.font}>{labId}</Typography>
                }
            />
          </ListItem>
        );
      }
    }
    return list;
  }

  handleDrawerOpen = () => {
    this.setState({
      open: true
    });
  };

  handleDrawerClose = () => {
    this.setState({
      open: false
    });
  };

  changeTabValue = (event, value) => {
    let { frameworkMap,selectedLabId,updateStateWithoutStatus,contentVals } = this.props;
    let formObj = frameworkMap.get(selectedLabId).formMap.get(value);
    let valObj = utils.initMiddlewareObject(formObj);
    updateStateWithoutStatus&&updateStateWithoutStatus({
      middlewareObject:valObj,
      backUpMiddlewareObject:_.cloneDeep(valObj),
      contentVals:{
        ...contentVals,
        selectedSubTabId:value,
        infoTargetFormId:value
      }
    });
  }

  generateTab = () => {
    const { classes,selectedLabId,selectedSubTabId,frameworkMap } = this.props;
    let tabs = [];
    if (!!selectedLabId&&frameworkMap.size > 0) {
      let formMap = frameworkMap.get(selectedLabId).formMap;
      for (let [formId,formObj] of formMap) {
        tabs.push(
          <CIMSMultiTab
              key={formId}
              id={`ix_request_edit_sub_tab_${formId}`}
              value={formId}
              disableClose
              className={selectedSubTabId === formId ? 'tabSelected' : 'tabNavigation'}
              label={
                <span className={classes.tabSpan}>
                  {formObj.formShortName}
                </span>
              }
          />
        );
      }
    }
    return tabs;
  }

  judgeContainerType = (testFrameworkMap,specimenFrameworkMap) => {
    let types = [];
    if (testFrameworkMap.size > 0) {
      types.push(constants.ITEM_CATEGORY_TYPE.TEST);
    }
    if (specimenFrameworkMap.size > 0) {
      types.push(constants.ITEM_CATEGORY_TYPE.SPECIMEN);
    }
    return types;
  }

  render() {
    const {
      classes,
      frameworkMap,
      selectedLabId,
      selectedSubTabId,
      dropdownMap,
      middlewareObject,
      updateState,
      ioeFormMap,
      openCommonMessage
    } = this.props;
    let { open } = this.state;

    let testFrameworkMap = !!frameworkMap&&frameworkMap.size>0&&!!selectedLabId?frameworkMap.get(selectedLabId).formMap.get(selectedSubTabId).testItemsMap:new Map();
    let specimenFrameworkMap = !!frameworkMap&&frameworkMap.size>0&&!!selectedLabId?frameworkMap.get(selectedLabId).formMap.get(selectedSubTabId).specimenItemsMap:new Map();
    let types = this.judgeContainerType(testFrameworkMap,specimenFrameworkMap);

    let testContainerProps = {
      selectedLabId,
      selectedFormId:selectedSubTabId,
      dropdownMap,
      testFrameworkMap,
      middlewareObject,
      ioeFormMap,
      openCommonMessage,
      updateState
    };
    let specimenContainerProps = {
      selectedLabId,
      selectedFormId:selectedSubTabId,
      dropdownMap,
      middlewareObject,
      specimenFrameworkMap,
      updateState
    };

    return (
      <div className={classes.wrapper}>
        <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open
            })}
            position="relative"
        >
          <Toolbar
              disableGutters={!open}
              classes={{
                regular:classes.toolBar
              }}
          />
        </AppBar>
        <Drawer
            classes={{
              root: classes.drawerRoot,
              paper: classNames(classes.drawerPaperRoot, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open
              })
            }}
            className={classNames(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open
            })}
            open={open}
            variant="permanent"
        >
          <Divider />
          <List className={classes.listRoot}>
            {this.generateDrawerList()}
          </List>
        </Drawer>
        {/* list content */}
        <div
            className={classNames(classes.content, {
              [classes.contentOpen]: open
            })}
        >
          {/* sub tab */}
          <CIMSMultiTabs
              value={selectedSubTabId}
              onChange={this.changeTabValue}
              indicatorColor="primary"
          >
            {this.generateTab()}
          </CIMSMultiTabs>
          {/* content */}
          <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
          >
            {
              types.length>1?(
                [
                  (
                    <Grid item xs={6} key={`${selectedLabId}_${selectedSubTabId}_specimen`} classes={{'grid-xs-6':classes.specimenWrapper}}>
                      <SpecimenContainer {...specimenContainerProps} />
                    </Grid>
                  ),
                  (
                    <Grid item xs={6} key={`${selectedLabId}_${selectedSubTabId}_test`} classes={{'grid-xs-6':classes.testWrapper}}>
                      <TestContainer {...testContainerProps} />
                    </Grid>
                  )
                ]
              ):(
                types.length === 1?(
                  types[0] === constants.ITEM_CATEGORY_TYPE.TEST?(
                    <Grid item xs={12} classes={{'grid-xs-12':classes.fullWrapper}}>
                      <TestContainer {...testContainerProps} displayHeader />
                    </Grid>
                  ):(
                    types[0] === constants.ITEM_CATEGORY_TYPE.SPECIMEN?(
                      <Grid item xs={12} classes={{'grid-xs-12':classes.fullWrapper}}>
                        <SpecimenContainer {...specimenContainerProps} displayHeader />
                      </Grid>
                    ):null
                  )
                ):null
              )
            }
          </Grid>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(TabContainer);
