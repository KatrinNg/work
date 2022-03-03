/*
 * Front-end UI for save/update IOE Service Profile Maintenance Template Ordering
 * Load IOE Service Profile Maintenance Template List Action: [serviceProfileMaintenance.js] componentDidMount -> initData
 * -> [serviceProfileAction.js] getServiceProfileList
 * -> [serviceProfileSaga.js] getServiceProfileList
 * -> Backend API = /ioe/listServiceProfileByType
 * Clear Action: [serviceProfileMaintenance.js] Clear -> handleClear
 * -> [serviceProfileAction.js] getServiceProfileList
 * -> [serviceProfileSaga.js] getServiceProfileList
 * -> Backend API = /ioe/listServiceProfileByType
 * Save Ordering Action: [serviceProfileMaintenance.js] Save Ordering -> handleSave
 * -> [serviceProfileAction.js] saveServiceProfileList
 * -> [serviceProfileSaga.js] saveServiceProfileList
 * -> Backend API = /ioe/saveServiceProfileList
 * Get Lab Test Grouping Template Action: [serviceProfileMaintenance.js] Edit -> handleEdit
 * -> [serviceProfileAction.js] getServiceProfileTemplate
 * -> [serviceProfileSaga.js] getServiceProfileTemplate
 * -> Backend API = /ioe/getServiceProfileById
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { styles } from './serviceProfileMaintenanceStyle';
import { withStyles, Card, CardContent, Typography, Button, Grid} from '@material-ui/core';
import { AddCircle, Edit, ArrowUpwardOutlined, ArrowDownward } from '@material-ui/icons';
import CIMSTable from '../../../../components/Table/CimsTableNoPagination';
import ServiceProfileDialog from '../../../../components/IOE/Dialog/ServiceProfile/ServiceProfileDialog';
import moment from 'moment';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { openCommonCircularDialog, closeCommonCircularDialog} from '../../../../store/actions/common/commonAction';
import { SERVICE_PROFILE_MAINTENANCE_CODE } from '../../../../constants/message/IOECode/serviceProfileMaintenanceCode';
import {
  getServiceProfileList,
  saveServiceProfileList,
  getServiceProfileTemplate,
  getServiceProfildItemDropdownList,
  getTemplateAllItemsForSearch,
  getServiceProfileFrameworkList } from '../../../../store/actions/IOE/serviceProfile/serviceProfileAction';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CustomizedSelectFieldValidator from '../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import { DL_PRIVILEGES_SERVICE_PROFILE, DL_PRIVILEGES_PERSONAL_PROFILE } from '../../../../constants/IOE/serviceProfile/serviceProfileConstants';
import { concat,toLower,isEqual,filter,isNull } from 'lodash';
import { COMMON_OPERATION,COMMON_ACTION_TYPE } from '../../../../constants/common/commonConstants';
import Container from 'components/JContainer';
import {COMMON_CODE} from 'constants/message/common/commonCode';
import {updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../../enums/accessRightEnum';
import * as utils from '../../../../components/IOE/Dialog/ServiceProfile/utils/dialogUtils';
import classNames from 'classnames';
import * as commonConstants from '../../../../constants/common/commonConstants';
import * as commonUtils from '../../../../utilities/josCommonUtilties';

class serviceProfileMaintenance extends Component {
  constructor(props){
    super(props);
    let {accessRights} = props.loginInfo;
    this.favoriteCategorys = [];
    if (accessRights.length>0) {
      for (let i = 0; i < accessRights.length; i++) {
        const accessRightObj = accessRights[i];
        if (accessRightObj.name === accessRightEnum.privilegeServiceProfileMaintenance) {
          // Service Favorite and Nurse Permission
          this.favoriteCategorys = concat(this.favoriteCategorys,DL_PRIVILEGES_SERVICE_PROFILE);
        } else if (accessRightObj.name === accessRightEnum.privilegePersonalProfileMaintenance) {
          // My Favorite
          this.favoriteCategorys = concat(this.favoriteCategorys,DL_PRIVILEGES_PERSONAL_PROFILE);
        }
      }
    }
    this.state={
      serviceCd:props.loginInfo.service.code,
      templateTypeCd:this.favoriteCategorys.length>0?this.favoriteCategorys[0].value:null,
      isOpen: false,
      dialogIsCreateMode: true,
      selectedObj: null,
      templateList: [],
      // getSelectRow: null,
      pageNum: null,
      selectRow: null,
      templateSeq: null,
      tipsListSize: parseInt(props.sysConfig.TMPL_TIPS_SIZE.value),
      isSave: true,
      tableRows: [
        { name: 'templateSeq',width: '3%', label:'Seq'},
        { name: 'templateName', width: 'auto', label: 'Template Name' },
        { name: 'isActive', width: '10%', label: 'Active'  ,   customBodyRender: value => {
          return value===0 ||value==='0'? 'No' : (value===1 ||value==='1'?'Yes':'No');
          }
        },
        { name: 'updatedBy', width: '10%', label: 'Updated By' },
        { name: 'updatedDtm', label: 'Updated On', width: '10%', customBodyRender: (value) => {
            return value ? moment(value).format('DD-MMM-YYYY') : null;
          }
        }
      ],
      tableOptions: {
        rowHover: true,
        rowsPerPage:5,
        onSelectIdName:'templateSeq', //显示tips的列
        tipsListName:'ioeTestTemplateItems', //显示tips的list
        tipsDisplayListName:'codeIoeFormItem', //显示tips的列
        tipsDisplayName:'frmItemName',//显示tips的值
        // tipsPlacement: 'right-start',
        tipsCutomStyle:{
          tooltip:props.classes.tooltip
        },
        // tooltipDivStyle: props.classes.tooltipDiv,
        tipsCustomRender:(rowIndex)=>{
          let {templateList} = this.state;
          let wrapper = [];
          if (templateList.length>0) {
            let tooltipMap = templateList[rowIndex].templateTooltipMap;
            wrapper.push(<Typography style={{fontWeight: 'bold',whiteSpace:'pre-wrap'}} key={Math.random()}><u>{templateList[rowIndex].templateName}</u></Typography>);
            if (Object.prototype.toString.call(tooltipMap).match(/^\[object (.*)\]$/)[1].toLowerCase() === 'map') {
              for (let orderObj of tooltipMap.values()) {
                let title = <Typography key={Math.random()}>- {orderObj.title}</Typography>;
                let contents = [];
                contents = orderObj.contents.map((content,index) => {
                  return(
                  <Typography style={{paddingLeft:10,wordWrap:'break-word',wordBreak:'break-all'}} key={index}>
                    - {content.indexOf('Remark:')>-1?(
                      <span><b>{content.substring(0,7)}</b>{content.substring(8,content.length)}</span>
                    ):(
                      content.indexOf('Instruction')>-1?(
                        <span><b>{content.substring(0,12)}</b>{content.substring(13,content.length)}</span>
                      ):(
                        content.indexOf('Clinical Summary & Diagnosis')>-1?(
                          <span><b>{content.substring(0,29)}</b>{content.substring(30,content.length)}</span>
                        ):content
                      )
                    )}
                  </Typography>
                  );
                });
                wrapper.push(title);
                wrapper.push(contents);
              }
            }
          }
          return wrapper;
        },
        // onSelectedRow:(rowId,rowData,selectedData)=>{
        //   this.selectTableItem(selectedData);
        // },
        bodyCellStyle:this.props.classes.customRowStyle,
 	    	headRowStyle:this.props.classes.headRowStyle,
        headCellStyle:this.props.classes.headCellStyle
      },
      dialogExtraProps: {
        maxSeq: 0,
        maxVersion: null,
        userId: null
      }
    };
  }

  componentDidMount() {
    this.props.ensureDidMount();
    if (this.favoriteCategorys.length > 0) {
      this.props.openCommonCircularDialog();
      this.props.getServiceProfildItemDropdownList({});
      this.props.getTemplateAllItemsForSearch({});
      this.toDoInit();
    }
    this.props.updateCurTab(accessRightEnum.serviceProfileMaintenance, this.doClose);  //关闭tab方法
    this.insertIxProfileLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} Investigation Profile Maintenance`, '');
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    let {templateList} = this.state;
    if (!isEqual(templateList,nextProps.serviceProfileTemplateList)) {
      this.setState({
        templateList:nextProps.serviceProfileTemplateList
      });
    }
  }

  toDoInit=()=>{
    this.props.getServiceProfileFrameworkList({
      params:{},
      callback: () => {
        this.initData();
      }
    });
  }

  handleFavouriteCategoryChanged = (e) => {
    this.props.getServiceProfileList({
      params:{
        favoriteType:e.value
      },
      callback:(templateList)=>{
        const {ioeFormMap,dropdownMap} = this.props;
        utils.generateListTooltips(templateList,ioeFormMap,dropdownMap);
        this.setState({
          templateTypeCd: e.value,
          isSave:true,
          templateList: templateList,
          templateSeq: null,
          selectRow:null,
          selectedObj:null,
          isChange: false
        });
      }
    });
    this.insertIxProfileLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} favourite category: ${e.value} in drop-down list`, '');
  }

  doClose = (callback) => {
    let editFlag = !this.state.isSave;
    if (editFlag) {
      this.props.openCommonMessage({
        msgCode: COMMON_CODE.SAVE_WARING,
        btnActions: {
          btn1Click: () => {
            this.handleSave(callback);
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Ix Profile Maintenance');
            this.insertIxProfileLog(name,'ioe/saveServiceProfileList');
            // setInterval(callback(true), 1000);
          }, btn2Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Ix Profile Maintenance');
            this.insertIxProfileLog(name,'');
            callback(true);
          }, btn3Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Ix Profile Maintenance');
            this.insertIxProfileLog(name, '');
          }
        },
        params: [
          {
            name: 'title',
            value: 'Ix Profile Maintenance'
          }
        ]
      });
    }
    else {
      this.insertIxProfileLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Investigation Profile Maintenance`,'');
      callback(true);
    }
  }

  initData = () => {
    let params = {
      favoriteType:this.state.templateTypeCd
    };
    this.props.getServiceProfileList({
      params,
      callback:(templateList)=>{
        const {ioeFormMap,dropdownMap} = this.props;
        utils.generateListTooltips(templateList,ioeFormMap,dropdownMap);
        this.setState({
          isSave:true,
          templateList: templateList,
          templateSeq: null,
          selectRow:null,
          selectedObj:null,
          isChange: false
        });
        this.props.closeCommonCircularDialog();
      }
    });
  };

  //获得选中行数据
  getSelectRow = (data) => {
    this.setState({
      templateSeq: data.templateSeq,
      selectRow:data.templateSeq,
      selectedObj:data
    });
  }

  //检查是否选中行数据，未选中提示相应提示
  checkSelect = (msgCode,action) => {
    if(this.state.templateSeq===null){
      let payload = {
        msgCode,
        params:[
          { name:'action1', value:action },
          { name:'action2', value:toLower(action) }
        ]
      };
      this.props.openCommonMessage(payload);
    }
  }

  handleCheckSave = (msgCode,action) => {
    let payload = {
      msgCode,
      params:[
        { name:'action', value:action }
      ]
    };
    this.props.openCommonMessage(payload);
  }

  handleAdd = () => {
    let { isSave,templateList } = this.state;
    if(!isSave){ //提示有其他操作判断未保存
      this.handleCheckSave(SERVICE_PROFILE_MAINTENANCE_CODE.TEMPLATE_IN_ACTION,COMMON_OPERATION.ADD);
    } else {
      let maxSeq = 0, maxVersion = null;
      if (templateList.length > 0) {
        let maxObj = templateList[templateList.length-1];
        maxSeq = maxObj.templateSeq;
        maxVersion = maxObj.version;
      }
      this.setState({
        isOpen: true,
        dialogIsCreateMode: true,
        dialogExtraProps:{
          maxSeq,
          maxVersion,
          userId:null
        }
      });
      this.insertIxProfileLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Add' button`, '');
    }
  }

  handleEdit=()=>{
    let { isSave,selectedObj } = this.state;
    if (!isSave) { //提示有其他操作判断未保存
      this.handleCheckSave(SERVICE_PROFILE_MAINTENANCE_CODE.TEMPLATE_IN_ACTION,COMMON_OPERATION.EDIT);
    } else if (!selectedObj) {  //提示未选中行
      let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (No record is selected; IOE Test Template ID: null; Template Name: null)`;
      this.insertIxProfileLog(name,'');
      let payload = {
        msgCode:SERVICE_PROFILE_MAINTENANCE_CODE.TEMPLATE_BEFORE_PROCEEDING_OTHER_ACTION,
        params:[
          { name:'action1', value:COMMON_OPERATION.EDIT },
          { name:'action2', value:toLower(COMMON_OPERATION.EDIT) }
        ]
      };
      this.props.openCommonMessage(payload);
    } else {
      let name=`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Edit' button (IOE Test Template ID: ${selectedObj.ioeTestTemplateId}; Template Name: ${selectedObj.templateName})`;
      this.props.openCommonCircularDialog();
      this.props.getServiceProfileTemplate({
        params: {
          ioeTestTemplateId: selectedObj.ioeTestTemplateId
        },
        callback: () => {
          this.setState({
            isOpen: true,
            dialogIsCreateMode: false,
            dialogExtraProps:{
              maxSeq:0,
              maxVersion:null,
              userId:selectedObj.userId
            }
          });
        }
      });
      this.insertIxProfileLog(name, '');
    }
  }

  handleDown= () => {
    let {templateList,templateSeq} = this.state;
    if(templateSeq){
      let index = templateSeq-1;
      if (templateList[index+1]) {
        let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Down' button (Sequence Number: ${templateList[index].templateSeq}; IOE Test Template ID: ${templateList[index].ioeTestTemplateId}; Template Name: ${templateList[index].templateName})`;
        templateList[index].templateSeq = templateSeq+1;
        templateList[index].operationType = COMMON_ACTION_TYPE.UPDATE;
        templateList[index+1].templateSeq = templateSeq;
        templateList[index+1].operationType = COMMON_ACTION_TYPE.UPDATE;
        [templateList[index],templateList[index+1]] = [templateList[index+1],templateList[index]];
        this.setState({
          templateSeq:templateSeq+1,
          selectRow:templateSeq+1,
          templateList : templateList,
          isSave:false,
          isChange: true
        });
        this.insertIxProfileLog(name, '');
      }
    }else{
      this.checkSelect(SERVICE_PROFILE_MAINTENANCE_CODE.TEMPLATE_BEFORE_PROCEEDING_OTHER_ACTION,COMMON_OPERATION.DOWN);
      let name=`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Down' button (No record is selected; Sequence Number: null; IOE Test Template ID: null; Template Name: null)`;
      this.insertIxProfileLog(name, '');
    }
  }

  handleUp= () => {
    let {templateList,templateSeq} = this.state;
    if(templateSeq){
      let index = templateSeq-1;
      if (templateList[index-1]) {
        let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button (Sequence Number: ${templateList[index].templateSeq}; IOE Test Template ID: ${templateList[index].ioeTestTemplateId}; Template Name: ${templateList[index].templateName})`;
        templateList[index].templateSeq = index;
        templateList[index].operationType = COMMON_ACTION_TYPE.UPDATE;
        templateList[index-1].templateSeq = templateSeq;
        templateList[index-1].operationType = COMMON_ACTION_TYPE.UPDATE;
        [templateList[index],templateList[index-1]] = [templateList[index-1],templateList[index]];
        this.insertIxProfileLog(name, '');
        this.setState({
          templateSeq:index,
          selectRow:index,
          templateList : templateList,
          isSave:false,
          isChange: true
        });
      }
    }else{
      this.checkSelect(SERVICE_PROFILE_MAINTENANCE_CODE.TEMPLATE_BEFORE_PROCEEDING_OTHER_ACTION,COMMON_OPERATION.UP);
      let name=`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Up' button (No record is selected; Sequence Number: null; IOE Test Template ID: null; Template Name: null)`;
      this.insertIxProfileLog(name,'');
    }
  }

  // Save Ordering action
  handleSave = (saveCallback) => {
    let {templateTypeCd} = this.state;
    let resultObj = this.generateResultDtos();
    this.props.openCommonCircularDialog();
    this.props.saveServiceProfileList({
      params:resultObj,
      callback:(data)=>{
        if(data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          let payload = {
            msgCode: data.msgCode,
            btnActions:
            {
              btn1Click: () => {
                this.refreshPageData(templateTypeCd);
              },
              btn2Click: () => {
                this.props.closeCommonCircularDialog();
              }
            }
          };
          this.props.openCommonMessage(payload);
        }else{
          this.refreshPageData(templateTypeCd);
          this.props.openCommonMessage({
            msgCode:data.msgCode,
            showSnackbar:true
          });
          if (typeof saveCallback != 'function' || saveCallback === undefined) {
            this.insertIxProfileLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save Ordering' button`, 'ioe/saveServiceProfileList');
            return false;
          } else {
            saveCallback(true);
          }
        }
      }
    });
  }

  refreshPageData = (templateTypeCd) => {
    this.props.getServiceProfileList({
      params:{
        favoriteType:templateTypeCd
      },
      callback:(templateList)=>{
        const {ioeFormMap,dropdownMap} = this.props;
        utils.generateListTooltips(templateList,ioeFormMap,dropdownMap);
        this.setState({
          isSave:true,
          templateList: templateList,
          templateSeq: null,
          selectRow:null,
          selectObj:null,
          isChange: false,
          selectedObj:null
        });
      }
    });
  }

  handleClear = () => {
    let isChange = this.state.isChange;
    if (isChange){
      let payload = {
        msgCode :SERVICE_PROFILE_MAINTENANCE_CODE.TEMPLATE_IS_CLEAR,
        btnActions : {
          btn1Click: () => {
            this.initData();
          }
        }
      };
      this.props.openCommonMessage(payload);
    }else {
      this.initData();
    }
  }

  handleDialogCancel = (saveFlag=false) =>{
    this.setState({
      isOpen:false
    });
    if (saveFlag) {
      this.initData();
    }
  }

  generateResultDtos = () => {
    let {templateList} = this.state;
    let dtos = [];
    dtos = filter(templateList,listItem => {
      return !isNull(listItem.operationType);
    });
    return {
      dtos
    };
  }
  insertIxProfileLog = (desc, apiName = '', content = null) => {
    commonUtils.commonInsertLog(apiName, 'F119', 'Ix Profile Maintenance', desc, 'ioe', content);
  };
  handleCancelLog = (name,apiName='') => {
    this.insertIxProfileLog(name, apiName);
  }

  refreshEditData = (selectedObj) => {
    if(selectedObj!=null){
      this.props.getServiceProfileTemplate({
        params: {
          ioeTestTemplateId: selectedObj.ioeTestTemplateId
        },
        callback: () => {
          this.setState({
            isOpen: true,
            dialogIsCreateMode: false,
            dialogExtraProps:{
              maxSeq:0,
              maxVersion:null,
              userId:selectedObj.userId
            }
          });
        }
      });
    }else{
      this.toDoInit();
      this.props.closeCommonCircularDialog();
      this.setState({
        isOpen: false
      });

    }
  }

  render() {
    const { classes,commonMessageList} = this.props;
    const {selectedObj} = this.state;
    let {
      isOpen,
      serviceCd,
      templateTypeCd,
      dialogIsCreateMode,
      dialogExtraProps
      // isChange
    } = this.state;
    let dialogProps = {
      selectedObj,
      isOpen,
      templateTypeCd,
      dialogIsCreateMode,
      dialogExtraProps,
      commonMessageList,
      dialogTitle: dialogIsCreateMode ? 'Create Ix Profile' : 'Edit Ix Profile',
      handleDialogCancel:this.handleDialogCancel,
      // handleDialogSave: this.handleDialogSave,
      insertIxProfileLog:this.insertIxProfileLog,
      refreshEditData:this.refreshEditData,
      toDoInit:this.toDoInit
    };
    const buttonBar={
      isEdit:!this.state.isSave,
      title:'Ix Profile Maintenance',
      logSaveApi: 'ioe/saveServiceProfileList',
      saveFuntion:this.handleSave,
      handleCancelLog: this.handleCancelLog,
      // height:'64px',
      position:'fixed',
      buttons:[{
        title:'Save Ordering',
        id:'btn_group_service_profile_save',
        disabled:!this.state.isChange,
        onClick:this.handleSave
      }]
    };

    let disabledFlag = this.favoriteCategorys.length>0?false:true;

    return (
      <Container component="div" id="wrapper" className={classes.wrapper} buttonBar={buttonBar}>
        <Card className={classes.cardWrapper}>
          <CardContent classes={{root:classes.cardContent}}>
            {/* title */}
            <Typography component="div" className={classes.topDiv}>
              <Typography component="div" className={classes.titleDiv}>
                <label className={classes.label}>{`Ix Profile Maintenance (${serviceCd})`}</label>
              </Typography>
              {/* Favorite Category */}
              <Typography component="div" className={classes.favouriteCategoryDiv}>
                <ValidatorForm
                    id="favouriteForm"
                    onSubmit={() => {}}
                    ref="form"
                >
                  <Grid container>
                    <label className={classes.favouriteCategoryLabel}>Favourite Category:</label>
                    <Grid item xs={3}>
                      <CustomizedSelectFieldValidator
                          className={classes.favoriteCategory}
                          id={'service_profile_favourite_category'}
                          options={
                            this.favoriteCategorys.map((item) => ({
                              value: item.value,
                              label: item.label
                            }))
                          }
                          onChange={this.handleFavouriteCategoryChanged}
                          value={templateTypeCd}
                      />
                    </Grid>
                  </Grid>
                </ValidatorForm>
              </Typography>
              {/* Table Action */}
              <Typography component="div" className={classes.actionDiv}>
                <Button
                    disabled={disabledFlag}
                    id="btn_service_profile_add"
                    onClick={this.handleAdd}
                    className={classes.actionBtn}
                >
                  <AddCircle color="primary" />
                  <span className={classNames(classes.font_color,{[classes.font_disabled]:disabledFlag})}>Add</span>
                </Button>
                <Button
                    disabled={disabledFlag}
                    id="btn_service_profile_edit"
                    onClick={this.handleEdit}
                    className={classes.actionBtn}
                >
                  <Edit color="primary" />
                  <span className={classNames(classes.font_color,{[classes.font_disabled]:disabledFlag})}>Edit</span>
                </Button>
                <Button
                    disabled={disabledFlag}
                    id="btn_service_profile_up"
                    onClick={this.handleUp}
                    className={classes.actionBtn}
                >
                  <ArrowUpwardOutlined color="primary" />
                  <span className={classNames(classes.font_color,{[classes.font_disabled]:disabledFlag})}>Up</span>
                </Button>
                <Button
                    disabled={disabledFlag}
                    id="btn_service_profile_down"
                    onClick={this.handleDown}
                    className={classes.actionBtn}
                >
                  <ArrowDownward color="primary" />
                  <span className={classNames(classes.font_color,{[classes.font_disabled]:disabledFlag})}>Down</span>
                </Button>
              </Typography>
            </Typography>
            <Typography component="div" className={classes.tableDiv}>
              <CIMSTable
                  data={disabledFlag?[]:this.state.templateList}
                  getSelectRow={this.getSelectRow}
                  id="service_profile_table"
                  options={this.state.tableOptions}
                  rows={this.state.tableRows}
                  rowsPerPage={this.state.pageNum}
                  selectRow={this.state.selectRow}
                  style={{marginTop:20}}
                  tipsListSize={this.state.tipsListSize}
              />
            </Typography>
          </CardContent>
          <ServiceProfileDialog {...dialogProps} />
        </Card>
      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginInfo:{
      ...state.login.loginInfo,
      accessRights: state.login.accessRights,
      service:{
        code:state.login.service.serviceCd
      }
    },
    commonMessageList:state.message.commonMessageList,
    sysConfig:state.clinicalNote.sysConfig,
    serviceProfileTemplateList:state.serviceProfile.serviceProfileTemplateList,
    ioeFormMap:state.serviceProfile.ioeFormMap,
    dropdownMap:state.serviceProfile.dropdownMap
  };
};

const mapDispatchToProps = {
  getServiceProfildItemDropdownList,
  getTemplateAllItemsForSearch,
  getServiceProfileFrameworkList,
  getServiceProfileTemplate,
  getServiceProfileList,
  saveServiceProfileList,
  openCommonMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  updateCurTab
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(serviceProfileMaintenance));
