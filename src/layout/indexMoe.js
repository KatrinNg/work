import React, { Component } from 'react';
import { connect } from 'react-redux';
import { openErrorMessage, closeErrorMessage } from '../store/actions/common/commonAction';
import { logout, saveDrug, updateField } from '../store/actions/moe/moeAction';
//import MoePatientPanel from './moe/compontent/moePatientPanel';
import {
  Grid,
  MenuItem,
  Button,
  TextField,
  InputBase,
  Select,
  OutlinedInput
} from '@material-ui/core';
//import SelectFieldValidator from '../components/FormValidator/SelectFieldValidator';
import Moe from '../views/moe/moe';
import moment from 'moment';
import { KeyboardDatePicker } from '@material-ui/pickers';
import CommonErrorDialog from '../views/compontent/commonDialog/commonErrorDialog';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import Enum from '../enums/enum';
import {
  openCommonMessage
} from '../store/actions/message/messageAction';
import CommonCircular from '../views/compontent/commonProgress/commonCircular';
import CIMSMessageDialog from '../components/Dialog/CIMSMessageDialog';
import MessageSnackbar from '../components/Snackbar/MessageSnackbar/MessageSnackbar';
// import * as commonUtilities from '../utilities/commonUtilities';

// const defParams = '{' +
//   '"appName":"CIMS","apptDate":"' + moment().format('YYYY-MM-DD') + '","apptHospitalCd":"KFC","apptSpec":"FCS","user":' +
//   '{' +
//   '"actionCd":"","admDtm":"2018-08-01","age":"12 YEAR","attDrName":"","bedNum":"302","chiName":"手動品控","classNum":"","conDrName":"",' +
//   '"detailsCd":"","disDtm":"","dob":"2007-08-28","docNum":"","docTypeCd":"AR","dod":"0","ehrNum":"","enableHtmlPrinting":"","engGivenName":"QUALITY",' +
//   '"engSurName":"MANUAL","genderCd":"U","homePhone":"","hospitalCd":"KFC","hospitalName":"","loginId":"ADMIN3","loginName":"ADMIN3","maritalCd":"",' +
//   '"mobilePhone":"","mrnDisplayLabelE":"","mrnDisplayLabelP":"","mrnDisplayTypeCd":"","mrnPatientEncounterNum":"' + moment().format('YYMMDD') + '","mrnPatientIdentity":120,' +
//   '"nationCd":"","officePhone":"","orderNum":0,"otherName":"","otherPhone":"","patientStatus":"","patientStatusLabel":"","patientTypeCd":"O",' +
//   '"photoContent":"","photoContentType":"","prescTypeCd":"O","religionCd":"","residentialAddress":"","sourceSystem":"","spec":"FCS",' +
//   '"systemLogin":"MOE","userRankCd":"MO","userRankDesc":"Medical Officer","ward":"A5"' +
//   '},"version":"1.0.1"' +
//   '}';

const defParams = '{' +
  '"appName":"CIMS","apptDate":"' + moment().format(Enum.DATE_FORMAT_EYMD_VALUE) + '","apptHospitalCd":"KFC","apptSpec":"FCS","user":' +
  '{' +
  '"actionCd":"","admDtm":"2018-08-01","age":"12 YEAR","attDrName":"","bedNum":"302","chiName":"手動品控","classNum":"","conDrName":"",' +
  '"detailsCd":"","disDtm":"","dob":"2007-08-28","docNum":"","docTypeCd":"AR","dod":"0","ehrNum":"","enableHtmlPrinting":"","engGivenName":"QUALITY",' +
  '"engSurName":"MANUAL","genderCd":"U","homePhone":"","hospitalCd":"KFC","hospitalName":"","loginId":"ADMIN3","loginName":"ADMIN3","maritalCd":"",' +
  '"mobilePhone":"","mrnDisplayLabelE":"","mrnDisplayLabelP":"","mrnDisplayTypeCd":"","mrnPatientEncounterNum":"' + moment().format('YYMMDD') + '","mrnPatientIdentity":120,' +
  '"nationCd":"","officePhone":"","orderNum":0,"otherName":"","otherPhone":"","patientStatus":"","patientStatusLabel":"","patientTypeCd":"O",' +
  '"photoContent":"","photoContentType":"","prescTypeCd":"O","religionCd":"","residentialAddress":"","sourceSystem":"","spec":"FCS",' +
  '"systemLogin":"MOE","userRankCd":"MO","userRankDesc":"Medical Officer","ward":"A5"' +
  '},"version":"1.0.1"' +
  '}';

class IndexMoe extends Component {

  state = {
    moeType: 'create',
    moeTypeList: [
      { label: 'create', value: 'create' },
      { label: 'edit or backdate', value: 'edit' },
      { label: 'enquiry', value: 'enquiry' }],
    showMoe: false,
    // dateFormat: 'DD-MM-YYYY',
    // dataDateFormat: 'YYYY-MM-DD',
    // orderBackDate: moment().format('YYYY-MM-DD'),
    dateFormat: Enum.DATE_FORMAT_EDMY_VALUE,
    dataDateFormat: Enum.DATE_FORMAT_EYMD_VALUE,
    orderBackDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
    mrnPatientEncounterNum: moment().format('YYMMDD'),
    mrnPatientIdentity: 120,
    paramsStr: defParams,
    moePatientParams: ''
  }

