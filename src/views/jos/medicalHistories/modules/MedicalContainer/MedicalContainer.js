import React, { Component } from 'react';
import { styles } from './MedicalContainerStyle';
import { withStyles, AppBar, Toolbar, IconButton, Typography, Drawer, Divider, List, Tooltip, ListItem, ListItemIcon, Avatar, ListItemText, Grid } from '@material-ui/core';
import classNames from 'classnames';
import { Menu, ChevronLeft } from '@material-ui/icons';
import OccupationalHistory from '../OccupationalHistory/OccupationalHistory';
import _ from 'lodash';
import SocialHistory from '../SocialHistory/SocialHistory';
import PastMedicalHistory from '../PastMedicalHistory/PastMedicalHistory';
import FamilyHistory from '../FamilyHistory/FamilyHistory';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import EventEmitter from '../../../../../utilities/josCommonUtilties';

class MedicalContainer extends Component {
  constructor(props){
    super(props);
    this.occupationalRef = React.createRef();
    this.socialRef = React.createRef();
    this.pastRef = React.createRef();
    this.familyRef = React.createRef();
    this.wrapperRef = React.createRef();
    this.barRef = React.createRef();
    this.state = {
      contentHeight: undefined,
      open: true
    };
  }

  componentDidMount(){
    this.resetHeight();
    window.addEventListener('resize',this.resetHeight);
  }

  componentWillUnmount(){
    window.removeEventListener('resize',this.resetHeight);
  }

  resetHeight=_.debounce(()=>{
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    let height = vh - 223.1; // 50.1 (menu) + 31.3 (non-patient-tab) + 110 (patient banner) + 31.3(patient-specific tab)
    if(this.barRef.current&&this.barRef.current.clientHeight){
      let contentHeight = height - this.barRef.current.clientHeight - 16 - 44; // 16(padding 8*2) + 44(fixed button in bottom)
      this.setState({contentHeight});
    }
  },500);

  handleDrawerClick = (moduleName,eventType) => {
    let { updateState } = this.props;
    updateState&&updateState({
      selectedTabName: moduleName
    });
    EventEmitter.emit(`medical_histories_${eventType}_load_data`);
  }

  generateDrawerList = () => {
    const { classes,moduleNameList,selectedTabName } = this.props;
    let list = [];
    moduleNameList.forEach((moduleNameObj,index) => {
      list.push(
        <Tooltip
            key={`${moduleNameObj.shortName}_${index}`}
            title={moduleNameObj.name}
            classes={{tooltip:classes.tooltip}}
        >
          <ListItem
              id={moduleNameObj.shortName}
              button
              onClick={() => {this.handleDrawerClick(moduleNameObj.name,moduleNameObj.eventType);}}
              className={classNames({
                [classes.selectedItem]: moduleNameObj.name === selectedTabName
              })}
          >
            <ListItemIcon className={classNames({[classes.marginRightNone]: open})}>
              <Avatar className={classes.avatar}>{moduleNameObj.shortName}</Avatar>
            </ListItemIcon>
            <ListItemText
                primary={<Typography className={classes.font} noWrap>{moduleNameObj.name}</Typography>}
            />
          </ListItem>
        </Tooltip>
      );
    });
    return list;
  }

  handleDrawerOpen = () => {
    this.setState({open: true});
  };

  handleDrawerClose = () => {
    this.setState({open: false});
  };

  integrateResultObj = () => {
    let resultObj = null;
    let familyResultObj = this.familyRef.generateResultObj();
    let pastResultObj = this.pastRef.generateResultObj();
    let socialResultObj = this.socialRef.generateResultObj();
    let occupationResultObj = this.occupationalRef.generateResultObj();

    if (familyResultObj.errorFlag||pastResultObj.errorFlag||socialResultObj.errorFlag||occupationResultObj.errorFlag) {
      return null;
    } else {
      resultObj = {
        occupationalHistoryDto:{
          ...occupationResultObj.resultObj
        },
        pastMedHistoryList:pastResultObj.resultObj.pastMedHistoryList,
        saveFamilyHistoryDto:{
          ...familyResultObj.resultObj
        },
        saveSocialHistoryDto:{
          ...socialResultObj.resultObj
        }
      };
    }

    return resultObj;
  };

