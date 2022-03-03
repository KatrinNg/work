import React, { Component } from 'react';
import { withStyles, Table, TableHead, TableRow, TableCell, TableBody, Typography, Divider, Tooltip } from '@material-ui/core';
import { styles } from './ProblemDetailsTableStyle';
import classNames from 'classnames';
import moment from 'moment';
import TextInputBox from '../TextInputBox/TextInputBox';
import _ from 'lodash';
import * as constants from '../../../../../constants/common/commonConstants';
import * as medicalConstants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import * as utils from '../../util/utils';
import EventEmitter from '../../../../../utilities/josCommonUtilties';

class ProblemDetailsTable extends Component {
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
    let prefix = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS?'past_medical':'family';
    EventEmitter.on(`medical_histories_${prefix}_history_problem_details_table_reset`, this.handleResetStatus);
  }

  componentWillUnmount(){
    const { type } = this.props;
    let prefix = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS?'past_medical':'family';
    EventEmitter.delete(`medical_histories_${prefix}_history_problem_details_table_reset`, this.handleResetStatus);
  }

  handleResetStatus = () => {
    this.setState({selectedRowId:null});
  }

  handleRowClick = (detailsId,rowAddFlag=false) => {
    const { setSelectedRowId } = this.props;
    setSelectedRowId&&setSelectedRowId(detailsId);
    this.setState({
      selectedRowId:detailsId,
      addFlag:true
    },()=>{
      if (rowAddFlag&&this.tableRef.current) {
        this.tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  }

  handleRowAdd = () => {
    let { updateState, type, dataList, valMap } = this.props;
    let tempObj = utils.generateHistoryValObj(type);
    let fieldName = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS?'pastMedDetailsId':'familyDetailsId';
    valMap.get(type).set(tempObj[fieldName],tempObj);
    updateState&&updateState({
      detailsValObjList: _.concat(dataList,tempObj),
      valMap
    });
    this.handleRowClick(tempObj[fieldName],true);
  }

  handleRowDelete = () => {
    let { updateState, dataList, valMap, type } = this.props;
    let { selectedRowId } = this.state;
    if (dataList.length>0) {
      let fieldName = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS?'pastMedDetailsId':'familyDetailsId';
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
            tempObj.details = '';
            valMap.get(type).set(selectedRowId,tempObj);
          } else {
            valMap.get(type).delete(selectedRowId);
          }
        }
        this.handleRowClick(null);
        updateState&&updateState({
          detailsValObjList: dataList,
          valMap
        });
      }
    }
  }

  generateTableContent = () => {
    const { classes, dataList, updateState, serviceList, valMap, type, changeEditFlag, viewMode=false } = this.props;
    let { selectedRowId } = this.state;
    let elements = [];
    let fieldName = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS?'pastMedDetailsId':'familyDetailsId';
    dataList.forEach(item => {
      if (item.deleteInd !== medicalConstants.DELETED_STATUS.YES&&item.operationType!==constants.COMMON_ACTION_TYPE.DELETE) {
        let currentRowFlag = selectedRowId === item[fieldName]?true:false;
        let commonProps = {
          itemId:item[fieldName],
          item,
          currentRowFlag,
          updateState,
          valMap,
          type,
          changeEditFlag
        };
        let detailsFieldProps = {
          val:item.details,
          attrName: 'details',
          mandatoryFlag: true,
          enableAutoFocus: this.state.addFlag,
          maxLength:1000,
          ...commonProps
        };

        let targetServiceObj = _.find(serviceList,tempObj=>{
          return tempObj.serviceCd === item.serviceCd;
        });

        elements.push(
          <TableRow
              key={`medical_history_details_table_row_${item[fieldName]}`}
              className={classNames(classes.tableContentrow,{
                [classes.tableContentRowSelected]:currentRowFlag
              })}
              onClick={()=>{this.handleRowClick(item[fieldName]);}}
          >
            {/* Details */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              {viewMode?(
                <Tooltip title={item.details?item.details:''} classes={{tooltip:classes.tooltip}}>
                  <label className={classes.displayLabel}>{item.details?item.details:''}</label>
                </Tooltip>
              ):(
                <TextInputBox {...detailsFieldProps} />
              )}
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
    const { classes, dataList, tableHeight, viewMode, type=medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS } = this.props;
    let contentElements = this.generateTableContent();
    let colName = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS?'Problem / Accident Details':'Problem Details';
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
              <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>{colName}</TableCell>
              <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Updated</TableCell>
              <TableCell padding="none" style={{width: '14%'}} className={classes.tableHeadCell} rowSpan={2}>Service</TableCell>
            </TableRow>
            <TableRow className={classes.tableHeadRow}>
              <TableCell padding="none" style={{width: '11%', top: 32,minWidth:110}} className={classes.tableHeadCell}>
                <Divider className={classes.tableDivider} />
                <span style={{position:'absolute'}}>On</span>
              </TableCell>
              <TableCell padding="none" style={{width: '10%', top: 32,minWidth:100}} className={classes.tableHeadCell}>
                <Divider className={classes.tableDivider} />
                <span style={{position:'absolute'}}>By</span>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataList.filter(x => x.operationType !== constants.COMMON_ACTION_TYPE.DELETE).length>0?(contentElements):(
              <TableRow style={{ height: 'auto' }}>
                <TableCell colSpan={4} className={classes.tableCellRow}>
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

export default withStyles(styles)(ProblemDetailsTable);
