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

  componentDidMount() {
    this.resetTableHeight(this.props.containerHeight);
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    this.resetTableHeight(nextProps.containerHeight);
  }

  resetTableHeight = (containerHeight) => {
    if (containerHeight) {
      let tableHeight = containerHeight - (this.toolBarRef.current.clientHeight!==0?this.toolBarRef.current.clientHeight:44);
      if (tableHeight!==this.state.tableHeight) {
        this.setState({tableHeight});
      }
    }
  }

  hanldeLogClick = () => {
    const { openCommonCircularDialog, closeCommonCircularDialog, getPastHistoryProblemDetailLogList,insertMedicalHistoriesLog } = this.props;
    let { selectedRowId, selectedPastName } = this.state;
    openCommonCircularDialog && openCommonCircularDialog();
    let name = `[Past Medical History] Action: Click 'Log' button (Past Med History ID: ${selectedRowId}; Problem/Accident: ${selectedPastName}`;
    insertMedicalHistoriesLog && insertMedicalHistoriesLog(name, '/medical-summary/pastMedHistory/getMsPastMedDetailsLogList');
    getPastHistoryProblemDetailLogList({
      params:{ pastMedHistoryId:selectedRowId },
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
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog('[Past Medical History] [Past Medical History Record Log Dialog] Action: Click \'OK\' button','');
  }

  setSelectedRowId = rowId => {
    const { dataList } = this.props;
    let tempObj = null;
    if (rowId) {
      tempObj = _.find(dataList,item => {
        return item.pastMedHistoryId === rowId;
      });
    }
    this.setState({
      selectedRowId:rowId,
      selectedPastName: tempObj ? tempObj.pastMedHistoryText : '',
      selectedRecordVer:tempObj?tempObj.version:null
    });
    EventEmitter.emit('medical_histories_past_medical_history_problem_details_table_reset');
  }

  handleUpdateClick = () => {
    const { handleProblemUpdate,insertMedicalHistoriesLog } = this.props;
    let { selectedRowId,selectedPastName } = this.state;
    if (selectedRowId) {
      let valName = selectedRowId > 1 ? `(Past Med History ID: ${selectedRowId}; Problem: ${selectedPastName})` : `(New row is selected; Past Med History ID: null;  Problem/Accident: ${selectedPastName})`;
      let name = `[Past Medical History] Action: Click 'Update' button ${valName}`;
      insertMedicalHistoriesLog && insertMedicalHistoriesLog(name, '');
      handleProblemUpdate&&handleProblemUpdate(selectedRowId);
    }
  }

  handleDeleteClick = () => {
    const { changeEditFlag,insertMedicalHistoriesLog } = this.props;
    if (this.problemTableRef) {
      let { selectedRowId,selectedPastName } = this.state;
      let valName = selectedRowId > 1 ? `(Past Med History ID: ${selectedRowId}; Problem: ${selectedPastName})` : `(New row is selected; Past Med History ID: null;  Problem/Accident: ${selectedPastName})`;
      let name = `[Past Medical History] Action: Click 'Delete' button ${valName}`;
      insertMedicalHistoriesLog && insertMedicalHistoriesLog(name, '');
      this.problemTableRef.current.handleRowDelete();
      changeEditFlag && changeEditFlag();
    }
  }

  render() {
    const { classes, containerHeight, type, valMap, updateState, dataList, serviceList, changeEditFlag, encounterExistFlag, antFeatureFlag } = this.props;
    let { selectedRowId, selectedRecordVer, tableHeight, logDataList, logIsOpen } = this.state;
    let disabledFlag = encounterExistFlag?(selectedRowId?false:true):true;

    let logDialogProps ={
      type:constants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS,
      serviceList,
      dataList:logDataList,
      isOpen:logIsOpen,
      handleLogOK:this.handleLogOK
    };

    let problemTableProps = {
      encounterExistFlag,
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
      <div className={classes.container} style={{height:containerHeight?containerHeight:'100%'}}>
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
