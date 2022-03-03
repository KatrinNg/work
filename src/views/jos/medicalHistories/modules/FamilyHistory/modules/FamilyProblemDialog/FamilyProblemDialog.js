import React, { Component } from 'react';
import { withStyles, Dialog, Paper, DialogTitle, DialogContent, DialogActions, Grid, Typography } from '@material-ui/core';
import { styles } from './FamilyProblemDialogStyle';
import Draggable from 'react-draggable';
import CIMSButton from '../../../../../../../components/Buttons/CIMSButton';
import _ from 'lodash';
import * as utils from '../../../../util/utils';
import * as constants from '../../../../../../../constants/medicalHistories/medicalHistoriesConstants';
import * as commonConstants from '../../../../../../../constants/common/commonConstants';
import ProblemContainer from '../ProblemContainer/ProblemContainer';
import TableContainer from '../TableContainer/TableContainer';
import FamilyProblemDetailDialog from '../FamilyProblemDetailDialog/FamilyProblemDetailDialog';
import EventEmitter from '../../../../../../../utilities/josCommonUtilties';

function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={e=>e.target.getAttribute('customdrag') === 'allowed'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class FamilyProblemDialog extends Component {
  constructor(props){
    super(props);
    this.contentRef = React.createRef();
    let tempMap = new Map();
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM,new Map());
    this.state={
      valMap: tempMap,
      problemValObjList: [],
      selectedRowId: null,
      detailIsOpen: false,
      problemItemObj: null,
      contentHeight: undefined,
      recordUpdateFlag: false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    let { selectedObj, isOpen } = nextProps;
    if (isOpen&&selectedObj) {
      let { details=[] } = selectedObj;
      let { valMap,problemValObjList } = this.state;
      if (details.length>0&&problemValObjList.length === 0) {
        details.forEach(itemObj => {
          let valObj = utils.generateHistoryValObj(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM,itemObj);
          valMap.get(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM).set(valObj.familyHistoryId,valObj);
          problemValObjList.push(valObj);
        });
        this.setState({valMap, problemValObjList});
      }

      if (this.contentRef.current&&this.contentRef.current.clientHeight!==0) {
        this.setState({
          contentHeight: this.contentRef.current.clientHeight - 17 - 20
        });
      }
    }
  }

  handleProblemUpdate = (rowId) => {
    let { valMap } = this.state;
    let valObj = valMap.get(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM).get(rowId);
    if (valObj) {
      let problemItem = utils.transformFamilyProblemItem(null,valObj);
      this.setState({
        problemItemObj: problemItem,
        detailIsOpen: true,
        recordUpdateFlag: true
      });
    }
  }

  handleOtherProblemAdd = (item) => {
    let problemItem = utils.transformFamilyProblemItem(item);
    this.setState({
      problemItemObj: problemItem,
      detailIsOpen: true,
      recordUpdateFlag: false
    });
  }

  handleProblemItemClick = (problemItem) => {
    let {insertMedicalHistoriesLog}=this.props;
    this.setState({
      problemItemObj: problemItem,
      detailIsOpen: true,
      recordUpdateFlag: false
    });
    let name = `[Family History] [Family History Problem Dialog] Action: Select ${problemItem.displayGroup} problem in problem list (Code Term ID: ${problemItem.codeTermId}; Problem: ${problemItem.pastMedHistoryText})`;
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog(name,'');
  }

  setSelectedRowId = rowId => {
    this.setState({selectedRowId:rowId});
  }

  updateState = obj => {
    this.setState({
      ...obj
    });
  }

  handleAdd = () => {
    const { selectedObj, handleProblemDialogAdd,insertMedicalHistoriesLog } = this.props;
    let { problemValObjList, valMap } = this.state;
    let tempValMap = valMap.get(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM);
    let details = [];
    let content='';
    if (tempValMap.size > 0) {
      for (let item of tempValMap.values()) {
        if (item.operationType||item.version) {
          item.detailItems.forEach(element => { content += `Problem Details: ${element.details};`; });
          content += `Problem: ${item.probTxt};`;
          let tempValObj = _.cloneDeep(item);
          if (item.operationType) {
            selectedObj.operationType = selectedObj.version?commonConstants.COMMON_ACTION_TYPE.UPDATE:commonConstants.COMMON_ACTION_TYPE.INSERT;
          }
          details.push(tempValObj);
        }
      }
    }
    let problemDesc = utils.generateFmailyProblemDesc(problemValObjList);
    selectedObj.problemDesc = problemDesc;
    selectedObj.details = details;
    insertMedicalHistoriesLog && insertMedicalHistoriesLog('[Family History] [Family History Problem Dialog] Action: Click \'Add\' button to confirm family history problem', '', content);
    handleProblemDialogAdd&&handleProblemDialogAdd(selectedObj);
  }

  handleCancel = () => {
    const { handleProblemDialogCancel,insertMedicalHistoriesLog } = this.props;
    insertMedicalHistoriesLog && insertMedicalHistoriesLog('[Family History]  Action: Click \'Cancel\' button', '');
    handleProblemDialogCancel&&handleProblemDialogCancel();
  }

  handleDetailDialogOK = (tempObj,editMode=false) => {
    let { valMap, problemValObjList } = this.state;
    valMap.get(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM).set(tempObj.familyHistoryId,tempObj);
    if (editMode) {
      let index = _.findIndex(problemValObjList, itemObj => {
        return itemObj.familyHistoryId === tempObj.familyHistoryId;
      });
      if (index!==-1) {
        problemValObjList[index] = tempObj;
      }
    } else {
      problemValObjList = _.concat(problemValObjList,tempObj);
    }
    this.handleDetailDialogCancel();
    this.setState({
      problemValObjList,
      valMap
    },()=>{
      EventEmitter.emit('medical_histories_family_history_problem_table_add_data',{
        editMode,
        rowId:tempObj.familyHistoryId
      });
    });
  }

  handleDetailDialogCancel = () => {
    this.setState({detailIsOpen: false});
  }

  resetStatus = () => {
    let tempMap = new Map();
    tempMap.set(constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM,new Map());
    this.setState({
      valMap: tempMap,
      problemValObjList: [],
      selectedRowId: null
    });
  }

  handleEntered = () => {
    if (this.contentRef.current&&this.contentRef.current.clientHeight!==0) {
      this.setState({
        contentHeight: this.contentRef.current.clientHeight - 17 - 20
      });
    }
  }

  render() {
    const { classes,isOpen,serviceList,currentServiceInfo,familyTerminologyServiceList,queryProblemList,sysConfig,changeEditFlag,encounterInfo,getFamilyHistoryProblemDetailLogList,openCommonCircularDialog,closeCommonCircularDialog,selectedObj=null,insertMedicalHistoriesLog, antFeatureFlag } = this.props;
    let { detailIsOpen, problemItemObj, problemValObjList, valMap, contentHeight, recordUpdateFlag } = this.state;
    let commonProps = {
      antFeatureFlag,
      openCommonCircularDialog,
      closeCommonCircularDialog,
      sysConfig,
      valMap,
      encounterInfo,
      currentServiceInfo,
      serviceList,
      insertMedicalHistoriesLog,
      updateState:this.updateState,
      changeEditFlag
    };
    let detailDialogProps ={
      recordUpdateFlag,
      currentServiceInfo,
      serviceList,
      insertMedicalHistoriesLog,
      relationshipProblemObj:_.cloneDeep(problemItemObj),
      type: constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM_DETAIL,
      isOpen: detailIsOpen,
      handleDetailDialogOK:this.handleDetailDialogOK,
      handleDetailDialogCancel:this.handleDetailDialogCancel
    };

    let dialogProblemProps = {
      queryProblemList,
      containerHeight: contentHeight,
      terminologyServiceList: familyTerminologyServiceList,
      handleProblemItemClick:this.handleProblemItemClick,
      handleOtherProblemAdd: this.handleOtherProblemAdd,
      ...commonProps
    };

    let dialogTableProps = {
      getFamilyHistoryProblemDetailLogList,
      containerHeight: contentHeight?contentHeight-5:contentHeight,
      type: constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM,
      dataList:problemValObjList,
      handleProblemUpdate: this.handleProblemUpdate,
      ...commonProps
    };
    return (
      <Dialog
          classes={{paper: classes.paper}}
          fullWidth
          maxWidth="md"
          open={isOpen}
          scroll="paper"
          onExited={this.resetStatus}
          onEntered={this.handleEntered}
          PaperComponent={PaperComponent}
      >
        {/* title */}
        <DialogTitle className={classes.dialogTitle} disableTypography customdrag="allowed">Family History Problem</DialogTitle>
        {/* content */}
        <DialogContent ref={this.contentRef} classes={{'root':classes.dialogContent}}>
          <Typography component="div">
            <Paper elevation={1} className={classes.contentPaper}>
              <label className={classes.relationshipLabel}>Relationship: {selectedObj?selectedObj.rltText:''}</label>
              <Grid container>
                <Grid item xs={6}>
                  <TableContainer {...dialogTableProps} />
                </Grid>
                <Grid item xs={6}>
                  <ProblemContainer {...dialogProblemProps} />
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
                    id="btn_family_history_problme_dialog_add"
                    onClick={this.handleAdd}
                >
                  Add
                </CIMSButton>
                <CIMSButton
                    id="btn_family_history_problme_dialog_cancel"
                    onClick={this.handleCancel}
                >
                  Cancel
                </CIMSButton>
              </div>
            </Grid>
          </Grid>
        </DialogActions>
        {/* detail dialog */}
        <FamilyProblemDetailDialog {...detailDialogProps} />
      </Dialog>
    );
  }
}

export default withStyles(styles)(FamilyProblemDialog);
