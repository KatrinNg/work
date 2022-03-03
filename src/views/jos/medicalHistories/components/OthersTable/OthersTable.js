import React, { Component } from 'react';
import { withStyles, Table, TableHead, TableRow, TableCell, TableBody, Typography, Divider, Tooltip } from '@material-ui/core';
import { styles } from './OthersTableStyle';
import classNames from 'classnames';
import moment from 'moment';
import TextareaBox from '../TextareaBox/TextareaBox';
import _ from 'lodash';
import * as constants from '../../../../../constants/common/commonConstants';
import * as medicalConstants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import * as utils from '../../util/utils';
import CheckBox from '../CheckBox/CheckBox';

class OthersTable extends Component {
  constructor(props){
    super(props);
    this.tableRef = React.createRef();
    this.tableBodyRef = React.createRef();
    this.contentRef = React.createRef();
    let idFieldName = utils.identifyOthersObjId(props.type,props.viewMode);
    this.state= {
      idFieldName,
      selectedRowId:null
    };
  }

  componentDidMount() {
    const { type,viewMode } = this.props;
    let idFieldName = utils.identifyOthersObjId(type,viewMode);
    this.setState({idFieldName});
  }

  handleRowClick = (commonOthersId,rowAddFlag=false) => {
    const { setSelectedRowId, moveToEnd = true } = this.props;
    setSelectedRowId&&setSelectedRowId(commonOthersId);
    this.setState({
      selectedRowId:commonOthersId
    },()=>{
      if (rowAddFlag) {
        if (moveToEnd && this.tableRef.current) {
          this.tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else if (!moveToEnd && this.tableBodyRef.current && this.contentRef.current) {
          const newRowIndex = this.tableBodyRef.current.children.length;
          const offsetTop = this.tableBodyRef.current.children[newRowIndex - 1].offsetTop;
          this.contentRef.current.scroll({ top: offsetTop, behavior: 'smooth' });
        }
      }
    });
  }

  handleRowAdd = () => {
    let { updateState, dataList, valMap, type } = this.props;
    let { idFieldName } = this.state;
    let tempObj = utils.generateHistoryValObj(type);
    valMap.get(type).set(tempObj[idFieldName],tempObj);
    updateState&&updateState({
      othersList: _.concat(dataList,tempObj),
      valMap
    });
    this.handleRowClick(tempObj[idFieldName],true);
  }

  handleRowDelete = () => {
    let { updateState, dataList, valMap, type } = this.props;
    let { selectedRowId, idFieldName } = this.state;
    if (dataList.length>0) {
      let tempArray = _.remove(dataList, item => {
        return item[idFieldName] === selectedRowId;
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
          othersList: dataList,
          valMap
        });
      }
    }
  }

  generateOthersField = (othersVal) => {
    const {classes} = this.props;
    return <pre className={classes.pre}>{othersVal}</pre>;
  }

  generateTableContent = () => {
    const { classes, dataList, updateState, serviceList, valMap, type, viewMode=false, prefix, changeEditFlag,encounterExistFlag, antFeatureFlag=false } = this.props;
    let { selectedRowId, idFieldName } = this.state;
    let elements = [];
    let onFieldName = 'updateDtm';
    let byFieldName = 'updateBy';
    let maxLength = undefined;
    switch (prefix) {
      case 'occupation':
      case 'social':
        maxLength = 100;
        break;
      case 'family':
        maxLength = 500;
        break;
    }
    elements = dataList.map(item => {
      if (item.deleteInd!==medicalConstants.DELETED_STATUS.YES&&item.operationType!==constants.COMMON_ACTION_TYPE.DELETE) {
        let currentRowFlag = selectedRowId === item[idFieldName]?true:false;
        let commonProps = {
          itemId:item[idFieldName],
          item,
          currentRowFlag,
          updateState,
          valMap,
          type,
          changeEditFlag,
          encounterExistFlag
        };
        let remarkFieldProps = {
          mandatoryFlag: true,
          val:item.others,
          attrName: 'others',
          maxLength,
          ...commonProps
        };
        let obsRiskFactorProps = {
          val: item.obsRiskFactor,
          attrName: 'obsRiskFactor',
          options: medicalConstants.OBS_RICK_FACTOR_OPTION,
          ...commonProps
        };

        let targetServiceObj = _.find(serviceList,tempObj=>{
          return tempObj.serviceCd === item.serviceCd;
        });
        return (
          <TableRow
              key={`${prefix}_others_table_row_${item[idFieldName]}`}
              className={classNames(classes.tableContentrow,{
                [classes.tableContentRowSelected]:currentRowFlag
              })}
              onClick={()=>{this.handleRowClick(item[idFieldName]);}}
          >
            {/* Remarks(others) */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              {viewMode?(
                <Tooltip title={this.generateOthersField(item.others)} classes={{tooltip:classes.tooltip}}>
                  <pre className={classes.preLabel}>{item.others?item.others:''}</pre>
                </Tooltip>
              ):(
                <TextareaBox {...remarkFieldProps} />
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
              <Tooltip title={item[onFieldName]?moment(item[onFieldName]).format('DD-MMM-YYYY'):''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{item[onFieldName]?moment(item[onFieldName]).format('DD-MMM-YYYY'):''}</label>
              </Tooltip>
            </TableCell>
            {/* By */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={item[byFieldName]?item[byFieldName]:''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{item[byFieldName]?item[byFieldName]:''}</label>
              </Tooltip>
            </TableCell>
            {/* Service */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={targetServiceObj?targetServiceObj.serviceName:''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{targetServiceObj?targetServiceObj.serviceName:''}</label>
              </Tooltip>
            </TableCell>
            {/* OBS Risk Factor */}
            {viewMode?null:
              (antFeatureFlag?
              <TableCell className={classes.tableContentCell} padding={'none'}>
                <CheckBox {...obsRiskFactorProps} />
              </TableCell>:null)
            }
          </TableRow>
        );
      }
    });
    return elements;
  }

  render() {
    const { classes, dataList, tableHeight, viewMode, prefix, antFeatureFlag=false } = this.props;
    let contentElements = this.generateTableContent();
    return (
      <div
          className={classNames(classes.tableContainer,{
            [classes.tableViewContainer]: viewMode
          })}
          style={{maxHeight:tableHeight}}
          ref={this.contentRef}
      >
        <Table id={`${prefix}_others_table`} ref={this.tableRef}>
          <TableHead>
            <TableRow className={classes.tableHeadRow}>
              <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>{prefix==='family'?'Others':'Remarks'}</TableCell>
              {viewMode?(
                <TableCell padding="none" style={{width: '10%'}} className={classes.tableHeadCell} rowSpan={2}>Action</TableCell>
              ):null}
              <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Updated</TableCell>
              <TableCell padding="none" style={{width: '15%'}} className={classes.tableHeadCell} rowSpan={2}>Service</TableCell>
              {viewMode?null:
                (antFeatureFlag?
                <TableCell padding="none" style={{width: '4%'}} className={classes.tableHeadCell} rowSpan={2}>OBS Risk Factor</TableCell>
                :null)
              }
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
          <TableBody ref={this.tableBodyRef}>
            {dataList.length>0?(contentElements):(
              <TableRow style={{ height: 'auto' }}>
                <TableCell colSpan={antFeatureFlag?5:4} className={classes.tableCellRow}>
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

export default withStyles(styles)(OthersTable);
