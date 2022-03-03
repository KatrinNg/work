import React, { Component } from 'react';
import { withStyles, Table, TableHead, TableRow, TableCell, TableBody, Typography, Divider, Tooltip } from '@material-ui/core';
import { styles } from './ProblemLogTableStyle';
import classNames from 'classnames';
import moment from 'moment';
import _ from 'lodash';
import * as medicalConstants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import {getState} from '../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};
class ProblemLogTable extends Component {
  constructor(props){
    super(props);
    this.tableRef = React.createRef();
    this.state={
      selectedRowId:null
    };
  }

  handleRowClick = (pastMedDetailsId) => {
    const { setSelectedRowId } = this.props;
    setSelectedRowId&&setSelectedRowId(pastMedDetailsId);
    this.setState({
      selectedRowId:pastMedDetailsId
    });
  }

  generateTableContent = () => {
    const { classes, dataList, serviceList, type, viewMode=false } = this.props;
    let { selectedRowId } = this.state;
    let elements = [];
    let fieldName = '', diagnosisDateField = '', idName = '';
    if (type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS) {
      idName = 'past_history';
      fieldName = 'logPastMedHistoryId';
      diagnosisDateField = 'happenedDateText';
    } else {
      idName = 'family_history';
      fieldName = 'logFamilyHistoryId';
      diagnosisDateField = 'diagDateTxt';
    }
    elements = dataList.map((item,index) => {
      let tempId = `${item[fieldName]}_${index}`;
      let currentRowFlag = selectedRowId === tempId?true:false;
      let targetServiceObj = _.find(serviceList,tempObj=>{
        return tempObj.serviceCd === item.serviceCd;
      });

      return (
        <TableRow
            id={`${idName}_table_row_${tempId}`}
            key={`${idName}_table_row_${tempId}`}
            className={classNames(classes.tableContentrow,{
              [classes.tableContentRowSelected]:currentRowFlag
            })}
            onClick={()=>{this.handleRowClick(tempId);}}
        >
          {/* Problem/Accident */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={item.problemDesc?item.problemDesc:''} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{item.problemDesc?item.problemDesc:''}</label>
            </Tooltip>
          </TableCell>
          {/* Diagnosis Date */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={item[diagnosisDateField]?item[diagnosisDateField]:''} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{item[diagnosisDateField]?item[diagnosisDateField]:''}</label>
            </Tooltip>
          </TableCell>
          {/* Details */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={item.details?item.details:''} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{item.details?item.details:''}</label>
            </Tooltip>
          </TableCell>
          {/* Action */}
          {viewMode?(
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={item.logType?medicalConstants.LOG_TYPE_MAP.get(item.logType):''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{item.logType?medicalConstants.LOG_TYPE_MAP.get(item.logType):''}</label>
              </Tooltip>
            </TableCell>
          ):null}
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
    });
    return elements;
  }

  render() {
    const { classes, dataList, tableHeight, viewMode, type=medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS } = this.props;
    let colName = type === medicalConstants.MEDICAL_HISTORIES_TYPE.PAST_MEDICAL_HISTORY_DETAILS?'Problem / Accident':'Problem';
    let contentElements = this.generateTableContent();
    return (
      <div
          className={classNames(classes.tableContainer,{
            [classes.tableViewContainer]: viewMode
          })}
          style={{maxHeight:tableHeight}}
      >
        <Table id="past_medical_history_details_log_table" ref={this.tableRef}>
          <TableHead>
            <TableRow className={classes.tableHeadRow}>
              <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>{colName}</TableCell>
              <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>Diagnosis Date</TableCell>
              <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>Detail</TableCell>
              {viewMode?(
                <TableCell padding="none" style={{width: '10%'}} className={classes.tableHeadCell} rowSpan={2}>Action</TableCell>
              ):null}
              <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Updated</TableCell>
              <TableCell padding="none" style={{width: '15%'}} className={classes.tableHeadCell} rowSpan={2}>Service</TableCell>
            </TableRow>
            <TableRow className={classes.tableHeadRow}>
              <TableCell padding="none" style={{width: '10%', top: 32}} className={classes.tableHeadCell}>
                <Divider className={classes.tableDivider} />
                <span style={{position:'absolute'}}>On</span>
              </TableCell>
              <TableCell padding="none" style={{width: '10%', top: 32}} className={classes.tableHeadCell}>
                <Divider className={classes.tableDivider} />
                <span style={{position:'absolute'}}>By</span>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataList.length>0?(contentElements):(
              <TableRow style={{ height: 'auto' }}>
                <TableCell colSpan={7} style={{ textAlign: 'center'}}>
                  <Typography style={{padding: 10, backgroundColor: color.cimsBackgroundColor}}>There is no data.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default withStyles(styles)(ProblemLogTable);
