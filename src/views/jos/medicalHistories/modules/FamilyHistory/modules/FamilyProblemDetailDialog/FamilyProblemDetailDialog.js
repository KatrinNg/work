import React, { Component } from 'react';
import { withStyles, Dialog, Paper, DialogTitle, DialogContent, DialogActions, Grid, Typography, TextField, Button } from '@material-ui/core';
import { styles } from './FamilyProblemDetailDialogStyle';
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
        onStart={e=>e.target.getAttribute('detailcustomdrag') === 'allowed'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class FamilyProblemDetailDialog extends Component {
  constructor(props){
    super(props);
    this.tableRef = React.createRef();
    let tempMap = new Map();
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM_DETAIL,new Map());
    this.state={
      dateVal: '',
      valMap: tempMap,
      detailsValObjList: [],
      selectedRowId: null
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    let { relationshipProblemObj, isOpen } = nextProps;
    if (isOpen&&relationshipProblemObj) {
      let { diagDateTxt='', detailItems=[] } = relationshipProblemObj;
      if (diagDateTxt!==this.state.dateVal) {
        this.setState({dateVal:diagDateTxt});
      }
      let { valMap,detailsValObjList } = this.state;
      if (detailItems.length>0&&detailsValObjList.length === 0) {
        detailItems.forEach(itemObj => {
          let valObj = utils.generateHistoryValObj(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM_DETAIL,itemObj);
          valMap.get(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM_DETAIL).set(valObj.familyDetailsId,valObj);
          detailsValObjList.push(valObj);
        });
        this.setState({
          valMap,
          detailsValObjList
        });
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
    this.setState({selectedRowId:rowId});
  }

  handleAddClick = () => {
    const{insertMedicalHistoriesLog}=this.props;
    if (this.tableRef) {
      this.tableRef.current.handleRowAdd();
      // changeEditFlag&&changeEditFlag();
    }
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog('[Family History] [Family History Problem Dialog] [Problem Detail Dialog] Action: Click \'Add\' button','');
  }

  handleDeleteClick = () => {
    const { insertMedicalHistoriesLog } = this.props;
    let { selectedRowId } = this.state;
    if (this.tableRef) {
      let valName = selectedRowId > 1 ? `(Family Details ID: ${selectedRowId})` : '(New record is selected; Family Details ID: null),';
      let name = `[Family History] [Family History Problem Dialog] [Problem Detail Dialog] Action: Click 'Delete' button ${valName}`;
      insertMedicalHistoriesLog && insertMedicalHistoriesLog(name, '');
      this.tableRef.current.handleRowDelete();
      // changeEditFlag&&changeEditFlag();
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
    const { handleDetailDialogOK,type,relationshipProblemObj,insertMedicalHistoriesLog } = this.props;
    let { dateVal, valMap } = this.state;
    let details = [];
    let content = 'Problem Details:';
    if (!this.validateValMap()) {
      let tempValMap = valMap.get(type);
      if (tempValMap.size > 0) {
        for (let item of tempValMap.values()) {
          content += item.details + ',';
          if (item.operationType || item.version) {
            let temp = _.cloneDeep(item);
            details.push(temp);
          }
        }
      }

      let editMode = false;
      // generate parent obj
      let tempObj = null;
      if (relationshipProblemObj.familyHistoryId) {
        editMode = true;
        tempObj = _.cloneDeep(relationshipProblemObj);
        tempObj.operationType = commonConstants.COMMON_ACTION_TYPE.UPDATE;
        delete tempObj.pastMedHistoryText;
      } else {
        tempObj = utils.generateHistoryValObj(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM);
        tempObj.codeTermId = relationshipProblemObj.codeTermId;
        tempObj.termCncptId = relationshipProblemObj.termCncptId;
        tempObj.probTxt = relationshipProblemObj.termCncptId?`${relationshipProblemObj.pastMedHistoryText} {${relationshipProblemObj.termCncptId}}`:`${relationshipProblemObj.pastMedHistoryText}`;
        // tempObj.probTxt = relationshipProblemObj.pastMedHistoryText;
      }
      tempObj.diagDateTxt = dateVal;
      tempObj.detailItems = details;
      insertMedicalHistoriesLog && insertMedicalHistoriesLog('[Family History] [Family History Problem Dialog] [Problem Detail Dialog] Action: Click \'OK\' button', '', content + ';');
      handleDetailDialogOK&&handleDetailDialogOK(tempObj,editMode);
    }
  }

  handleCancel = () => {
    const { handleDetailDialogCancel,insertMedicalHistoriesLog } = this.props;
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog('[Family History] [Family History Problem Dialog] [Problem Detail Dialog] Action: Click \'Cancel\' button','');
    handleDetailDialogCancel&&handleDetailDialogCancel();
  }

  resetStatus = () => {
    let tempMap = new Map();
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM_DETAIL,new Map());
    this.setState({
      dateVal: '',
      valMap: tempMap,
      detailsValObjList: [],
      selectedRowId: null
    });
  }

  render() {
    const { classes,isOpen,serviceList,recordUpdateFlag,relationshipProblemObj=null } = this.props;
    let { dateVal, selectedRowId, detailsValObjList, valMap } = this.state;
    let displayName = '';
    if (recordUpdateFlag) {
      // Update
      displayName = relationshipProblemObj?`${relationshipProblemObj.pastMedHistoryText}`:'';
    } else {
      // Add
      displayName = relationshipProblemObj?`${relationshipProblemObj.pastMedHistoryText} ${relationshipProblemObj.termCncptId?`{${relationshipProblemObj.termCncptId}}`:''}`:'';
    }
    // let displayName = relationshipProblemObj?`${relationshipProblemObj.pastMedHistoryText} ${relationshipProblemObj.termCncptId?`{${relationshipProblemObj.termCncptId}}`:''}`:'';
    let tableProps = {
      type:constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM_DETAIL,
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
          PaperComponent={PaperComponent}
      >
        {/* title */}
        <DialogTitle className={classes.dialogTitle} disableTypography detailcustomdrag="allowed">Problem Detail</DialogTitle>
        {/* content */}
        <DialogContent classes={{'root':classes.dialogContent}}>
          <Typography component="div">
            <Paper elevation={1} className={classes.root}>
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
                        id="family_problem_details_dialog_diagnosis_date_text_box"
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
                        id="btn_family_history_problme_detail_dialog_add"
                        className={classes.btnRoot}
                        onClick={this.handleAddClick}
                    >
                      <AddCircle color="primary" />
                      <span className={classes.btnSpan}>Add</span>
                    </Button>
                    <Button
                        disabled={selectedRowId?false:true}
                        id="btn_family_history_problme_detail_dialog_delete"
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
                    id="btn_family_history_problme_detail_dialog_ok"
                    onClick={this.handleOK}
                >
                  OK
                </CIMSButton>
                <CIMSButton
                    id="btn_family_history_problme_detail_dialog_cancel"
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

export default withStyles(styles)(FamilyProblemDetailDialog);
