import React,{Component} from 'react';
import Form from '../../../../../../components/JForm';
import {MenuItem,Switch,FormControlLabel,Checkbox, FormGroup, Input} from '@material-ui/core';
import Select from '../../../../../../components/JSelect';
import DatePicker from '../IxEnquiryDate/DatePicker';
import CIMSButton from '../../../../../../components/Buttons/CIMSButton';
import { cloneDeep,trim } from 'lodash';
import moment from 'moment';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import * as commonUtils from '../../../../../../utilities/josCommonUtilties';
import * as messageTypes from '../../../../../../store/actions/message/messageActionType';
import Enum from '../../../../../../enums/enum';
import * as commonConstants from '../../../../../../constants/common/commonConstants';
import {getState} from '../../../../../../store/util';
import _ from 'lodash';
import * as commonActionType from '../../../../../../store/actions/common/commonActionType';

const { color, font } = getState(state => state.cimsStyle) || {};

const customTheme = (theme) => createMuiTheme({
  ...theme,
  overrides: {
    ...theme.overrides,
    MuiPaper:{
      root:{
        backgroundColor:color.cimsBackgroundColor
      }
    },
    MuiInputBase: {
      ...theme.overrides.MuiInputBase,
      root: {
        height: 39,
        color:color.cimsTextColor
      }
    },
    MuiPickersCalendarHeader:{
      iconButton:{
        backgroundColor:color.cimsBackgroundColor
      }
    },
    MuiFormLabel:{
      root:{
        color: color.cimsPlaceholderColor
      }
    },
    MuiInputLabel: {
      shrink: {
        color: `${color.cimsLabelColor} !important`
      }
    },
    MuiFormControlLabel:{
      label:{
        MuiDisabled:{
          color: color.cimsPlaceholderColor
        }
      }
    }
  }
});

class Filter extends Component {
  constructor(props){
    super(props);
    let clinicNoChange=[];
    let owneClinic = commonUtils.getOwnClinic();
    this.props.mode==='patient' && this.initServiceListAndClinicList('/ioe');
    clinicNoChange=cloneDeep(this.props.options.clinicOptions).filter(item=>item.value===JSON.parse(sessionStorage.getItem('clinic')).clinicCd);
    this.state={
      ix:'request',
      exp:false,
      followUpStatus:'A',
      clinicCd:owneClinic?owneClinic:clinicNoChange.length>0?JSON.parse(sessionStorage.getItem('clinic')).clinicCd:(this.props.options.clinicOptions.length>0?this.props.options.clinicOptions[0].value:' '),
      emptyList:[{value:' ', title: '---Please Select---'}],
      fromDate:null,
      toDate:null,
      // clinicCdList:this.props.options.clinicOptions.filter(item=>item.value===this.props.loginInfo.clinic.code),
      requestBy:'ALL',
      // serviceCd: this.props.mode==='clinic'?'':JSON.parse(sessionStorage.getItem('service')).serviceCd,
      radioCheck:false,
      dataPlaceHolder:'',
      toLabel:'From',
      toEndLabel:'To',
      labelTitle:'Request Date',
      errorFromDate: false,
      errorToDate: false,
      clinicOptions:[],
      serviceOptions:[]
    };
  }

  initServiceListAndClinicList = (apiFunctionName) =>{
    const { dispatch, patientInfo, loginInfo, onSearch }=this.props;
    let { patientKey } = patientInfo;
    let params = {
      apiFunctionName:apiFunctionName,
      patientKey : patientKey
    };
    dispatch({
      type:commonActionType.GET_COMMON_SERVICED_LIST,
      params,
      callback : (data) => {
        let serviceOptions = commonUtils.getServiceListByServiceCdList(data);
        let clinicOptions = commonUtils.getClinicListByServiceCd(loginInfo.service.code);
        let serviceCdIsExist = _.find(serviceOptions,{ 'value': loginInfo.service.code });
        let owneClinic = commonUtils.getOwnClinic();
        let params = {
          followUpStatus: 'A',
          formId: '0',
          fromDate: '',
          ix: 'request',
          serviceCd: serviceOptions.length == 1 || !serviceCdIsExist ? 'ALL' : loginInfo.service.code,
          clinicCd: serviceOptions.length == 1 || !serviceCdIsExist ? 'ALL' : (owneClinic ? owneClinic : loginInfo.clinic.code),
          toDate: '',
          turnaroundTime: '0'
        };
        onSearch && onSearch(params);
        this.setState({
          clinicOptions,
          serviceOptions,
          serviceCd: serviceOptions.length == 1 || !serviceCdIsExist ? 'ALL' : loginInfo.service.code,
          clinicCd: serviceOptions.length == 1 || !serviceCdIsExist ? 'ALL' : (owneClinic ? owneClinic : loginInfo.clinic.code)
        });
      }
    });
  }

