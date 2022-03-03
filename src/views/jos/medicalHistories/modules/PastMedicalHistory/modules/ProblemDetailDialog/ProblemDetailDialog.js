import React, { Component } from 'react';
import { withStyles, Dialog, Paper, DialogTitle, DialogContent, DialogActions, Grid, Typography, TextField, Button } from '@material-ui/core';
import { styles } from './ProblemDetailDialogStyle';
import Draggable from 'react-draggable';
import CIMSButton from '../../../../../../../components/Buttons/CIMSButton';
import { RemoveCircle, AddCircle } from '@material-ui/icons';
import ProblemDetailsTable from '../../../../components/ProblemDetailsTable/ProblemDetailsTable';
import _ from 'lodash';
import * as utils from '../../../../util/utils';
import * as constants from '../../../../../../../constants/medicalHistories/medicalHistoriesConstants';
import * as commonConstants from '../../../../../../../constants/common/commonConstants';

function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={e => e.target.getAttribute('customdrag') === 'allowed'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class ProblemDetailDialog extends Component {
  constructor(props){
    super(props);
    this.tableRef = React.createRef();
    let tempMap = new Map();
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS,new Map());
    this.state={
      dateVal: '',
      valMap: tempMap,
      detailsValObjList: [],
      selectedRowId: null,
      selectedPastName: null
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    let { problemItemObj, isOpen } = nextProps;
    if (isOpen&&problemItemObj) {
      let { happenedDateText='', detailItems=[] } = problemItemObj;
      if (happenedDateText!==this.state.dateVal) {
        this.setState({dateVal:happenedDateText});
      }
      let { valMap,detailsValObjList } = this.state;
      if (detailItems.length>0&&detailsValObjList.length === 0) {
        detailItems.forEach(itemObj => {
          valMap.get(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS).set(itemObj.pastMedDetailsId,itemObj);
          detailsValObjList.push(itemObj);
        });
        this.setState({valMap, detailsValObjList});
      }
    }
  }

  handleDateChange = (event) => {
    this.setState({dateVal: event.target.value});
  }

  handleDateBlur = (event) => {
    this.setState({dateVal: _.trim(event.target.value)});
  }

  setSelectedRowId = rowId => {
    const { detailsValObjList, valMap } = this.state;
    let tempObj = null;
    if (rowId) { tempObj = _.find(detailsValObjList, item => { return item.pastMedHistoryId === rowId; }); }
    let typeName = '';
    let tempValMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS);
    if (tempValMap.size > 0) {
      for (let valObj of tempValMap.values()) {
        if (valObj.pastMedDetailsId === rowId) {
          typeName = valObj.details;
          break;
        }
      }
    }
    this.setState({
      selectedRowId: rowId,
      // selectedRowId: rowId > 1 ? rowId : 0,
      selectedPastName: tempObj ? tempObj.pastMedHistoryText : typeName
    });
  }

  handleAddClick = () => {
    const{insertMedicalHistoriesLog}=this.props;
    if (this.tableRef) {
      this.tableRef.current.handleRowAdd();
      // changeEditFlag&&changeEditFlag();
    }
    insertMedicalHistoriesLog && insertMedicalHistoriesLog('[Past Medical History] [Problem Detail Dialog] Action: Click \'Add\' button', '');
  }

  handleDeleteClick = () => {
    const{insertMedicalHistoriesLog}=this.props;
    if (this.tableRef) {
      let {selectedRowId,selectedPastName}=this.state;
      this.tableRef.current.handleRowDelete();
      // changeEditFlag&&changeEditFlag();
      if (selectedRowId > 0) {
        let name = `[Past Medical History] [Problem Detail Dialog] Action: Click 'Delete' button (Past Med History ID: ${selectedRowId}; Problem/Accident Details: ${selectedPastName}),`;
        insertMedicalHistoriesLog && insertMedicalHistoriesLog(name, '');
      } else {
        let name = `[Past Medical History] [Problem Detail Dialog] Action: Click 'Delete' button (New row is selected; Past Med History ID: null; Problem/Accident Details: ${selectedPastName}),`;
        insertMedicalHistoriesLog && insertMedicalHistoriesLog(name, '');
      }
    }
  }

  updateState = obj => {
    this.setState({
      ...obj
    });
  }

  validateValMap = () => {
    const { type } = this.props;
    let { valMap } = this.state;
    let flag = false;
    let tempValMap = valMap.get(type);
    if (tempValMap.size > 0) {
      for (let valObj of tempValMap.values()) {
        if (valObj.details === '') {
          valObj.detailsErrorFlag = true;
        }
        if (valObj.detailsErrorFlag && valObj.operationType !== commonConstants.COMMON_ACTION_TYPE.DELETE) {
          flag = true;
          break;
        }
      }
    }
    if (flag) {
      this.setState({valMap});
    }
    return flag;
  }

  handleOK = () => {
    const { handleDetailDialogOK, type, problemItemObj, problemDetailType, insertMedicalHistoriesLog, currentClinicInfo, encounterInfo } = this.props;
    let { dateVal, valMap } = this.state;
    let details = [];
    let content = '';
    if (!this.validateValMap()) {
      let tempValMap = valMap.get(type);
      if (tempValMap.size > 0) {
        for (let item of tempValMap.values()) {
          if (item.operationType||item.version) {
            let temp = _.cloneDeep(item);
            temp.clinicCd = currentClinicInfo.clinicCd;
            temp.encounterId = encounterInfo.encounterId;
            details.push(temp);
          }
          let isResult = item.pastMedHistoryId === null ? 'null' : item.pastMedDetailsId;
          content += `Past Med Details ID: ${isResult}; Problem/Accident Details: ${item.details};`;
        }
      }
      insertMedicalHistoriesLog && insertMedicalHistoriesLog('[Past Medical History] [Problem Detail Dialog] Action: Click \'OK\' button', '', content);

      let editMode = false;
      // generate parent obj
      let tempObj = null;
      if (problemItemObj.version) {
        tempObj = _.cloneDeep(problemItemObj);
        tempObj.operationType = commonConstants.COMMON_ACTION_TYPE.UPDATE;
        editMode = true;
      } else {
        tempObj = utils.generateHistoryValObj(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY);
        if (problemItemObj.pastMedHistoryId) {
          editMode = true;
          tempObj.pastMedHistoryId = problemItemObj.pastMedHistoryId;
          tempObj.pastMedHistoryText = problemItemObj.pastMedHistoryText;
        } else {
          tempObj.pastMedHistoryText = problemItemObj.termCncptId?`${problemItemObj.pastMedHistoryText} {${problemItemObj.termCncptId}}`:`${problemItemObj.pastMedHistoryText}`;
        }
        tempObj.pastMedHistoryIndt = problemDetailType;
        // tempObj.pastMedHistoryText = problemItemObj.pastMedHistoryText;
        tempObj.codeTermId = problemItemObj.codeTermId;
        tempObj.termCncptId = problemItemObj.termCncptId;
      }
      tempObj.happenedDateText = dateVal;
      tempObj.detailItems = details;
      handleDetailDialogOK&&handleDetailDialogOK(tempObj,editMode);
    }
  }

  handleCancel = () => {
    const { handleDetailDialogCancel,insertMedicalHistoriesLog } = this.props;
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog('[Past Medical History] [Problem Detail Dialog] Action: Click \'Cancel\' button','');
    handleDetailDialogCancel&&handleDetailDialogCancel();
  }

  resetStatus = () => {
    let tempMap = new Map();
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS,new Map());
    this.setState({
      dateVal: '',
      valMap: tempMap,
      detailsValObjList: [],
      selectedRowId: null
    });
  }

  render() {
    const { classes,isOpen,serviceList,type,recordUpdateFlag,problemItemObj=null } = this.props;
    let { dateVal, selectedRowId, detailsValObjList, valMap } = this.state;
    let displayName = '';
    if (recordUpdateFlag) {
      // Update
      displayName = problemItemObj?`${problemItemObj.pastMedHistoryText}`:'';
    } else {
      // Add
      displayName = problemItemObj?`${problemItemObj.pastMedHistoryText} ${problemItemObj.termCncptId?`{${problemItemObj.termCncptId}}`:''}`:'';
    }
    let tableProps = {
      type,
      valMap,
      dataList:detailsValObjList,
      serviceList,
      selectedRowId,
      updateState:this.updateState,
      setSelectedRowId:this.setSelectedRowId
    };
    let inputProps = {
      inputProps: {
        maxLength: 100,
        className:classes.inputProps
      }
    };

    return (
      <Dialog
          classes={{paper: classes.paper}}
          fullWidth
          maxWidth="md"
          open={isOpen}
          scroll="paper"
          onExited={this.resetStatus}
          // onEnter={this.resetStatus}
          PaperComponent={PaperComponent}
      >
        {/* title */}
        <DialogTitle className={classes.dialogTitle} disableTypography customdrag="allowed">Problem Detail</DialogTitle>
        {/* content */}
        <DialogContent classes={{'root':classes.dialogContent}}>
          <Typography component="div">
            <Paper elevation={1} classes={{'root':classes.backPaper}}>
              <Grid container alignItems="center">
                <Grid item xs={2} className={classes.titleGrid}>
                  <label className={classes.titleLabel}>Problem: </label>
                </Grid>
                <Grid item xs={10}>{displayName}</Grid>
                <Grid item xs={2} className={classes.titleGrid}>
                  <label className={classes.titleLabel}>Diagnosis Date: </label>
                </Grid>
                <Grid item xs={10}>
                  <div style={{paddingRight: 15}}>
                    <TextField
                        fullWidth
                        id="problem_details_dialog_diagnosis_date_text_box"
                        autoComplete="off"
                        variant="outlined"
                        value={dateVal}
                        onChange={this.handleDateChange}
                        onBlur={this.handleDateBlur}
                        {...inputProps}
                    />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div>
                    <Button
                        id="btn_past_medical_history_problme_detail_dialog_add"
                        className={classes.btnRoot}
                        onClick={this.handleAddClick}
                    >
                      <AddCircle color="primary" />
                      <span className={classes.btnSpan}>Add</span>
                    </Button>
                    <Button
                        disabled={selectedRowId ? false : true}
                        id="btn_past_medical_history_problme_detail_dialog_delete"
                        className={classes.btnRoot}
                        onClick={this.handleDeleteClick}
                    >
                      <RemoveCircle color={(selectedRowId ? false : true) ? classes.disabledIcon : 'primary'} />
                      <span className={classes.btnSpan}>Delete</span>
                    </Button>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <ProblemDetailsTable ref={this.tableRef} {...tableProps} />
                </Grid>
              </Grid>
            </Paper>
          </Typography>
        </DialogContent>
        {/* button group */}
        <DialogActions className={classes.dialogActions}>
          <Grid container direction="row" justify="flex-end" alignItems="center">
            <Grid item xs={12}>
              <div style={{float:'right'}}>
                <CIMSButton
                    id="btn_past_medical_history_problme_detail_dialog_ok"
                    onClick={this.handleOK}
                >
                  OK
                </CIMSButton>
                <CIMSButton
                    id="btn_past_medical_history_problme_detail_dialog_cancel"
                    onClick={this.handleCancel}
                >
                  Cancel
                </CIMSButton>
              </div>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(ProblemDetailDialog);
