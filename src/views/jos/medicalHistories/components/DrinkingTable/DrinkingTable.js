import React, { Component } from 'react';
import { withStyles, Table, TableHead, TableRow, TableCell, TableBody, Typography, Divider, Tooltip } from '@material-ui/core';
import { styles } from './DrinkingTableStyle';
import classNames from 'classnames';
import moment from 'moment';
import DateInputBox from '../DateInputBox/DateInputBox';
import _ from 'lodash';
import * as constants from '../../../../../constants/common/commonConstants';
import * as medicalConstants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import SelectBox from '../SelectBox/SelectBox';
import AgeInputBox from '../AgeInputBox/AgeInputBox';
import PerWeekAmountBox from '../PerWeekAmountBox/PerWeekAmountBox';
import PerWeekUnitBox from '../PerWeekUnitBox/PerWeekUnitBox';
import * as utils from '../../util/utils';
import CheckBox from '../CheckBox/CheckBox';

class DrinkingTable extends Component {
  constructor(props){
    super(props);
    this.statusColumnRef = React.createRef();
    this.typeColumnRef = React.createRef();
    this.tableRef = React.createRef();
    this.tableBodyRef = React.createRef();
    this.contentRef = React.createRef();
    this.state={
      statusWidth: undefined,
      typeWidth: 235,
      selectedRowId: null
    };
  }

  componentDidMount(){
    this.resetHeight();
    window.addEventListener('resize',this.resetHeight);
  }

  componentDidUpdate(){
    this.resetHeight();
  }

  componentWillUnmount(){
    window.removeEventListener('resize',this.resetHeight);
  }

  resetHeight=_.debounce(()=>{
    if(this.statusColumnRef.current&&this.statusColumnRef.current.clientWidth!==this.state.statusWidth){
      this.setState({statusWidth:this.statusColumnRef.current.clientWidth});
    }
    if (this.typeColumnRef.current&&this.typeColumnRef.current.clientWidth!==this.state.typeWidth) {
      this.setState({typeWidth:235});
      // this.setState({typeWidth:this.typeColumnRef.current.clientWidth});
    }
  },500);

