import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './SearchIxDialogStyle';
import { withStyles, Dialog, Paper, DialogTitle, DialogContent, Typography, DialogActions, Grid, TextField } from '@material-ui/core';
import Draggable from 'react-draggable';
import CIMSButton from '../../../../../Buttons/CIMSButton';
import CIMSTable from '../../../../../Table/CimsTableNoPagination';
import {isNull,trim,includes,toLower,filter} from 'lodash';
// import { COMMON_ACTION_TYPE } from '../../../../../../constants/common/commonConstants';
import { SERVICE_PROFILE_MAINTENANCE_CODE } from '../../../../../../constants/message/IOECode/serviceProfileMaintenanceCode';
import { openCommonMessage } from '../../../../../../store/actions/message/messageAction';
import * as utils from '../../utils/dialogUtils';
import ValidatorForm from '../../../../../FormValidator/ValidatorForm';
import CustomizedSelectFieldValidator from '../../../../../Select/CustomizedSelect/CustomizedSelectFieldValidator';

function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={(e)=>{
          return e.target.getAttribute('customdragsearch') === 'allowed';
        }}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class SearchIxDialog extends Component {
  constructor(props){
    super(props);
    this.state={
      searchIx: '',
      selectedDiscipline: props.labOptions[0].value,
      selectedObj: null,
      resultList: [],
      pageNum: null,
      selectRow: null,
      tipsListSize: parseInt(props.sysConfig.TMPL_TIPS_SIZE.value),
      tableRows: [
        { name: 'labCentreId', width: '10%', label: 'Discipline' },
        { name: 'formLongName', width: '25%', label: 'Form Name' },
        {
          name: 'test',
          width: '25%',
          label: 'Test',
          customBodyRender: value => {
            return !isNull(value)?value:'';
          }
        },
        {
          name: 'specimen',
          width: '25%',
          label: 'Specimen',
          customBodyRender: value => {
            return !isNull(value)?value:'';
          }
        }
      ],
      tableOptions: {
        rowHover: true,
        rowsPerPage:5,
        onSelectIdName:'codeIoeFormItemId', //显示tips的列
        tipsListName:'ioeTestTemplateItems', //显示tips的list
        tipsDisplayListName:'codeIoeFormItem', //显示tips的列
        tipsDisplayName:'frmItemName',//显示tips的值
        bodyCellStyle:props.classes.customRowStyle,
 	    	headRowStyle:props.classes.headRowStyle,
        headCellStyle:props.classes.headCellStyle
      }
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    let { isOpen } = nextProps;
    if (isOpen) {
      let resultList = this.commonSearch(this.state.selectedDiscipline,nextProps.searchIx);
      this.setState({
        searchIx:nextProps.searchIx,
        resultList: resultList,
        selectRow:null,
        selectedObj:null
      });
    }
  }

  commonSearch = (selectedDiscipline,searchIx) => {
    const { searchItemList } = this.props;
    let resultList = [];
    if (searchItemList.length > 0 && searchIx !== '') {
      resultList = filter(searchItemList,item=>{
        if (selectedDiscipline === 'All') {
          return includes(toLower(item.test),toLower(searchIx))||includes(toLower(item.specimen),toLower(searchIx));
        } else {
          return (item.labCentreId === selectedDiscipline)&&(includes(toLower(item.test),toLower(searchIx))||includes(toLower(item.specimen),toLower(searchIx)));
        }
      });
    }
    return resultList;
  }

  // get the data of selected row
  getSelectRow = (data) => {
    this.setState({
      selectRow:data.codeIoeFormItemId,
      selectedObj:data
    });
  }

  handleRowDoubleClick = (data) => {
    this.setState({
      selectRow:data.codeIoeFormItemId,
      selectedObj:data
    },()=>{
      this.handleSelect();
    });
  }

  resetDialogState = () => {
    const { labOptions } = this.props;
    this.setState({
      searchIx: '',
      selectedDiscipline: labOptions[0].value,
      selectedObj: null,
      resultList: []
    });
  }

  handleSelect = () => {
    const { dialogTitle,orderIsEdit,middlewareObject,frameworkMap,handleSearchDialogCancel,updateState,updateGroupingContainerState,updateStateWithoutStatus,editMode=false,insertIxProfileLog } = this.props;
    let {selectedObj} = this.state;
    if (isNull(selectedObj)) {
      let content = 'No record is selected (Discipline: null; Form Name:null; Specimen: null; Test: null)';
      insertIxProfileLog && insertIxProfileLog(`${dialogTitle} [Search Result Dialog] Action: Click 'Select' button`, '', content);
      this.props.openCommonMessage({
        msgCode:SERVICE_PROFILE_MAINTENANCE_CODE.SEARCH_RESULT_EMPTY_SELECT
      });
    } else {
      let { labCentreId,codeIoeFormId,codeIoeFormItemId,test,specimen,formName } = selectedObj;
      let disciplineName = labCentreId === 'All' ? 'ALL' : labCentreId;
      let content = `Discipline: ${disciplineName}; Form Name: ${formName}; Specimen: ${specimen}; Test: ${test}`;
      insertIxProfileLog&&insertIxProfileLog(`${dialogTitle} [Search Result Dialog] Action: Click 'Select' button`,'',content);
      let valObj = null, editFlag = false;
      if (codeIoeFormId !== middlewareObject.codeIoeFormId) {
        // not in current form
        let formObj = frameworkMap.get(labCentreId).formMap.get(codeIoeFormId);
        valObj = utils.initMiddlewareObject(formObj);
      } else {
        // in current form
        valObj = middlewareObject;
        editFlag = orderIsEdit;
      }
      if (!isNull(test)) {
        let itemObj = valObj.testValMap.get(codeIoeFormItemId);
        itemObj.isChecked = true;
        utils.handleTestItem(codeIoeFormItemId,valObj.testValMap,valObj.masterTestMap,labCentreId);
        utils.handleClickBoxOperationType(itemObj);
      }else if (!isNull(specimen)){
        let itemObj = valObj.specimenValMap.get(codeIoeFormItemId);
        itemObj.isChecked = true;
        utils.handleSepcimenItem(codeIoeFormItemId,valObj.specimenValMap);
        utils.handleClickBoxOperationType(itemObj);
      }
      if (editMode) {
        updateStateWithoutStatus&&updateStateWithoutStatus({
          middlewareObject: valObj,
          targetLabId:labCentreId,
          targetFormId:codeIoeFormId
        });
      } else {
        updateState&&updateState({
          orderIsEdit: editFlag,
          middlewareObject: valObj
        });
        updateGroupingContainerState&&updateGroupingContainerState({
          labValue: labCentreId,
          selectedFormId: codeIoeFormId,
          infoTargetLabId: labCentreId,
          infoTargetFormId: codeIoeFormId
        });
      }
      handleSearchDialogCancel&&handleSearchDialogCancel();
    }
  }

  handleDialogCancel = () => {
    const { handleSearchDialogCancel,insertIxProfileLog,dialogTitle } = this.props;
    insertIxProfileLog && insertIxProfileLog(`${dialogTitle} [Search Result Dialog] Action: Click 'Cancel' button`, '');
    handleSearchDialogCancel&&handleSearchDialogCancel();
  }

  handleIxChange = event => {
    this.setState({
      searchIx:event.target.value
    });
  }

  handleIxBlur = event => {
    this.setState({
      searchIx:trim(event.target.value)
    });
  }

  handleDisciplineChange = event => {
    this.setState({
      selectedDiscipline:event.value
    });
  }

  handleSearchIxByEnter = event => {
    if (event.keyCode === 13) {
      let { selectedDiscipline,searchIx } = this.state;
      let resultList = this.commonSearch(selectedDiscipline,trim(searchIx));
      this.setState({
        resultList: resultList,
        selectRow:null,
        selectedObj:null
      });
    }
  }

  handleSearch = () => {
    const { insertIxProfileLog,dialogTitle } = this.props;
    let { selectedDiscipline,searchIx } = this.state;
    let resultList = this.commonSearch(selectedDiscipline,searchIx);
    this.setState({
      resultList: resultList,
      selectRow:null,
      selectedObj:null
    });
    let disciplineName = selectedDiscipline === 'All' ? 'ALL' : selectedDiscipline;
    let name = `${dialogTitle} [Search Result Dialog] Action: Click 'Search' button (Discipline: ${disciplineName}; Ix: ${searchIx})`;
    insertIxProfileLog && insertIxProfileLog(name, '');
  }

  render() {
    const {classes,isOpen=false,labOptions} = this.props;
    let { searchIx,selectedDiscipline,resultList,tableRows,tableOptions,pageNum,selectRow,tipsListSize } = this.state;
    let inputProps = {
      autoCapitalize:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        className: classes.inputProps
      },
      InputProps:{
        classes: {
          input: classes.input
        }
      }
    };
    return (
      <Dialog
          classes={{paper: classes.paper}}
          fullWidth
          maxWidth="md"
          open={isOpen}
          scroll="paper"
          PaperComponent={PaperComponent}
          onExited={this.resetDialogState}
          onEscapeKeyDown={this.handleDialogCancel}
      >
        {/* title */}
        <DialogTitle className={classes.dialogTitle} disableTypography customdragsearch="allowed">Search Result</DialogTitle>
        {/* content */}
        <DialogContent classes={{'root':classes.dialogContent}}>
          {/* search bar */}
          <Typography component="div" className={classes.searchDiv}>
            <ValidatorForm id="search_result_form" onSubmit={() => {}}>
              <Grid container direction="row" justify="center" alignItems="center">
                <Grid item xs={2}>
                  <label>Click to select an Ix: </label>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.flexCenter}>
                    <label className={classes.searchLabel}>Discipline</label>
                    <CustomizedSelectFieldValidator
                        id="dropdown_search_result_dialog_discipline"
                        options={labOptions.map(option=>{
                          return {
                            label: option.label,
                            value: option.value
                          };
                        })}
                        value={selectedDiscipline}
                        onChange={event => {this.handleDisciplineChange(event);}}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                        menuPortalTarget={document.body}
                    />
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className={classes.flexCenter}>
                    <label className={classes.searchLabel}>Ix</label>
                    <TextField
                        id="input_search_result_dialog_ix"
                        placeholder="Search by Test / Specimen"
                        fullWidth
                        onKeyUp={this.handleSearchIxByEnter}
                        onChange={this.handleIxChange}
                        onBlur={this.handleIxBlur}
                        value={searchIx}
                        {...inputProps}
                    />
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <CIMSButton
                      id="btn_search_result_dialog_search"
                      className={classes.searchBtn}
                      onClick={this.handleSearch}
                  >
                    Search
                  </CIMSButton>
                </Grid>
              </Grid>
            </ValidatorForm>
          </Typography>
          {/* table */}
          <Typography component="div" className={classes.tableDiv}>
            <CIMSTable
                id="search_result_table"
                data={resultList}
                getSelectRow={this.getSelectRow}
                handleRowDoubleClick={this.handleRowDoubleClick}
                options={tableOptions}
                rows={tableRows}
                rowsPerPage={pageNum}
                selectRow={selectRow}
                style={{marginTop:20}}
                tipsListSize={tipsListSize}
            />
          </Typography>
        </DialogContent>
        {/* button group */}
        <DialogActions className={classes.dialogActions}>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item>
              <Typography component="div" noWrap>
                <span className={classes.numberSpan}>No of Result: {resultList.length}</span>
              </Typography>
            </Grid>
            <Grid item>
              <div className={classes.actionWrapper}>
                <CIMSButton
                    id="btn_service_profile_search_result_dialog_cancel"
                    className={classes.searchBtn}
                    onClick={this.handleDialogCancel}
                >
                  Cancel
                </CIMSButton>
                <CIMSButton
                    id="btn_service_profile_search_result_dialog_select"
                    className={classes.searchBtn}
                    onClick={this.handleSelect}
                >
                  Select
                </CIMSButton>
              </div>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = state => {
  return {
    sysConfig:state.clinicalNote.sysConfig,
    labOptions:state.serviceProfile.labOptions,
    searchItemList:state.serviceProfile.searchItemList
  };
};

const mapDispatchToProps = {
  openCommonMessage
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(SearchIxDialog));
