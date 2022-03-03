import React, { Component } from 'react';
import { connect } from 'react-redux';
import { style } from './officerInChargeMaintenanceCss';
import { withStyles } from '@material-ui/core/styles';
import { Card,FormControl, CardHeader, CardContent, Grid, Typography } from '@material-ui/core';
import en_US from '../../../../locales/en_US';
import CIMSTable from './Component/CustomizedTable';
import { getOfficerDoctorDropdownList,saveOfficerDoctorList } from '../../../../store/actions/IOE/officerInCharge/officerInChargeAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../../store/actions/common/commonAction';
import SearchSelect from '../../../jos/clinicalNote/components/SearchSelect/index';
import { COMMON_CODE } from 'constants/message/common/commonCode';
import { updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../../enums/accessRightEnum';
import Container from 'components/JContainer';
import _ from 'lodash';
import {COMMON_ACTION_TYPE} from '../../../../constants/common/commonConstants';
import {listClinic} from '../../../../store/actions/common/commonAction';
import * as commonConstants from '../../../../constants/common/commonConstants';
import { useroIsServiceAdminSetting, userIsClinicaSetting } from '../../../../utilities/userUtilities';
import * as commonUtils from '../../../../utilities/josCommonUtilties';
class OfficerInChargeMaintenance extends Component {
  constructor(props) {
    super(props);
    const { loginInfo = {}, common} = props;
    let {clinic,isServiceAdmin,isClinicalAdmin}  = loginInfo;
    const {clinicList } = common;
    let clinicOption=[];
    // Generate clinic Dropdown List
    if(useroIsServiceAdminSetting()){
        clinicOption = clinicList.filter(item => {
            return item.serviceCd === loginInfo.service.serviceCd;
        });
    }else if(userIsClinicaSetting()){
        clinicOption = clinicList.filter(item => {
            return item.serviceCd === loginInfo.service.serviceCd&&item.clinicCd===clinic.clinicCd;
        });
    }
    // clinicOption=defaultOption.concat(clinicOption);
    this.state = {
      serviceCd:JSON.parse(sessionStorage.getItem('service')).serviceCd,
      clinicEngDesc: JSON.parse(sessionStorage.getItem('clinic')).clinicName!==undefined?JSON.parse(sessionStorage.getItem('clinic')).clinicName+'('+JSON.parse(sessionStorage.getItem('clinic')).clinicCd+')':JSON.parse(sessionStorage.getItem('clinic')).clinicCd,
      clinic,
      clinicOption:_.cloneDeep(clinicOption),
      templateList: [],
      doctorList:[],
      isChange: false,
      isSave: true,
      seq: null,
      getSelectRow: null,
      pageNum: null,
      selectRow: null,
      ioeTokenTemplateId: '',
      dispalyState: false,
      tableRows: [
        { name: 'clinicName', width: 500, label: 'Clinic Name' },
        {
          name: 'userInCharge', label: 'Responsible Doctor', width: 130, customBodyRender: (value,item,index) => {
            return(
            <FormControl id={`officerInChargeMaintenance_clinic_select_${index}`} style={{width:'98%',fontFamily:'Arial',margin:'10px 0px'}}>
                <SearchSelect  id={`officerInChargeMaintenance_clinic_select_${index}`} onChange={(e) => {this.handleDropdownChanged(e,item,index);}} options={[]} value={value} />
            </FormControl>);
          }
        }
      ],
      tableOptions: {
        rowHover: true,
        rowsPerPage: 5,
        onSelectIdName: 'ehrId',
        bodyCellStyle: this.props.classes.customRowStyle,
        headRowStyle: this.props.classes.headRowStyle,
        headCellStyle: this.props.classes.headCellStyle
      },
      ioeReminderInstructionId:null
    };
  }

  componentDidMount() {
    this.props.ensureDidMount();
    this.initData();
    this.props.updateCurTab(accessRightEnum.tokenTemplateMaintenance, this.doClose);
    this.insertofficerInChargeMaintenanceLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} Office In Charge Maintenance`, 'user/commonRoles/CIMS-DOCTOR/users');
  }

  initData = () => {
    const { loginInfo = {}, common} = this.props;
    let {clinic,isServiceAdmin,isClinicalAdmin}  = loginInfo;
    const {clinicList } = common;
    let clinicOption=[];
    // Generate clinic Dropdown List
    if(useroIsServiceAdminSetting()){
        clinicOption = clinicList.filter(item => {
            return item.serviceCd === loginInfo.service.serviceCd;
        });
    }else if(userIsClinicaSetting()){
        clinicOption = clinicList.filter(item => {
            return item.serviceCd === loginInfo.service.serviceCd&&item.clinicCd===clinic.clinicCd;
        });
    }

    let {serviceCd}=this.state;
    let params = {};
    params.roleName='CIMS-DOCTOR';
    params.userSvcCd =serviceCd;
    params.userSiteId =clinic.siteId;
    let doctors=[];
    this.props.getOfficerDoctorDropdownList({params, callback:(data)=>{
         doctors=data.data.map(item => {
             let salutation=item.salutation;
             if(salutation===undefined||salutation===null){
                salutation='';
             }else{
                salutation=salutation+' ';
             }
            return { value: item.userId, title: salutation+item.engSurname+' '+item.engGivName };
        });
        let tableRows=[
            { name: 'clinicName', width: 500, label: 'Clinic Name' },
            {
              name: 'userInCharge', label: 'Responsible Doctor', width: 130, customBodyRender: (value,item,index) => {
                return(
                <FormControl id={'officerInChargeMaintenance_formControl_clinic_select'+index} style={{width:'98%',fontFamily:'Arial',margin:'10px 0px'}}>
                    <SearchSelect  id={'officerInChargeMaintenance_clinic_select'+index} onChange={(e) => {this.handleDropdownChanged(e,item,index);}} options={doctors} value={_.toNumber(value)} />
                </FormControl>);
              }
            }
          ];
        this.setState({
            doctorList:doctors,
            tableRows,
            clinicOption:_.cloneDeep(clinicOption),
            isChange:false
          });
        this.props.closeCommonCircularDialog();//关闭保存等待页面
      }});
  };

    //关闭close tab
  doClose = (callback) => {
    let editFlag = this.state.isChange;
    if (editFlag) {
      this.props.openCommonMessage({
        msgCode: COMMON_CODE.SAVE_WARING,
        btnActions: {
          btn1Click: () => {
            this.handleClickSave();
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Officer In ChargeMaintenance');
            this.insertofficerInChargeMaintenanceLog(name,'/ioe/saveOfficerInChange');
            setInterval(callback(true), 1000);
          }, btn2Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Officer In ChargeMaintenance');
            this.insertofficerInChargeMaintenanceLog(name,'');
            callback(true);
          }, btn3Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Officer In ChargeMaintenance');
            this.insertofficerInChargeMaintenanceLog(name, '');
          }
        },
        params: [
          {
            name: 'title',
            value: 'Officer In ChargeMaintenance'
          }
        ]
      });
    }
    else {
      this.insertofficerInChargeMaintenanceLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Office In Charge Maintenance`, '');
      callback(true);
    }
  }
    handleDropdownChanged= (value,item,index) => {
      let { clinicOption } = this.state;
      clinicOption[index].userInCharge = value;
      clinicOption[index].operationType = COMMON_ACTION_TYPE.UPDATE;
      this.setState({
        clinicOption,
        isChange: true
      });
    }
  //获得选中行数据
  getSelectRow = (data) => {
      this.setState({
        seq: data.seq,
        selectRow:data.seq,
        selectObj:data
      });
    }
  //检查是否选中行数据，未选中提示相应提示
  checkSelect(msgCode){
    if(this.state.seq===null){
      let payload = {
        msgCode:msgCode,
        btnActions: {
          // Yes
          btn1Click: () => {
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
  }


  handleClickSave = (saveCallback) => {
    let clinicOption = _.cloneDeep(this.state.clinicOption);
    let params = [];
    // Generate clinic Dropdown List
    params = clinicOption.map(item => {
      return { siteId: item.siteId, userId: item.userInCharge + '', operationType: item.operationType };
    });
    this.props.openCommonCircularDialog();//打开保存等待页面，后台调用返回后关闭
    this.props.saveOfficerDoctorList({
      params, callback: (data) => {
        let payload = {
          msgCode: data.msgCode,
          showSnackbar: true, //切换左下角（Snackbar）successfully 消息条
          btnActions: {
          }
        };
        this.props.listClinic({});
        _.delay(() => {
          this.initData();
        }, 1000);
        this.props.openCommonMessage(payload);
        if (typeof saveCallback != 'function' || saveCallback === undefined) {
          this.insertofficerInChargeMaintenanceLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' Button`, '/ioe/saveOfficerInChange');
          return false;
        } else {
          saveCallback();
        }
      }
    });
  }

  handleClickCancel = () => {
    let isChange = this.state.isChange;
    if (isChange){
      let payload = {
        msgCode :COMMON_CODE.SAVE_WARING,
        btnActions : {
          btn1Click: () => {
            this.insertofficerInChargeMaintenanceLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Cancel' button`, '');
            this.initData();
          }
        }
      };
      this.props.openCommonMessage(payload);
    }else {
      this.initData();
    }
  }
  insertofficerInChargeMaintenanceLog = (desc, apiName = '', content = null) => {
    commonUtils.commonInsertLog(apiName, 'F129', 'Officer In Charge Maintenance', desc, 'ioe', content);
  };
  handleCancelLog = (name,apiName='') => {
    this.insertofficerInChargeMaintenanceLog(name, apiName);
  }

  render() {
    const { classes} = this.props;
    const buttonBar = {
      isEdit: this.state.isChange,
      title:'Officer In Charge Maintenance',
      logSaveApi: '/ioe/saveOfficerInChange',
      saveFuntion:this.handleClickSave,
      handleCancelLog:this.handleCancelLog,
      position: 'fixed',
      buttons: [
        {
          title: 'Save',
          onClick: this.handleClickSave,
          id: 'btn_officerInChargeMaintenance_save'
        }
      ]
    };
    return (
      <Container buttonBar={buttonBar} className={classes.wrapper}>
        <Card className={classes.bigContainer}>
          <CardHeader
              classes={{
                root:classes.cardHeader
              }}
              titleTypographyProps={{
                style:{
                  fontSize: '1.5rem',
                fontFamily: 'Arial'}
              }}
              title={`${en_US.officerInCharge.label_title} (${this.state.serviceCd})`}
          />
            <CardContent style={{paddingTop: 0}}>
              <div className={classes.topDiv}>
                <Typography
                    component="div"
                    style={{marginBottom: 0, marginLeft: 5, marginRight: 5, marginTop: 5, backgroundColor: '#ffffff' }}
                >
                  <Grid container
                      style={{ marginTop: -10,marginLeft:-8 }}
                  >
                    <label
                        id="officerInChargeMaintenance_clinic_lable"
                        className={classes.left_Label}
                    >Clinic: {this.state.clinicEngDesc}</label>
                  </Grid>
                </Typography>
              </div>
              <div className={classes.tableDiv}>
                <CIMSTable
                    data={this.state.clinicOption}
                    getSelectRow={this.getSelectRow}
                    id="officerInChargeMaintenance_table"
                    options={this.state.tableOptions}
                    rows={this.state.tableRows}
                    rowsPerPage={this.state.pageNum}
                    // selectRow={this.state.selectRow}
                    style={{marginTop:20}}
                    classes={{
                      label:classes.fontLabel
                    }}
                />
              </div>
            </CardContent>
        </Card>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    tokenTemplateList: state.tokenTemplateManagement.tokenTemplateList,
    sysConfig:state.clinicalNote.sysConfig,
    loginInfo: {
        ...state.login.loginInfo,
        service: state.login.service,
        clinic: state.login.clinic,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin:state.login.isClinicalAdmin
      },
      common: state.common,
      mainFrame: state.mainFrame,
      patientInfo: state.patient.patientInfo
  };
}
const mapDispatchToProps = {
    openCommonMessage,
    openCommonCircularDialog,
    updateCurTab,
    closeCommonCircularDialog,
    getOfficerDoctorDropdownList,
    saveOfficerDoctorList,
    listClinic
  };
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(style)(OfficerInChargeMaintenance));
