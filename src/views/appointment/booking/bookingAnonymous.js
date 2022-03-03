import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import moment from 'moment';
import _ from 'lodash';
import BookingConfirmDialog from './component/bookDialog/bookingConfirmDialog';
import BookingSearchDialog from './component/bookDialog/bookingSearchDialog';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import BookAnonForm from './component/bookAnonForm';
import AnonymousPatientBar from './component/anonymousPatientBar';
import {
    resetReplaceAppointment,
    resetInfoAll,
    appointmentBook,
    listTimeSlot,
    bookAnonymousConfirm,
    bookConfirmWaiting,
    updateState,
    updateAnonymousAppointment,
    cancelAndConfirmAnonymousAppointment,
    initAnonBookingData,
    searchPatientList,
    updateField,
    stillAppointmentsBookConfirm,
    replaceOldAppointmnet,
    resetSqueeze,
    putSqueeze,
    putUrgSqueeze,
    reAnonymousAppointment,
    deleteAnonymousAppointment,
    resetAnonymousBookingData,
    getEncounterTypeListBySite
} from '../../../store/actions/appointment/booking/bookingAnonymousAction';
import { getBookingMaximumTimeslot, checkApptWithEncntrCaseStatus, logShsEncntrCase } from '../../../store/actions/appointment/booking/bookingAction';
import {
    redesignListRemarkCode
} from '../../../store/actions/appointment/booking/redesignBookingAction';
import { getCodeList, getClcAntGestCalcParams } from '../../../store/actions/common/commonAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { deleteTabs, updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import { codeList } from '../../../constants/codeList';
import { refreshPatient } from '../../../store/actions/patient/patientAction';
import { initBookingData } from '../../../constants/appointment/bookingInformation/bookingInformationConstants';
import * as BookingAnonymousType from '../../../store/actions/appointment/booking/bookingAnonymousActionType';
import { DateUtil, CaseNoUtil, CommonUtil, PatientUtil, AppointmentUtil } from '../../../utilities';
import Enum from '../../../enums/enum';
import accessRightEnum from '../../../enums/accessRightEnum';
import { anonPageStatus, UpdateMeans } from '../../../enums/appointment/booking/bookingEnum';
import '../../../styles/common/bookingAnonymous.scss';
import ReplaceAppointmentDialog from './component/bookDialog/replaceAppointmentDialog';
import OverlappedPeriodAppointmentDialog from './component/bookDialog/overlappedPeriodAppointmentDialog';
import SqueezeInAppointmentDialog from './component/bookDialog/squeezeInAppointmentDialog';
import { auditAction } from '../../../store/actions/als/logAction';
import DeleteApptDialog from './component/bookDialog/deleteApptDialog';
import SupervisorsApprovalDialog from '../../../views/compontent/supervisorsApprovalDialog';
import FieldConstant from '../../../constants/fieldConstant';
import GestationCalcDialog from './component/bookDialog/gestationCalcDialog';
import UnexpectedEnctrApprlDialog from './component/bookDialog/unexpectedEnctrApprlDialog';
import { UNEXPECTED_ACTION_TYPE, BookMeans } from '../../../enums/appointment/booking/bookingEnum';

const styles = theme => ({
    root: {
        width: '100%',
        maxWidth: '95%',
        margin: '1.5rem auto'
    }
});

