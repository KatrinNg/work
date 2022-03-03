import React, { Component } from 'react';
import { withStyles, Table, TableHead, TableRow, TableCell, TableBody, Typography, Divider, Tooltip } from '@material-ui/core';
import { styles } from './ProblemSummaryTableStyle';
import classNames from 'classnames';
import moment from 'moment';
import _ from 'lodash';
import * as constants from '../../../../../constants/common/commonConstants';
import * as medicalConstants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import EventEmitter from '../../../../../utilities/josCommonUtilties';
import CheckBox from '../CheckBox/CheckBox';

class ProblemSummaryTable extends Component {
  constructor(props){
    super(props);
    this.tableRef = React.createRef();
    this.state={
      selectedRowId:null,
      addFlag:false
    };
  }

  // UNSAFE_componentWillMount(){
  //   const { type } = this.props;
  //   let prefix = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS?'past_medical':'family';
  //   EventEmitter.on(`medical_histories_${prefix}_history_problem_details_table_reset`, this.handleResetStatus);
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

  generateTableDetails = (detailItems) => {
    const { classes } = this.props;
    let details = detailItems.map((item, index) => {
      return item.details === '' ? null :
      (
        <div key={index}>
          <Tooltip title={item.details?item.details:''} classes={{tooltip:classes.tooltip}}>
            <label className={classNames(classes.detailLabel,classes.displayLabel)}>{item.details?item.details:''}</label>
          </Tooltip>
          {/* {((index === detailItems.length-1 ) || item.details === '')?null:<Divider />} */}
          {((this.hasDetailItem(detailItems,index)) || item.details === '')?null:<Divider />}
        </div>
      );
    });
    return details;
  }

  hasDetailItem = (detailItems, start) => {
    let flag = true;
    for (let index = start + 1; index < detailItems.length; index++) {
      let element = detailItems[index];
      if(element.details !== '') {
        flag = false;
        break;
      }
    }
    return flag;
  }

  generateTableContent = () => {
    const { classes, dataList, valMap, serviceList, type, updateState, encounterExistFlag, changeEditFlag, antFeatureFlag = false } = this.props;
    let { selectedRowId } = this.state;
    let elements = [];
    let fieldName = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY?'pastMedHistoryId':'familyHistoryId';
    let probFieldName = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY?'pastMedHistoryText':'probTxt';
    let diagDateFieldName = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY?'happenedDateText':'diagDateTxt';
    dataList.forEach(item => {
      if (item.deleteInd !== medicalConstants.DELETED_STATUS.YES&&item.operationType!==constants.COMMON_ACTION_TYPE.DELETE) {
        let currentRowFlag = selectedRowId === item[fieldName]?true:false;

        let targetServiceObj = _.find(serviceList,tempObj=>{
          return tempObj.serviceCd === item.serviceCd;
        });

        let obsRiskFactorProps = {
          type,
          valMap,
          updateState,
          itemId: item[fieldName],
          val: item.obsRiskFactor,
          attrName: 'obsRiskFactor',
          options: medicalConstants.OBS_RICK_FACTOR_OPTION,
          encounterExistFlag,
          changeEditFlag
        };

        elements.push(
          <TableRow
              key={`medical_history_details_table_row_${item[fieldName]}`}
              className={classNames(classes.tableContentrow,{
                [classes.tableContentRowSelected]:currentRowFlag
              })}
              onClick={()=>{this.handleRowClick(item[fieldName]);}}
          >
            {/* problem/accident */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={item?.[probFieldName]||''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{item?.[probFieldName]||''}</label>
              </Tooltip>
            </TableCell>
            {/* diagnosis date */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={item?.[diagDateFieldName]||''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{item?.[diagDateFieldName]||''}</label>
              </Tooltip>
            </TableCell>
            {/* OBS Risk Factor */}
            {antFeatureFlag?(
              <TableCell className={classes.tableContentCell} padding={'none'}>
                <CheckBox {...obsRiskFactorProps} />
              </TableCell>
            ):null}
            {/* Details */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              {this.generateTableDetails(item.detailItems)}
            </TableCell>
            {/* On */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={item.updateDtm?moment(item.updateDtm).format('DD-MMM-YYYY'):''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{item.updateDtm?moment(item.updateDtm).format('DD-MMM-YYYY'):''}</label>
              </Tooltip>
            </TableCell>
            {/* By */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={item.updateBy?item.updateBy:''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{item.updateBy?item.updateBy:''}</label>
              </Tooltip>
            </TableCell>
            {/* Service */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={targetServiceObj?targetServiceObj.serviceName:''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{targetServiceObj?targetServiceObj.serviceName:''}</label>
              </Tooltip>
            </TableCell>
          </TableRow>
        );
      }
    });
    return elements;
  }

  render() {
    const { classes, dataList, tableHeight, viewMode, antFeatureFlag=false } = this.props;
    let contentElements = this.generateTableContent();

    return (
      <div
          className={classNames(classes.tableContainer,{
            [classes.tableViewContainer]: viewMode
          })}
          style={{maxHeight:tableHeight}}
      >
        <Table id="medical_history_details_table" ref={this.tableRef}>
          <TableHead>
            <TableRow className={classes.tableHeadRow}>
              <TableCell padding="none" style={{width: '22%'}} className={classes.tableHeadCell} rowSpan={2}>Problem/Accident</TableCell>
              <TableCell padding="none" style={{width: '15%'}} className={classes.tableHeadCell} rowSpan={2}>Diagnosis Date</TableCell>
              {antFeatureFlag?(
                <TableCell padding="none" style={{width: '5%'}} className={classes.tableHeadCell} rowSpan={2}>OBS Risk Factor</TableCell>
              ):null}
              <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>Details</TableCell>
              <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Updated</TableCell>
              <TableCell padding="none" style={{width: '9%'}} className={classes.tableHeadCell} rowSpan={2}>Service</TableCell>
            </TableRow>
            <TableRow className={classes.tableHeadRow}>
              <TableCell padding="none" style={{width: '14%', top: 32}} className={classes.tableHeadCell}>
                <Divider className={classes.tableDivider} />
                <span style={{position:'absolute'}}>On</span>
              </TableCell>
              <TableCell padding="none" style={{width: '11%', top: 32}} className={classes.tableHeadCell}>
                <Divider className={classes.tableDivider} />
                <span style={{position:'absolute'}}>By</span>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataList.length>0?(contentElements):(
              <TableRow style={{ height: 'auto' }}>
                <TableCell colSpan={antFeatureFlag?7:6} className={classes.tableCellRow}>
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

export default withStyles(styles)(ProblemSummaryTable);
