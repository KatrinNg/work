import React, { Component } from 'react';
import { styles } from './TableContainerStyle';
import { withStyles, Grid, Button } from '@material-ui/core';
import { RemoveCircle, Notes, Edit } from '@material-ui/icons';
import ProblemSummaryTable from '../../../../components/ProblemSummaryTable/ProblemSummaryTable';
import LogDialog from '../../../../components/LogDialog/LogDialog';
import _ from 'lodash';
import * as constants from '../../../../../../../constants/medicalHistories/medicalHistoriesConstants';
import EventEmitter from '../../../../../../../utilities/josCommonUtilties';

class TableContainer extends Component {
  constructor(props){
    super(props);
    this.toolBarRef = React.createRef();
    this.problemTableRef = React.createRef();
    this.state={
      tableHeight:undefined,
      selectedRowId: null,
      selectedPastName:'',
      selectedRecordVer: null,
      logDataList:[],
      logIsOpen:false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if (nextProps.containerHeight) {
      let tableHeight = nextProps.containerHeight - (this.toolBarRef.current.clientHeight!==0?this.toolBarRef.current.clientHeight:44);
      if (tableHeight!==this.state.tableHeight) {
        this.setState({tableHeight});
      }
    }
  }

  hanldeLogClick = () => {
    const { openCommonCircularDialog, closeCommonCircularDialog, getFamilyHistoryProblemDetailLogList, currentServiceInfo,insertMedicalHistoriesLog } = this.props;
    let { selectedRowId,selectedPastName } = this.state;
    let name=`[Family History] [Family History Problem Dialog] Action: Click 'Log' button (Family History ID: ${selectedRowId}; Problem: ${selectedPastName})`;
    insertMedicalHistoriesLog && insertMedicalHistoriesLog(name, '/medical-summary/pastMedHistory/getMsPastMedDetailsLogList');
    openCommonCircularDialog&&openCommonCircularDialog();
    getFamilyHistoryProblemDetailLogList({
      params:{
        familyHistoryId:selectedRowId,
        serviceCd:currentServiceInfo.svcCd
      },
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
    this.setState({logIsOpen: false});
    insertMedicalHistoriesLog && insertMedicalHistoriesLog('[Family History] [Family History Problem Dialog] [Family Relationship Problem Log Dialog] Action: Click \'OK\' button', '');
  }

  setSelectedRowId = rowId => {
    const { dataList } = this.props;
    let tempObj = null;
    if (rowId) { tempObj = _.find(dataList, item => { return item.familyHistoryId === rowId; }); }
    let typeName = '';
    this.setState({
      selectedRowId:rowId,
      selectedPastName: tempObj ? tempObj.probTxt : typeName,
      detailsDataList: tempObj ? tempObj.detailItems : [],
      selectedRecordVer: tempObj ? tempObj.version : null
    });
    // EventEmitter.emit('medical_histories_family_history_problem_details_table_reset');
  }

  handleUpdateClick = () => {
    const { handleProblemUpdate,insertMedicalHistoriesLog } = this.props;
    let { selectedRowId,selectedPastName } = this.state;
    if (selectedRowId) {
      let valName = selectedRowId > 1 ? `(Family History ID: ${selectedRowId}; Problem: ${selectedPastName})` : `(New record is selected; Family History ID: null; Problem: ${selectedPastName})`;
      let name = `[Family History] [Family History Problem Dialog] Action: Click 'Update' button ${valName}`;
      insertMedicalHistoriesLog && insertMedicalHistoriesLog(name, '');
      handleProblemUpdate && handleProblemUpdate(selectedRowId);
    }
  }

  handleDeleteClick = () => {
    const { insertMedicalHistoriesLog } = this.props;
    if (this.problemTableRef) {
      let { selectedRowId, selectedPastName } = this.state;
      if (selectedRowId) {
        let valName = selectedRowId > 1 ? `(Family History ID:  ${selectedRowId}; Problem: ${selectedPastName})` : `(New record is selected; Family History ID: null; Problem: ${selectedPastName})`;
        let name = `[Family History] [Family History Problem Dialog] Action: Click 'Delete' button ${valName},`;
        insertMedicalHistoriesLog && insertMedicalHistoriesLog(name, '');
        this.problemTableRef.current.handleRowDelete();
      }
    }
  }

  render() {
    const { classes, containerHeight, type, valMap, updateState, dataList, serviceList, changeEditFlag, encounterInfo, antFeatureFlag } = this.props;
    let { selectedRowId, selectedRecordVer, tableHeight, logDataList, logIsOpen } = this.state;
    let encounterFlag = encounterInfo&&!_.isEmpty(encounterInfo)?false:true;
    let disabledFlag = !encounterFlag?(selectedRowId?false:true):true;

    let logDialogProps ={
      type:constants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM_DETAIL,
      serviceList,
      dataList:logDataList,
      isOpen:logIsOpen,
      handleLogOK:this.handleLogOK
    };

    let problemTableProps = {
      antFeatureFlag,
      valMap,
      type,
      serviceList,
      dataList,
      setSelectedRowId:this.setSelectedRowId,
      viewMode:true,
      tableHeight,
      changeEditFlag,
      updateState
    };

    return (
      <div className={classes.container} style={{height:containerHeight}}>
        <Grid container>
          <Grid item xs={12} md={12}>
            <Grid container justify="space-between" alignItems="center" ref={this.toolBarRef}>
              <Grid item xs={12} md={6}>
                <div>
                  <Button
                      disabled={disabledFlag}
                      id="btn_past_medical_history_table_update"
                      className={classes.btnRoot}
                      onClick={this.handleUpdateClick}
                  >
                    <Edit color={disabledFlag ? classes.disabledIcon : 'primary'} />
                    <span className={classes.btnSpan}>Update</span>
                  </Button>
                  <Button
                      disabled={disabledFlag}
                      id="btn_past_medical_history_table_delete"
                      className={classes.btnRoot}
                      onClick={this.handleDeleteClick}
                  >
                    <RemoveCircle color={disabledFlag ? classes.disabledIcon : 'primary'} />
                    <span className={classes.btnSpan}>Delete</span>
                  </Button>
                </div>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                    disabled={selectedRowId?(selectedRecordVer?false:true):true}
                    id="btn_past_medical_history_table_log"
                    className={classes.btnRoot}
                    style={{float:'right'}}
                    onClick={this.hanldeLogClick}
                >
                  <Notes color={(selectedRowId ? (selectedRecordVer ? false : true) : true) ? classes.disabledIcon : 'primary'} />
                  <span className={classes.btnSpan}>Log</span>
                </Button>
              </Grid>
            </Grid>
            <Grid item xs={12} md={12}>
              <ProblemSummaryTable ref={this.problemTableRef} {...problemTableProps} />
            </Grid>
          </Grid>
        </Grid>
        {/* log dialog */}
        <LogDialog {...logDialogProps} />
      </div>
    );
  }
}

export default withStyles(styles)(TableContainer);
