import React, { Component } from 'react';
import { withStyles, Table, TableHead, TableRow, TableCell, TableBody, Typography, Tooltip } from '@material-ui/core';
import { styles } from './ProblemTableStyle';
import classNames from 'classnames';
import _ from 'lodash';
import * as constants from '../../../../../constants/common/commonConstants';
import * as medicalConstants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
// import * as utils from '../../util/utils';
import EventEmitter from '../../../../../utilities/josCommonUtilties';

class ProblemTable extends Component {
  constructor(props){
    super(props);
    this.tableRef = React.createRef();
    this.state={
      selectedRowId: null
    };
  }

  // UNSAFE_componentWillMount(){
  //   const { type } = this.props;
  //   let prefix = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY?'past_medical':'family';
  //   EventEmitter.on(`medical_histories_${prefix}_history_problem_table_add_data`, this.handleAddData);
  // }

  componentDidMount(){
    const { type } = this.props;
    let prefix = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY?'past_medical':'family';
    EventEmitter.on(`medical_histories_${prefix}_history_problem_table_add_data`, this.handleAddData);
  }

  componentWillUnmount(){
    const { type } = this.props;
    let prefix = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY?'past_medical':'family';
    EventEmitter.delete(`medical_histories_${prefix}_history_problem_table_add_data`, this.handleAddData);
  }

  handleAddData = (payload={}) => {
    let { editMode,rowId } = payload;
    this.handleRowClick(rowId,!editMode);
  }

  handleRowClick = (selectedId,rowAddFlag=false) => {
    const { setSelectedRowId} = this.props;
    setSelectedRowId&&setSelectedRowId(selectedId);
    this.setState({
      selectedRowId:selectedId
    },()=>{
      if (rowAddFlag&&this.tableRef.current) {
        _.delay(()=>{
          this.tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        },300);
      }
    });
  }

  handleRowDelete = () => {
    let { updateState, dataList, valMap, type } = this.props;
    let { selectedRowId } = this.state;
    if (dataList.length>0) {
      let fieldName = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY?'pastMedHistoryId':'familyHistoryId';
      let tempArray = _.remove(dataList, item => {
        return item[fieldName] === selectedRowId;
      });
      if (tempArray.length>0) {
        let tempObj = _.head(tempArray);
        if (tempObj.version) {
          tempObj.operationType = constants.COMMON_ACTION_TYPE.DELETE;
          tempObj.deleteInd = medicalConstants.DELETED_STATUS.YES;
        }
        if (valMap.get(type).has(selectedRowId)) {
          if (tempObj.operationType === constants.COMMON_ACTION_TYPE.DELETE) {
            valMap.get(type).set(selectedRowId,tempObj);
          } else {
            valMap.get(type).delete(selectedRowId);
          }
        }
        this.handleRowClick(null);
        updateState&&updateState({
          problemValObjList: dataList,
          valMap
        });
      }
    }
  }

  generateTableContent = () => {
    const { classes, dataList, type} = this.props;
    let { selectedRowId } = this.state;
    let elements = [];
    let fieldName = '', colField1 = '', colField2 = '';
    if (type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY) {
      fieldName = 'pastMedHistoryId';
      colField1 = 'pastMedHistoryText';
      colField2 = 'happenedDateText';
    } else {
      fieldName = 'familyHistoryId';
      colField1 = 'probTxt';
      colField2 = 'diagDateTxt';
    }
    elements = dataList.map(item => {
      if (item.deleteInd !== medicalConstants.DELETED_STATUS.YES&&item.operationType!==constants.COMMON_ACTION_TYPE.DELETE) {
        let currentRowFlag = selectedRowId === item[fieldName]?true:false;
        let displayProblemName = `${item[colField1]}`;
        // let displayProblemName = `${item[colField1]} ${item.termCncptId?`{${item.termCncptId}}`:''}`;

        return (
          <TableRow
              key={`medical_history_problem_table_row_${item[fieldName]}`}
              className={classNames(classes.tableContentrow,{
                [classes.tableContentRowSelected]:currentRowFlag
              })}
              onClick={()=>{this.handleRowClick(item[fieldName]);}}
          >
            {/* Problem(s)/Accident(s) */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={displayProblemName} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{displayProblemName}</label>
              </Tooltip>
            </TableCell>
            {/* Diagnosis Date */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={item[colField2]?item[colField2]:''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{item[colField2]?item[colField2]:''}</label>
              </Tooltip>
            </TableCell>
          </TableRow>
        );
      }
    });
    return elements;
  }

  render() {
    const { classes, dataList, tableHeight, type=medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY} = this.props;
    let colName = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY?'Selected Problem(s) / Accident(s)':'Selected Problem(s)';
    let id = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY?'past':'family';
    let contentElements = this.generateTableContent();
    return (
      <div
          className={classNames(classes.tableContainer)}
          style={{maxHeight:tableHeight}}
      >
        <Table id={`medical_history_${id}_problem_table`} ref={this.tableRef} >
          <TableHead>
            <TableRow className={classes.tableHeadRow}>
              <TableCell padding="none" className={classes.tableHeadCell} style={{width:'40%'}} >{colName}</TableCell>
              <TableCell padding="none" className={classes.tableHeadCell} >Diagnosis Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataList.length>0?(contentElements):(
              <TableRow style={{ height: 'auto' }}>
                <TableCell colSpan={2} style={{ textAlign: 'center' }}>
                  <Typography style={{padding: 10}}>There is no data.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default withStyles(styles)(ProblemTable);
