import React, { Component } from 'react';
import { styles } from './HistoryContainerStyle';
import { withStyles, Button } from '@material-ui/core';
import { AddCircle, RemoveCircle, Notes } from '@material-ui/icons';
import OthersTable from '../../../../components/OthersTable/OthersTable';
import LogDialog from '../../../../components/LogDialog/LogDialog';
import * as constants from '../../../../../../../constants/medicalHistories/medicalHistoriesConstants';
import {MEDICAL_HISTORIES_CODE} from '../../../../../../../constants/message/medicalHistoriesCode';
import ValidatorForm from '../../../../../../../components/FormValidator/ValidatorForm';
import CustomizedSelectFieldValidator from '../../../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import RelationshipTable from '../../../../components/RelationshipTable/RelationshipTable';

class HistoryContainer extends Component {
  constructor(props){
    super(props);
    this.buttonGroupRef = React.createRef();
    this.relationshipTableRef = React.createRef();
    this.othersTableRef = React.createRef();
    this.state = {
      tableHeight: undefined,
      logDataList: [],
      logIsOpen: false,
      selectedRowId: null,
      selectedRelationshipVal: null
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if (nextProps.containerHeight&&this.buttonGroupRef.current&&this.buttonGroupRef.current.clientHeight!==0) {
      let tableHeight = nextProps.containerHeight - this.buttonGroupRef.current.clientHeight;
      if (tableHeight!==this.state.tableHeight) {
        this.setState({tableHeight});
      }
    }
  }

  setSelectedRowId = rowId => {
    this.setState({selectedRowId:rowId});
  }

  judgeRef = () => {
    const { type } = this.props;
    let ref = null;
    switch (type) {
      case constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP:
        ref = this.relationshipTableRef;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS:
        ref = this.othersTableRef;
        break;
    }
    return ref;
  }

  handleRelationshipChange = event => {
    const { insertMedicalHistoriesLog } = this.props;
    this.setState({
      selectedRelationshipVal: event.value
    });
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog(`[Family History] Action: Select relationship: ${event.value} in drop-down list`,'');
  }

  handleAddClick = () => {
    const { changeEditFlag,insertMedicalHistoriesLog,typeName } = this.props;
    let currentRef = this.judgeRef();
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog(`[Family History] Action: Click 'Add' button in ${typeName}`, '');
    if (currentRef) {
      currentRef.current.handleRowAdd();
      changeEditFlag&&changeEditFlag();
    }
  }

  handleDeleteClick = () => {
    const { changeEditFlag, openCommonMessage, insertMedicalHistoriesLog, typeName, valMap, type } = this.props;
    let { selectedRowId } = this.state;
    let name='';
    let content='';
    if (valMap.get(type).size > 0) {
      for (const [key, value] of valMap.get(type).entries()) {
        if (key === selectedRowId) {
          name = key > 1 ? `(Family History Rlt ID: ${value.familyHistoryRltId})` : '(New record is selected; Family History Rlt ID: null)';
          if(type===constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP){
            content = `Relationship: ${value.rltText}; Problem: ${value.problemDesc};`;
          }else if(type===constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_OTHERS){
            content = `Remarks: ${value.others};`;
          }
        }
      }
    }

    let currentRef = this.judgeRef();
    if (currentRef === this.relationshipTableRef) {
      openCommonMessage&&openCommonMessage({
        msgCode:MEDICAL_HISTORIES_CODE.DELETE_FAMILY_RELATIONSHIP_CONFIRM,
        btnActions: {
          btn1Click: () => {
            insertMedicalHistoriesLog(`[Family History] Action: Click 'Delete' button in ${typeName} ${name}`, '', content);
            currentRef.current.handleRowDelete();
            changeEditFlag&&changeEditFlag();
          }
        }
      });
    } else {
      // others
      currentRef.current.handleRowDelete();
      changeEditFlag&&changeEditFlag();
    }
  }

  hanldeLogClick = () => {
    const { patientKey, openCommonCircularDialog, closeCommonCircularDialog, getFamilyHistoryOthersLogList,insertMedicalHistoriesLog } = this.props;
    insertMedicalHistoriesLog && insertMedicalHistoriesLog('[Family History] Action: Click \'Log\' button in Others', '');
    openCommonCircularDialog&&openCommonCircularDialog();
    getFamilyHistoryOthersLogList({
      params:{patientKey},
      callback: data => {
        closeCommonCircularDialog&&closeCommonCircularDialog();
        this.setState({
          logIsOpen: true,
          logDataList: data
        });
      }
    });
  }

  handleLogOK = () => {
    const { insertMedicalHistoriesLog } = this.props;
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog('[Family History] [Others Record Log Dialog] Action: Click \'OK\' button', '');
    this.setState({
      logIsOpen: false
    });
  }

  render() {
    const { classes, openCommonCircularDialog, closeCommonCircularDialog, valMap, type, changeEditFlag, serviceList, encounterInfo, encounterExistFlag, currentServiceInfo, updateState, getFamilyHistoryProblemDetailLogList, sysConfig, queryProblemList, relationshipList, familyTerminologyServiceList, isOthers=false, dataList=[],insertMedicalHistoriesLog, antFeatureFlag } = this.props;
    let { logIsOpen, tableHeight, logDataList, selectedRelationshipVal,selectedRowId } = this.state;
    let disabledEdit = !encounterExistFlag;
    let deleteDisabledFlag = encounterExistFlag?(selectedRowId?false:true):true;

    let tableProps = {
      antFeatureFlag,
      encounterInfo,
      currentServiceInfo,
      type,
      valMap,
      updateState,
      dataList,
      relationshipList,
      familyTerminologyServiceList,
      sysConfig,
      queryProblemList,
      serviceList,
      viewMode:false,
      setSelectedRowId:this.setSelectedRowId,
      tableHeight:tableHeight,
      changeEditFlag,
      encounterExistFlag,
      getFamilyHistoryProblemDetailLogList,
      openCommonCircularDialog,
      closeCommonCircularDialog,
      insertMedicalHistoriesLog
    };

    let logDialogProps ={
      type,
      serviceList,
      dataList:logDataList,
      isOpen:logIsOpen,
      handleLogOK:this.handleLogOK
    };

    return (
      <div style={{width:'100%'}}>
        {/* button group */}
        <div className={classes.btnGroup} ref={this.buttonGroupRef}>
          {isOthers?null:(
            <ValidatorForm onSubmit={()=>{}} className={classes.form}>
              <CustomizedSelectFieldValidator
                  id="family_relationship_selectbox"
                  notShowMsg
                  options={relationshipList}
                  value={selectedRelationshipVal}
                  onChange={this.handleRelationshipChange}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                  menuPortalTarget={document.body}
              />
            </ValidatorForm>
          )}
          <Button
              disabled={disabledEdit?true:(isOthers?false:(selectedRelationshipVal?false:true))}
              id="btn_family_history_other_table_add"
              className={classes.btnRoot}
              onClick={this.handleAddClick}
          >
            <AddCircle color={(disabledEdit ? true : (isOthers ? false : (selectedRelationshipVal ? false : true))) ? classes.disabledIcon : 'primary'} />
            <span className={classes.btnSpan}>Add</span>
          </Button>
          <Button
              disabled={deleteDisabledFlag}
              id="btn_family_history_other_table_delete"
              className={classes.btnRoot}
              onClick={this.handleDeleteClick}
          >
            <RemoveCircle color={deleteDisabledFlag ? classes.disabledIcon : 'primary'} />
            <span className={classes.btnSpan}>Delete</span>
          </Button>
          {isOthers?(
            <Button
                id="btn_family_history_other_table_log"
                className={classes.btnRoot}
                onClick={this.hanldeLogClick}
            >
              <Notes color="primary" />
              <span className={classes.btnSpan}>Log</span>
            </Button>
          ):null}
        </div>
        {/* Table */}
        <div>
          {isOthers?(
            <OthersTable prefix={'family'} ref={this.othersTableRef} {...tableProps} />
          ):(
            <RelationshipTable selectedRelationshipVal={selectedRelationshipVal} ref={this.relationshipTableRef} {...tableProps} />
          )}
        </div>
        {/* Dialog */}
        <LogDialog {...logDialogProps} />
      </div>
    );
  }
}

export default withStyles(styles)(HistoryContainer);
