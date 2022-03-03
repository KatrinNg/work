import React, { Component } from 'react';
import { withStyles, Table, TableHead, TableRow, TableCell, TableBody, Typography, Tooltip } from '@material-ui/core';
import { styles } from './RelationshipTableStyle';
import classNames from 'classnames';
import _ from 'lodash';
import * as constants from '../../../../../constants/common/commonConstants';
import * as medicalConstants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import * as utils from '../../util/utils';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import FamilyProblemDialog from '../../modules/FamilyHistory/modules/FamilyProblemDialog/FamilyProblemDialog';

class RelationshipTable extends Component {
  constructor(props){
    super(props);
    this.tableRef = React.createRef();
    this.state={
      isOpen: false,
      selectedRowId:null,
      selectedObj:null
    };
  }

  handleRowClick = (familyHistoryRltId,rowAddFlag=false) => {
    const { setSelectedRowId } = this.props;
    setSelectedRowId&&setSelectedRowId(familyHistoryRltId);
    this.setState({
      selectedRowId:familyHistoryRltId
    },()=>{
      if (rowAddFlag&&this.tableRef.current) {
        this.tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  }

  handleRowAdd = () => {
    let { updateState, type, dataList, valMap, relationshipList, selectedRelationshipVal } = this.props;
    let tempRltObj = _.find(relationshipList, item=> item.rltCd === selectedRelationshipVal);
    let tempObj = utils.generateHistoryValObj(type);
    tempObj.familyRltIndt = tempRltObj?tempRltObj.codeMsFamilyRltId:null;
    tempObj.rltSeq = tempRltObj?tempRltObj.codeMsFamilyRltId:null;
    tempObj.rltText = tempRltObj?tempRltObj.rltDesc:'';
    valMap.get(type).set(tempObj.familyHistoryRltId,tempObj);
    updateState&&updateState({
      relationshipHistoryList: _.concat(dataList,tempObj),
      valMap
    });
    this.handleRowClick(tempObj.familyHistoryRltId,true);
  }

  handleRowDelete = () => {
    let { updateState, dataList, valMap, type } = this.props;
    let { selectedRowId } = this.state;
    if (dataList.length>0) {
      let tempArray = _.remove(dataList, item => {
        return item.familyHistoryRltId === selectedRowId;
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
          relationshipHistoryList: dataList,
          valMap
        });
      }
    }
  }

  handleProblemClick = (selectedRowId) => {
    let { dataList,insertMedicalHistoriesLog } = this.props;
    let selectedObj = _.find(dataList, item => item.familyHistoryRltId === selectedRowId);
    let name = selectedRowId > 1 ? `(Family History Rlt ID: ${selectedRowId}; Relationship: ${selectedObj.rltText})`:`(New record is selected; Family History Rlt ID: null; Relationship: ${selectedObj.rltText})`;
    insertMedicalHistoriesLog(`[Family History] Action: Click 'Problem' in relationship problem list ${name}`, '');
    this.setState({
      selectedObj,
      isOpen: true
    });
  }

  handleProblemDialogAdd = (selectedObj) => {
    let { valMap,dataList,updateState, changeEditFlag } = this.props;
    let index = _.findIndex(dataList, item => item.familyHistoryRltId === selectedObj.familyHistoryRltId);
    if (index!==-1) {
      valMap.get(medicalConstants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP).set(selectedObj.familyHistoryRltId,selectedObj);
      dataList[index]=selectedObj;
      updateState&&updateState({
        valMap,
        relationshipHistoryList:dataList
      });
    }
    changeEditFlag&&changeEditFlag();
    this.handleProblemDialogCancel();
  }

  handleProblemDialogCancel = () => {
    this.setState({
      isOpen: false
    });
  }

  generateTableContent = () => {
    const { classes, dataList, encounterExistFlag } = this.props;
    let { selectedRowId } = this.state;
    let elements = [];
    let fieldName = 'familyHistoryRltId';
    elements = dataList.map(item => {
      if (item.operationType !== constants.COMMON_ACTION_TYPE.DELETE) {
        let currentRowFlag = selectedRowId === item[fieldName]?true:false;

        return (
          <TableRow
              key={`family_history_relationship_table_row_${item[fieldName]}`}
              className={classNames(classes.tableContentrow,{
                [classes.tableContentRowSelected]:currentRowFlag
              })}
              onClick={()=>{this.handleRowClick(item[fieldName]);}}
          >
            {/* Relationship */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={item.rltText?item.rltText:''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{item.rltText?item.rltText:''}</label>
              </Tooltip>
            </TableCell>
            {/* button */}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <CIMSButton
                  id={`family_history_relationship_table_btn_problem_${item.fieldName}`}
                  disabled={!encounterExistFlag}
                  style={{maxHeight:35,minHeight:35}}
                  onClick={()=>{this.handleProblemClick(item[fieldName]);}}
              >
                Problem
              </CIMSButton>
            </TableCell>
            {/* Problem Desc*/}
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <Tooltip title={item.problemDesc?item.problemDesc:''} classes={{tooltip:classes.tooltip}}>
                <label className={classes.displayLabel}>{item.problemDesc?item.problemDesc:''}</label>
              </Tooltip>
            </TableCell>
          </TableRow>
        );
      }
    });
    return elements;
  }

  render() {
    const { classes, dataList, tableHeight, viewMode, serviceList, familyTerminologyServiceList, queryProblemList, sysConfig, currentServiceInfo, encounterInfo, getFamilyHistoryProblemDetailLogList, closeCommonCircularDialog, openCommonCircularDialog,insertMedicalHistoriesLog, antFeatureFlag } = this.props;
    let { isOpen,selectedObj } = this.state;
    let contentElements = this.generateTableContent();
    let problemDialogProps = {
      antFeatureFlag,
      isOpen,
      sysConfig,
      serviceList,
      selectedObj,
      queryProblemList,
      currentServiceInfo,
      encounterInfo,
      familyTerminologyServiceList,
      openCommonCircularDialog,
      closeCommonCircularDialog,
      getFamilyHistoryProblemDetailLogList,
      insertMedicalHistoriesLog,
      type:medicalConstants.MEDICAL_HISTORIES_TYPE.FAMILY_HISTORY_RELATIONSHIP_PROBLEM,
      handleProblemDialogAdd:this.handleProblemDialogAdd,
      handleProblemDialogCancel:this.handleProblemDialogCancel
    };

    return (
      <div
          className={classNames(classes.tableContainer,{
            [classes.tableViewContainer]: viewMode
          })}
          style={{maxHeight:tableHeight}}
      >
        <Table id="family_history_relationship_table" ref={this.tableRef}>
          <TableHead>
            <TableRow className={classes.tableHeadRow}>
              <TableCell padding="none" className={classes.tableHeadCell}>Relationship</TableCell>
              <TableCell padding="none" className={classes.tableHeadCell} style={{width:'5%',minWidth:96}}></TableCell>
              <TableCell padding="none" className={classes.tableHeadCell} style={{width:'80%'}}>Problem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataList.length > 0 ? (contentElements) : (
              <TableRow style={{ height: 'auto' }}>
                <TableCell colSpan={3} className={classes.tableCellRow}>
                  <Typography style={{padding: 10}}>There is no data.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <FamilyProblemDialog {...problemDialogProps} />
      </div>
    );
  }
}

export default withStyles(styles)(RelationshipTable);