  handleChangeRequest=()=>{
    if(trim(this.state.fromDate)!=''&&trim(this.state.toDate)===''){
        this.setState({ix:'request',radioCheck:false,labelTitle:'Request Date',toLabel:'Request Date (From)'});
    }else if(trim(this.state.toDate)!=''&&trim(this.state.fromDate)===''){
        this.setState({ix:'request',radioCheck:false,labelTitle:'Request Date',toEndLabel:'Request Date (To)'});
    }else if(trim(this.state.fromDate)!=''&&trim(this.state.toDate)!=''){
        this.setState({ix:'request',radioCheck:false,labelTitle:'Request Date',toLabel:'Request Date (From)',toEndLabel:'Request Date (To)'});
    }else{
        this.setState({ix:'request',radioCheck:false,labelTitle:'Request Date'});
    }
  }

  handleChangeReport=()=>{
    if(trim(this.state.fromDate)!=''&&trim(this.state.toDate)===''){
        this.setState({ix:'report',radioCheck:true,labelTitle:'Report Received Date',toLabel:'Report Received Date (From)'});
    }else if(trim(this.state.toDate)!=''&&trim(this.state.fromDate)===''){
        this.setState({ix:'report',radioCheck:true,labelTitle:'Report Received Date',toEndLabel:'Report Received Date (To)'});
    }else if(trim(this.state.fromDate)!=''&&trim(this.state.toDate)!=''){
        this.setState({ix:'report',radioCheck:true,labelTitle:'Report Received Date',toLabel:'Report Received Date (From)',toEndLabel:'Report Received Date (To)'});
    }
    else{
        this.setState({ix:'report',radioCheck:true,labelTitle:'Report Received Date'});
    }
}
  toggleSwitch=(e,status)=>{
    this.setState({exp:status});
  }

  followUpStatusChange=(value)=>{
    this.setState({followUpStatus:value});
  }

