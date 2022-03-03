import React, { Component } from 'react';
import { styles } from './HistoryContainerStyle';
import { withStyles, Button, FormGroup, FormControlLabel, Checkbox, Grid } from '@material-ui/core';
import { AddCircle, RemoveCircle, Notes } from '@material-ui/icons';
import OthersTable from '../../../../components/OthersTable/OthersTable';
import LogDialog from '../../../../components/LogDialog/LogDialog';
import * as constants from '../../../../../../../constants/medicalHistories/medicalHistoriesConstants';
import SmokingTable from '../../../../components/SmokingTable/SmokingTable';
import PassiveTable from '../../../../components/PassiveTable/PassiveTable';
import SubstanceAbuseTable from '../../../../components/SubstanceAbuseTable/SubstanceAbuseTable';
import DrinkingTable from '../../../../components/DrinkingTable/DrinkingTable';
import moment from 'moment';

class HistoryContainer extends Component {
  constructor(props){
    super(props);
    this.buttonGroupRef = React.createRef();
    this.smokingTableRef = React.createRef();
    this.drinkingTableRef = React.createRef();
    this.substanceAbuseTableRef = React.createRef();
    this.othersTableRef = React.createRef();
    this.passiveTableRef = React.createRef();
    this.state = {
      tableHeight: undefined,
      logIsOpen: false,
      selectedRowId: null,
      logDataList: [],
      askIsChecked: false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if (nextProps.containerHeight&&this.buttonGroupRef.current&&this.buttonGroupRef.current.clientHeight) {
      let tableHeight = nextProps.containerHeight - this.buttonGroupRef.current.clientHeight;
      if (tableHeight!==this.state.tableHeight) {
        this.setState({tableHeight});
      }
    }
  }

  setSelectedRowId = rowId => {
    this.setState({selectedRowId:rowId});
  }

  handleAddClick = (e) => {
    const { type, changeEditFlag,insertMedicalHistoriesLog,typeName } = this.props;
    insertMedicalHistoriesLog && insertMedicalHistoriesLog(`[Social History] Action: Click 'Add' button in ${typeName}`, '');
    let currentRef = null;
    switch (type) {
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING:
        currentRef = this.smokingTableRef;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE:
        currentRef = this.passiveTableRef;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING:
        currentRef = this.drinkingTableRef;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE:
        currentRef = this.substanceAbuseTableRef;
        break;
      default: // others
        currentRef = this.othersTableRef;
        break;
    }
    e.stopPropagation();
    if (currentRef) {
      currentRef.current.handleRowAdd();
      changeEditFlag&&changeEditFlag();
    }
  }

  handleDeleteClick = () => {
    const { type, changeEditFlag,insertMedicalHistoriesLog,typeName,valMap } = this.props;
    let { selectedRowId } = this.state;
    let currentRef = null;
    //log--start---
    let content = '';
    let name = '';
    if (valMap.get(type).size > 0) {
      for (const [key, value] of valMap.get(type).entries()) {
        if (key === selectedRowId) {
          if (type === constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING || type === constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE) {
            name = key > 1 ? `(Social History ID: ${value.socialHistoryDetailsId})` : '(New record is selected; Social History ID: null)';
            content = `Status: ${value.status}; Type: ${value.socialHistorySubtypeId}; Amount Per Day: ${value.amtTxt}; Age From ${value.ageFrom} To ${value.ageTo}; Year From ${value.yearFrom} To ${value.yearTo}`;
          } else if (type === constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING) {
            name = key > 1 ? `(Social History ID: ${value.socialHistoryDetailsId})` : '(New record is selected; Social History ID: null)';
            content = `Status: ${value.status}; Type: ${value.socialHistorySubtypeId}; Amount Per Week: ${value.amtTxt} ${value.socialHistorySubtypeId} ${value.volAmt} (Unit: ${value.stdUnit}); Age From ${value.ageFrom} To ${value.ageTo}; Year From ${value.yearFrom} To ${value.yearTo}`;
          } else if (type === constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE) {
            name = key > 1 ? `(Social History ID: ${value.msPassiveSmkId})` : '(New record is selected; Social History ID: null)';
            content = `Location: ${value.codRlatTypeId}; Number of smokers: ${value.smkNum}; Relationship of the smoker: ${value.rlat}`;
          } else {
            name = key > 1 ? `(Social History ID: ${value.socialOthersId})` : '(New record is selected; Social History ID: null)';
            content = `Remarks: ${value.others}`;
          }
        }
      }
    }
    //log--end---
    switch (type) {
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING:
        currentRef = this.smokingTableRef;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE:
        currentRef = this.passiveTableRef;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING:
        currentRef = this.drinkingTableRef;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE:
        currentRef = this.substanceAbuseTableRef;
        break;
      default: // others
        currentRef = this.othersTableRef;
        break;
    }
    if (currentRef) {
      insertMedicalHistoriesLog(`[Social History] Action: Click 'Delete' button in ${typeName} ${name}`,'',content);
      currentRef.current.handleRowDelete();
      changeEditFlag&&changeEditFlag();
    }
  }

  hanldeLogClick = () => {
    const { type, patientKey, socialHistoryTypeId,
      openCommonCircularDialog, closeCommonCircularDialog,
      getSocialHistoryCommonLogList, getSocialHistoryPassiveSmokingInformationLogList,
      getSocialHistoryOthersLogList, insertMedicalHistoriesLog, typeName } = this.props;
    insertMedicalHistoriesLog(`[Social History] Action: Click 'Log' button in ${typeName}`, '');
    openCommonCircularDialog&&openCommonCircularDialog();
    switch (type) {
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING:
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING:
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE:
        getSocialHistoryCommonLogList({
          params:{patientKey,socialHistoryTypeId},
          callback: data => {
            closeCommonCircularDialog&&closeCommonCircularDialog();
            this.setState({
              logIsOpen: true,
              logDataList: data
            });
          }
        });
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE:
        getSocialHistoryPassiveSmokingInformationLogList({
          params: { patientKey },
          callback: data => {
            closeCommonCircularDialog && closeCommonCircularDialog();
            this.setState({
              logIsOpen: true,
              logDataList: data
            });
          }
        });
        break;
      default: // others
        getSocialHistoryOthersLogList({
          params:{patientKey},
          callback: data => {
            closeCommonCircularDialog&&closeCommonCircularDialog();
            this.setState({
              logIsOpen: true,
              logDataList: data
            });
          }
        });
        break;
    }
  }

  handleLogOK = () => {
    const { insertMedicalHistoriesLog,typeName } = this.props;
    insertMedicalHistoriesLog(`[Social History] [Social History ${typeName} Log Dialog] Action: Click 'OK' button`, '');
    this.setState({
      logIsOpen: false
    });
  }

  renderTable = () => {
    const { type, valMap, updateState, changeEditFlag, socialHistoryType, dataList, currentServiceInfo, serviceList, currentClinicInfo, encounterInfo, patientKey, encounterId, dropdownOption,encounterExistFlag, antFeatureFlag } = this.props;
    let { tableHeight } = this.state;
    let tableProps = {
      type,
      valMap,
      updateState,
      dataList,
      currentServiceInfo,
      serviceList,
      currentClinicInfo,
      encounterInfo,
      patientKey,
      encounterId,
      socialHistoryType,
      dropdownOption,
      viewMode:false,
      setSelectedRowId:this.setSelectedRowId,
      tableHeight:tableHeight,
      changeEditFlag,
      encounterExistFlag,
      antFeatureFlag,
      moveToEnd: false
    };
    let tableElement = null;
    switch (type) {
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SMOKING:
        tableElement = <SmokingTable ref={this.smokingTableRef} {...tableProps} />;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_PASSIVE:
        tableElement = <PassiveTable ref={this.passiveTableRef} {...tableProps} />;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_SUBSTANCE_ABUSE:
        tableElement = <SubstanceAbuseTable ref={this.substanceAbuseTableRef} {...tableProps} />;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.SOCIAL_HISTORY_DRINKING:
        tableElement = <DrinkingTable ref={this.drinkingTableRef} {...tableProps} />;
        break;
      default: // others
        tableElement = <OthersTable prefix={'social'} ref={this.othersTableRef} {...tableProps} />;
        break;
    }
    return tableElement;
  }

  handleAskChange = (event) => {
    let { updateState, askedMap, askTypeId, changeEditFlag } = this.props;
    this.setState({askIsChecked: event.target.checked});
    askedMap.get(askTypeId).checkedFlag = event.target.checked?constants.CHECK_BOX_STATUS.CHECKED:constants.CHECK_BOX_STATUS.UNCHECKED;
    updateState&&updateState({askedMap});
    changeEditFlag&&changeEditFlag();
  }

  render() {
    const { classes, serviceList, type, askedMap, askTypeId, isOthers, dropdownOption,encounterExistFlag } = this.props;
    let { logIsOpen, selectedRowId, logDataList, askIsChecked } = this.state;
    let disabledEdit = !encounterExistFlag;
    let deleteDisabledFlag = encounterExistFlag?(selectedRowId?false:true):true;

    let logDialogProps ={
      type,
      serviceList,
      dropdownOption,
      dataList:logDataList,
      isOpen:logIsOpen,
      handleLogOK:this.handleLogOK
    };

    return (
      <div style={{width:'100%'}}>
        {/* button group */}
        <div ref={this.buttonGroupRef} className={classes.divBack}>
          <Grid container alignItems="center">
            <Grid item xs={12} md={12}>
              <div style={{float: 'left'}}>
                <Button
                    disabled={disabledEdit}
                    id="btn_social_history_table_add"
                    className={classes.btnRoot}
                    onClick={this.handleAddClick}
                >
                  <AddCircle color={disabledEdit ? classes.disabledIcon : 'primary'} />
                  <span className={classes.btnSpan}>Add</span>
                </Button>
                <Button
                    disabled={deleteDisabledFlag}
                    id="btn_social_history_table_delete"
                    className={classes.btnRoot}
                    onClick={this.handleDeleteClick}
                >
                  <RemoveCircle color={deleteDisabledFlag ? classes.disabledIcon : 'primary'} />
                  <span className={classes.btnSpan}>Delete</span>
                </Button>
                <Button
                    id="btn_social_history_table_log"
                    className={classes.btnRoot}
                    onClick={this.hanldeLogClick}
                >
                  <Notes color="primary" />
                  <span className={classes.btnSpan}>Log</span>
                </Button>
              </div>
              <div style={{display:isOthers?'none':'flex', alignItems: 'center', paddingTop: 5}}>
                {/* Asked */}
                <div>
                  <FormGroup row>
                    <FormControlLabel
                        label="Asked"
                        control={<Checkbox checked={askIsChecked} disabled={disabledEdit} name="Asked" color="primary" onChange={this.handleAskChange} />}
                    />
                  </FormGroup>
                </div>
                {/* Last Asked Date */}
                {
                  askedMap.has(askTypeId)&&askedMap.get(askTypeId).date?(
                    <div>
                      <label style={{fontWeight:'bold'}}>
                        {`Last Asked Date: ${askedMap.has(askTypeId)&&askedMap.get(askTypeId).date?moment(askedMap.get(askTypeId).date).format('DD-MMM-YYYY'):''}`}
                      </label>
                    </div>
                  ):null
                }
              </div>
            </Grid>
          </Grid>
        </div>
        {/* Table */}
        <div>{this.renderTable()}</div>
        {/* Dialog */}
        <LogDialog {...logDialogProps} />
      </div>
    );
  }
}

export default withStyles(styles)(HistoryContainer);
