import React, { Component } from 'react';
import { styles } from './HistoryContainerStyle';
import { withStyles, Button } from '@material-ui/core';
import { AddCircle, RemoveCircle, Notes } from '@material-ui/icons';
import OccupationalTable from '../../../../components/OccupationalTable/OccupationalTable';
import OthersTable from '../../../../components/OthersTable/OthersTable';
import LogDialog from '../../../../components/LogDialog/LogDialog';
import * as constants from '../../../../../../../constants/medicalHistories/medicalHistoriesConstants';

class HistoryContainer extends Component {
  constructor(props){
    super(props);
    this.buttonGroupRef = React.createRef();
    this.occupationalTableRef = React.createRef();
    this.othersTableRef = React.createRef();
    this.state = {
      tableHeight: undefined,
      logIsOpen: false,
      selectedRowId: null,
      logDataList: []
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
      case constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY:
        ref = this.occupationalTableRef;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS:
        ref = this.othersTableRef;
        break;
    }
    return ref;
  }

  handleAddClick = () => {
    const { changeEditFlag,insertMedicalHistoriesLog,typeName } = this.props;
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog(`[Occupational History] Action: Click 'Add' button in ${typeName},`, '');
    let currentRef = this.judgeRef();
    if (currentRef) {
      currentRef.current.handleRowAdd();
      changeEditFlag&&changeEditFlag();
    }
  }

  handleDeleteClick = () => {
    const { changeEditFlag,insertMedicalHistoriesLog,typeName,valMap,type } = this.props;
    let {selectedRowId}=this.state;
    let name='';
    let content='';
    if (valMap.get(type).size > 0) {
      for (const [key, value] of valMap.get(type).entries()) {
        if (key === selectedRowId) {
          name = key > 1 ? `(Occupational Others ID: ${value.occupationalHistoryId})` : '(New record is selected; Occupational Others ID: null)';
          if(type===constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY){
            content = `Occupation: ${value.occupation}; Year From ${value.yearFrom} To ${value.yearTo}; Remarks: ${value.remark}`;
          }else if(type===constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS){
            content = `Remarks: ${value.others}`;
          }
        }
      }
    }
    insertMedicalHistoriesLog && insertMedicalHistoriesLog(`[Occupational History] Action: Click 'Delete' button in ${typeName} record ${name}`, '', content);
    let currentRef = this.judgeRef();
    if (currentRef) {
      currentRef.current.handleRowDelete();
      changeEditFlag&&changeEditFlag();
    }
  }

  hanldeLogClick = () => {
    const { type, patientKey, openCommonCircularDialog, closeCommonCircularDialog, getOccupationalLogList, getOccupationalOthersLogList,insertMedicalHistoriesLog,typeName } = this.props;
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog(`[Occupational History] Action: Click 'Log' button in ${typeName}`,'');
    let getLog = null;
    switch (type) {
      case constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_HISTORY:
        getLog = getOccupationalLogList;
        break;
      case constants.MEDICAL_HISTORIES_TYPE.OCCUPATIONAL_OTHERS:
        getLog = getOccupationalOthersLogList;
        break;
    }
    if (getLog) {
      openCommonCircularDialog&&openCommonCircularDialog();
      getLog({
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
  }

  handleLogOK = () => {
    const { insertMedicalHistoriesLog,typeName } = this.props;
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog(`[Occupational History] [${typeName} Log Dialog] Action: Click 'OK' button`,'');
    this.setState({
      logIsOpen: false
    });
  }

  render() {
    const { classes, valMap, type, currentServiceInfo, changeEditFlag, serviceList, encounterInfo, updateState, isOthers=false, encounterExistFlag, dataList=[] } = this.props;
    let { logIsOpen, tableHeight, logDataList, selectedRowId } = this.state;
    let disabledEdit = !encounterExistFlag;
    let deleteDisabledFlag = encounterExistFlag?(selectedRowId?false:true):true;

    let tableProps = {
      type,
      valMap,
      updateState,
      dataList,
      currentServiceInfo,
      serviceList,
      encounterInfo,
      viewMode:false,
      setSelectedRowId:this.setSelectedRowId,
      tableHeight:tableHeight,
      changeEditFlag,
      encounterExistFlag
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
        <div ref={this.buttonGroupRef} className={classes.divBack}>
          <Button
              disabled={disabledEdit}
              id="btn_occupational_table_add"
              className={classes.btnRoot}
              onClick={this.handleAddClick}
          >
            <AddCircle color={disabledEdit ? classes.disabledIcon : 'primary'} />
            <span className={classes.btnSpan}>Add</span>
          </Button>
          <Button
              disabled={deleteDisabledFlag}
              id="btn_occupational_table_delete"
              className={classes.btnRoot}
              onClick={this.handleDeleteClick}
          >
            <RemoveCircle color={deleteDisabledFlag ? classes.disabledIcon : 'primary'} />
            <span className={classes.btnSpan}>Delete</span>
          </Button>
          <Button
              id="btn_occupational_table_log"
              className={classes.btnRoot}
              onClick={this.hanldeLogClick}
          >
            <Notes color="primary" />
            <span className={classes.btnSpan}>Log</span>
          </Button>
        </div>
        {/* Table */}
        <div>
          {isOthers?(<OthersTable prefix={'occupation'} ref={this.othersTableRef} {...tableProps} />):(<OccupationalTable ref={this.occupationalTableRef} {...tableProps} />)}
        </div>
        {/* Dialog */}
        <LogDialog {...logDialogProps} />
      </div>
    );
  }
}

export default withStyles(styles)(HistoryContainer);