  fromDateChange=(value)=>{
    let { toDate,radioCheck } = this.state;
    this.compareToDateAndFormDate(toDate, value);
    this.setState({
      fromDate:value !== null&&value !== '' ? moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) : null,
      toLabel: radioCheck ? 'Report Received Date (From)' : 'Request Date (From)'
    });
  }
  toDateChange=(value)=>{
    let { fromDate,radioCheck } = this.state;
    this.compareToDateAndFormDate(value, fromDate);
    this.setState({
      toDate: value !== null && value !== '' ? moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) : null,
      toEndLabel: radioCheck ? 'Report Received Date (To)' : 'Request Date (To)'
    });
  }

  compareToDateAndFormDate = (toDate, fromDate) => {
    let fromDateFlag = false;
    let toDateFlag = false;
    if (fromDate !== null) {
      if (
        moment(fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE) === 'Invalid date' ||
        moment(moment(fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).diff((moment(new Date()).format(Enum.DATE_FORMAT_EDMY_VALUE)))>0 ||
        !moment(moment(fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).isBetween(moment('01-01-1900').format(Enum.DATE_FORMAT_EDMY_VALUE), moment('01-01-2100').format(Enum.DATE_FORMAT_EDMY_VALUE), null, '[]')
      ) {
        fromDateFlag = true;
      }
    }
    if (toDate !== null) {
      if (
        moment(toDate).format(Enum.DATE_FORMAT_EDMY_VALUE) === 'Invalid date' ||
        !moment(moment(toDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).isBetween(moment('01-01-1900').format(Enum.DATE_FORMAT_EDMY_VALUE), moment('01-01-2100').format(Enum.DATE_FORMAT_EDMY_VALUE), null, '[]')
      ) {
        toDateFlag = true;
      }
    }
    if ((!fromDateFlag && !toDateFlag) || (fromDateFlag && !toDateFlag)) {
      if (moment(toDate).format(Enum.DATE_FORMAT_EDMY_VALUE) !== 'Invalid date' && moment(fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE) !== 'Invalid date') {
         if(moment(moment(fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).diff((moment(toDate).format(Enum.DATE_FORMAT_EDMY_VALUE)))>0){
          let payload = { msgCode: '101001', showSnackbar: true };
          this.props.dispatch({ type: messageTypes.OPEN_COMMON_MESSAGE, payload });
          fromDateFlag = true;
          toDateFlag = true;
        }
      }
    }
    this.setState({ errorFromDate: fromDateFlag, errorToDate: toDateFlag });
  }

  handleServiceCdChange=(value)=>{
    let { loginInfo } = this.props;
    let { service, clinic } = loginInfo;
    let clinicOptions = commonUtils.getClinicListByServiceCd(value);
    let ownerClinic = commonUtils.getOwnClinic();
    this.setState({
      clinicCd:service.code === value ? (ownerClinic ? ownerClinic : clinic.code) : 'ALL',
      serviceCd:value,
      clinicOptions
    });
    this.props.insertIxEnquiryLog(commonConstants.INSERT_LOG_ACTION.Action+commonConstants.INSERT_LOG_STATUS.Select + ` service: ${trim(value)===''?'ALL':value} in drop-down list`, '');
  }

  handleClinicChange=(value)=>{
    let {serviceCd}=this.state;
     this.setState({
      clinicCd:value,
      serviceCd
    });
  }

  handleRequestByChange=(value)=>{
    this.setState({requestBy:value});
  }

  hangdleFormSubmit =(formData)=>{
    const {onSearch}=this.props;
    const {ix}=this.state;
    formData.ix=ix;
    onSearch(formData);
  }

  focusCallBack=(label)=>{
    this.setState({toLabel:label});
  }

  focusCallBackEnd = (label) => {
    this.setState({ toEndLabel: label });
  }


  render(){
    const {mode,options,...rest}=this.props;
    const {forms=[],requestedByList=[]}=options;
    let {serviceCd,clinicCd,serviceOptions,clinicOptions} = this.state;
    // let {clinicOptions=[]}=options;
    return (
      <MuiThemeProvider theme={customTheme}>
        <Form  onSubmit={this.hangdleFormSubmit} {...rest} maxWidth={(100/9+'%')}>
        <FormGroup row maxWidth="5%" style={{paddingTop:20,paddingLeft:4}} minWidth="102px">
        <FormControlLabel
            control={
          <Checkbox
              id={'checkbox_ix_enquiry_report'}
              checked={this.state.radioCheck}
              onChange={this.handleChangeReport}
              color="primary"
          />
        }
            label="Report"
        />
        </FormGroup>

          <FormGroup row maxWidth="6%" style={{paddingTop:20}} minWidth="102px">
          <FormControlLabel
              control={
                <Checkbox
                    id={'checkbox_ix_enquiry_request'}
                    checked={!this.state.radioCheck}
                    onChange={this.handleChangeRequest}
                    color="primary"
                />
              }
              label="Request"
          />
          </FormGroup>
            <DatePicker id="fromDate"  maxDate={moment(new Date()).format('DD-MMM-YYYY')} name="fromDate" originalLabel="From" labelTitle={this.state.labelTitle+' (From)'} label={this.state.toLabel} format="DD-MMM-YYYY" value={this.state.fromDate} onChange={this.fromDateChange} focusCallBack={this.focusCallBack} error={this.state.errorFromDate}/>
            <DatePicker id="toDate"  value={this.state.toDate} name="toDate"  format="DD-MMM-YYYY" label={this.state.toEndLabel} originalLabel="To"  labelTitle={this.state.labelTitle+' (To)'}  onChange={this.toDateChange}  focusCallBack={this.focusCallBackEnd} error={this.state.errorToDate} />
            <Select name="formId" height={39} label="Form Name" options={forms} maxWidth={mode==='clinic'?'20.3%':'19.5%'} flexBasis={mode==='clinic'?'20.3%':'19.5%'}/>
            {mode=='patient'&&<Select name="serviceCd"  height={39} label="Service" options={serviceOptions} onChange={this.handleServiceCdChange} value={serviceCd} maxWidth="7.1%" minWidth="104px"/>}
            {mode=='patient'&& <Select name="clinicCd"  height={39} label="Clinic" maxWidth={mode==='clinic'?'12.1%':'15%'} flexBasis={mode==='clinic'?'12.1%':'15%'}value={clinicCd} onChange={this.handleClinicChange} options={mode==='clinic'?clinicOptions:(clinicOptions.length>0?clinicOptions:this.state.emptyList)} disabled={(trim(clinicCd)==='ALL' && trim(serviceCd)==='ALL' ) ? true : false} readOnly={mode==='clinic'?true:false}/>}
              <Select name="followUpStatus" height={39} label="Follow-up Status" maxWidth="7.1%" disabled={this.state.ix==='request'?true:false} defaultValue={this.state.followUpStatus} >
              <MenuItem value={'A'}>ALL</MenuItem>
              <MenuItem value={'S'}>Screened</MenuItem>
              <MenuItem value={'R'}>Reviewed</MenuItem>
              <MenuItem value={'E'}>Explained</MenuItem>
            </Select>
            {mode=='clinic'&&
            <Select name="requestBy" height={39} label="Requested By"  onChange={this.handleRequestByChange} value={this.state.requestBy} maxWidth="12.3%" flexBasis="12.3%" paddingRight={mode==='clinic'?'0':''}>
              {requestedByList?requestedByList.map((item,index)=>{
            return (<MenuItem key={index} value={item.value}>{item.lable}</MenuItem>);
          }):null}
              </Select>
            }
            {mode == 'clinic' ? <Input name="docType" maxWidth="7.1%" paddingRight={mode === 'clinic' ? '0' : ''} label="PMI/IRN/HKID" type="text" /> : null}
            <FormControlLabel id="turnaroundTime" labelPlacement="top" style={{minWidth:167}} maxWidth="10%" flexBasis="10%"  name="turnaroundTime" control={<Switch checked={this.state.exp} onChange={this.toggleSwitch}  value={this.state.exp?'1':'0'} disabled={this.state.ix==='report'||this.state.ix==='ALL'?true:false} />} label="> Exp Turnaround Time" no-need-input-label />
            <CIMSButton id="Search" maxWidth="6%" style={{ width: '30%' }} type={'submit'} variant="contained" color="primary">Search</CIMSButton>
        </Form>
      </MuiThemeProvider>
    );
  }
}

export default Filter;

