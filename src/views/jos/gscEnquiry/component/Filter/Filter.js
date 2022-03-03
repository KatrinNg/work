import React, { Component } from 'react';
import moment from 'moment';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import DatePicker from '../DatePicker/DatePicker';
import SelectBox from '../SelectBox/SelectBox';
import { FormGroup, FormControl, FormControlLabel, TextField, Grid, InputLabel, Form, Typography } from '@material-ui/core';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import Enum from '../../../../../../src/enums/enum';
import _ from 'lodash';
import { getState } from '../../../../../store/util';
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
      },
      input:{
        padding:'0px 10px'
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
    },
    MuiFormHelperText: {
      root: {
        fontSize: 12,
        color: 'red',
        error: {
          padding: 2
        }
      }
    }
  }
});

class Filter extends Component {
  constructor(props){
    super(props);
    this.state = {
      errReportFromDate: false,
      errReportToDate: false,
      reportFromDate: moment().subtract(6, 'd').format(Enum.DATE_FORMAT_EDMY_VALUE),
      // reportToDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
      reportToDate: moment().format(Enum.DATE_FORMAT_EDMY_VALUE),
      LabNo: '',
      reportLabelTitle: 'Report Date',
      startReportLabel: 'From',
      endReportLabel: 'To',
      reportErrorMsg: null,

      birthFromDate: null,
      birthToDate: null,
      errBirthFromDate: false,
      errBirthToDate: false,
      birthLabelTitle: 'Birth Date',
      startBirthLabel: 'From',
      endBirthLabel: 'To',
      birthErrorMsg: null,
      errMsgReportFromDate: '',
      errMsgReportToDate: '',
      errMsgBirthFromDate: '',
      errMsgBirthToDate: ''
    };
  }

