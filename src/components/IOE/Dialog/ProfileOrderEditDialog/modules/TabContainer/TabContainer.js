import React, { Component } from 'react';
import { withStyles, AppBar, Toolbar, Typography, Drawer, Divider, List, ListItem, ListItemText, Grid } from '@material-ui/core';
import { styles } from './TabContainerStyle';
import classNames from 'classnames';
import TestContainer from '../TestContainer/TestContainer';
import SpecimenContainer from '../SpecimenContainer/SpecimenContainer';
import ValidatorForm from '../../../../../FormValidator/ValidatorForm';
import * as utils from '../../../ServiceProfile/utils/dialogUtils';
import * as serviceProfileConstants from '../../../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import CIMSMultiTabs from '../../../../../Tabs/CIMSMultiTabs';
import CIMSMultiTab from '../../../../../Tabs/CIMSMultiTab';

class TabContainer extends Component {
  constructor(props){
    super(props);
    let { selectedFormId } = props;
    this.state={
      open: false,
      selectedFormId: selectedFormId
    };
  }

  handleDrawerClick = labId => {
    let { lab2FormMap,frameworkMap,updateStateWithoutStatus } = this.props;
    let selectedFormId = lab2FormMap.get(labId)[0];
    let formObj = frameworkMap.get(labId).formMap.get(selectedFormId);
    let valObj = utils.initMiddlewareObject(formObj);
    updateStateWithoutStatus&&updateStateWithoutStatus({
      targetLabId:labId,
      targetFormId:selectedFormId,
      middlewareObject:valObj
    });
  };

  generateDrawerList = () => {
    const { classes,selectedLabId,frameworkMap } = this.props;
    let list = [];
    for (let labId of frameworkMap.keys()) {
      list.push(
        <ListItem
            id={`profile_order_${labId}`}
            button
            key={labId}
            style={{padding: '3px'}}
            onClick={() => {this.handleDrawerClick(labId);}}
            className={classNames({
              [classes.selectedItem]: labId === selectedLabId
            })}
        >
          <ListItemText
              style={{textAlign: 'center'}}
              primary={
                <Typography className={classes.font}>
                  {labId}
                </Typography>
              }
          />
        </ListItem>
      );
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
    let { frameworkMap,selectedLabId,updateStateWithoutStatus } = this.props;
    let formObj = frameworkMap.get(selectedLabId).formMap.get(value);
    let valObj = utils.initMiddlewareObject(formObj);
    updateStateWithoutStatus&&updateStateWithoutStatus({
      middlewareObject:valObj,
      targetFormId:value
    });
  }

  generateTab = () => {
    const { classes,selectedLabId,frameworkMap } = this.props;
    let { selectedFormId } = this.state;
    let tabs = [];
    if (selectedLabId!==null&&frameworkMap.size > 0) {
      let formMap = frameworkMap.get(selectedLabId).formMap;
      for (let [formId,formObj] of formMap) {
        tabs.push(
          <CIMSMultiTab
              key={formId}
              id={`profile_order_form_tab_${formId}`}
              value={formId}
              disableClose
              className={selectedFormId === formId ? 'tabSelected' : 'tabNavigation'}
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
      types.push(serviceProfileConstants.ITEM_CATEGORY_TYPE.TEST);
    }
    if (specimenFrameworkMap.size > 0) {
      types.push(serviceProfileConstants.ITEM_CATEGORY_TYPE.SPECIMEN);
    }
    return types;
  }

  render() {
    const {
      classes,
      ioeFormMap,
      frameworkMap,
      selectedLabId,
      selectedFormId,
      dropdownMap,
      middlewareObject,
      updateState,
      openCommonMessage
    } = this.props;
    let { open } = this.state;

    let testFrameworkMap = frameworkMap!==undefined&&frameworkMap.size>0?frameworkMap.get(selectedLabId).formMap.get(selectedFormId).testItemsMap:new Map();
    let specimenFrameworkMap = frameworkMap!==undefined&&frameworkMap.size>0?frameworkMap.get(selectedLabId).formMap.get(selectedFormId).specimenItemsMap:new Map();
    let types = this.judgeContainerType(testFrameworkMap,specimenFrameworkMap);

    let testContainerProps = {
      ioeFormMap,
      selectedLabId,
      selectedFormId,
      dropdownMap,
      testFrameworkMap,
      middlewareObject,
      openCommonMessage,
      updateState
    };
    let specimenContainerProps = {
      selectedLabId,
      selectedFormId,
      dropdownMap,
      middlewareObject,
      specimenFrameworkMap,
      updateState
    };
    return (
      <div>
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
        <ValidatorForm id="profile_order_group_form" onSubmit={()=>{}} ref="form">
          <div
              className={classNames(classes.content, {
                [classes.contentOpen]: open
              })}
          >
            {/* Top Tab */}
            <CIMSMultiTabs
                value={selectedFormId}
                onChange={this.changeTabValue}
                indicatorColor="primary"
            >
              {this.generateTab()}
            </CIMSMultiTabs>
            {/* Content */}
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
                      <Grid item xs={6} key={`${selectedLabId}_${selectedFormId}_specimen`} classes={{'grid-xs-6':classes.specimenWrapper}}>
                        <SpecimenContainer {...specimenContainerProps} />
                      </Grid>
                    ),
                    (
                      <Grid item xs={6} key={`${selectedLabId}_${selectedFormId}_test`} classes={{'grid-xs-6':classes.testWrapper}}>
                        <TestContainer {...testContainerProps} />
                      </Grid>
                    )
                  ]
                ):(
                  types.length === 1?(
                    types[0] === serviceProfileConstants.ITEM_CATEGORY_TYPE.TEST?(
                      <Grid item xs={12} classes={{'grid-xs-12':classes.fullWrapper}}>
                        <TestContainer {...testContainerProps} displayHeader />
                      </Grid>
                    ):(
                      types[0] === serviceProfileConstants.ITEM_CATEGORY_TYPE.SPECIMEN?(
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
        </ValidatorForm>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(TabContainer);
