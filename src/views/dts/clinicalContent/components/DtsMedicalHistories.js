import { Chip, Link, Tooltip, Typography } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import { cloneDeep, clone, merge, isEqual, pick, toString } from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CIMSCheckBox from '../../../../components/CheckBox/CIMSCheckBox';
import * as constants from '../../../../constants/dts/clinicalContent/DtsClinicalContentConstant';
import Enum from '../../../../enums/enum';
import { createMedicialHistoryRfi, createMedicialHistorySnapshot, getMedicialHistoryRfi, getMedicialHistorySnapshotByEncounter, updateMedicialHistorySnapshot } from '../../../../store/actions/dts/clinicalContent/encounterAction';
import { getPastHistoryList, getSocialDropdownList, getSocialHistoryList } from '../../../../store/actions/medicalHistories/medicalHistoriesAction';


const useStyles = theme => ({
  contents: {
    display: 'flex'
  },
  title: {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    fontFamily: 'Arial,MingLiU,Helvertica,Sans-serif,Arial Unicode MS',
    fontSize: '1rem'
  },
  link: {
    display: 'inline',
    fontWeight: 700
  },
  iconBtnRoot: {
    padding: 0,
    marginLeft: 4
  },
  chip: {
    margin: '5px'
  }
});

const _initDataView = {
  saamAlertText: null,
  smokingHistoryText: null,
  medicalHistoryText: null,
  saamAlertLastAsked: null,
  medicalHistoryLastAsked: null,
  smokingHistoryLastAsked: null
};

const _initHasBeenLoaded = {
  socialHistory: false,
  pastMedHistory: false,
  saamPatientSummary: false,
  snapShotRecord: false,
  rfi: false
};

class MedicalHistories extends Component {
  constructor(props) {
    super(props);
    const { loginInfo = {}, patientInfo, currentEncounter } = props;
    const { clinic = {}, loginName } = loginInfo;
    const { patientKey } = patientInfo;

    this.state = {
      dropdownlistLoaded: false,
      hasBeenLoaded: cloneDeep(_initHasBeenLoaded),
      params: {
        serviceCd: clinic.serviceCd,
        encntrId: currentEncounter.encntrId,
        clinicCd: clinic.clinicCd,
        patientKey
      },
      dataView: cloneDeep(_initDataView),
      rfi: {
        lastAskedSaamAlert: null,
        lastAskedPastMedHistory: null,
        lastAskedSmoking: null
      },
      snapShotValObj: null,
      allDataLoaded: false
    };
  }

  componentDidMount() {

    const { readOnly } = this.props;

    this.props.onRef(this);
    this.loadSnapshotRecord();
    if (!readOnly) {
      this.loadRfiRecord();

      this.loadSocialDropdownList();
      this.loadPastMedHistoryData();
      this.loadSaamPatientSummary();
      // this.loadSocialHistoryData();
    }
  }

  componentDidUpdate(prevState, prevProps) {
  }

  handleSaveRfi = (rfiCodeId) => {
    const { readOnly } = this.props;
    const { params } = this.state;
    let valObjs = [];

    valObjs.push({
      clinicCd: params.clinicCd,
      encounterId: params.encntrId,
      patientKey: params.patientKey,
      rfiCodeId
    });

    if (!readOnly) {
      this.props.createMedicialHistoryRfi(
        { rfiDtos: valObjs }, this.loadRfiRecord
      );
    }
  }

  shouldSaveSnapshot = () => {
    if (this.allLoaded() && this.isDataUpdated()) {
      this.handleSaveSnapshot();
    }
  }

  handleRefresh = () => {
    const { readOnly } = this.props;
    // this.loadSnapshotRecord();
    if (!readOnly) {
      this.setState({
        hasBeenLoaded: {
          ...this.state.hasBeenLoaded,
          socialHistory: false,
          pastMedHistory: false,
          saamPatientSummary: false,
          rfi: false
        }
      }, () => {
        this.loadRfiRecord();
        this.loadSocialDropdownList();
        this.loadPastMedHistoryData();
        this.loadSaamPatientSummary();
      });
      // this.loadSocialHistoryData();
    }
  }

  handleSaveSnapshot = () => {
    const { readOnly } = this.props;
    const { snapShotValObj } = this.state;
    let valObj = this.generateValObj();
    // console.log('************** handleSaveSnapshot ************* =====> valObj' + JSON.stringify(valObj));

    if (!readOnly) {
      if (snapShotValObj && snapShotValObj.snapshotId) {
        this.props.updateMedicialHistorySnapshot(
          valObj, this.loadSnapshotRecord
        );
      }
      else {
        this.props.createMedicialHistorySnapshot(
          valObj, this.loadSnapshotRecord
        );
      }
    }
  }