  componentDidMount() {
    this.openIndexMoe = true;
  }

  getQueryVariables = () => {
    let result = {};
    let querys1 = window.location.href.split('?');
    let query1 = querys1.length > 1 ? querys1[1] : querys1[0];
    let querys2 = query1.split('#');
    let query2 = querys2[0];
    let vars = query2.split('&');
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split('=');
      result[pair[0]] = decodeURIComponent(pair[1]);
    }
    return result;
  }

  handleChangeMoeType = (e) => {
    // let moePatient = JSON.parse(this.state.paramsStr);
    let orderBackDate = e.target.value === this.state.moeTypeList[0].value ? moment().format(this.state.dataDateFormat)
      : e.target.value === this.state.moeTypeList[1].value ? moment().add(-5, 'days').format(this.state.dataDateFormat)
        : moment().add(-15, 'days').format(this.state.dataDateFormat);
    let caseNo = (e.target.value === this.state.moeTypeList[0].value ? moment().format('YYMMDD')
      : e.target.value === this.state.moeTypeList[1].value ? moment().add(-5, 'days').format('YYMMDD')
        : moment().add(-15, 'days').format('YYMMDD'));
    // moePatient.user.mrnPatientEncounterNum = caseNo;
    this.setState({
      moeType: e.target.value,
      orderBackDate: orderBackDate,
      mrnPatientEncounterNum: caseNo
      // paramsStr: JSON.stringify(moePatient)
    });
  }

  saveDrug(newDrugList, isDeleteOrder, callback, isSubmit) {
    this.props.saveDrug(this.props.codeList, newDrugList, this.props.orderData, this.props.loginInfo.user, isDeleteOrder, true, callback, null, isSubmit);
    this.props.updateField({ 'existDrugList': null });
  }

  login = () => {
    try {
      let moePatient = JSON.parse(this.state.paramsStr);
      // if (!moment(moePatient.apptDate).isValid('YYYY-MM-DD')) {
      //   this.props.openErrorMessage('Invalid Order Date');
      //   return;
      // }
      if (!moment(moePatient.apptDate).isValid(Enum.DATE_FORMAT_EYMD_VALUE)) {
        this.props.openErrorMessage('Invalid Order Date');
        return;
      }
      this.setState({
        showMoe: true,
        moePatientParams: moePatient
      });
    }
    catch (ex) {
      this.props.openErrorMessage('Invalid JSON Format');
    }
  }

  logout = (event) => {
    let callback = () => {
      this.setState({ showMoe: false}, () => {
        if (typeof (event) === 'function') {
          event();
        }
      });
    };

    this.props.logout(callback);
  }

  transferToParams = () => {
    try {
      let moePatient = JSON.parse(this.state.paramsStr);
      moePatient.apptDate = moment(this.state.orderBackDate).format(this.state.dataDateFormat);
      moePatient.user.mrnPatientEncounterNum = this.state.mrnPatientEncounterNum;
      moePatient.user.mrnPatientIdentity = this.state.mrnPatientIdentity;
      this.setState({
        paramsStr: JSON.stringify(moePatient)
      });
    }
    catch (ex) {
      this.props.openErrorMessage('Invalid JSON Format');
    }
  }

  resetParams = () => {
    this.setState({ paramsStr: defParams });
  }

  handleChange = (date) => {
    this.setState({
      orderBackDate: date.format(this.state.dataDateFormat),
      mrnPatientEncounterNum: moment(date).format('YYMMDD')
    });
  }

  handleToggle = (e) => {
    const name = e.target.name;
    this.setState({
      [name]: e.target.value
    });
    // switch (e.target.id){
    //   case 'moe_PatientEncounterNum_TextField':
    //     this.setState({
    //       mrnPatientEncounterNum:e.target.value
    //     });
    //     break;
    //   case 'moe_PatientIdentity_TextField':
    //     this.setState({
    //       mrnPatientIdentity:e.target.value
    //     });
    //     break;
    //   case 'moe_ParamsStr_TextField':{
    //     this.setState({
    //       paramsStr: e.target.value
    //     });
    //     break;
    //   }
    //   default: break;
    // }

  }

  render() {
    let values = this.getQueryVariables();
    sessionStorage.setItem('moePatient', JSON.stringify(values));
    return (
      <Grid>
        <Grid container justify="space-between">
          <Grid item>
          </Grid>
          <Grid item>
            <Button onClick={this.logout}>LOGOUT</Button>
          </Grid>
        </Grid>
        {this.state.showMoe && <Moe presciptionClasses={this.props.classes} moePatient={this.state.moePatientParams} logout={this.logout} isSelectedPrescription openIndexMoe={this.openIndexMoe}></Moe>}
        {!this.state.showMoe &&
          <div style={{ overflow: 'hidden' }}>
            <h1 style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '25px' }}>Parameters</h1>
            <hr />
            <Grid container style={{ paddingLeft: '20px', marginTop: '20px' }} spacing={1}>
              <Grid item xs={4}>
                <Grid container wrap="nowrap" spacing={1}>
                  <Grid item xs={5}>
                    <label style={{ fontWeight: 'bold' }}>Mode:</label>
                  </Grid>
                  <Grid item xs={7}>
                    <Select
                        id={'moeTypeSelect'}
                        value={this.state.moeType}
                        onChange={this.handleChangeMoeType}
                        options={this.state.moeTypeList}
                        input={<OutlinedInput style={{ width: '100%', maxWidth: '210px' }} />}
                    >
                      <MenuItem value={this.state.moeTypeList[0].value}>{this.state.moeTypeList[0].label}</MenuItem>
                      <MenuItem value={this.state.moeTypeList[1].value}>{this.state.moeTypeList[1].label}</MenuItem>
                      <MenuItem value={this.state.moeTypeList[2].value}>{this.state.moeTypeList[2].label}</MenuItem>
                    </Select>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4}></Grid>
              <Grid item xs={4}></Grid>
              <Grid item xs={4}>
                <Grid container wrap="nowrap" spacing={1}>
                  <Grid item xs={5}>
                    <label style={{ fontWeight: 'bold' }}>Order Date & Back Date:</label>
                  </Grid>
                  <Grid item xs={7}>
                    <KeyboardDatePicker
                        id="moe_OrderBackDate_dpk"
                        onChange={this.handleChange}
                        onAccept={this.handleAccept}
                        format={this.state.dateFormat}
                        openTo="date"
                        inputVariant={'outlined'}
                        placeholder={moment().format(this.state.dateFormat)}
                        value={this.state.orderBackDate}
                        KeyboardButtonProps={{
                        style: { padding: 2, position: 'absolute', right: 0 },
                        tabIndex: -1
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4}>
                <Grid container spacing={1} wrap="nowrap">
                  <Grid item xs={5}>
                    <label style={{ fontWeight: 'bold' }}>MRN Patient Encounter Num:</label>
                  </Grid>
                  <Grid item xs={7}>
                    <TextField
                        id={'moe_PatientEncounterNum_TextField'}
                        variant="outlined"
                        autoComplete={'off'}
                        onChange={this.handleToggle}
                        name={'mrnPatientEncounterNum'}
                        value={this.state.mrnPatientEncounterNum}
                        inputProps={{
                        maxLength: 256
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4}>
                <Grid container spacing={1} wrap="nowrap">
                  <Grid item xs={5}>
                    <label style={{ fontWeight: 'bold' }}>MRN Patient Identity:</label>
                  </Grid>
                  <Grid item xs={7}>
                    <TextField
                        id={'moe_PatientIdentity_TextField'}
                        variant="outlined"
                        autoComplete={'off'}
                        onChange={this.handleToggle}
                        name={'mrnPatientIdentity'}
                        value={this.state.mrnPatientIdentity}
                        inputProps={{
                        maxLength: 256
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} style={{ margin: '10px 0' }}>
                <Grid container justify="center">
                  <Button aria-label="Transfer" size="small" onClick={this.transferToParams} variant="contained">
                    <ArrowDownwardIcon fontSize="inherit" />
                  </Button>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1} wrap="nowrap">
                  <Grid item>
                    <label style={{ fontWeight: 'bold' }}>Params:</label>
                  </Grid>
                  <Grid item xs={11}>
                    <InputBase
                        id={'moe_ParamsStr_TextField'}
                        fullWidth
                        autoComplete={'off'}
                        onChange={this.handleToggle}
                        name={'paramsStr'}
                        multiline
                        rows={'10'}
                        style={{
                        height: `${24 * 10}px`,
                        border: '1px solid #B8BCB9',
                        display: 'inline-block',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        borderRadius: '5px',
                        wordBreak: 'break-all'
                      }}
                        value={this.state.paramsStr}
                        inputProps={{
                        maxLength: 5000
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} style={{ margin: '10px 0' }}>
                <Grid container justify="center" spacing={2}>
                  <Grid item>
                    <Button size="small" variant="contained" color="primary" onClick={this.login}>LOGIN</Button>
                  </Grid>
                  <Grid item>
                    <Button size="small" onClick={this.resetParams} variant="contained">
                      Reset Params
                  </Button>
                  </Grid>

                </Grid>
              </Grid>
            </Grid>
          </div>
        }
        <CommonErrorDialog />
        <CommonCircular />
        <CIMSMessageDialog />
        <MessageSnackbar />
      </Grid>
    );
  }
}
function mapStateToProps(state) {
  return {
    moePatient: state.moePatient,
    orderData: state.moe.orderData,
    codeList: state.moe.codeList,
    loginInfo: state.moe.loginInfo
  };
}

const mapDispatchToProps = {
  logout,
  openErrorMessage,
  closeErrorMessage,
  openCommonMessage,
  saveDrug,
  updateField
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexMoe);
