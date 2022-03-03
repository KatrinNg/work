import React, { Component } from 'react';
import { withStyles, Table, TableHead, TableRow, TableCell, TableBody, Typography, Divider, Tooltip } from '@material-ui/core';
import { styles } from './OccupationalTableStyle';
import classNames from 'classnames';
import moment from 'moment';
import TextInputBox from '../TextInputBox/TextInputBox';
import DateInputBox from '../DateInputBox/DateInputBox';
import _ from 'lodash';
import * as constants from '../../../../../constants/common/commonConstants';
import * as medicalConstants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import * as utils from '../../util/utils';

class OccupationalTable extends Component {
  constructor(props){
    super(props);
    this.tableRef = React.createRef();
    this.state={
      selectedRowId:null
    };
  }

  handleRowClick = (occupationalHistoryId,rowAddFlag=false) => {
    const { setSelectedRowId } = this.props;
    setSelectedRowId&&setSelectedRowId(occupationalHistoryId);
    this.setState({
      selectedRowId:occupationalHistoryId
    },()=>{
      if (rowAddFlag&&this.tableRef.current) {
        this.tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  }

  handleRowAdd = () => {
    let { updateState, type, dataList, valMap } = this.props;
    let tempObj = utils.generateHistoryValObj(type);
    valMap.get(type).set(tempObj.occupationalHistoryId,tempObj);
    updateState&&updateState({
      occupationHistoryList: _.concat(dataList,tempObj),
      valMap
    });
    this.handleRowClick(tempObj.occupationalHistoryId,true);
  }

  handleRowDelete = () => {
    let { updateState, dataList, valMap, type } = this.props;
    let { selectedRowId } = this.state;
    if (dataList.length>0) {
      let tempArray = _.remove(dataList, item => {
        return item.occupationalHistoryId === selectedRowId;
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
          occupationHistoryList: dataList,
          valMap
        });
      }
    }
  }

  generateTableContent = () => {
    const { classes, dataList, updateState, serviceList, valMap, type, changeEditFlag, viewMode=false,encounterExistFlag } = this.props;
    let { selectedRowId } = this.state;
    let elements = [];
    let fieldName = viewMode?'logOccupationalHistoryId':'occupationalHistoryId';
    elements = dataList.map(item => {
      if (item.deleteInd !== medicalConstants.DELETED_STATUS.YES && item.operationType !== constants.COMMON_ACTION_TYPE.DELETE) {
        let currentRowFlag = selectedRowId === item[fieldName]?true:false;
        let commonProps = {
          itemId:item[fieldName],
          item,
          currentRowFlag,
          updateState,
          valMap,
          type,
          changeEditFlag,
          encounterExistFlag
        };
        let occupationFieldProps = {
          val:item.occupation,
          attrName: 'occupation',
          mandatoryFlag: true,
          maxLength: 100,
          ...commonProps
        };
        let yearFromFieldProps = {
          val:item.yearFrom,
          attrName: 'yearFrom',
          eventSignName: 'occupational_histroy',
          ...commonProps
        };
        let yearToFieldProps = {
          val:item.yearTo,
          attrName: 'yearTo',
          eventSignName: 'occupational_histroy',
          ...commonProps
        };
        let remarkFieldProps = {
          val:item.remark,
          attrName: 'remark',
          maxLength: 500,
          ...commonProps
        };

        let targetServiceObj = _.find(serviceList,tempObj=>{
          return tempObj.serviceCd === item.serviceCd;
        });

        return (
          <TableRow
              key={`occupational_history_table_row_${item[fieldName]}`}
              className={classNames(classes.tableContentrow,{
                [classes.tableContentRowSelected]:currentRowFlag
              })}
              onClick={()=>{this.handleRowClick(item[fieldName]);}}
          >
            {/* Occupation */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              {viewMode?(
                <Tooltip title={item.occupation?item.occupation:''} classes={{tooltip:classes.tooltip}}>
                  <label className={classes.displayLabel}>{item.occupation?item.occupation:''}</label>
                </Tooltip>
              ):(
                <TextInputBox {...occupationFieldProps} />
              )}
            </TableCell>
            {/* From */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              {viewMode?(
                <Tooltip title={item.yearFrom?item.yearFrom:''} classes={{tooltip:classes.tooltip}}>
                  <label className={classes.displayLabel}>{item.yearFrom?item.yearFrom:''}</label>
                </Tooltip>
              ):(
                <DateInputBox {...yearFromFieldProps} />
              )}
            </TableCell>
            {/* To */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              {viewMode?(
                <Tooltip title={item.yearTo?item.yearTo:''} classes={{tooltip:classes.tooltip}}>
                  <label className={classes.displayLabel}>{item.yearTo?item.yearTo:''}</label>
                </Tooltip>
              ):(
                <DateInputBox {...yearToFieldProps} />
              )}
            </TableCell>
            {/* Remarks */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              {viewMode?(
                <Tooltip title={item.remark?item.remark:''} classes={{tooltip:classes.tooltip}}>
                  <label className={classes.displayLabel}>{item.remark?item.remark:''}</label>
                </Tooltip>
              ):(
                <TextInputBox {...remarkFieldProps} />
              )}
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
      }
    });
    return elements;
  }

  render() {
    const { classes, dataList, tableHeight, viewMode } = this.props;
    let contentElements = this.generateTableContent();
    return (
      <div
          className={classNames(classes.tableContainer,{
            [classes.tableViewContainer]: viewMode
          })}
          style={{maxHeight:tableHeight}}
      >
        <Table id="occpational_history_table" ref={this.tableRef}>
          <TableHead>
            <TableRow className={classes.tableHeadRow}>
              <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>Occupation</TableCell>
              <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Year</TableCell>
              <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>Remarks</TableCell>
              {viewMode?(
                <TableCell padding="none" style={{width: '10%'}} className={classes.tableHeadCell} rowSpan={2}>Action</TableCell>
              ):null}
              <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Updated</TableCell>
              <TableCell padding="none" style={{width: '15%'}} className={classes.tableHeadCell} rowSpan={2}>Service</TableCell>
            </TableRow>
            <TableRow className={classes.tableHeadRow}>
              <TableCell padding="none" style={{width: '6%', minWidth: 95, top: 32}} className={classes.tableHeadCell}>
                <Divider className={classes.tableDivider} />
                <span style={{position:'absolute'}}>From</span>
              </TableCell>
              <TableCell padding="none" style={{width: '6%', minWidth: 95, top: 32}} className={classes.tableHeadCell}>
                <Divider className={classes.tableDivider} />
                <span style={{position:'absolute'}}>To</span>
              </TableCell>
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
                <TableCell colSpan={7} className={classes.tableCellRow}>
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

export default withStyles(styles)(OccupationalTable);