  generateValObj = () => {
    let { params } = this.state;
    let { snapShotValObj, dataView } = this.state;

    // copy data from view object
    let obj = cloneDeep(dataView);
    obj = {
      ...obj,
      snapshotId: snapShotValObj ? snapShotValObj.snapshotId : 0,
      encntrId: params.encntrId,
      patientKey: params.patientKey,
      version: snapShotValObj && snapShotValObj.version
    };
    // console.log('************** generateValObj ************* =====> obj' + JSON.stringify(obj));
    return obj;
  }

  isDataUpdated = () => {
    const { dataView, snapShotValObj } = this.state;

    let _snapShotValObj = {};
    merge(_snapShotValObj, _initDataView, clone(pick(snapShotValObj, Object.keys(_initDataView))));

    // console.log('************** isDataUpdated ************* =====> dataView' + JSON.stringify(dataView));
    // console.log('************** isDataUpdated ************* =====> _snapShotValObj' + JSON.stringify(_snapShotValObj));
    // console.log('************** isDataUpdated ************* =====> !isEqual(dataView, _snapShotValObj)' + !isEqual(dataView, _snapShotValObj));

    return !isEqual(dataView, _snapShotValObj);
  }

  allLoaded = () => {
    const { dropdownlistLoaded, hasBeenLoaded } = this.state;
    return dropdownlistLoaded && hasBeenLoaded.pastMedHistory && hasBeenLoaded.saamPatientSummary
      && hasBeenLoaded.snapShotRecord && hasBeenLoaded.socialHistory && hasBeenLoaded.rfi;
  }

  loadSaamPatientSummary = () => {
    const { saamPatientSummary } = this.props;
    let sps = saamPatientSummary;
    this.setState({
      // hasSaamAlert: (sps?.patientAllergyList?.length > 0 || sps?.patientAdrList?.length > 0 || sps?.patientAlertList?.length > 0),
      dataView: { ...this.state.dataView, saamAlertText: this.generateSaamPatientSummaryText() },
      hasBeenLoaded: { ...this.state.hasBeenLoaded, saamPatientSummary: true }
    });
    this.shouldSaveSnapshot();
  }