class BookingAnonymousInformation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            deleteReasonDialogOpen: false,
            deleteReasonType: '',
            deleteReasonText: '',
            caseDto: null,
            gestationCalcOpen: false,
            gestCalcParams: null,
            gestStartDate: null,
            gestEndDate: null,
            wkStart: null,
            wkEnd: null,
            dayStart: null,
            dayEnd: null,
            bookingAction:'',
            searchCriteria:[],
            daysOfWeekValArr: [1, 1, 1, 1, 1, 1, 1],
            approvalDialogParams: {
                isOpen: false,
                staffId: '',
                rsnCd: null,
                rsnTxt: ''
            }
        };

        this.isUseGestCalc = CommonUtil.isUseGestCalc();
    }

    componentDidMount() {
        // this.props.resetInfoAll();

        //init dropdownlist codelist
        this.initCodeList();

        //doclose function
        this.initDoClose();

        //init pass in parameter
        this.initPassInParameters();

        this.resetDaysOfWeek();
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if (this.isUseGestCalc && this.state.gestEndDate) {
            const currBookingData = this.props.bookingData;
            const prevBookingData = prevProps.bookingData;
            if (currBookingData.encounterTypeCd !== 'ENC_NEW'
                || currBookingData.siteId !== prevBookingData.siteId
                || (this.props.pageStatus === anonPageStatus.UPDATE && prevProps.pageStatus === anonPageStatus.VIEW)
                || (this.props.pageStatus === anonPageStatus.VIEW && prevProps.pageStatus === anonPageStatus.UPDATE)
                || this.props.pageStatus === anonPageStatus.CONFIRMED) {
                this.setState({ gestStartDate: null, gestEndDate: null });
            }
        }
        return null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.redirectParam !== prevProps.redirectParam) {
            if (!this.checkIsDirty()) {
                this.handleRefresh();
            } else {
                this.props.openCommonMessage({
                    // msgCode: '111109',
                    msgCode: '112031',
                    params: [{ name: 'PATIENT_CALL', value: CommonUtil.getPatientCall() }]
                });
            }
        }
    }

    componentWillUnmount() {
        this.props.resetInfoAll();
    }

    handleRefresh() {

        this.initCodeList();

        this.initDoClose();

        this.initPassInParameters();
    }

    initCodeList = () => {
        this.props.getCodeList({
            params: [codeList.document_type],
            actionType: BookingAnonymousType.PUT_GET_CODE_LIST
        });
        let redesignListRemarkCodeParams = {
            params: {
                svcCd: this.props.serviceCd,
                siteId: this.props.siteId
            }
        };

        this.props.redesignListRemarkCode(redesignListRemarkCodeParams);

        if (this.isUseGestCalc) {
            this.props.getClcAntGestCalcParams(null, (data) => {
                const gestCalConfigs = (data || []).find(x => x.siteId === this.props.siteId);
                this.setState({
                    gestCalcParams: data,
                    wkStart: gestCalConfigs && gestCalConfigs.wkStart,
                    wkEnd: gestCalConfigs && gestCalConfigs.wkEnd,
                    dayStart: gestCalConfigs && gestCalConfigs.dayStart,
                    dayEnd: gestCalConfigs && gestCalConfigs.dayEnd
                 });
            });
        }
    }


    checkIsDirty = () => {
        const { anonymousPatint, anonymousPersonalInfoBackUp } = this.props;
        let isDirty = false;
        let bookingData = _.cloneDeep(this.props.bookingData);
        let bookingDataBackup = _.cloneDeep(this.props.bookingDataBackup);
        bookingData = {
            ...bookingData,
            appointmentDate: bookingData.appointmentDate && moment(bookingData.appointmentDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            appointmentTime: bookingData.appointmentTime && moment(bookingData.appointmentTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
        };
        bookingDataBackup = {
            ...bookingDataBackup,
            appointmentDate: bookingDataBackup.appointmentDate && moment(bookingDataBackup.appointmentDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            appointmentTime: bookingDataBackup.appointmentTime && moment(bookingDataBackup.appointmentTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
        };
        let compareKeys = [
            'siteId',
            'encounterTypeId',
            'rmId',
            'qtType',
            'appointmentDate',
            'appointmentTime',
            'elapsedPeriod',
            'elapsedPeriodUnit',
            'sessId',
            'bookingUnit',
            'forDoctorOnly',
            'priority',
            'remarkId',
            'memo'
        ];
        let compareObj1 = _.pick(bookingData, compareKeys);
        let compareObj2 = _.pick(bookingDataBackup, compareKeys);
        isDirty = !CommonUtil.isEqualObj(anonymousPatint, anonymousPersonalInfoBackUp) || !CommonUtil.isEqualObj(compareObj1, compareObj2);
        return isDirty;
    }

    saveFunc = (closeTabFunc) => {
        const { newOrUpdate } = this.props;
        this.props.updateState({ closeTabFunc: closeTabFunc });
        if (newOrUpdate === UpdateMeans.UPDATE) {
            this.handleBtnClick('Update');
        } else if (newOrUpdate === UpdateMeans.BOOKNEW) {
            this.handleBtnClick('Book');
        }
    }

    initDoClose = () => {
        this.doClose = CommonUtil.getDoCloseFunc_2(accessRightEnum.bookingAnonymous, this.checkIsDirty, this.saveFunc);
        this.props.updateCurTab(accessRightEnum.bookingAnonymous, this.doClose);
    }

    initPassInParameters = () => {
        let bookData = _.cloneDeep(initBookingData);
        if (this.props.redirectParam) {
            let params = _.cloneDeep(this.props.redirectParam);
            let updateField = {};
            if (params.redirectFrom === accessRightEnum.patientSpec) {
                delete params.redirectFrom;
                bookData.clinicCd = params.appointmentDto.clinicCd;
                bookData.siteId = params.futureAppt.siteId;
                bookData.encounterTypeId = params.futureAppt.encntrTypeId;
                bookData.encounterTypeCd = params.futureAppt.encounterTypeCd;
                bookData.subEncounterTypeCd = params.futureAppt.subEncounterTypeCd;
                bookData.rmId = params.futureAppt.rmId;
                bookData.appointmentDate = moment(params.futureAppt.appointmentDate, Enum.DATE_FORMAT_EDMY_VALUE);
                bookData.appointmentTime = moment(params.futureAppt.appointmentTime, Enum.DATE_FORMAT_24_HOUR);
                bookData.caseTypeCd = params.appointmentDto.caseTypeCd;
                bookData.qtType = params.appointmentDto.appointmentTypeCd;
                bookData.remarkId = params.futureAppt.remarkId;
                bookData.memo = params.futureAppt.memo;
                bookData.bookingUnit = params.appointmentDto.bookingUnit;
                bookData.version = params.futureAppt.version;
                bookData.appointmentId = params.futureAppt.appointmentId;
                bookData.bookingUnit = params.futureAppt.bookingUnit;
                bookData.appointmentDetlBaseVoList = params.futureAppt.appointmentDetlBaseVoList || null;
                bookData.attnStatusCd = params.futureAppt.attnStatusCd;
                bookData.qtType = params.futureAppt.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList[0].qtType;
                bookData.sessId = params.futureAppt.sessId;
                bookData.encntrGrpCd=params.futureAppt.encntrGrpCd||'';
                let isHKIDFormat = PatientUtil.isHKIDFormat(params.futureAppt.anonymousPatientDto.docTypeCd);

                updateField.anonyomousBookingActiveInfo = {
                    patientKey: params.futureAppt.patientKey,
                    docTypeCd: params.futureAppt.anonymousPatientDto.docTypeCd || '',
                    docNo: isHKIDFormat ? PatientUtil.getHkidFormat(params.futureAppt.anonymousPatientDto.docNo || '') : params.futureAppt.anonymousPatientDto.docNo || '',
                    surname: params.futureAppt.engSurname || '',
                    givenName: params.futureAppt.engGivename || '',
                    countryCd: params.futureAppt.countryCd,
                    mobile: {
                        smsPhoneInd: params.futureAppt.anonymousPatientDto.smsPhoneInd,
                        phoneTypeCd: params.futureAppt.anonymousPatientDto.phnTypeCd,
                        countryCd: params.futureAppt.anonymousPatientDto.ctryCd,
                        areaCd: params.futureAppt.anonymousPatientDto.areaCd,
                        dialingCd: params.futureAppt.anonymousPatientDto.dialingCd,
                        phoneNo: params.futureAppt.anonymousPatientDto.cntctPhn
                    },
                    isHKIDValid: (params.futureAppt.anonymousPatientDto.docTypeCd || '') === 'ID',
                    version: params.futureAppt.anonymousPatientDto.version
                };
                updateField.anonymousPersonalInfoBackUp = _.cloneDeep(updateField.anonyomousBookingActiveInfo);
                updateField.anonPatientInfo = {
                    patientKey: params.futureAppt.patientKey,
                    engSurname: params.futureAppt.engSurname || '',
                    engGivename: params.futureAppt.engGivename || '',
                    docTypeCd: params.futureAppt.anonymousPatientDto.docTypeCd || '',
                    surname: params.futureAppt.engSurname || '',
                    givenName: params.futureAppt.engGivename || '',
                    countryCd: params.futureAppt.anonymousPatientDto.ctryCd,
                    mobile: {
                        smsPhoneInd: params.futureAppt.anonymousPatientDto.smsPhoneInd,
                        phoneTypeCd: params.futureAppt.anonymousPatientDto.phnTypeCd,
                        countryCd: params.futureAppt.anonymousPatientDto.ctryCd,
                        areaCd: params.futureAppt.anonymousPatientDto.areaCd,
                        dialingCd: params.futureAppt.anonymousPatientDto.dialingCd,
                        phoneNo: params.futureAppt.anonymousPatientDto.cntctPhn
                    },
                    isHKIDValid: (params.futureAppt.anonymousPatientDto.docTypeCd || '') === 'ID',
                    docNo: isHKIDFormat ? PatientUtil.getHkidFormat(params.futureAppt.anonymousPatientDto.docNo || '') : params.futureAppt.anonymousPatientDto.docNo || '',
                    otherDocNo: isHKIDFormat ? '' : params.futureAppt.hkic || '',
                    priDocNo: params.futureAppt.anonymousPatientDto.priDocNo || undefined,
                    priDocTypecd: params.futureAppt.anonymousPatientDto.priDocTypeCd || undefined,
                    version: params.futureAppt.anonymousPatientDto.version
                };
                updateField.currentAnonyomousBookingActiveInfo = {
                    patientKey: params.futureAppt.patientKey,
                    docTypeCd: params.futureAppt.anonymousPatientDto.docTypeCd || '',
                    docNo: isHKIDFormat ? PatientUtil.getHkidFormat(params.futureAppt.anonymousPatientDto.docNo || '') : params.futureAppt.anonymousPatientDto.docNo || '',
                    surname: params.futureAppt.engSurname || '',
                    givenName: params.futureAppt.engGivename || '',
                    countryCd: params.futureAppt.countryCd,
                    mobile: {
                        smsPhoneInd: params.futureAppt.anonymousPatientDto.smsPhoneInd,
                        phoneTypeCd: params.futureAppt.anonymousPatientDto.phnTypeCd,
                        countryCd: params.futureAppt.anonymousPatientDto.ctryCd,
                        areaCd: params.futureAppt.anonymousPatientDto.areaCd,
                        dialingCd: params.futureAppt.anonymousPatientDto.dialingCd,
                        phoneNo: params.futureAppt.anonymousPatientDto.cntctPhn
                    },
                    isHKIDValid: (params.futureAppt.anonymousPatientDto.docTypeCd || '') === 'ID'
                };
                updateField.anonyomous = {
                    patientKey: params.futureAppt.patientKey
                };
                this.props.updateState({
                    ...updateField,
                    pageStatus: anonPageStatus.UPDATE,
                    newOrUpdate: UpdateMeans.UPDATE
                });
            } else if (params.redirectFrom === accessRightEnum.waitingList) {
                delete params.redirectFrom;
                //this.props.getEncounterTypeListBySite(this.props.serviceCd, params.siteId, (enctList) => {
                bookData = AppointmentUtil.loadWaitListPassedData(bookData, params, this.props.encounterTypeList, this.props.destinationList);
                let anonData = AppointmentUtil.loadWaitListAnonData(params);
                updateField.waitingList = {
                    version: params.version,
                    waitListId: params.waitListId
                };
                updateField.anonyomousBookingActiveInfo = anonData.anonyomousBookingActiveInfo;
                updateField.anonymousPersonalInfoBackUp = _.cloneDeep(anonData.anonyomousBookingActiveInfo);
                updateField.anonPatientInfo = anonData.anonPatientInfo;
                this.props.updateState(updateField);
                this.props.initAnonBookingData(bookData);
                //});
                return;
            } else if (params.redirectFrom === accessRightEnum.calendarView) {
                bookData = { ...bookData, ...params.bookData };
            } else if (params.redirectFrom === accessRightEnum.EhsWaitingList) {
                bookData = { ...bookData, ...params.bookData };
                if (params.anonyomousBookingActiveInfo) {
                    updateField.anonyomousBookingActiveInfo = params.anonyomousBookingActiveInfo;
                    updateField.anonymousPersonalInfoBackUp = _.cloneDeep(params.anonyomousBookingActiveInfo);
                    this.props.updateState(updateField);
                }
            }
        }
        // this.props.getEncounterTypeListBySite(this.props.serviceCd, this.props.siteId, (enctList) => {
        //     bookData.encounterTypeList = enctList;
        this.props.initAnonBookingData(bookData);
        // });
    }

    // initPassInParameters = () => {
    //     let bookData = _.cloneDeep(initBookingData);
    //     if (this.props.location.state) {
    //         let params = _.cloneDeep(this.props.location.state);
    //         let updateField = {};
    //         if (params.redirectFrom === accessRightEnum.patientSpec) {
    //             delete params.redirectFrom;
    //             bookData.clinicCd = params.appointmentDto.clinicCd;
    //             bookData.siteId = params.futureAppt.siteId;
    //             bookData.encounterTypeId = params.futureAppt.encntrTypeId;
    //             bookData.encounterTypeCd = params.futureAppt.encounterTypeCd;
    //             bookData.subEncounterTypeCd = params.futureAppt.subEncounterTypeCd;
    //             bookData.rmId = params.futureAppt.rmId;
    //             bookData.appointmentDate = moment(params.futureAppt.appointmentDate, Enum.DATE_FORMAT_EDMY_VALUE);
    //             bookData.appointmentTime = moment(params.futureAppt.appointmentTime, Enum.DATE_FORMAT_24_HOUR);
    //             bookData.caseTypeCd = params.appointmentDto.caseTypeCd;
    //             bookData.qtType = params.appointmentDto.appointmentTypeCd;
    //             bookData.remarkId = params.futureAppt.remarkId;
    //             bookData.memo = params.futureAppt.memo;
    //             bookData.bookingUnit = params.appointmentDto.bookingUnit;
    //             bookData.version = params.futureAppt.version;
    //             bookData.appointmentId = params.futureAppt.appointmentId;
    //             bookData.bookingUnit = params.futureAppt.bookingUnit;
    //             bookData.appointmentDetlBaseVoList = params.futureAppt.appointmentDetlBaseVoList || null;
    //             bookData.attnStatusCd = params.futureAppt.attnStatusCd;
    //             bookData.qtType = params.futureAppt.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList[0].qtType;
    //             bookData.sessId = params.futureAppt.sessId;
    //             bookData.encntrGrpCd=params.futureAppt.encntrGrpCd||'';
    //             let isHKIDFormat = PatientUtil.isHKIDFormat(params.futureAppt.anonymousPatientDto.docTypeCd);

    //             updateField.anonyomousBookingActiveInfo = {
    //                 patientKey: params.futureAppt.patientKey,
    //                 docTypeCd: params.futureAppt.anonymousPatientDto.docTypeCd || '',
    //                 docNo: isHKIDFormat ? PatientUtil.getHkidFormat(params.futureAppt.anonymousPatientDto.docNo || '') : params.futureAppt.anonymousPatientDto.docNo || '',
    //                 surname: params.futureAppt.engSurname || '',
    //                 givenName: params.futureAppt.engGivename || '',
    //                 countryCd: params.futureAppt.countryCd,
    //                 mobile: {
    //                     smsPhoneInd: params.futureAppt.anonymousPatientDto.smsPhoneInd,
    //                     phoneTypeCd: params.futureAppt.anonymousPatientDto.phnTypeCd,
    //                     countryCd: params.futureAppt.anonymousPatientDto.ctryCd,
    //                     areaCd: params.futureAppt.anonymousPatientDto.areaCd,
    //                     dialingCd: params.futureAppt.anonymousPatientDto.dialingCd,
    //                     phoneNo: params.futureAppt.anonymousPatientDto.cntctPhn
    //                 },
    //                 isHKIDValid: (params.futureAppt.anonymousPatientDto.docTypeCd || '') === 'ID',
    //                 version: params.futureAppt.anonymousPatientDto.version
    //             };
    //             updateField.anonymousPersonalInfoBackUp = _.cloneDeep(updateField.anonyomousBookingActiveInfo);
    //             updateField.anonPatientInfo = {
    //                 patientKey: params.futureAppt.patientKey,
    //                 engSurname: params.futureAppt.engSurname || '',
    //                 engGivename: params.futureAppt.engGivename || '',
    //                 docTypeCd: params.futureAppt.anonymousPatientDto.docTypeCd || '',
    //                 surname: params.futureAppt.engSurname || '',
    //                 givenName: params.futureAppt.engGivename || '',
    //                 countryCd: params.futureAppt.anonymousPatientDto.ctryCd,
    //                 mobile: {
    //                     smsPhoneInd: params.futureAppt.anonymousPatientDto.smsPhoneInd,
    //                     phoneTypeCd: params.futureAppt.anonymousPatientDto.phnTypeCd,
    //                     countryCd: params.futureAppt.anonymousPatientDto.ctryCd,
    //                     areaCd: params.futureAppt.anonymousPatientDto.areaCd,
    //                     dialingCd: params.futureAppt.anonymousPatientDto.dialingCd,
    //                     phoneNo: params.futureAppt.anonymousPatientDto.cntctPhn
    //                 },
    //                 isHKIDValid: (params.futureAppt.anonymousPatientDto.docTypeCd || '') === 'ID',
    //                 docNo: isHKIDFormat ? PatientUtil.getHkidFormat(params.futureAppt.anonymousPatientDto.docNo || '') : params.futureAppt.anonymousPatientDto.docNo || '',
    //                 otherDocNo: isHKIDFormat ? '' : params.futureAppt.hkic || '',
    //                 priDocNo: params.futureAppt.anonymousPatientDto.priDocNo || undefined,
    //                 priDocTypecd: params.futureAppt.anonymousPatientDto.priDocTypeCd || undefined,
    //                 version: params.futureAppt.anonymousPatientDto.version
    //             };
    //             updateField.currentAnonyomousBookingActiveInfo = {
    //                 patientKey: params.futureAppt.patientKey,
    //                 docTypeCd: params.futureAppt.anonymousPatientDto.docTypeCd || '',
    //                 docNo: isHKIDFormat ? PatientUtil.getHkidFormat(params.futureAppt.anonymousPatientDto.docNo || '') : params.futureAppt.anonymousPatientDto.docNo || '',
    //                 surname: params.futureAppt.engSurname || '',
    //                 givenName: params.futureAppt.engGivename || '',
    //                 countryCd: params.futureAppt.countryCd,
    //                 mobile: {
    //                     smsPhoneInd: params.futureAppt.anonymousPatientDto.smsPhoneInd,
    //                     phoneTypeCd: params.futureAppt.anonymousPatientDto.phnTypeCd,
    //                     countryCd: params.futureAppt.anonymousPatientDto.ctryCd,
    //                     areaCd: params.futureAppt.anonymousPatientDto.areaCd,
    //                     dialingCd: params.futureAppt.anonymousPatientDto.dialingCd,
    //                     phoneNo: params.futureAppt.anonymousPatientDto.cntctPhn
    //                 },
    //                 isHKIDValid: (params.futureAppt.anonymousPatientDto.docTypeCd || '') === 'ID'
    //             };
    //             updateField.anonyomous = {
    //                 patientKey: params.futureAppt.patientKey
    //             };
    //             this.props.updateState({
    //                 ...updateField,
    //                 pageStatus: anonPageStatus.UPDATE,
    //                 newOrUpdate: UpdateMeans.UPDATE
    //             });
    //         } else if (params.redirectFrom === accessRightEnum.waitingList) {
    //             delete params.redirectFrom;
    //             //this.props.getEncounterTypeListBySite(this.props.serviceCd, params.siteId, (enctList) => {
    //             bookData = AppointmentUtil.loadWaitListPassedData(bookData, params, this.props.encounterTypeList, this.props.destinationList);
    //             let anonData = AppointmentUtil.loadWaitListAnonData(params);
    //             updateField.waitingList = {
    //                 version: params.version,
    //                 waitListId: params.waitListId
    //             };
    //             updateField.anonyomousBookingActiveInfo = anonData.anonyomousBookingActiveInfo;
    //             updateField.anonymousPersonalInfoBackUp = _.cloneDeep(anonData.anonyomousBookingActiveInfo);
    //             updateField.anonPatientInfo = anonData.anonPatientInfo;
    //             this.props.updateState(updateField);
    //             this.props.initAnonBookingData(bookData);
    //             //});
    //             return;
    //         } else if (params.redirectFrom === accessRightEnum.calendarView) {
    //             bookData = { ...bookData, ...params.bookData };
    //         }
    //     }
    //     // this.props.getEncounterTypeListBySite(this.props.serviceCd, this.props.siteId, (enctList) => {
    //     //     bookData.encounterTypeList = enctList;
    //     this.props.initAnonBookingData(bookData);
    //     // });
    // }

    formSubmitFunc = (callback) => {
        let formSubmit = this.refs.anonymousBookingForm.isFormValid(false);
        formSubmit.then(result => {
            if (result) {
                callback();
            } else {
                this.refs.anonymousBookingForm.focusFail();
            }
        });
    }

    handleBtnClick = (type, params) => {
        this.setState({bookingAction:type});
        this.updateSearchCriteria();
        if (type === 'Book') {
            this.props.resetSqueeze();
            const { bookingData,anonPatientInfo } = this.props;
            if (this.props.serviceCd === 'SHS' && anonPatientInfo && anonPatientInfo.patientKey > 0) {
                const bookingFunc = () => {
                    //this.searchTimeSlot();
                    this.formSubmitFunc(() => {
                        //should call check api here
                        const params = {
                            patientKey: anonPatientInfo.patientKey,
                            encntrTypeId: bookingData.encounterTypeId
                        };
                        this.props.checkApptWithEncntrCaseStatus(params, (action) => {
                            if (action === UNEXPECTED_ACTION_TYPE.APPROVAL) {
                                this.setState({
                                    approvalDialogParams: {
                                        ...this.state.approvalDialogParams,
                                        isOpen: true
                                    }
                                });
                            } else if (action === UNEXPECTED_ACTION_TYPE.BLOCK) {
                                this.props.openCommonMessage({ msgCode: '110201' });
                            } else {
                                this.handleBooking();
                            }
                        });
                    });
                };
                this.resetApprovalDialogParams(() => {
                    AppointmentUtil.checkAppEncntrCaseStatusBeforeBook(bookingFunc);
                });
            } else {
                this.formSubmitFunc(this.handleBooking);
            }
        }
        if (type === 'Update') {
            this.formSubmitFunc(this.handleBooking);
        }
        if (type === 'NewCaseBook') {
            this.formSubmitFunc(this.handleNewCaseBooking);
        }
    }

    handleUpdate = (params) => {
        let preData = this.props.bookingDataBackup;
        let newData = this.props.bookingData;
        const daysOfWeek=this.state.daysOfWeekValArr.join('');
        if (preData.encounterTypeCd != newData.encounterTypeCd) {
            this.props.appointmentBook(params);
            return;
        }
        if (preData.subEncounterTypeCd != newData.subEncounterTypeCd) {
            this.props.appointmentBook(params);
            return;
        }
        if (preData.caseTypeCd != newData.caseTypeCd) {
            this.props.appointmentBook(params);
            return;
        }
        if (preData.qtType != newData.qtType) {
            this.props.appointmentBook(params);
            return;
        }
        if (moment(preData.appointmentDate).format('DD-MMM-YYYY') != moment(newData.appointmentDate).format('DD-MMM-YYYY')) {
            this.props.appointmentBook(params);
            return;
        }
        if (moment(preData.appointmentTime).format('HH:mm') != moment(newData.appointmentTime).format('HH:mm')) {
            this.props.appointmentBook(params);
            return;
        }
        if ((preData.elapsedPeriod != newData.elapsedPeriod) ||
            (preData.elapsedPeriodUnit != newData.elapsedPeriodUnit) ||
            (preData.searchLogicCd != newData.searchLogicCd) ||
            (preData.bookingUnit != newData.bookingUnit)
        ) {
            this.props.appointmentBook(params);
            return;
        }
        if (preData.sessId !== newData.sessId) {
            this.props.appointmentBook(params);
            return;
        }
        if (this.props.serviceCd === 'SHS') {
            const daysOfWeekDefault = AppointmentUtil.getDaysOfWeekDefault();
            if (daysOfWeek !== daysOfWeekDefault) {
                this.props.appointmentBook(params);
                return;
            }
        }
        this.handleUpdateAnonAppt();

    }

    handleUpdateAnonAppt = () => {
        const { anonymousPatint, closeTabFunc } = this.props;
        let bookingData = _.cloneDeep(this.props.bookingData);
        const { mobile } = anonymousPatint;
        const isHKIDFormat = PatientUtil.isHKIDFormat(anonymousPatint.docTypeCd);
        const anonDocNo = isHKIDFormat ? PatientUtil.getCleanHKIC(anonymousPatint.docNo) : anonymousPatint.docNo;
        const anonPriDocTypecd = anonymousPatint.priDocTypecd ? anonymousPatint.docTypeCd : undefined;
        const anonPriDocNo = anonymousPatint.priDocNo ? anonDocNo : undefined;
        let submitUpdateParams = {
            anonymousPatientDto: {
                patientKey: anonymousPatint.patientKey,
                areaCd: mobile.areaCd || '',
                // ctryCd:mobile.countryCd||null,
                dialingCd: mobile.dialingCd,
                cntctPhn: mobile.phoneNo || '',
                phnTypeCd: mobile.phoneTypeCd || '',
                engGivename: anonymousPatint.givenName,
                engSurname: anonymousPatint.surname,
                docTypeCd: anonymousPatint.docTypeCd,
                docNo: anonDocNo,
                priDocTypecd: anonPriDocTypecd,
                priDocNo: anonPriDocNo,
                version: anonymousPatint.version
            },
            appointmentDto: {
                apptId: bookingData.appointmentId,
                memo: bookingData.memo,
                version: bookingData.version
            }
        };

        this.props.updateAnonymousAppointment(submitUpdateParams, () => {
            if (closeTabFunc) {
                closeTabFunc(true);
                this.props.updateState({ closeTabFunc: null });
            } else {
                this.props.deleteTabs(accessRightEnum.bookingAnonymous);
            }
        });
    }

    //using this function to get confirm params for confirm booking
    loadConfirmParams = (timeSlotData, bookingData, anonPatientInfo) => {
        let sdtmString = timeSlotData[0].slotDate + ' ' + timeSlotData[0].list[0].startTime + ':00';
        let edtmString = timeSlotData[0].slotDate + ' ' + timeSlotData[0].list[0].endTime + ':00';
        // Set the appt Date and Time FYI :. Time Slot Date Time
        let apptDate = moment(moment(timeSlotData[0].list[0].slotDate).format(Enum.DATE_FORMAT_EYMD_VALUE) + ' ' + timeSlotData[0].list[0].startTime + ':00').format();
        let sdtm = moment(new Date(sdtmString)).format();
        let edtm = moment(new Date(edtmString)).format();
        let bookTimeSlotParams = [];
        const { caseDto } = this.state;
        for (let a = 0; a < timeSlotData[0].list.length; a++) {
            bookTimeSlotParams[a] = timeSlotData[0].list[a].slotId;
        }

        let confirmAppointmentDto = {
            remarkTypeId: timeSlotData[0].remarkId,
            apptDate: apptDate,
            apptSlipRemark: timeSlotData[0].memo,
            edtm: edtm,
            encntrTypeId: bookingData.encounterTypeId,
            isSqueeze: timeSlotData[0].isSqueeze || 0,
            isUrg: 0,
            isUrgSqueeze: timeSlotData[0].isUrgentSqueeze || 0,
            isObs: 0,
            patientKey: anonPatientInfo.patientKey === '0' ? '' : anonPatientInfo.patientKey,
            qtId: bookingData.qtType,
            rmId: bookingData.rmId,
            sdtm: sdtm,
            seq: 0,
            sessId: timeSlotData[0].list[0].sessId,
            siteId: bookingData.siteId,
            tmsltIdList: bookTimeSlotParams,
            memo: timeSlotData[0].memo,
            remarkId: timeSlotData[0].remarkId,
            apptTypeCd: bookingData.qtType,
            appointmentTypeCd: bookingData.qtType,
            caseNo: anonPatientInfo.caseNo,
            caseDto: caseDto || null
        };
        if (this.props.serviceCd === 'SHS') {
            const { searchCriteria } = this.state;
            const searchCriteriaStr = AppointmentUtil.readySearchCriteriaStr(searchCriteria);
            confirmAppointmentDto.searchCriteria = searchCriteriaStr;
        }

        let massageHkid = (docNo) => docNo ? docNo.replace('(', '').replace(')', '').toUpperCase().padStart(9, ' ') : '';
        let docNo = this.props.anonymousPatint.docNo;
        if (PatientUtil.isHKIDFormat(this.props.anonymousPatint.docTypeCd)) {
            docNo = massageHkid(this.props.anonymousPatint.docNo);
        }

        let newAnonymousPatientDto = {
            areaCd: anonPatientInfo.mobile.areaCd,
            // ctryCd: anonPatientInfo.mobile.countryCd,
            dialingCd: anonPatientInfo.mobile.dialingCd,
            docNo: docNo,
            docTypeCd: this.props.anonymousPatint.docTypeCd,
            engGivename: anonPatientInfo.givenName,
            engSurname: anonPatientInfo.surname,
            cntctPhn: anonPatientInfo.mobile.phoneNo,
            phnTypeCd: anonPatientInfo.mobile.phoneTypeCd,
            // 'priDocNo': docNo,
            // 'priDocTypeCd': this.props.anonymousPatint.docTypeCd
            patientKey: anonPatientInfo.patientKey
        };

        let submitParams = {
            confirmAppointmentDto,
            newAnonymousPatientDto
        };

        return submitParams;
    }


    handleReAnonymousAppt = (timeslotData) => {
        const { anonPatientInfo } = this.props;
        let bookingData = _.cloneDeep(this.props.bookingData);
        const { mobile } = anonPatientInfo;
        const selected_apptInfo_baseVo = bookingData.appointmentDetlBaseVoList.find(item => item.isObs === 0);
        let bookTimeSlotList = timeslotData;

        let apptDateTime = moment(moment(bookTimeSlotList[0].list[0].slotDate).format(Enum.DATE_FORMAT_EYMD_VALUE) + ' ' + bookTimeSlotList[0].list[0].startTime + ':00').format();
        let timesoltVoList = [];
        bookTimeSlotList[0].list.forEach(slotData => {
            let sdtmString = slotData.slotDate + ' ' + slotData.startTime + ':00';
            let edtmString = slotData.slotDate + ' ' + slotData.endTime + ':00';
            let sdtm = moment(new Date(sdtmString)).format();
            let edtm = moment(new Date(edtmString)).format();
            let slot = {
                qtType: bookingData.qtType,
                sdtm: sdtm,
                edtm: edtm,
                tmsltId: slotData.slotId
            };
            timesoltVoList.push(slot);
        });
        const isHKIDFormat = PatientUtil.isHKIDFormat(anonPatientInfo.docTypeCd);

        const anonDocNo = isHKIDFormat ? PatientUtil.getCleanHKIC(anonPatientInfo.docNo) : anonPatientInfo.otherDocNo;
        const anonPriDocTypecd = anonPatientInfo.priDocTypecd ? anonPatientInfo.docTypeCd : undefined;
        const anonPriDocNo = anonPatientInfo.priDocNo ? anonDocNo : undefined;
        let submitUpdateParams = {
            anonymousPatientDto: {
                patientKey: anonPatientInfo.patientKey,
                areaCd: mobile.areaCd || '',
                // ctryCd:mobile.countryCd||null,
                dialingCd: mobile.dialingCd,
                cntctPhn: mobile.phoneNo || '',
                phnTypeCd: mobile.phoneTypeCd || '',
                engGivename: anonPatientInfo.givenName,
                engSurname: anonPatientInfo.surname,
                docTypeCd: anonPatientInfo.docTypeCd,
                docNo: anonDocNo,
                priDocTypeCd: anonPriDocTypecd,
                priDocNo: anonPriDocNo,
                // docNo:anonPatientInfo.docNo,
                version: anonPatientInfo.version
            },
            apptInfoBaseVo: {
                appointmentId: bookingData.appointmentId,
                caseNo: bookingData.caseNo || '',
                patientKey: anonPatientInfo.patientKey,
                siteId: bookingData.siteId,
                encntrTypeCd: bookingData.encounterTypeCd,
                rmCd: bookingData.rmCd,
                bookingUnit: bookingData.bookingUnit,
                // isSqueeze: bookingData.isSqueeze?bookingData.isSqueeze:0,
                isSqueeze: bookTimeSlotList[0].isSqueeze || 0,
                isUrgSqueeze: bookTimeSlotList[0].isUrgentSqueeze || 0,
                isTrace: bookingData.isTrace,
                isUrg: bookingData.isUrg,
                attnStatusCd: bookingData.attnStatusCd,
                apptTypeCd: bookingData.qtType,
                firstOfferApptDtm: bookingData.firstOfferApptDtm || null,
                version: bookingData.version,
                apptDateTime: apptDateTime,
                apptDateEndTime: null,
                reschRsnTypeId: bookingData.reschRsnTypeId,
                reschRsnRemark: bookingData.reschRsnRemark,
                memo: bookingData.memo || '',
                forDoctorOnly: bookingData.forDoctorOnly || '',
                priority: bookingData.priority || '',
                patientStatusCd: bookingData.patientStatusCd,
                appointmentDetlBaseVoList: [{
                    ...selected_apptInfo_baseVo,
                    sessId: bookingData.sessId,
                    encntrTypeId: bookingData.encounterTypeId,
                    rmId: bookingData.rmId,
                    memo: bookingData.memo || '',
                    //     mapAppointmentTimeSlotVosList: [{
                    //         ...selected_apptInfo_baseVo_mapTimeslot,
                    //         qtType: bookingData.qtType,
                    //         sdtm: sdtm,
                    //         edtm: edtm,
                    //         tmsltId: bookTimeSlotList[0].list[0].slotId
                    // }]
                    mapAppointmentTimeSlotVosList: timesoltVoList
                }]
            }
        };
        const callback = () => {
            if (this.props.closeTabFunc) {
                this.props.closeTabFunc(true);
                this.props.updateState({ closeTabFunc: null });
            } else {
                this.props.deleteTabs(accessRightEnum.bookingAnonymous);
                this.props.updateState({ newOrUpdate: UpdateMeans.UPDATE });
            }
        };
        if (this.props.serviceCd === 'SHS') {
            const { searchCriteria } = this.state;
            const searchCriteriaStr = AppointmentUtil.readySearchCriteriaStr(searchCriteria);
            submitUpdateParams.apptInfoBaseVo.searchCriteria = searchCriteriaStr;
        }
        this.props.auditAction('Confirm Reschedule Anonymous Appointment');
        this.props.reAnonymousAppointment(submitUpdateParams, callback);
        // this.props.updateAnonymousAppointment(submitUpdateParams, () => {
        //     this.props.deleteTabs(accessRightEnum.bookingAnonymous);
        // });
    }

    handleBooking = () => {
        this.props.getBookingMaximumTimeslot(this.props.bookingData.encounterTypeId, (data) => {
            if (parseInt(this.props.bookingData.bookingUnit) > data.data.maxTmslt) {
                this.props.openCommonMessage({
                    msgCode: '110369'
                });
            } else {
                let params = AppointmentUtil.handleBookingDataToParams(_.cloneDeep(this.props.bookingData), 'N');
                // params.newOrUpdate=this.props.pageStatus===anonPageStatus.UPDATE?UpdateMeans.UPDATE:UpdateMeans.BOOKNEW;

                if (this.props.serviceCd === 'SHS') {
                    //const daysOfWeekDefault = AppointmentUtil.getDaysOfWeekDefault();
                    const daysOfWeek = this.state.daysOfWeekValArr.join('');
                    // if (daysOfWeek !== daysOfWeekDefault) {
                    params.daysOfWeek = daysOfWeek;
                    // }
                }
                if (this.props.pageStatus === anonPageStatus.UPDATE) {
                    this.props.auditAction('Update Anonymous Appointment');
                    this.handleUpdate(params);
                    return;
                }
                if (params) {
                    this.props.updateState({ bookWithNewCase: false });
                    this.props.auditAction('Book New Anonymous Appointment');
                    this.props.appointmentBook(params);
                }
            }
        });
    }

    handleNewCaseBooking = () => {
        let params = AppointmentUtil.handleBookingDataToParams(_.cloneDeep(this.props.bookingData), 'N');
        if (params) {
            this.props.updateState({ bookWithNewCase: true });
            this.props.auditAction('Book New Case Appointment');
            this.props.appointmentBook(params);
        }
    }

    checkingBeforeConfirm = () => {
        const { anonPatientInfo, patientList } = this.props;
        //no patient
        if (!anonPatientInfo) {
            this.props.openCommonMessage({
                msgCode: '111206',
                params: [{ name: 'PATIENT_CALL', value: CommonUtil.getPatientCall() }]
            });
            return false;
        }
        //dead patient
        if (parseInt(anonPatientInfo.deadInd)) {
            this.props.openCommonMessage({
                msgCode: '111207',
                params: [{ name: 'PATIENT_CALL', value: CommonUtil.getPatientCall() }]
            });
            return false;
        }
        return true;
    }

    checkCaseNo = (callback) => {
        const { patientList } = this.props;
        if (this.props.newOrUpdate === UpdateMeans.UPDATE) {
            callback();
            return;
        }
        if (this.props.waitingList) {
            callback();
            return;
        }
        if (CommonUtil.isUseCaseNo() && CommonUtil.isNewCaseBookingFlow() && patientList && patientList.length === 1 && parseInt(patientList[0].patientKey) > 0) {
            if (this.props.bookWithNewCase) {
                CaseNoUtil.handleNewCaseNoBeforeAnonBookOrLinkPatient(patientList[0], (callbackPara) => {
                    if (callbackPara) {
                        if (typeof callbackPara === 'string') {
                            this.props.updateState({ anonPatientInfo: { ...this.props.anonPatientInfo, callbackPara } });
                            callback();
                        } else {
                            callback(callbackPara);
                        }
                    }
                });
                return;
            }
            // else {
            //     CaseNoUtil.handleCaseNoBeforeAnonBookOrLinkPatient(patientList[0], (caseNo) => {
            //         if (caseNo) {
            //             this.props.updateState({ anonPatientInfo: { ...this.props.anonPatientInfo, caseNo } });
            //             callback();
            //         }
            //     });
            // }
            // return;
        }
        callback();
    }

    handStillAppointments = () => {
        if (!this.checkingBeforeConfirm()) return;
        const { bookingData, anonPatientInfo } = this.props;
        let bookTimeSlotList = this.props.bookSqueezeInTimeSlotData ? _.cloneDeep(this.props.bookSqueezeInTimeSlotData) : _.cloneDeep(this.props.bookTimeSlotData);

        let submitParams = this.loadConfirmParams(bookTimeSlotList, bookingData, anonPatientInfo);
        // Only for PMI Booking not for anonymous booking
        let stillAppointmentsBookConfirmParams = submitParams.confirmAppointmentDto;
        let stillAppointmentsParams = {
            params: [stillAppointmentsBookConfirmParams]
        };
        this.props.stillAppointmentsBookConfirm(stillAppointmentsParams, this.confirmCallBack);
        this.props.resetReplaceAppointment();
    }

    handReplaceOldAppointmnet = () => {
        if (!this.checkingBeforeConfirm()) return;
        const { bookingData, anonPatientInfo, replaceAppointmentData } = this.props;
        let bookTimeSlotList = this.props.bookSqueezeInTimeSlotData ? _.cloneDeep(this.props.bookSqueezeInTimeSlotData) : _.cloneDeep(this.props.bookTimeSlotData);
        // let params = [];

        let replaceableAppointmentDtoList = [];
        replaceAppointmentData.bookingData.forEach(bookingData => {
            let replaceableAppointmentDto = {
                apptId: bookingData.appointmentId,
                version: bookingData.version
            };
            replaceableAppointmentDtoList.push(replaceableAppointmentDto);
        });

        let submitParams = this.loadConfirmParams(bookTimeSlotList, bookingData, anonPatientInfo);
        let replaceOldAppointmnetParams =
        {
            confirmAppointmentDto: submitParams.confirmAppointmentDto,
            replaceableAppointmentDtoList: replaceableAppointmentDtoList
        };
        this.props.replaceOldAppointmnet(replaceOldAppointmnetParams, this.confirmCallBack);
        this.props.resetReplaceAppointment();
    }

    handleBookConfirm = (timeSlotData) => {
        if (!this.checkingBeforeConfirm()) return;
        this.checkCaseNo((caseDto) => {
            const { bookingData, anonPatientInfo } = this.props;
            let submitParams = {};
            let bookTimeSlotList = timeSlotData;
            // let params = [];

            let sessId = null;
            let startTime = null;
            let endTime = null;
            let slotDate = null;

            let tmslts = bookTimeSlotList.map(
                slotOptions => slotOptions.list || []
            ).flatMap(
                slots => {
                    return (slots || []).flat();
                }
            );
            if (tmslts && tmslts.length > 0) {
                const firstSlot = tmslts[0];
                const lastSlot = tmslts[tmslts.length - 1];
                sessId = firstSlot.sessId;
                startTime = firstSlot.startTime;
                endTime = lastSlot.endTime;
                slotDate = firstSlot.slotDate;
            }

            let tmsltIdList = tmslts.map(
                slot => slot.slotId
            );

            let checkBookingRuleParams = [];

            for (let i = 0; i < bookTimeSlotList.length; i++) {
                let bookTimeSlotParams = [];
                for (let a = 0; a < bookTimeSlotList[i].list.length; a++) {
                    bookTimeSlotParams[a] = bookTimeSlotList[i].list[a].slotId;
                }
                // Checking the More one Appt ??
                let checkBookingRule = {
                    svcCd: this.props.serviceCd,
                    siteId: this.props.siteId,
                    encounterTypeId: bookingData.encounterTypeId,
                    patientKey: anonPatientInfo.patientKey,
                    tmsltIdList: bookTimeSlotParams
                };
                checkBookingRuleParams.push(checkBookingRule);

                // params.push(obj);
            }

            let confirmAppointmentDto = {
                'remarkTypeId': bookTimeSlotList[0].remarkId,
                'apptDate': moment(`${slotDate} ${startTime}`, Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR).format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
                'apptSlipRemark': bookTimeSlotList[0].memo,
                'edtm': moment(`${slotDate} ${endTime}`, Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR).format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
                'encntrTypeId': bookingData.encounterTypeId,
                // 'isSqueeze': bookingData.isSqueeze ? bookingData.isSqueeze : 0,
                'isSqueeze': bookTimeSlotList[0].isSqueeze || 0,
                'isUrg': 0,
                // 'isUrgSqueeze': bookingData.isUrgSqueeze ? bookingData.isUrgSqueeze : 0,
                'isUrgSqueeze': bookTimeSlotList[0].isUrgentSqueeze || 0,
                'isObs': 0,
                'patientKey': anonPatientInfo.patientKey === '0' ? '' : anonPatientInfo.patientKey,
                'qtId': bookingData.qtType,
                'rmId': bookingData.rmId,
                'sdtm': moment(`${slotDate} ${startTime}`, Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR).format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
                'seq': 0,
                'sessId': sessId,
                'siteId': bookingData.siteId,
                'tmsltIdList': tmsltIdList,
                'memo': bookTimeSlotList[0].memo,
                'remarkId': bookTimeSlotList[0].remarkId,
                'apptTypeCd': bookingData.qtType,
                'appointmentTypeCd': bookingData.qtType,
                'caseNo': anonPatientInfo.caseNo,
                caseDto: caseDto || null
            };
            if (this.props.serviceCd === 'SHS') {
                const { searchCriteria } = this.state;
                const searchCriteriaStr = AppointmentUtil.readySearchCriteriaStr(searchCriteria);
                confirmAppointmentDto.searchCriteria = searchCriteriaStr;
            }

            // if (!anonPatientInfo.patientKey) {
            // let countryOptionsObj = this.props.countryList.find(item => item.countryCd == anonPatientInfo.countryCd);
            // let dialingCd = countryOptionsObj && countryOptionsObj.dialingCd;
            let massageHkid = (docNo) => docNo ? docNo.replace('(', '').replace(')', '').toUpperCase().padStart(9, ' ') : '';
            let docNo = this.props.anonymousPatint.docNo;
            if (PatientUtil.isHKIDFormat(this.props.anonymousPatint.docTypeCd)) {
                docNo = massageHkid(this.props.anonymousPatint.docNo);
            }

            let newAnonymousPatientDto = {
                'areaCd': anonPatientInfo.mobile.areaCd,
                // 'ctryCd': anonPatientInfo.mobile.countryCd,
                'dialingCd': anonPatientInfo.mobile.dialingCd,
                'docNo': docNo,
                'docTypeCd': this.props.anonymousPatint.docTypeCd,
                'engGivename': anonPatientInfo.givenName,
                'engSurname': anonPatientInfo.surname,
                'cntctPhn': anonPatientInfo.mobile.phoneNo,
                'phnTypeCd': anonPatientInfo.mobile.phoneTypeCd,
                'priDocNo': docNo,
                'priDocTypeCd': this.props.anonymousPatint.docTypeCd
            };

            submitParams = {
                confirmAppointmentDto,
                newAnonymousPatientDto
            };

            if (this.props.waitingList) {
                const { anonymousPatint } = this.props;

                const { mobile } = anonymousPatint;
                let anonymousPatientDto = {
                    patientKey: anonymousPatint.patientKey,
                    areaCd: mobile.areaCd || '',
                    // ctryCd:mobile.countryCd||null,
                    dialingCd: mobile.dialingCd,
                    cntctPhn: mobile.phoneNo || '',
                    phnTypeCd: mobile.phoneTypeCd || '',
                    engGivename: anonymousPatint.givenName,
                    engSurname: anonymousPatint.surname,
                    docTypeCd: anonymousPatint.docTypeCd,
                    docNo: anonymousPatint.docNo,
                    version: anonymousPatint.version
                };
                let waitingParams = {
                    anonymousPatientDto,
                    confirmAppointmentDto: submitParams.confirmAppointmentDto,
                    ...this.props.waitingList
                };
                this.props.auditAction('Confirm Anonymous Waiting Booking');
                this.props.bookConfirmWaiting(waitingParams, checkBookingRuleParams, this.confirmCallBack);
            } else {
                if (this.props.newOrUpdate === UpdateMeans.UPDATE) {
                    this.handleReAnonymousAppt(timeSlotData);
                    this.props.updateState({ pageStatus: anonPageStatus.VIEW });
                } else {
                    if (caseDto) {
                        this.setState({ caseDto,bookingAction:'' });
                    }
                    this.props.auditAction('Confirm Anonymous Booking');
                    this.props.bookAnonymousConfirm(submitParams, checkBookingRuleParams, this.confirmCallBack);
                }
            }
        });
    }

    handleBookSearch = () => {
        this.props.updateState({ pageStatus: anonPageStatus.SEARCHING });
    }

    handleBookCancel = () => {
        const { bookingAction } = this.state;
        if (bookingAction === 'Update') {
            this.props.updateState({ pageStatus: anonPageStatus.UPDATE });
        } else {
            this.props.updateState({ pageStatus: anonPageStatus.VIEW });
        }
    }

    fetchLogShsEncntrCaseDto = (apptInfo) => {
        if (apptInfo && parseInt(apptInfo.patientKey) > 0) {
            const { approvalDialogParams } = this.state;
            const { bookingData } = this.props;
            if (approvalDialogParams.staffId) {
                const encounterDto = bookingData.encounterTypeList.find(x => x.encntrTypeId === bookingData.encounterTypeId);
                if (encounterDto) {
                    this.props.logShsEncntrCase({
                        'actionType': 'A',
                        'approvalRsnCd': approvalDialogParams.rsnCd,
                        'approvalRsnTxt': approvalDialogParams.rsnTxt,
                        'approverId': approvalDialogParams.staffId,
                        'apptIds': [apptInfo.apptId],
                        'isNewOldEncntrType': encounterDto.isNewOld,
                        'patientKey': apptInfo.patientKey,
                        'sspecId': encounterDto.sspecId
                    });
                }
                this.resetApprovalDialogParams();
            }
        }
    }

    confirmCallBack = (data) => {
        //SHS encounter case reason log
        this.fetchLogShsEncntrCaseDto(data);

        if (this.props.pageStatus === anonPageStatus.CONFIRMED) {
            if (this.props.closeTabFunc) {
                this.props.closeTabFunc(true);
                this.props.updateState({ closeTabFunc: null });
            } else {
                // this.props.deleteTabs(accessRightEnum.bookingAnonymous);
                this.props.updateState({ pageStatus: anonPageStatus.VIEW });
            }
        }
        if (data && data.caseDto && data.caseDto.caseNo && data.patientKey) {
            if (this.props.patientInfo && parseInt(this.props.patientInfo.patientKey) === parseInt(data.patientKey)) {
                this.props.refreshPatient({
                    isRefreshCaseNo: true,
                    caseNo: data.caseDto.caseNo
                });
            }
        }
        this.setState({caseDto:null,bookingAction:''});
    }

    handleAnonymousInfoChange = (data) => {
        this.props.updateState({ anonyomousBookingActiveInfo: data });
    }

    validatorListener = (isvalid, name) => {
        let patientInfo = { ...this.props.patient };
        if (!isvalid) {
            patientInfo[name] = '';
            if (this.invalidFieldList.indexOf(name) < 0) {
                this.invalidFieldList.push(name);
            }
        } else {
            let tempInvalidFieldList = [];
            this.invalidFieldList.forEach(f => {
                if (f !== name) {
                    tempInvalidFieldList.push(f);
                }
                this.invalidFieldList = tempInvalidFieldList;
            });
        }
        this.fillingPatientInfo(patientInfo);
    }

    handleSearchDialogSave = (timeSlotData) => {
        // bookSqueezeInTimeSlotData) : _.cloneDeep(this.props.bookTimeSlotData

        let bookingData = _.cloneDeep(this.props.bookingData);
        let updateData = {};
        bookingData.isSqueeze = timeSlotData[0].isSqueeze;
        bookingData.isUrgSqueeze = timeSlotData[0].isUrgentSqueeze;
        updateData = {
            bookingData,
            pageStatus: anonPageStatus.SELECTED
        };
        if (timeSlotData[0].isSqueeze === 1 || timeSlotData[0].isUrgentSqueeze === 1) {
            updateData.bookSqueezeInTimeSlotData = timeSlotData;
        } else {
            updateData.bookTimeSlotData = timeSlotData;
            updateData.bookSqueezeInTimeSlotData = null;
        }
        this.props.updateState(updateData);
        // let bookTimeSlot = _.cloneDeep(copyBookingTimeSlot);
        // if (bookTimeSlot.findIndex(x => x.isSqueeze) > -1) {
        //     this.props.updateState({
        //         bookSqueezeInTimeSlotData: bookTimeSlot,
        //         pageDialogStatus: PAGE_DIALOG_STATUS.SELECTED,
        //         pageStatus: PAGE_DIALOG_STATUS.SELECTED,
        //         bookConfirmSelected: -1
        //     });
        // } else {
        //     this.props.updateState({
        //         bookTimeSlotData: bookTimeSlot,
        //         bookSqueezeInTimeSlotData: null,
        //         pageDialogStatus: PAGE_DIALOG_STATUS.SELECTED,
        //         pageStatus: PAGE_DIALOG_STATUS.SELECTED,
        //         bookConfirmSelected: -1
        //     });
        // }
    }

    handleSerchDialogCancel = () => {
        const { bookSqueezeInTimeSlotData } = this.props;
        this.props.updateState({
            // bookTimeSlotData:[],
            // bookSqueezeInTimeSlotData:[],
            pageStatus: bookSqueezeInTimeSlotData ? anonPageStatus.SQUEEZE : anonPageStatus.SELECTED
        });
    }

    handleDeleteAppointment = () => {
        const { deleteReasonType, deleteReasonText } = this.state;
        const { bookingData } = this.props;
        this.props.deleteAnonymousAppointment({
            apptId: bookingData.appointmentId,
            delRsnTypeId: deleteReasonType,
            delRsnRemark: deleteReasonText,
            version: bookingData.version
        }, () => {
            this.props.resetAnonymousBookingData();
            this.setState({ deleteReasonDialogOpen: false, deleteReasonType: '', deleteReasonText: '' });
        });
    }

    handleApprovalSubmit = () => {
        const { searchString, staffId } = this.props.supervisorsApprovalDialogInfo;
        let params = {
            docType: FieldConstant.PATIENT_NAME_TYPE,
            searchString: searchString,
            staffId: staffId
        };
        const callback = () => {
            this.anonymousPatientBarRef.preFillDocPair({ searchType: FieldConstant.PATIENT_NAME_TYPE, searchString: searchString });
        };
        this.props.auditAction('Search Patient');
        this.props.searchPatientList(params, [], callback);
    }

    handleApprovalChange = (value) => {
        const { supervisorsApprovalDialogInfo } = this.props;
        this.props.updateField({ supervisorsApprovalDialogInfo: { ...supervisorsApprovalDialogInfo, staffId: value } });
    }

    handleApprovalCancel = () => {
        this.props.auditAction('Click Cancel In Supervisors Approval Dialog', 'Booking(Anonymous)');
        this.props.updateField({ supervisorsApprovalDialogInfo: { staffId: '', open: false, searchString: '' } });
        const contactPhone = {
            phoneId: '',
            phoneTypeCd: 'M',
            // countryCd: 'HK',
            countryCd: null,
            areaCd: '',
            dialingCd: FieldConstant.DIALING_CODE_DEFAULT_VALUE,
            phoneNo: '',
            smsPhoneInd: ''
        };
        const patInfo = {
            anonyomousBookingActiveInfo: {
                docTypeCd: 'ID',
                docNo: '',
                surname: '',
                givenName: '',
                mobile: contactPhone,
                isHKIDValid: true
            },
            patientList: [],
            anonyomous: [],
            waitingList: null
        };

        this.props.updateState({ ...patInfo });
    }

    resetApprovalDialog = () => {
        this.props.updateField({ supervisorsApprovalDialogInfo: { staffId: '', open: false, searchString: '' } });
    }

    updateSearchCriteria = () => {
        const { appointmentMode, bookingData, serviceCd } = this.props;
        //let searchCriteria = this.state.searchCriteria
        if (serviceCd === 'SHS') {
            let criteria = [];
            // if (appointmentMode === BookMeans.SINGLE) {
                if (bookingData.appointmentDate) {
                    criteria.push({ label: 'Exact Date: ', value: moment(bookingData.appointmentDate).format(Enum.DATE_FORMAT_EDMY_VALUE) });
                } else if (bookingData.elapsedPeriod && bookingData.elapsedPeriodUnit) {
                    criteria.push({ label: 'Period Later: ', value: `${bookingData.elapsedPeriod} ${bookingData.elapsedPeriodUnit}(s)` });
                }
            // } else if (appointmentMode === BookMeans.MULTIPLE) {
            //     const intervalUnit = Enum.INTERVAL_TYPE.find(x => x.code === bookingData.multipleIntervalUnit);
            //     criteria.push({ label: 'Exact Date: ', value: moment(bookingData.multipleAppointmentDate).format(Enum.DATE_FORMAT_EDMY_VALUE) });
            //     criteria.push({ label: 'Interval: ', value: `${bookingData.multipleInterval} ${intervalUnit.engDesc.toLowerCase()}(s)` });
            // }
            this.setState({ searchCriteria: criteria });
        }
    }

    updateDaysOfWeek = (daysOfWeekValArr) => {
        this.setState({ daysOfWeekValArr: daysOfWeekValArr });
    }

    resetDaysOfWeek = () => {
        const daysOfWeekDefault = AppointmentUtil.getDaysOfWeekDefault();
        let _daysOfWeekValArr = [1,1,1,1,1,1,1];
        daysOfWeekDefault.split('').forEach((x, idx) => {
            _daysOfWeekValArr[idx] = parseInt(x);
        });
        this.setState({ daysOfWeekValArr: _daysOfWeekValArr });
    }

    handleUpdateApprovalDialogParams = (name, value) => {
        let params = _.cloneDeep(this.state.approvalDialogParams);
        params[name] = value;
        if (name === 'rsnCd') {
            params = {
                ...params,
                rsnTxt: ''
            };
        } else if (name === 'rsnTxt') {
            params = {
                ...params,
                rsnCd: ''
            };
        }
        this.setState({
            approvalDialogParams: params
        });
    }

    resetApprovalDialogParams = (callback) => {
        this.setState({
            approvalDialogParams: {
                isOpen: false,
                staffId: '',
                rsnCd: null,
                rsnTxt: ''
            }
        }, () => { callback && callback(); });
    }

    render() {
        const {
            classes,
            bookingData,
            bookTimeSlotData,
            openReplaceAppointmentDialog,
            openSameDayAppointmentDialog,
            replaceAppointmentData,
            pageStatus,
            patientList,
            bookSqueezeInTimeSlotData,
            patientSearchParam,
            isShowRemarkTemplate,
            encounterTypes
        } = this.props;

        const { approvalDialogParams } = this.state;

        // let openSqueezeInAppointmentDialog = (pageStatus === anonPageStatus.SEARCHING
        //     || pageStatus === anonPageStatus.SELECTED) && (this.props.bookSqueezeInTimeSlotData);

        let inputPatientInfo = patientList && patientList[0] ? PatientUtil.getPmiNPatientName(
            patientList[0].patientKey, patientList[0].idSts, patientList[0].engSurname,
            patientList[0].engGivename, patientList[0].nameChi)
            : '';

        const gestCalConfigs = (this.state.gestCalcParams || []).find(x => x.siteId === bookingData.siteId);

        return (
            <Grid container spacing={1} className={classes.root} id={'bookingAnonymousSection'}>
                <Grid item container direction="column" xs={12}>
                    <ValidatorForm ref="anonymousBookingForm">
                        <AnonymousPatientBar
                            isDoUpdate={pageStatus === anonPageStatus.UPDATE}
                            id={'bookingAnonymousPatientBar'}
                            codeList={this.props.codeList}
                            countryList={this.props.countryList}
                            patient={this.props.anonymousPatint}
                            anonymousInfoOnchange={this.handleAnonymousInfoChange}
                            updateState={this.props.updateState}
                            searchPatientList={this.props.searchPatientList}
                            updateField={this.props.updateField}
                            openCommonMessage={this.props.openCommonMessage}
                            clinicConfig={this.props.clinicConfig}
                            innerRef={r => this.anonymousPatientBarRef = r}
                        />
                        <BookAnonForm
                            handleBtnClick={this.handleBtnClick}
                            countryList={this.props.countryList}
                            updateField={this.props.updateField}
                            handleOpenDeleteReason={() => { this.setState({ deleteReasonDialogOpen: true }); }}
                            handleGestationCalc={() => { this.setState({ gestationCalcOpen: true }); }}
                            isUseGestCalc={this.isUseGestCalc}
                            daysOfWeekValArr={this.state.daysOfWeekValArr}
                            updateDaysOfWeek={this.updateDaysOfWeek}
                            resetDaysOfWeek={this.resetDaysOfWeek}
                        />
                    </ValidatorForm>
                </Grid>
                <BookingConfirmDialog
                    id="appointment_anonymousBooking"
                    open={pageStatus === anonPageStatus.SELECTED}
                    bookTimeSlotData={bookTimeSlotData}
                    bookSqueezeInTimeSlotData={this.props.bookSqueezeInTimeSlotData}
                    bookingData={bookingData}
                    remarkCodeList={this.props.remarkCodeList}
                    handleBookConfirm={this.handleBookConfirm}
                    handleBookSearch={this.handleBookSearch}
                    handleBookCancel={this.handleBookCancel}
                    updateState={this.props.updateState}
                    isAnonymous
                    isShowRemarkTemplate={isShowRemarkTemplate}
                    isShowGestMessage={this.isUseGestCalc && this.state.gestEndDate}
                    gestCalcDto={{
                        startDate: DateUtil.getFormatDate(this.state.gestStartDate),
                        endDate: DateUtil.getFormatDate(this.state.gestEndDate),
                        wkStart: this.state.wkStart,
                        wkEnd: this.state.wkEnd,
                        dayStart: this.state.dayStart,
                        dayEnd: this.state.dayEnd
                    }}
                    searchCriteria={this.state.searchCriteria}
                />
                <SqueezeInAppointmentDialog
                    id={'appointment_booking'}
                    // openSqueezeInAppointmentDialog={openSqueezeInAppointmentDialog}
                    openSqueezeInAppointmentDialog={pageStatus === anonPageStatus.SQUEEZE}
                    bookSqueezeInTimeSlotData={this.props.bookSqueezeInTimeSlotData}
                    bookingData={bookingData}
                    updateState={this.props.updateState}
                    handleBookConfirm={this.handleBookConfirm}
                    handleBookSearch={this.handleBookSearch}
                    handleBookCancel={this.handleBookCancel}
                    putUrgSqueeze={this.props.putUrgSqueeze}
                    putSqueeze={this.props.putSqueeze}
                    isMultiple={false}
                />
                <ReplaceAppointmentDialog
                    id="appointment_booking"
                    openReplaceAppointmentDialog={openReplaceAppointmentDialog}
                    handStillAppointments={this.handStillAppointments}
                    handReplaceOldAppointmnet={this.handReplaceOldAppointmnet}
                    updateState={this.props.updateState}
                    inputPatientInfo={inputPatientInfo}
                    replaceAppointmentData={this.props.replaceAppointmentData}
                    resetReplaceAppointment={this.props.resetReplaceAppointment}
                />
                <OverlappedPeriodAppointmentDialog
                    id="appointment_booking"
                    openSameDayAppointmentDialog={openSameDayAppointmentDialog}
                    handStillAppointments={this.handStillAppointments}
                    updateState={this.props.updateState}
                    resetReplaceAppointment={this.props.resetReplaceAppointment}
                />

                {
                    pageStatus === anonPageStatus.SEARCHING ?
                        <BookingSearchDialog
                            id="appointment_anonymousBooking"
                            open={pageStatus === anonPageStatus.SEARCHING}
                            updateState={this.props.updateState}
                            listTimeSlot={this.props.listTimeSlot}
                            defaultCaseTypeCd="N"
                            bookingData={{
                                ...bookingData,
                                sessId: bookingData.sessId === '*All' ? null : bookingData.sessId
                            }}
                            bookingTimeSlot={bookSqueezeInTimeSlotData ? bookSqueezeInTimeSlotData : bookTimeSlotData}
                            timeSlotList={this.props.timeSlotList}
                            isMultiple={false}
                            handleSave={this.handleSearchDialogSave}
                            handleCancel={this.handleSerchDialogCancel}
                        /> : null
                }
                <DeleteApptDialog
                    id="booking_anonymous"
                    open={this.state.deleteReasonDialogOpen}
                    deleteReasonType={this.state.deleteReasonType}
                    deleteReasonsList={this.props.deleteReasonsList}
                    deleteReasonText={this.state.deleteReasonText}
                    onChange={(value, name) => {
                        this.setState({ [name]: value });
                    }}
                    onDelete={() => {
                        this.props.auditAction('Open Delete Appointment Dialog', null, null, false, 'ana');
                        this.handleDeleteAppointment();
                    }}
                    onCancel={() => {
                        this.props.auditAction('Close Delete Appointment Dialog', null, null, false, 'ana');
                        this.setState({ deleteReasonDialogOpen: false, deleteReasonType: '', deleteReasonText: '' });
                    }}
                />
                {this.props.supervisorsApprovalDialogInfo.open ?
                    <SupervisorsApprovalDialog
                        title={`Search by ${CommonUtil.getPatientCall()} Name: `}
                        searchString={this.props.supervisorsApprovalDialogInfo.searchString}
                        confirm={this.handleApprovalSubmit}
                        handleCancel={this.handleApprovalCancel}
                        handleChange={this.handleApprovalChange}
                        resetApprovalDialog={this.resetApprovalDialog}
                        supervisorsApprovalDialogInfo={this.props.supervisorsApprovalDialogInfo}
                    /> : null
                }
                {
                    this.state.gestationCalcOpen ?
                        <GestationCalcDialog
                            calcConfig={gestCalConfigs}
                            handleConfirm={(gcForm) => {
                                this.setState({ gestationCalcOpen: false });
                                if (moment(gcForm.gestStartDate).isValid() && moment(gcForm.gestEndDate).isValid()) {
                                    let startDate = gcForm.gestStartDate;
                                    if (moment(startDate).isBefore(moment(), 'days')) {
                                        startDate = moment();
                                    }
                                    this.props.updateState({
                                        bookingData: {
                                            ...bookingData,
                                            appointmentDate: startDate,
                                            appointmentTime: moment(startDate).set({ hour: 0, minute: 0, second: 0 })
                                        }
                                    }).then(() => {
                                        this.setState({
                                            gestStartDate: gcForm.gestStartDate,
                                            gestEndDate: gcForm.gestEndDate,
                                            wkStart: gcForm.gestWeekStart,
                                            wkEnd: gcForm.gestWeekEnd,
                                            dayStart: gcForm.gestDayStart,
                                            dayEnd: gcForm.gestDayEnd
                                        });
                                    });
                                }
                            }}
                            handleClose={() => {
                                this.setState({ gestationCalcOpen: false });
                            }}
                        /> : null
                }
                {
                    this.props.serviceCd === 'SHS' ?
                        approvalDialogParams.isOpen ?
                            <UnexpectedEnctrApprlDialog
                                appointment={bookingData}
                                approvalDialogParams={approvalDialogParams}
                                confirmCallback={this.handleBooking}
                                handleUpdateApprovalDialogParams={this.handleUpdateApprovalDialogParams}
                                encounterTypes={encounterTypes}
                            /> : null
                        : null
                }
            </Grid>
        );
    }
}

const mapStatetoProps = (state) => {
    return {
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        siteId: state.login.clinic.siteId,
        clinicConfig: state.common.clinicConfig,
        anonPatientInfo: state.bookingAnonymousInformation.anonPatientInfo,
        timeSlotList: state.bookingAnonymousInformation.timeSlotList,
        remarkCodeList: state.bookingAnonymousInformation.remarkCodeList,
        pageStatus: state.bookingAnonymousInformation.pageStatus,
        bookSqueezeInTimeSlotData: state.bookingAnonymousInformation.bookSqueezeInTimeSlotData,
        bookingData: state.bookingAnonymousInformation.bookingData,
        bookTimeSlotData: state.bookingAnonymousInformation.bookTimeSlotData,
        waitingList: state.bookingAnonymousInformation.waitingList,
        bookingDataBackup: state.bookingAnonymousInformation.bookingDataBackup,
        anonymousPatint: state.bookingAnonymousInformation.anonyomousBookingActiveInfo,
        anonymousPersonalInfoBackUp: state.bookingAnonymousInformation.anonymousPersonalInfoBackUp,
        currentAnonyomousBookingActiveInfo: state.bookingAnonymousInformation.currentAnonyomousBookingActiveInfo,
        countryList: state.patient.countryList || [],
        codeList: state.bookingAnonymousInformation.codeList,
        encounterTypes: state.common.encounterTypes,
        openReplaceAppointmentDialog: state.bookingAnonymousInformation.replaceAppointmentData.openReplaceAppointmentDialog,
        openSameDayAppointmentDialog: state.bookingAnonymousInformation.replaceAppointmentData.openSameDayAppointmentDialog,
        replaceAppointmentData: state.bookingAnonymousInformation.replaceAppointmentData,
        anonyomous: state.bookingAnonymousInformation.anonyomous,
        newOrUpdate: state.bookingAnonymousInformation.newOrUpdate,
        patientList: state.bookingAnonymousInformation.patientList,
        bookWithNewCase: state.bookingAnonymousInformation.bookWithNewCase,
        closeTabFunc: state.bookingAnonymousInformation.closeTabFunc,
        deleteReasonsList: state.common.deleteReasonsList,
        supervisorsApprovalDialogInfo: state.bookingAnonymousInformation.supervisorsApprovalDialogInfo,
        patientSearchParam: state.bookingAnonymousInformation.patientSearchParam,
        destinationList: state.patient.destinationList,
        isShowRemarkTemplate: state.bookingAnonymousInformation.isShowRemarkTemplate,
        patientInfo: state.patient.patientInfo,
        encounterTypeList: state.bookingAnonymousInformation.bookingData.encounterTypeList,
        tabsActiveKey: state.mainFrame.tabsActiveKey,
        redirectParam: state.bookingAnonymousInformation.redirectParam
    };
};

const mapDispatchtoProps = {
    resetInfoAll,
    appointmentBook,
    listTimeSlot,
    bookAnonymousConfirm,
    bookConfirmWaiting,
    updateState,
    deleteTabs,
    openCommonMessage,
    redesignListRemarkCode,
    updateCurTab,
    updateAnonymousAppointment,
    cancelAndConfirmAnonymousAppointment,
    getCodeList,
    initAnonBookingData,
    searchPatientList,
    stillAppointmentsBookConfirm,
    replaceOldAppointmnet,
    resetReplaceAppointment,
    resetSqueeze,
    putSqueeze,
    putUrgSqueeze,
    updateField,
    reAnonymousAppointment,
    getBookingMaximumTimeslot,
    auditAction,
    deleteAnonymousAppointment,
    resetAnonymousBookingData,
    refreshPatient,
    getClcAntGestCalcParams,
    getEncounterTypeListBySite,
    checkApptWithEncntrCaseStatus,
    logShsEncntrCase
};

export default connect(mapStatetoProps, mapDispatchtoProps)(withStyles(styles)(BookingAnonymousInformation));