  handleRenderSubTab = () => {
    const { classes, selectedTabName, insertMedicalHistoriesLog } = this.props;
    let { contentHeight } = this.state;
    let copyProps = _.cloneDeep(this.props);
    delete copyProps.classes;
    const tableHistoryProps = {
      selectedTabName,
      insertMedicalHistoriesLog,
      contentHeight:contentHeight,
      ...copyProps
    };
    return(
      <div className={classes.moduleWrapper}>
        <div style={{width:'inherit', height:'inherit',display: selectedTabName === 'Occupational History'?'block':'none' }}>
          <OccupationalHistory eventType="occupational_histroy" childRef={ref => (this.occupationalRef = ref)} {...tableHistoryProps} />
        </div>
        <div style={{width:'inherit', height:'inherit',display: selectedTabName === 'Social History'?'block':'none' }}>
          <SocialHistory eventType="social_history" childRef={ref => (this.socialRef = ref)} {...tableHistoryProps} />
        </div>
        <div style={{width:'inherit', height:'inherit',display: selectedTabName === 'Past Medical History'?'block':'none' }}>
          <PastMedicalHistory eventType="past_medical_history" childRef={ref => (this.pastRef = ref)} {...tableHistoryProps} />
        </div>
        <div style={{width:'inherit', height:'inherit',display: selectedTabName === 'Family History'?'block':'none' }}>
          <FamilyHistory eventType="family_history" childRef={ref => (this.familyRef = ref)} {...tableHistoryProps} />
        </div>
      </div>
    );
  }

  handleRevert = () => {
    const { selectedTabName, moduleNameList,insertMedicalHistoriesLog } = this.props;
    let tempObj = _.find(moduleNameList,moduleObj=>moduleObj.name === selectedTabName);
    if (tempObj) {
      EventEmitter.emit(`medical_histories_${tempObj.eventType}_load_data`,{manualFlag:true});
    }
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog('Action: Click \'Revert to Last Saved Version\' button', '');
  }

  render() {
    const { classes, selectedTabName } = this.props;
    let { open } = this.state;
    return (
      <div ref={this.wrapperRef} className={classes.wrapper}>
        <AppBar
            ref={this.barRef}
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open
            })}
            position="relative"
        >
          <Toolbar disableGutters={!open} classes={{regular:classes.toolBar}}>
            <IconButton
                aria-label="Open drawer"
                className={classNames(classes.menuButton, {
                  [classes.hide]: open
                })}
                color="inherit"
                onClick={this.handleDrawerOpen}
            >
              <Menu />
            </IconButton>
            <Typography
                className={classNames(classes.font,classes.fontBold,classes.title)}
                variant="h6"
                color="inherit"
                noWrap
            >
              <label>{selectedTabName}</label>
              <CIMSButton
                  id="btn_medical_histories_revert"
                  style={{maxHeight: 35,minHeight: 35, marginRight: 25}}
                  onClick={this.handleRevert}
              >
                Revert to Last Saved Version
              </CIMSButton>
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
            style={{height:'100%'}}
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
          <div>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeft />
            </IconButton>
          </div>
          <Divider />
          <List className={classes.listRoot}>
            {this.generateDrawerList()}
          </List>
        </Drawer>
        {/* content */}
        <div
            style={{height: this.state.contentHeight}}
            className={classNames(classes.content, {
              [classes.contentOpen]: open
            })}
        >
          <Grid
              style={{height: '100%'}}
              container
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
          >
            <Grid style={{height: '100%'}} item xs={12}>
              {this.handleRenderSubTab()}
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(MedicalContainer);