  loadRfiRecord = () => {
    const { readOnly, currentEncounter } = this.props;
    const { params } = this.state;
    let callBack = (data) => {
      // console.log('===> loadRfiRecord ===> data ==>' + toString(data));
      if (data) {

        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          // console.log('===> loadRfiRecord ===> item ==>' + JSON.stringify(item));
          if (item.rfiCodeId && item.lastAskedDate) {
            // let lastAskedDate = moment(item.lastAskedDate).format(DtsConstant.DTS_DATE_DISPLAY_FORMAT);
            switch (item.rfiCodeId) {
              case constants.MS_CODE_ENCOUNTER_RFI.SMOKING: {
                // console.log('===> loadRfiRecord ===> lastAskedDate ==>' + lastAskedDate);
                this.setState({
                  rfi: { ...this.state.rfi, lastAskedSmoking: item },
                  dataView: { ...this.state.dataView, smokingHistoryLastAsked: item.lastAskedDate && moment(item.lastAskedDate).valueOf() }
                });
                break;
              }
              case constants.MS_CODE_ENCOUNTER_RFI.PAST_MEDICAL_HISTORY: {

                this.setState({
                  rfi: { ...this.state.rfi, lastAskedPastMedHistory: item },
                  dataView: { ...this.state.dataView, medicalHistoryLastAsked: item.lastAskedDate && moment(item.lastAskedDate).valueOf() }
                });
                break;
              }
              case constants.MS_CODE_ENCOUNTER_RFI.ADVERSE_REACTION_ALLERGY_ALERT:
                this.setState({
                  rfi: { ...this.state.rfi, lastAskedSaamAlert: item },
                  dataView: { ...this.state.dataView, saamAlertLastAsked: item.lastAskedDate && moment(item.lastAskedDate).valueOf() }
                });
                break;
            }
          }
        }
      }
      this.setState({ hasBeenLoaded: { ...this.state.hasBeenLoaded, rfi: true } });
      this.shouldSaveSnapshot();
    };
    if (currentEncounter) {
      this.props.getMedicialHistoryRfi(
        {
          patientKey: params.patientKey,
          serviceCd: params.serviceCd
        }, callBack
      );
    }
  }

  loadSnapshotRecord = () => {
    const { readOnly, currentEncounter } = this.props;

    let callBack = (data) => {
      // console.log('===> loadSnapshot ===> data ==>' + toString(data));
      this.setState({ snapShotValObj: data, hasBeenLoaded: { ...this.state.hasBeenLoaded, snapShotRecord: true } });
      if (readOnly) {
        let dataView = cloneDeep(pick(data, Object.keys(_initDataView)));
        this.setState({
          dataView
        });
      }
    };

    if (currentEncounter) {
      // console.log('===> loadSnapshot ==> call getMedicialHistorySnapshotByEncounter');
      this.props.getMedicialHistorySnapshotByEncounter(
        { encounterId: currentEncounter.encntrId }, callBack
      );
    }
  }

  loadPastMedHistoryData = () => {

    const { params } = this.state;
    this.props.getPastHistoryList({
      params: {
        patientKey: params.patientKey
      },
      callback: data => {
        this.setState({
          dataView: { ...this.state.dataView, medicalHistoryText: this.generateMedHistoryText(data) },
          hasBeenLoaded: { ...this.state.hasBeenLoaded, pastMedHistory: true }
        });
        this.shouldSaveSnapshot();
        // this.props.closeCommonCircularDialog();
      }
    });

  }

  loadSocialDropdownList = () => {
    this.props.getSocialDropdownList({
      params: {},
      callback: data => {
        this.setState({ dropdownOption: data, dropdownlistLoaded: true });
        this.loadSocialHistoryData();
      }
    });
  }

  loadSocialHistoryData = () => {
    const { patientInfo } = this.props;
    const { params } = this.state;
    // this.props.openCommonCircularDialog();
    this.props.getSocialHistoryList({
      params: {
        patientKey: params.patientKey
      },
      callback: data => {
        let { smokings } = data; //, smokings, substanceAbuses, others
        let smokingHistoryText = this.generateSmokingHistoryText(smokings.details, this.state.dropdownOption);
        this.setState({
          dataView: { ...this.state.dataView, smokingHistoryText },
          smokingHistoryList: smokings.details,
          hasBeenLoaded: { ...this.state.hasBeenLoaded, socialHistory: true }
        });

        this.shouldSaveSnapshot();
        // this.props.closeCommonCircularDialog();
        // this.loadPastMedHistoryData();
      }
    });
  }

  generateMedHistoryText = (problemValObjList = []) => {
    let descArray = [];
    if (problemValObjList && problemValObjList.length > 0) {
      problemValObjList.forEach(problemItemObj => {
        if (problemItemObj.pastMedHistoryText) {
          descArray.push(problemItemObj.pastMedHistoryText);
        }
      });
    }
    return descArray.length > 0 ? toString(descArray) : null;
  }

  generateSmokingHistoryText = (smokingHistoryList = [], dropdownOption = {}) => {
    const { socialHistoryType } = this.props;
    let smokingIdTypeId = socialHistoryType.smokingId;
    let statusOptions = dropdownOption ? dropdownOption.statusOptions : [];
    let smokingOptions = dropdownOption && dropdownOption.typeOptionMap ? dropdownOption.typeOptionMap.get(smokingIdTypeId) : [];


    let descArray = [];
    if (smokingHistoryList && smokingHistoryList.length > 0) {
      smokingHistoryList.forEach(item => {
        if (item) {
          let status = statusOptions && statusOptions.find(status => status.value === item.status);
          let smoking = smokingOptions && smokingOptions.find(smoking => smoking.value === item.socialHistorySubtypeId);

          let statusLabel = status ? status.label : item.status;
          let smokingLable = smoking ? smoking.label : item.socialHistorySubtypeId;

          let text = `${smokingLable} ${statusLabel} ${item.amtTxt ? `(${item.amtTxt} per day)` : ''}`;

          descArray.push(text);
        }
      });
    }
    return descArray.length > 0 ? toString(descArray) : null;
  }

  generateSaamPatientSummaryText = () => {
    const { saamPatientSummary } = this.props;

    let sps = saamPatientSummary;
    let descArray = [];
    if (sps?.patientAllergyList?.length > 0) {
      let allergytext = sps.patientAllergyList.map((x, i, arr) => `${arr.length > 1 ? '(' + (i + 1) + ') ' : ''}${x.displayName}`).join('\n');
      descArray.push('[Allergy] ' + allergytext);
    }
    if (sps?.patientAdrList?.length > 0) {
      let adrtext = sps.patientAdrList.map((x, i, arr) => `${arr.length > 1 ? '(' + (i + 1) + ') ' : ''}${x.drugDesc}`).join('\n');
      descArray.push('[Adverse Drug Reaction] ' + adrtext);
    }
    if (sps?.patientAlertList?.length > 0) {
      let alerttext = sps.patientAlertList.map((x, i, arr) => `${arr.length > 1 ? '(' + (i + 1) + ') ' : ''}${x.alertDesc}`).join('\n');
      descArray.push('[Alert] ' + alerttext);
    }
    return descArray.length > 0 ? toString(descArray) : null;
  }

  generateContents = () => {
    const { readOnly } = this.props;
    const { rfi, dataView } = this.state;
    let contents = [];
    let id = 'ms_';

    contents.push({
      id: `${id}_alert`,
      linkLabel: 'Alert',
      linkFunction: this.props.openStructureAlertTab,
      rfiCodeId: constants.MS_CODE_ENCOUNTER_RFI.ADVERSE_REACTION_ALLERGY_ALERT,
      lastAsked: readOnly ? { lastAskedDate: dataView.saamAlertLastAsked } : rfi.lastAskedSaamAlert,
      linkText: dataView.saamAlertText,
      nowrap: false
    });

    contents.push({
      id: `${id}_past_medical_history`,
      linkLabel: 'Medical History',
      linkFunction: this.props.openMedicalHistoriesTab,
      rfiCodeId: constants.MS_CODE_ENCOUNTER_RFI.PAST_MEDICAL_HISTORY,
      lastAsked: readOnly ? { lastAskedDate: dataView.medicalHistoryLastAsked } : rfi.lastAskedPastMedHistory,
      linkText: dataView.medicalHistoryText,
      nowrap: false
    });

    contents.push({
      id: `${id}_smoking`,
      linkLabel: 'Smoking',
      linkFunction: this.props.openMedicalHistoriesTab,
      rfiCodeId: constants.MS_CODE_ENCOUNTER_RFI.SMOKING,
      lastAsked: readOnly ? { lastAskedDate: dataView.smokingHistoryLastAsked } : rfi.lastAskedSmoking,
      linkText: dataView.smokingHistoryText,
      nowrap: true
    });

    return contents;

  }

  render() {
    const { readOnly, classes } = this.props;
    const { params } = this.state;
    let contents = this.generateContents();

    return (
      <section>
        {
          contents && contents.map((item, idx) => {
            let { id, linkLabel, linkFunction, lastAsked, linkText, rfiCodeId, nowrap } = item;
            let lastAskedDate = lastAsked && lastAsked.lastAskedDate && moment(lastAsked.lastAskedDate).format(Enum.DATE_FORMAT_EDMY_VALUE);

            let thisEncounterAsked = lastAsked && params.encntrId === lastAsked.encntrId;
            let sameDayAsked = lastAskedDate && moment().isSame(lastAsked.lastAskedDate, 'day');

            // console.log("====> thisEncounterAsked:: " + thisEncounterAsked);
            // console.log("====> lastAskedDate:: " + lastAskedDate);
            // console.log("====> sameDayAsked:: " + sameDayAsked);
            // console.log("====> params.encntrId:: " + params.encntrId);

            return (<div className={classes.contents} id={id} key={idx} >
              {readOnly ? null : (thisEncounterAsked && sameDayAsked ?
                <CheckIcon fontSize="small" style={{ color: green[500], marginTop: 'auto', marginBottom: 'auto' }} />
                :
                <CIMSCheckBox size="small" className={classes.iconBtnRoot} value={rfiCodeId} onChange={() => { this.handleSaveRfi(rfiCodeId); }} />
              )}
              {readOnly ? <label className={classes.title}>{linkLabel}</label> : <Link component="button" className={classes.link} onClick={linkFunction} variant="body2">{linkLabel}</Link>}
              {lastAskedDate && <Chip size="small" label={lastAskedDate} style={{ marginTop: 'auto', marginBottom: 'auto' }} />}
              {linkText && <Tooltip title={linkText}>
                <Typography noWrap={nowrap} component="span" style={{ paddingLeft: 4 }} >
                  {linkText}
                </Typography>
              </Tooltip>}
            </div>);
          })}
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  // console.log(state.dtsAppointmentAttendance.patientKey);
  return {
    loginInfo: {
      ...state.login.loginInfo,
      service: state.login.service,
      clinic: state.login.clinic
    },
    socialHistoryType: state.medicalHistories.socialHistoryType,
    clinicList: state.common.clinicList,
    patientInfo: state.patient.patientInfo,
    saamPatientSummary: state.saamPatient.patientSummary
  };
};

const mapDispatchToProps = {
  getSocialHistoryList,
  getSocialDropdownList,
  getPastHistoryList,
  getMedicialHistorySnapshotByEncounter,
  updateMedicialHistorySnapshot,
  createMedicialHistorySnapshot,
  getMedicialHistoryRfi,
  createMedicialHistoryRfi
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles)(MedicalHistories));