  compareFormDateAndToDate = (fromDate, toDate, target) => {
    let fromDateFlag = false;
    let toDateFlag = false;
    let fromDateMsg = '';
    let toDateMsg = '';
    if (fromDate) {
      fromDate = moment(fromDate, Enum.DATE_FORMAT_EDMY_VALUE).isValid() ? moment(fromDate, Enum.DATE_FORMAT_EDMY_VALUE).format(Enum.DATE_FORMAT_EDMY_VALUE) : fromDate;
      if (moment(fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE) === 'Invalid date') {
        fromDateFlag = true;
        fromDateMsg = 'Invalid Date From';
      }

      if (moment(moment(fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).isBefore(moment('01-01-1900').format(Enum.DATE_FORMAT_EDMY_VALUE))) {
        fromDateFlag = true;
        fromDateMsg = 'Date should not be before minimal date';
      }

      if (moment(moment(fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).isAfter(moment(new Date()).format(Enum.DATE_FORMAT_EDMY_VALUE))) {
        fromDateFlag = true;
        fromDateMsg = 'Date should not be after maximal date';
      }
    }
    if (toDate) {
      toDate = moment(toDate, Enum.DATE_FORMAT_EDMY_VALUE).isValid() ? moment(toDate, Enum.DATE_FORMAT_EDMY_VALUE).format(Enum.DATE_FORMAT_EDMY_VALUE) : toDate;
      if (moment(toDate).format(Enum.DATE_FORMAT_EDMY_VALUE) === 'Invalid date') {
        toDateFlag = true;
        toDateMsg = 'Invalid Date To';
      }

      if (moment(moment(toDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).isBefore(moment('01-01-1900').format(Enum.DATE_FORMAT_EDMY_VALUE))) {
        toDateFlag = true;
        toDateMsg = 'Date should not be before minimal date';
      }

      if (moment(moment(toDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).isAfter(moment(new Date()).format(Enum.DATE_FORMAT_EDMY_VALUE))) {
        toDateFlag = true;
        toDateMsg = 'Date should not be after maximal date';
      }
    }
    if ((fromDate && toDate && !fromDateFlag && !toDateFlag)) {
      if (moment(moment(fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).diff(moment(toDate).format(Enum.DATE_FORMAT_EDMY_VALUE)) > 0) {
        if (target === 'from') {
          fromDateFlag = true;
          fromDateMsg = 'Start date can not after the end date';
        } else {
          toDateFlag = true;
          toDateMsg = 'End date can not before the start date';
        }
      }
    }
    return { fromDateFlag, toDateFlag, fromDateMsg, toDateMsg };
  }

  reportFromDateChange = (value) => {
    const { resetHeight } = this.props;
    let { birthToDate, birthFromDate, reportToDate } = this.state;
    this.handleValidateDate({
      rptRcvDatetimeStart: value,
      rptRcvDatetimeEnd: reportToDate,
      babyDobStart: birthFromDate,
      babyDobEnd: birthToDate
    }, 'from');
    this.setState({
      reportFromDate: value !== null && value !== '' ? moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) : null,
      startReportLabel: 'Report Date (From)'
    });
    resetHeight && resetHeight();
  }

  reportToDateChange = (value) => {
    const { resetHeight } = this.props;
    let { birthToDate, birthFromDate, reportFromDate } = this.state;
    this.handleValidateDate({
      rptRcvDatetimeStart: reportFromDate,
      rptRcvDatetimeEnd: value,
      babyDobStart: birthFromDate,
      babyDobEnd: birthToDate
    }, 'to');
    this.setState({
      reportToDate: value !== null && value !== '' ? moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) : null,
      endReportLabel: 'Report Date (To)'
    });
    resetHeight && resetHeight();
  }

  focusCallBackStartReport = (label) => {
    this.setState({ startReportLabel: label });
  }

  focusCallBackEndReport = (label) => {
    this.setState({ endReportLabel: label });
  }

  birthFormDateChange = (value) => {
    const { resetHeight } = this.props;
    let { birthToDate, reportToDate, reportFromDate } = this.state;
    this.handleValidateDate({
      rptRcvDatetimeStart: reportFromDate,
      rptRcvDatetimeEnd: reportToDate,
      babyDobStart: value,
      babyDobEnd: birthToDate
    }, 'from');
    this.setState({
      birthFromDate: value !== null && value !== '' ? moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) : null,
      startBirthLabel: 'Birth Date (From)'
    });
    resetHeight && resetHeight();
  }

  birthToDateChange = (value) => {
    const { resetHeight } = this.props;
    let { birthFromDate, reportToDate, reportFromDate } = this.state;
    this.handleValidateDate({
      rptRcvDatetimeStart: reportFromDate,
      rptRcvDatetimeEnd: reportToDate,
      babyDobStart: birthFromDate,
      babyDobEnd: value
    }, 'to');
    this.setState({
      birthToDate: value !== null && value !== '' ? moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) : null,
      endBirthLabel: 'Birth Date (To)'
    });
    resetHeight && resetHeight();
  }

  focusCallBackStartBirth = (label) => {
    this.setState({ startBirthLabel: label });
  }

  focusCallBackEndBirth = (label) => {
    this.setState({ endBirthLabel: label });
  }

  handleChangeText = (event) => {
    this.setState({ LabNo: this.cutOutString(event.target.value, 20) });
  }

  handleOnChange = (event) => {
    const { onChangeDrop } = this.props;
    onChangeDrop && onChangeDrop(event);
  }

  handleBlur = (event) => {
    let value = _.trim(event.target.value);
    this.setState({ LabNo: value });
  }

  cutOutString = (value, maxValue) => {
    let countIn = 0;
    let realCount = 0;
    for (let i = 0; i < value.length; i++) {
      const element = value.charCodeAt(i);
      if (element >= 0 && element <= 255) {
        if (countIn + 1 > maxValue) {
          break;
        } else {
          countIn += 1;
          realCount++;
        }
      } else {
        if (countIn + 3 > maxValue) {
          break;
        } else {
          countIn += 3;
          realCount++;
        }
      }
    }
    return value ? value.slice(0, realCount) : value;
  }

  handleValidateDate = (params, target) => {
    let errorFlag = false;
    let errReportFromDate = false;
    let errReportToDate = false;
    let errBirthFromDate = false;
    let errBirthToDate = false;
    let errMsgBirthFromDate = '';
    let errMsgBirthToDate = '';
    let errMsgReportFromDate = '';
    let errMsgReportToDate = '';

    if (!params.rptRcvDatetimeStart && !params.rptRcvDatetimeEnd && !params.babyDobStart && !params.babyDobEnd) {
      errReportFromDate = true;
      errReportToDate = true;
      errBirthFromDate = true;
      errBirthToDate = true;
      errMsgBirthFromDate = errMsgBirthToDate = errMsgReportFromDate = errMsgReportToDate = 'Please input search date range.';
      errorFlag = true;
    }
    if ((!params.rptRcvDatetimeStart && params.rptRcvDatetimeEnd) || (params.rptRcvDatetimeStart && !params.rptRcvDatetimeEnd)) {
      errReportFromDate = !params.rptRcvDatetimeStart;
      errReportToDate = !params.rptRcvDatetimeEnd;
      errMsgReportFromDate = !params.rptRcvDatetimeStart ? 'Please input search date range.' : '';
      errMsgReportToDate = !params.rptRcvDatetimeEnd ? 'Please input search date range.' : '';
      errorFlag = true;
    }
    if ((!params.babyDobStart && params.babyDobEnd) || (params.babyDobStart && !params.babyDobEnd)) {
      errBirthFromDate = !params.babyDobStart;
      errBirthToDate = !params.babyDobEnd;
      errMsgBirthFromDate = !params.babyDobStart ? 'Please input search date range.' : '';
      errMsgBirthToDate = !params.babyDobEnd ? 'Please input search date range.' : '';
      errorFlag = true;
    }

    const { fromDateFlag: reportFromDateFlag, toDateFlag: reportToDateFlag, fromDateMsg: reportFromDateErrorMsg, toDateMsg: reportToDateErrorMsg } = this.compareFormDateAndToDate(params.rptRcvDatetimeStart, params.rptRcvDatetimeEnd, target);
    if (reportFromDateFlag) {
      errReportFromDate = reportFromDateFlag;
      errMsgReportFromDate = reportFromDateErrorMsg;
    }
    if (reportToDateFlag) {
      errReportToDate = reportToDateFlag;
      errMsgReportToDate = reportToDateErrorMsg;
    }
    const { fromDateFlag: birthFromDateFlag, toDateFlag: birthToDateFlag, fromDateMsg: birthFromDateErrorMsg, toDateMsg: birthToDateErrorMsg } = this.compareFormDateAndToDate(params.babyDobStart, params.babyDobEnd, target);
    if (birthFromDateFlag) {
      errBirthFromDate = birthFromDateFlag;
      errMsgBirthFromDate = birthFromDateErrorMsg;
    }
    if (birthToDateFlag) {
      errBirthToDate = birthToDateFlag;
      errMsgBirthToDate = birthToDateErrorMsg;
    }
    this.setState({
      errReportFromDate,
      errReportToDate,
      errBirthFromDate,
      errBirthToDate,
      errMsgBirthFromDate,
      errMsgBirthToDate,
      errMsgReportFromDate,
      errMsgReportToDate
    });
    errorFlag = errorFlag || reportFromDateFlag || reportToDateFlag || birthFromDateFlag || birthToDateFlag;
    return errorFlag;
  }

  hangdleFormSubmit = (e) => {
    const { onSearch } = this.props;
    e.preventDefault();
    let params = {};
    let form = e.target;
    for (let index = 0; index < form.length; index++) {
      const element = form[index].name;
      if (element) {
        params[element] = form[element].value;
      }
    }
    let errorFlag = this.handleValidateDate(params);
    params.diagnosis = params.diagnosis === 'All' ? '' : params.diagnosis;
    params.result = params.result === 'All' ? '' : params.result;
    params.screening = params.screening === 'All' ? '' : params.screening;
    params.docSts = params.docSts === 'All' ? '' : params.docSts;
    params.birthplaceCod = params.birthplaceCod === 'All' ? '' : params.birthplaceCod;
    params.rslt = params.rslt === 'All' ? '' : params.rslt;
    if (!errorFlag) {
      params.rptRcvDatetimeStart = moment(params.rptRcvDatetimeStart, Enum.DATE_FORMAT_FOCUS_DMY_VALUE).isValid() ? moment(params.rptRcvDatetimeStart, Enum.DATE_FORMAT_FOCUS_DMY_VALUE).format(Enum.DATE_FORMAT_EDMY_VALUE) : params.rptRcvDatetimeStart;
      params.rptRcvDatetimeEnd = moment(params.rptRcvDatetimeEnd, Enum.DATE_FORMAT_FOCUS_DMY_VALUE).isValid() ? moment(params.rptRcvDatetimeEnd, Enum.DATE_FORMAT_FOCUS_DMY_VALUE).format(Enum.DATE_FORMAT_EDMY_VALUE) : params.rptRcvDatetimeEnd;
      params.babyDobStart = moment(params.babyDobStart, Enum.DATE_FORMAT_FOCUS_DMY_VALUE).isValid() ? moment(params.babyDobStart, Enum.DATE_FORMAT_FOCUS_DMY_VALUE).format(Enum.DATE_FORMAT_EDMY_VALUE) : params.babyDobStart;
      params.babyDobEnd = moment(params.babyDobEnd, Enum.DATE_FORMAT_FOCUS_DMY_VALUE).isValid() ? moment(params.babyDobEnd, Enum.DATE_FORMAT_FOCUS_DMY_VALUE).format(Enum.DATE_FORMAT_EDMY_VALUE) : params.babyDobEnd;

      onSearch && onSearch(params);
    }
  }

  render() {
    const { options, reviewedByEditFlag } = this.props;
    const {
      errReportFromDate, reportFromDate, reportLabelTitle, startReportLabel,
      errReportToDate, reportToDate, endReportLabel,
      errBirthFromDate, birthFromDate, birthLabelTitle, startBirthLabel,
      errBirthToDate, birthToDate, endBirthLabel, LabNo,
      errMsgReportFromDate, errMsgReportToDate, errMsgBirthFromDate, errMsgBirthToDate
    } = this.state;
    const {
      diagnosisDrop = [], resultDrop = [],
      screeningDrop = [], docStatusDrop = [],
      plaseOfBirthDrop = [], reviewedByDoctorDrop = []
    } = options;
    let inputProps = {
      InputProps: {
        classes: {
          multiline: {
            backgroundColor: color.cimsBackgroundColor,
            // padding: '5px 10px',
            borderRadius: 4
          }
        }
      },
      inputProps: {
        className: {
          fontSize: font.fontSize,
          fontFamily: font.fontFamily,
          color: color.cimsTextColor,
          borderRadius: 4
        },
        maxLength: 20
      }
    };
    return (
      <MuiThemeProvider theme={customTheme}>
        <form id="onSubmit" onSubmit={this.hangdleFormSubmit}>
          <Typography component="div">
            <InputLabel>Report Period Date</InputLabel>
            <Grid container spacing={4}>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '11%', flexBasis: '11%' }}>
                <DatePicker
                    id="reportFromDate"
                    name="rptRcvDatetimeStart"
                    originalLabel="From"
                    labelTitle={reportLabelTitle + ' (From)'}
                    label={startReportLabel}
                    format={Enum.DATE_FORMAT_EDMY_VALUE}
                    error={errReportFromDate}
                    value={reportFromDate}
                    focusCallBack={this.focusCallBackStartReport}
                    onChange={this.reportFromDateChange}
                    style={{ marginLeft: 10 }}
                    maxDate={new Date()}
                    helperText={errMsgReportFromDate}
                />
              </Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '11%', flexBasis: '11%' }}>
                <DatePicker
                    id="reportToDate"
                    name="rptRcvDatetimeEnd"
                    originalLabel="To"
                    labelTitle={reportLabelTitle + ' (To)'}
                    label={endReportLabel}
                    format={Enum.DATE_FORMAT_EDMY_VALUE}
                    error={errReportToDate}
                    value={reportToDate}
                    focusCallBack={this.focusCallBackEndReport}
                    onChange={this.reportToDateChange}
                    style={{ marginLeft: 10 }}
                    maxDate={new Date()}
                    helperText={errMsgReportToDate}
                />
              </Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '10%', flexBasis: '10%' }}>
                <FormControl style={{ width: '100%' }}>
                  <InputLabel id="form-diagnosis-label">Diagnosis</InputLabel>
                  <SelectBox
                      id="diagnosisName"
                      height={39}
                      name="diagnosis"
                      labelId="form-diagnosis-label"
                      options={diagnosisDrop}
                      // value={'CHT'}
                      onChange={this.handleOnChange}
                  />
                </FormControl>
              </Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '10%', flexBasis: '10%' }}>
                <FormControl style={{ width: '100%' }}>
                  <InputLabel id="form-result-label">Result</InputLabel>
                  <SelectBox
                      id="resultName"
                      height={39}
                      name="result"
                      labelId="form-result-label"
                      options={resultDrop}
                      // value={'A'}
                  />
                </FormControl>
              </Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '10%', flexBasis: '10%' }}>
                <FormControl style={{ width: '100%' }}>
                  <InputLabel id="form-screening-label">Screening</InputLabel>
                  <SelectBox
                      id="screeningName"
                      height={39}
                      name="screening"
                      labelId="form-screening-label"
                      options={screeningDrop}
                      // value={'P'}
                  />
                </FormControl>
              </Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '13%', flexBasis: '13%' }}>
                <FormControl style={{ width: '100%' }}>
                  <InputLabel id="form-docstatus-label">Doc Status</InputLabel>
                  <SelectBox
                      id="docstatusName"
                      height={39}
                      name="docSts"
                      labelId="form-docstatus-label"
                      options={docStatusDrop}
                      value={'All'}
                  />
                </FormControl>
              </Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '17%',flexBasis: '17%' }}>
                <TextField
                    id="gsc-input-labNo"
                    label="Lab No."
                    name="labNum"
                    value={LabNo}
                    maxWidth="12%"
                    style={{ width: '100%' }}
                    onChange={e => this.handleChangeText(e)}
                    onBlur={e => this.handleBlur(e)}
                    {...inputProps}
                />
              </Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '8%', flexBasis: '8%' }}>
                <CIMSButton id="Filter" maxWidth="6%" style={{ width: '30%' }} type={'submit'} variant="contained" color="primary">Filter</CIMSButton>
              </Grid>
            </Grid>
          </Typography>
          <Typography component="div">
            <InputLabel>Date of Birth</InputLabel>
            <Grid container spacing={4}>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '11%' }}>
                <DatePicker
                    id="birthFromDate"
                    name="babyDobStart"
                    originalLabel="From"
                    format={Enum.DATE_FORMAT_EDMY_VALUE}
                    style={{ marginLeft: 10 }}
                    error={errBirthFromDate}
                    labelTitle={birthLabelTitle + ' (Form)'}
                    label={startBirthLabel}
                    value={birthFromDate}
                    focusCallBack={this.focusCallBackStartBirth}
                    onChange={this.birthFormDateChange}
                    maxDate={new Date()}
                    helperText={errMsgBirthFromDate}
                />
              </Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '11%' }}>
                <DatePicker
                    id="birthToDate"
                    name="babyDobEnd"
                    originalLabel="To"
                    format={Enum.DATE_FORMAT_EDMY_VALUE}
                    error={errBirthToDate}
                    labelTitle={birthLabelTitle + ' (To)'}
                    label={endBirthLabel}
                    value={birthToDate}
                    focusCallBack={this.focusCallBackEndBirth}
                    onChange={this.birthToDateChange}
                    maxDate={new Date()}
                    helperText={errMsgBirthToDate}
                />
              </Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '10%', flexBasis: '10%' }}>
                <FormControl style={{ width: '100%' }}>
                  <InputLabel id="form-plase-of-birth-label">Place of Birth</InputLabel>
                  <SelectBox
                      id="plaseOfBirthName"
                      height={39}
                      name="birthplaceCod"
                      labelId="form-plase-of-birth-label"
                      options={plaseOfBirthDrop}
                      value={'All'}
                  />
                </FormControl>
              </Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '10%', flexBasis: '10%' }}>
                <FormControl style={{ width: '100%' }} disabled={reviewedByEditFlag}>
                  <InputLabel id="form-reviewed-by-doctor-label">Reviewed by Doctor</InputLabel>
                  <SelectBox
                      id="reviewedbyDoctorName"
                      height={39}
                      name="rslt"
                      labelId="form-reviewed-by-doctor-label"
                      options={reviewedByDoctorDrop}
                      // value={'All'}
                  />
                </FormControl>
              </Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '10%', flexBasis: '10%' }}></Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '13%', flexBasis: '13%' }}></Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '17%', flexBasis: '17%' }}></Grid>
              <Grid item lg={2} md={3} xs={4} style={{ maxWidth: '8%', flexBasis: '8%' }}>
                {/*<CIMSButton id="Export" maxWidth="6%" style={{ width: '30%' }} type={'submit'} variant="contained" color="primary" onClick={() => { this.typeBtn = 'export'; }}>Export</CIMSButton>*/}
              </Grid>
            </Grid>
          </Typography>
        </form>
      </MuiThemeProvider>
    );
  }
}
export default Filter;