  handleRowClick = (socialHistoryDetailsId,rowAddFlag=false) => {
    const { setSelectedRowId, moveToEnd = true } = this.props;
    setSelectedRowId&&setSelectedRowId(socialHistoryDetailsId);
    this.setState({
      selectedRowId:socialHistoryDetailsId
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
    let { updateState, type, dataList, valMap } = this.props;
    let tempObj = utils.generateHistoryValObj(type);
    valMap.get(type).set(tempObj.socialHistoryDetailsId,tempObj);
    updateState&&updateState({
      drinkingHistoryList: _.concat(dataList,tempObj),
      valMap
    });
    this.handleRowClick(tempObj.socialHistoryDetailsId,true);
  }

  handleRowDelete = () => {
    let { updateState, dataList, valMap, type } = this.props;
    let { selectedRowId } = this.state;
    if (dataList.length>0) {
      let tempArray = _.remove(dataList, item => {
        return item.socialHistoryDetailsId === selectedRowId;
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
          drinkingHistoryList: dataList,
          valMap
        });
      }
    }
  }

  generateTableContent = () => {
    const { classes, dataList, updateState, socialHistoryType, serviceList, valMap, type, dropdownOption, changeEditFlag, encounterExistFlag, antFeatureFlag=false } = this.props;
    let { selectedRowId, statusWidth, typeWidth } = this.state;
    let elements = [];
    elements = dataList.map(item => {
      let currentRowFlag = selectedRowId === item.socialHistoryDetailsId?true:false;
      let commonProps = {
        itemId:item.socialHistoryDetailsId,
        item,
        currentRowFlag,
        updateState,
        valMap,
        type,
        changeEditFlag,
        encounterExistFlag
      };

      let statusFieldProps = {
        val: item.status,
        maxWidth: statusWidth,
        attrName: 'status',
        options: dropdownOption?dropdownOption.statusOptions:[],
        ...commonProps
      };
      let typeFieldProps = {
        val: item.socialHistorySubtypeId,
        maxWidth: typeWidth,
        attrName: 'socialHistorySubtypeId',
        options: dropdownOption?dropdownOption.typeOptionMap.get(socialHistoryType.drinkingId):[],
        ...commonProps
      };
      let amountFieldProps = {
        amtTxt: item.amtTxt,
        codeContainerId:item.codeContainerId,
        volAmt: item.volAmt,
        options: dropdownOption?dropdownOption.containerOptions:[],
        ...commonProps
      };
      let unitFieldProps = {
        stdUnit: item.stdUnit,
        typeOptions: dropdownOption?dropdownOption.typeOptionMap.get(socialHistoryType.drinkingId):[],
        ...commonProps
      };
      let ageFromFieldProps = {
        val:item.ageFrom,
        attrName: 'ageFrom',
        eventSignName: 'social_histroy',
        ...commonProps
      };
      let ageToFieldProps = {
        val:item.ageTo,
        attrName: 'ageTo',
        eventSignName: 'social_histroy',
        ...commonProps
      };
      let yearFromFieldProps = {
        val:item.yearFrom,
        attrName: 'yearFrom',
        eventSignName: 'social_histroy',
        ...commonProps
      };
      let yearToFieldProps = {
        val:item.yearTo,
        attrName: 'yearTo',
        eventSignName: 'social_histroy',
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
            key={`social_history_drinking_table_row_${item.socialHistoryDetailsId}`}
            className={classNames(classes.tableContentrow,{
              [classes.tableContentRowSelected]:currentRowFlag
            })}
            onClick={()=>{this.handleRowClick(item.socialHistoryDetailsId);}}
        >
          {/* Status */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <SelectBox {...statusFieldProps} />
          </TableCell>
          {/* Type */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <SelectBox {...typeFieldProps} />
          </TableCell>
          {/* Per Week Amount */}
          <TableCell className={classes.tableContentCell} padding={'none'} style={{paddingRight:5,paddingLeft:5}}>
            <PerWeekAmountBox {...amountFieldProps} />
          </TableCell>
          {/* Per Week Unit */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <PerWeekUnitBox {...unitFieldProps} />
          </TableCell>
          {/* Age From */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <AgeInputBox {...ageFromFieldProps} />
          </TableCell>
          {/* Age To */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <AgeInputBox {...ageToFieldProps} />
          </TableCell>
          {/* Year From */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <DateInputBox {...yearFromFieldProps} />
          </TableCell>
          {/* Year To */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <DateInputBox {...yearToFieldProps} />
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
          {/* OBS Risk Factor */}
          {antFeatureFlag?(
            <TableCell className={classes.tableContentCell} padding={'none'}>
              <CheckBox {...obsRiskFactorProps} />
            </TableCell>
          ):null}
        </TableRow>
      );
    });
    return elements;
  }

  initLogAmount = (item) => {
    const { dropdownOption } = this.props;
    let {amtTxt,codeContainerId,volAmt} = item;
    let label = '', tempContanierObj = null;
    if (codeContainerId) {
      tempContanierObj = _.find(dropdownOption.containerOptions,dropItem=>dropItem.value === codeContainerId);
    }
    if (amtTxt||codeContainerId||volAmt) {
      label = `${amtTxt?amtTxt:''} ${tempContanierObj?tempContanierObj.label:''} ${volAmt?volAmt:''} (ml)`;
    }
    return label;
  }

  generateLogTableContent = () => {
    const { classes, dataList, serviceList} = this.props;
    let { selectedRowId } = this.state;
    let elements = [];
    elements = dataList.map(item => {
      let currentRowFlag = selectedRowId === item.logSocialHistoryDetailsId?true:false;
      let targetServiceObj = _.find(serviceList,tempObj=>{
        return tempObj.serviceCd === item.serviceCd;
      });

      let displayAmount = this.initLogAmount(item);

      return (
        <TableRow
            key={`social_history_drinking_table_row_${item.logSocialHistoryDetailsId}`}
            className={classNames(classes.tableContentrow,{
              [classes.tableContentRowSelected]:currentRowFlag
            })}
            onClick={()=>{this.handleRowClick(item.logSocialHistoryDetailsId);}}
        >
          {/* Type */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={item.type?item.type:''} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{item.type?item.type:''}</label>
            </Tooltip>
          </TableCell>
          {/* Status */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={item.statusDesc?item.statusDesc:''} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{item.statusDesc?item.statusDesc:''}</label>
            </Tooltip>
          </TableCell>
          {/* Age From */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={item.ageFrom!==null?item.ageFrom:''} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{item.ageFrom!==null?item.ageFrom:''}</label>
            </Tooltip>
          </TableCell>
          {/* Age To */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={item.ageTo!==null?item.ageTo:''} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{item.ageTo!==null?item.ageTo:''}</label>
            </Tooltip>
          </TableCell>
          {/* Year From */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={item.yrFrom?item.yrFrom:''} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{item.yrFrom?item.yrFrom:''}</label>
            </Tooltip>
          </TableCell>
          {/* Year To */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={item.yrTo?item.yrTo:''} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{item.yrTo?item.yrTo:''}</label>
            </Tooltip>
          </TableCell>
          {/* Amount*/}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={displayAmount} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{displayAmount}</label>
            </Tooltip>
          </TableCell>
          {/* Unit */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={item.stdUnit?item.stdUnit:''} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{item.stdUnit?item.stdUnit:''}</label>
            </Tooltip>
          </TableCell>
          {/* Action */}
          <TableCell className={classes.tableContentCell} padding={'none'}>
            <Tooltip title={item.logType?medicalConstants.LOG_TYPE_MAP.get(item.logType):''} classes={{tooltip:classes.tooltip}}>
              <label className={classes.displayLabel}>{item.logType?medicalConstants.LOG_TYPE_MAP.get(item.logType):''}</label>
            </Tooltip>
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
    });
    return elements;
  }

  render() {
    const { classes, dataList, tableHeight, viewMode, antFeatureFlag=false } = this.props;
    let contentElements = viewMode?this.generateLogTableContent():this.generateTableContent();
    return (
      <div
          className={classNames(classes.tableContainer,{
            [classes.tableViewContainer]: viewMode
          })}
          style={{maxHeight:tableHeight}}
          ref={this.contentRef}
      >
        <ValidatorForm onSubmit={()=>{}}>
          <Table id="social_history_drinking_table" ref={this.tableRef} >
            <TableHead>
              {viewMode?(
                <TableRow className={classes.tableHeadRow}>
                  <TableCell ref={this.typeColumnRef} padding="none" style={{width: '20%'}} className={classes.tableHeadCell} rowSpan={2}>Type</TableCell>
                  <TableCell ref={this.statusColumnRef} padding="none" style={{width: '7%'}} className={classes.tableHeadCell} rowSpan={2}>Status</TableCell>
                  <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Age</TableCell>
                  <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Year</TableCell>
                  <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Per Week</TableCell>
                  {viewMode?(
                    <TableCell padding="none" style={{width: '10%'}} className={classes.tableHeadCell} rowSpan={2}>Action</TableCell>
                  ):null}
                  <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Updated</TableCell>
                  <TableCell padding="none" style={{width: '12%'}} className={classes.tableHeadCell} rowSpan={2}>Service</TableCell>
                </TableRow>
              ):(
                <TableRow className={classes.tableHeadRow}>
                  <TableCell ref={this.statusColumnRef} padding="none" style={{width: '11%'}} className={classes.tableHeadCell} rowSpan={2}>Status</TableCell>
                  <TableCell ref={this.typeColumnRef} padding="none" style={{width: '10%', minWidth: 240}} className={classes.tableHeadCell} rowSpan={2}>Type</TableCell>
                  <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Per Week</TableCell>
                  <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Age</TableCell>
                  <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Year</TableCell>
                  <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Updated</TableCell>
                  <TableCell padding="none" style={{width: '6%'}} className={classes.tableHeadCell} rowSpan={2}>Service</TableCell>
                  {antFeatureFlag?(
                    <TableCell padding="none" style={{width: '4%'}} className={classes.tableHeadCell} rowSpan={2}>OBS Risk Factor</TableCell>
                  ):null}
                </TableRow>
              )}
              {viewMode?(
                <TableRow className={classes.tableHeadRow}>
                  <TableCell padding="none" style={{width: '5%', minWidth: 60, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>From</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '5%', minWidth: 60, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>To</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '5%', minWidth: 60, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>From</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '5%', minWidth: 60, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>To</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '12%', minWidth: 132, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>Amount</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '5%', minWidth: 55, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>Unit</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '9%', top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>On</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '8%', top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>By</span>
                  </TableCell>
                </TableRow>
              ):(
                <TableRow className={classes.tableHeadRow}>
                  <TableCell padding="none" style={{width: '20%', minWidth: 125, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>Amount</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '8%', minWidth: 95, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>Unit</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '5%', minWidth: 83, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>From</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '5%', minWidth: 83, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>To</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '7%', minWidth: 95, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>From</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '7%', minWidth: 95, top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>To</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '5%', top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>On</span>
                  </TableCell>
                  <TableCell padding="none" style={{width: '5%', top: 32}} className={classes.tableHeadCell}>
                    <Divider className={classes.tableDivider} />
                    <span style={{position:'absolute'}}>By</span>
                  </TableCell>
                </TableRow>
              )}
            </TableHead>
            <TableBody ref={this.tableBodyRef}>
              {dataList.length>0?(contentElements):(
                <TableRow style={{ height: 'auto' }}>
                  <TableCell colSpan={antFeatureFlag?12:11} className={classes.tableCellRow}>
                    <Typography style={{padding: 10}}>There is no data.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ValidatorForm>
      </div>
    );
  }
}

export default withStyles(styles)(DrinkingTable);
