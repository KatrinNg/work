import moment from 'moment';
import _ from 'lodash';
import Enum, { APPT_TYPE_CODE } from '../enums/enum';
import { PatientUtil, CommonUtil, CaseNoUtil, RegistrationUtil, EnctrAndRmUtil } from './index';
import { initBookingData } from '../constants/appointment/bookingInformation/bookingInformationConstants';
import { initTempDetailItem } from '../constants/appointment/timeslotTemplate/timeslotTemplateConstants';
import { patientPhonesBasic } from '../constants/registration/registrationConstants';
import { getState } from '../store/util';
import { othApptDtlStsMapping, othApptDtlStsEnum, caseSts } from '../enums/anSvcID/anSvcIDEnum';
import { getIsAtndResetDisplayCancelSts, getApptSearchCriteriaDefault } from './siteParamsUtilities';
import { BookMeans } from '../enums/appointment/booking/bookingEnum';
import {dispatch} from '../store/util';
import { openCommonMessage } from '../store/actions/message/messageAction';
import { getFullName } from './commonUtilities';
import { patientKeyFormatter } from './familyNoUtilities';

export function getOverlappingAppointmentSiteParamsByServiceCd(svcCd, clinicConfig) {
    let result = CommonUtil.getHighestPrioritySiteParams(
        Enum.CLINIC_CONFIGNAME.OVERLAPPING_APPT_CONTRO,
        clinicConfig,
        { serviceCd: svcCd, siteId: null }
    );
    return result;
}

export function getSiteCdServiceCdParams(serviceCd, siteId) {
    let result = {
        params: {
            serviceCd: serviceCd ? serviceCd : '',
            siteId: siteId ? siteId : ''
        }
    };
    return result;
}

export function getElapsedAppointmentDate(period, periodUnit) {
    let newMoment = moment();
    switch (periodUnit) {
        case Enum.ELAPSED_PERIOD_TYPE[0].code:
            newMoment.add(_.toSafeInteger(period), 'days');
            break;
        case Enum.ELAPSED_PERIOD_TYPE[1].code:
            newMoment.add(_.toSafeInteger(period), 'weeks');
            break;
        case Enum.ELAPSED_PERIOD_TYPE[2].code:
            newMoment.add(_.toSafeInteger(period), 'months');
            break;
        default:
            break;
    }
    return newMoment;
}

export function handleBookingDataToParams(bookingData, defaultCaseTypeCd, isMultiple, encounterTypeList) {
    let bookData = _.cloneDeep(bookingData);
    // elapsedFlag default
    bookData.elapsedFlag = false;
    if (!isMultiple) {
        let aDate = bookData.appointmentDate;
        let period = bookData.elapsedPeriod;
        let periodUnit = bookData.elapsedPeriodUnit;
        if (!aDate && period && periodUnit) {
            bookData.appointmentDate = getElapsedAppointmentDate(period, periodUnit);
            bookData.elapsedFlag = true;
        }
        //appointment date
        // if (!bookData.appointmentDate) {
        //     bookData.appointmentDate = moment();
        // }
        // if (moment(bookData.appointmentDate).isBefore(moment(), 'day')) {
        //     openCommonMessage({ msgCode: '111208' });
        //     return null;
        // }
        //appointment time
        if (!bookData.appointmentTime) {
            if (moment(bookData.appointmentDate).isSame(moment(), 'day')) {
                bookData.appointmentTime = moment();
            } else {
                bookData.appointmentTime = moment().set({ hours: 0, minute: 0, second: 0 });
            }
        }
        // } else {
        //     if (moment(bookData.appointmentDate).isSame(moment(), 'day')) {
        //         if (moment(bookData.appointmentTime).isSameOrBefore(moment(), 'millisecond')) {
        //             bookData.appointmentTime = moment();
        //         }
        //     }
        // }
        bookData.appointmentDate = moment(bookData.appointmentDate).format(Enum.DATE_FORMAT_EYMD_VALUE);
        bookData.appointmentTime = moment(bookData.appointmentTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
    }

    //booking unit
    // bookData.bookingUnit = bookData.bookingUnit;
    bookData.caseTypeCd = bookData.caseTypeCd || defaultCaseTypeCd;

    const isANT = getState(state => state.login.service.svcCd) === 'ANT';
    const appointmentDateTo = moment(bookData.appointmentDateTo);

    //Convert to API parameters
    let params = {
        apptStartDate: isMultiple ? moment(bookData.multipleAppointmentDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : bookData.appointmentDate,
        apptStartTime: isMultiple ? '' : bookData.appointmentTime,
        apptEndDate: isMultiple || !isANT ? null : appointmentDateTo.isValid() ? appointmentDateTo.format(Enum.DATE_FORMAT_EYMD_VALUE) : null,
        // apptTypeCd: bookData.appointmentTypeCd,//TODO: will be remove, replace qtType
        apptTypeCd: bookData.qtType,
        bookingUnit: bookData.bookingUnit,
        caseTypeCd: bookData.caseTypeCd,
        clinicCd: bookData.clinicCd,
        siteId: bookData.siteId,
        encounterTypeId: bookData.encounterTypeId,
        rmId: bookData.rmId,
        encounterCd: bookData.encounterTypeCd,
        subEncounterCd: bookData.subEncounterTypeCd,
        intervalType: bookData.multipleIntervalUnit,
        intervalVal: bookData.multipleInterval,
        isElapsed: bookData.elapsedFlag ? 'Y' : 'N',
        isMultiple: isMultiple ? 'Y' : 'N',
        numOfBooking: bookData.multipleNoOfAppointment,
        searchLogicCd: bookData.searchLogicCd,
        sessId: bookData.sessId,
        // qtId: bookData.appointmentTypeCd,//TODO: will be remove, replace qtType
        qtId: bookData.qtType,
        serviceCd: '',
        forDoctorOnly: bookData.forDoctorOnly,
        priority: bookData.priority
    };
    return params;
}

export function initBookData(bookData, encounterTypeList, defaultEncounterCd, isWalkin) {
    if (!bookData) {
        bookData = _.cloneDeep(initBookingData);
    }
    let _encounterList = encounterTypeList.filter(x => x.subEncounterTypeList && x.subEncounterTypeList.length > 0);

    bookData.appointmentDate = bookData.appointmentDate ? bookData.appointmentDate : null;
    bookData.appointmentTime = bookData.appointmentTime ? moment(bookData.appointmentTime, 'HH:mm') : null;

    if (bookData.encounterTypeCd) {
        const selEncounter = _encounterList.find(item => item.encounterTypeCd === bookData.encounterTypeCd);
        const subEncounterTypeList = selEncounter.subEncounterTypeList.filter(item => item.clinic === bookData.siteId);
        bookData.encounterTypeList = _encounterList;

        bookData.subEncounterTypeList = subEncounterTypeList ? subEncounterTypeList : [];
        if (!bookData.subEncounterTypeCd) {
            bookData.subEncounterTypeCd = subEncounterTypeList.length > 0 ? subEncounterTypeList[0].subEncounterTypeCd : '';
        }
    } else {
        const initEncounterDto = EnctrAndRmUtil.get_init_encounter(_.cloneDeep(_encounterList), defaultEncounterCd);
        // const initRoomDto = initEncounterDto && initEncounterDto.encounterTypeList.filter(item => item.encn);
        const initSubEncounter = ((initEncounterDto && initEncounterDto.subEncounterTypeList) || []).filter(item => item.clinic === bookData.siteId);
        const subEncounter = initSubEncounter.find(item => item);
        bookData.encounterTypeList = initEncounterDto.encounterTypeList;
        bookData.encounterTypeCd = initEncounterDto.encounterTypeCd;
        bookData.subEncounterTypeList = initSubEncounter;
        // bookData.subEncounterTypeCd = initSubEncounter.find(item => item).subEncounterTypeCd;
        bookData.subEncounterTypeCd = subEncounter ? subEncounter.subEncounterTypeCd : '';
    }

    bookData.qtType = bookData.qtType || (isWalkin ? 'W' : Enum.APPOINTMENT_TYPE_SUFFIX[0].code);
    //TODO: will be remove, replace qtType
    bookData.appointmentTypeCd = bookData.qtType;
    bookData.appointmentDate = bookData.appointmentDate || (isWalkin ? moment() : null);
    bookData.appointmentTime = bookData.appointmentTime || (isWalkin ? moment().set({
        'hours': 0,
        'minutes': 0,
        'seconds': 0
    }) : null);
    bookData.elapsedPeriod = bookData.elapsedPeriod || '';
    bookData.elapsedPeriodUnit = bookData.elapsedPeriodUnit || '';
    bookData.bookingUnit = bookData.bookingUnit || 1;

    //multiple appointment
    bookData.multipleAppointmentDate = bookData.multipleAppointmentDate || moment();
    bookData.multipleNoOfAppointment = bookData.multipleNoOfAppointment || '';
    bookData.multipleInterval = bookData.multipleInterval || '';
    bookData.multipleIntervalUnit = bookData.multipleIntervalUnit || Enum.INTERVAL_TYPE[1]['code'];

    // Add the rmId and encounterTypeId
    bookData.encounterTypeId = EnctrAndRmUtil.getEncounterTypeIdByTypeCd(bookData.encounterTypeCd, encounterTypeList);
    bookData.rmId = EnctrAndRmUtil.getRmId(bookData.subEncounterTypeCd, bookData.encounterTypeCd, encounterTypeList);
    bookData.rmCd = bookData.subEncounterTypeCd;

    return bookData;
}

export function compareMinuteTime(atime, btime) {
    let diffMinute = moment(atime).set('seconds', 0).diff(moment(btime).set('seconds', 0), 'minutes');
    return diffMinute;
}

export function compareDay(atime, btime) {
    atime = moment(atime).set({ 'hours': 0, 'minutes': 0, 'seconds': 0 });
    btime = moment(btime).set({ 'hours': 0, 'minutes': 0, 'seconds': 0 });
    // if (atime.format('YYYY-MM-DD') === btime.format('YYYY-MM-DD')) {
    //     return 0;
    // } else {
    //     return atime.diff(btime, 'days', true);
    // }
    if (atime.format(Enum.DATE_FORMAT_EYMD_VALUE) === btime.format(Enum.DATE_FORMAT_EYMD_VALUE)) {
        return 0;
    } else {
        return atime.diff(btime, 'days', true);
    }
}

export function isExpireTime(currentDate, currentTime) {
    let mo = moment();
    if (compareDay(currentDate, mo) > 0) {
        return false;
    } else if (compareDay(currentDate, mo) === 0) {
        return compareMinuteTime(currentTime, mo) < 0;
    } else {
        return true;
    }
}

//export function slotRemark(data = {}) {
export function slotRemark_bk(data = {}) {
    let remark = data.startTime + ' ' || '';
    remark += CommonUtil.getFullName(data.engSurname, data.engGivename);
    remark += data.phoneNo ? ', ' + data.phoneNo : '';
    remark += data.appointmentRemark ? ', ' + data.appointmentRemark : '';
    remark += data.appointmentMemo ? ', ' + data.appointmentMemo : '';
    remark += (data.userEngGivenName || data.userEngSurname) ? ' by ' : '';
    remark += CommonUtil.getFullName(data.userEngSurname, data.userEngGivenName);
    return remark;
}

export function slotRemark(data = {}, countryList = []) {
    //let remark = data.stime + ' ' || '';
    let remark = '';
    let docNo = PatientUtil.getFormatDocNoByDocumentPair(data.docTypeCd && data.docNo ? { docTypeCd: data.docTypeCd, docNo: data.docNo } : null);
    remark += docNo ? docNo + ', ' : '';
    remark += CommonUtil.getFullName(data.engSurname, data.engGivenName);
    remark += data.phoneNo ? ', ' + CommonUtil.getFormatPhone(countryList, data) : '';
    remark += data.appointmentRemark ? ', ' + data.appointmentRemark : '';
    remark += data.appointmentMemo ? ', ' + data.appointmentMemo : '';
    remark += (data.userEngGivenName || data.userEngSurname) ? ' by ' : '';
    remark += CommonUtil.getFullName(data.userEngSurname, data.userEngGivenName);
    return remark;
}

export function get_WaitingList_TableRow_ByServiceCd(listConfig, docTypeRender) {
    let rows = [
        {
            name: 'docTypeCd',
            label: 'Doc Type',
            width: 96,
            split: true,
            disableOrder: true,
            customBodyRender: docTypeRender
        },
        {
            name: 'hkidOrDocNo',
            label: 'DOC Number/HKID',
            disableOrder: true,
            split: true,
            width: 160,
            customBodyRender: (value, rowData) => {
                if (rowData && PatientUtil.isHKIDFormat(rowData.docTypeCd)) {
                    return PatientUtil.getHkidFormat(value);
                } else {
                    return PatientUtil.getOtherDocNoFormat(value, rowData.docTypeCd);
                }
            }
        },
        { name: 'englishName', label: 'English Name', disableOrder: true, split: true, width: 120 },
        { name: 'phoneNo', label: 'Phone Number', disableOrder: true, split: true, width: 125 },
        { name: 'clinicCd', label: 'Clinic', width: 70 },
        { name: 'encounterTypeCd', label: 'Encounter Type', width: 150 },
        {
            name: 'statusCd', label: 'Status', width: 80, customBodyRender: (value) => {
                let status = Enum.WAITING_LIST_STATUS_LIST.find(item => {
                    return item.value === value;
                });
                return status && status.label;
            }
        },
        { name: 'travelDtm', label: 'Departure Date', width: 120 },
        { name: 'createdDtm', label: 'Request Date', width: 160 },
        { name: 'countryList', label: 'Destintaion', disableOrder: true, width: 80 }
    ];

    if (listConfig && listConfig.WAITING_LIST) {
        const list = listConfig.WAITING_LIST.sort(function (a, b) {
            return a.displayOrder - b.displayOrder;
        });
        rows = [];
        for (let i = 0; i < list.length; i++) {
            let newRow = {
                name: list[i]['labelCd'],
                label: list[i]['labelName'],
                width: list[i]['labelLength'],
                split: list[i]['site'] === '1',
                disableOrder: true
            };

            if (newRow.name === 'docTypeCd') {
                newRow.customBodyRender = docTypeRender;
            }
            if (newRow.name === 'statusCd') {
                newRow.customBodyRender = (value) => {
                    let status = Enum.WAITING_LIST_STATUS_LIST.find(item => {
                        return item.value === value;
                    });
                    return status && status.label;
                };
            }
            if (newRow.name === 'hkidOrDocNo') {
                newRow.customBodyRender = (value, rowData) => {
                    if (rowData && PatientUtil.isHKIDFormat(rowData.docTypeCd)) {
                        return PatientUtil.getHkidFormat(value);
                    } else {
                        return PatientUtil.getOtherDocNoFormat(value, rowData.docTypeCd);
                    }
                };
            }
            if (newRow.name === 'clinicCd'
                || newRow.name === 'encounterTypeCd'
                || newRow.name === 'statusCd'
                || newRow.name === 'travelDtm'
                || newRow.name === 'createdDtm') {
                newRow.disableOrder = false;
            }
            rows.push(newRow);
        }
    }
    return rows;
}

/**get default elapsed period from clinic config */
export function getDefaultElapsedPeriodBookData(bookData) {
    if (!bookData.appointmentDate && !bookData.appointmentTime) {
        const loginInfo = JSON.parse(sessionStorage.getItem('loginInfo'));
        const service = JSON.parse(sessionStorage.getItem('service'));
        const clinic = JSON.parse(sessionStorage.getItem('clinic'));
        const clinicConfig = JSON.parse(sessionStorage.getItem('clinicConfig'));
        if (loginInfo && clinicConfig) {
            let where = { serviceCd: service.serviceCd, clinicCd: clinic.clinicCd };
            let config = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.ELAPSED_PERIOD, clinicConfig, where);
            if (config) {
                const configValueArr = config.configValue && config.configValue.split('_');
                if (configValueArr && configValueArr.length === 2) {
                    // let newBookingData = _.cloneDeep(initBookingData);
                    bookData.appointmentDate = null;
                    bookData.appointmentTime = null;
                    bookData.elapsedPeriod = configValueArr[0];
                    bookData.elapsedPeriodUnit = configValueArr[1];
                    // bookData = newBookingData;
                }
            }
        }
    }
    return bookData;
}

/**get formated appointment remark and memo */
export function getFormatRemarkAndMemo(apptInfo) {
    return `${apptInfo.remark ? apptInfo.remark : ''}${apptInfo.remark && apptInfo.apptSlipRemark ? ', ' : ''}${apptInfo.apptSlipRemark ? apptInfo.apptSlipRemark : ''}`;
}

/**combine appointment date and time */
export function combineApptDateAndTime(apptInfo, dateFormat = null, timeFormat = null) {
    let tempDateFormat = dateFormat === null ? Enum.DATE_FORMAT_EDMY_VALUE : dateFormat;
    let tempTimeFormat = timeFormat === null ? Enum.TIME_FORMAT_24_HOUR_CLOCK : timeFormat;
    return `${moment(apptInfo.appointmentDate).format(tempDateFormat)} ${moment(apptInfo.appointmentTime, tempTimeFormat).format(tempTimeFormat)}`;
}

export function getBookedApptType(caseTypeCd, apptTypeCd, clinicConfig, where) {
    let bookedApptType = {
        caseType: '',
        bookedQuotaType: ''
    };
    let bookedQuotaType = null;

    const quotaTypeConfig = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE_DESC, clinicConfig, where);
    const caseType = Enum.APPOINTMENT_TYPE_PERFIX.find(item => item.code === caseTypeCd);

    let quotaDescArr = quotaTypeConfig.configValue ? quotaTypeConfig.configValue.split('|') : ['N:Normal', 'F:Force', 'P:Public'];          //Irving:should have the default Quota Type
    let newQuotaArr = CommonUtil.transformToMap(quotaDescArr);

    bookedQuotaType = newQuotaArr.find(item => item.code === apptTypeCd);

    if (caseType) {
        bookedApptType.caseType = caseType.engDesc;
    }

    if (bookedQuotaType) {
        bookedApptType.bookedQuotaType = bookedQuotaType.engDesc;
    }

    return bookedApptType;
}

/**get allow back take attendance day from clinic config */
export function getAllowBackTakeDay(clinicConfig, where) {
    const backTakeDay = CommonUtil.getHighestPrioritySiteParams(Enum.CLINIC_CONFIGNAME.BACK_TAKE_ATTENDANCE_DAY, clinicConfig, where);
    let allowBackTakeDay = backTakeDay.configValue ? `-${backTakeDay.configValue}` : '-7';

    return allowBackTakeDay;
}

/**calculate past appointment can do back take */
export function isExpiryAllowBackTakeDate(clinicConfig, where, pastApptDate) {
    const backTakeDay = CommonUtil.getHighestPrioritySiteParams(Enum.CLINIC_CONFIGNAME.BACK_TAKE_ATTENDANCE_DAY, clinicConfig, where);
    let allowBackTakeDay = backTakeDay.paramValue ? `-${backTakeDay.paramValue}` : '-7';
    let allowBackTakeDate = moment().add(allowBackTakeDay, 'day');
    if (!pastApptDate) {
        return false;
    }
    let apptDate = moment(pastApptDate);
    return apptDate.isBefore(allowBackTakeDate) && !apptDate.isSame(allowBackTakeDate, 'day');
}


/**get current appointment record by appointment Id*/
export function getApptByApptId(appointmentId, relatedList) {
    let curAppointment;
    if (!appointmentId) {
        return null;
    }
    if (relatedList && relatedList.length > 0) {
        curAppointment = relatedList.find(item => item.appointmentId === appointmentId);
    }
    return curAppointment ? curAppointment : null;
}

/**get patient status code from current using case prefix*/
export function getPatientStatusCd(caseNo, patientInfo) {
    let caseNoDto = null;
    if (caseNo && patientInfo && patientInfo.caseList) {
        caseNoDto = patientInfo.caseList.find(item => item.caseNo === caseNo);
    }
    return (caseNoDto && caseNoDto.patientStatus) || (patientInfo && patientInfo.patientSts) || null;
}

/**get patient status flag */
export function getPatientStatusFlag(encounterList, curAppointment) {
    return 'Y';
    // if (!encounterList || encounterList.length === 0) {
    //     return 'N';
    // }

    // if (curAppointment === null) {
    //     return 'N';
    // }

    // let curSelectedEncounter = curAppointment.encounterTypeCd;
    // let curSelectedSubEncounter = curAppointment.subEncounterTypeCd;

    // let encounterDto = encounterList.find(item => item.encounterTypeCd === curSelectedEncounter);

    // if (!encounterDto) {
    //     return 'N';
    // }

    // if (encounterDto.subEncounterTypeList.length === 0) {
    //     return 'N';
    // }

    // let subEncounterDto = encounterDto.subEncounterTypeList.find(item => item.subEncounterTypeCd === curSelectedSubEncounter);
    // return subEncounterDto ? subEncounterDto.patientStatusFlag : 'N';
}

/**calculate how many day(s) is later than given appointment date*/
export function calcDayDiff(bookingDate, slotDate) {
    let dayDiff = 0;
    const dateFormat = Enum.DATE_FORMAT_EDMY_VALUE;
    if (moment(bookingDate, dateFormat).isAfter(moment(slotDate, dateFormat))) {
        return 0;
    }

    dayDiff = moment(bookingDate, dateFormat).diff(moment(slotDate, dateFormat), 'day');

    return dayDiff;

}

export function isPastAppointment(appointment) {
    if (!appointment) {
        return false;
    } else {
        return moment(appointment.appointmentDate).isBefore(moment(), 'day');
    }
}

export function isFutureAppointment(appointment) {
    // if(!appointment)
    return moment(appointment.appointmentDate).isAfter(moment(), 'day');
}

export function isTodayAppointment (appointment) {
    return moment(appointment.appointmentDate).isSame(moment(), 'day');
}

export function getDateDiff(startDate, slotDate, interval, intervalType) {
    let _intervalType = 'day';
    switch (intervalType) {
        case Enum.INTERVAL_TYPE[0].code:
            _intervalType = 'day';
            break;
        case Enum.INTERVAL_TYPE[1].code:
            _intervalType = 'week';
            break;
        case Enum.INTERVAL_TYPE[2].code:
            _intervalType = 'month';
            break;
    }
    return Math.ceil(moment(slotDate).diff(moment(startDate).add(interval || 0, _intervalType), 'day', true));
}

// export function genTableHeader(serviceList, customApptDateAndTime, customService, customDtm, customCaseNom, customLength, customRoom, customMeans, customArrivalDtm, customClinic) {
//     // const { serviceList, clinicList } = this.props;
//     return [
//         { label: 'Appt. Date/Time', name: 'apptDateTime', customBodyRender: (value, rowData) => customApptDateAndTime(value, rowData) },
//         { label: 'Length (mins)', name: 'length', customBodyRender: (value, rowData) => customLength(value, rowData) },
//         { label: 'Service', name: 'serviceCd', customBodyRender: (value, rowData) => customService(value, rowData) },
//         { label: 'Clinic', name: 'clinicName', customBodyRender: (value, rowData) => customClinic(value, rowData) },
//         { label: 'Encounter Type', name: 'encntrTypeDesc' },
//         { label: 'Room', name: 'room', customBodyRender: (value, rowData) => customRoom(value, rowData) },
//         { label: 'Means', name: 'means', customBodyRender: (value, rowData) => customMeans(value, rowData) },
//         { label: 'Arrival Date/Time', name: 'arrivalTime', customBodyRender: (value, rowData) => customArrivalDtm(value, rowData) },
//         { label: 'Case No.', name: 'caseNo', customBodyRender: (value) => customCaseNom(value) }
//         // { label: 'Appt. Date/Time', name: 'apptDateTime', customBodyRender: (value, rowData) => customApptDateAndTime(value, rowData) },
//         // { label: 'Service', name: 'serviceCd', customBodyRender: (value, rowData) => customService(value, rowData, serviceList) },
//         // { label: 'Clinic', name: 'clinicName' },
//         // { label: 'Encounter', name: 'encounterTypeCd' },
//         // { label: 'Sub-encounter', name: 'subEncounterTypeCd' },
//         // { label: 'Appt. Create Date/Time', name: 'createdDtm', customBodyRender: (value, rowData) => customDtm(value, rowData) },
//         // { label: 'Arrival Date/Time', name: 'attnTime', customBodyRender: (value, rowData) => customDtm(value, rowData) },
//         // { label: 'Case No.', name: 'caseNo', customBodyRender: (value, rowData) => customCaseNo(value, rowData) }
//     ];
// }

/**
 * When edit appointment, check if modify the data
 * @method isBookingDataEditing
 * @author JustinLong
 * @param {Object} curSelectedData
 * @param {Object} bookingData
 */
export function isBookingDataEditing(curSelectedData, bookingData, daysOfWeekValArr) {
    let oldData = _.cloneDeep(curSelectedData);
    let curData = _.cloneDeep(bookingData);
    const daysOfWeek=daysOfWeekValArr.join('');
    const daysOfWeekDefault = getDaysOfWeekDefault();
    if (oldData && curData) {
        //if elapsed Period and elapsedPeriodUnit edited
        if (curData.elapsedPeriod && curData.elapsedPeriodUnit && !curData.appointmentDate && !curData.appointmentTime) {
            curData.appointmentDate = getElapsedAppointmentDate(curData.elapsedPeriod, curData.elapsedPeriodUnit);
            curData.appointmentTime = moment().set({ hours: 0, minute: 0, second: 0 });
        }

        let isEdit =
            oldData.encntrTypeId !== curData.encounterTypeId
            || oldData.rmId !== curData.rmId
            || oldData.qtType !== curData.qtType
            || !moment(oldData.appointmentDate).isSame(moment(curData.appointmentDate), 'day')
            || oldData.appointmentTime !== moment(curData.appointmentTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
            || oldData.sessId !== curData.sessId
            || parseInt(oldData.bookingUnit) !== parseInt(curData.bookingUnit)
            || (oldData.forDoctorOnly || '') !== (curData.forDoctorOnly || '')
            || (oldData.priority || '') !== (curData.priority || '')
            || (oldData.memo || '') !== (curData.memo || '')
            || (oldData.patientStatusCd || '') !== (curData.patientStatusCd || '')
            || (oldData.isTrace || 0) !== (curData.isTrace || 0)
            || (oldData.dfltTraceRsnTypeId || '') !== (curData.dfltTraceRsnTypeId || '')
            || (oldData.dfltTraceRsnRemark || '') !== (curData.dfltTraceRsnRemark || '')
            || (oldData.isDfltTracePriority || 0) !== (curData.isDfltTracePriority || 0)
            || daysOfWeek !== daysOfWeekDefault;
        return isEdit;
    } else {
        return false;
    }
}

/**this function will return appointment type (current past future) */
export function getApptTypeByDate(appt) {
    if (!appt) {
        return '';
    }
    let apptTimeTpye = Enum.APPOINTMENT_TIME_TYPE.CURRENT;
    const currentDate = moment().format(Enum.DATE_FORMAT_EDMY_VALUE);
    const apptDate = moment(appt.appointmentDate, Enum.DATE_FORMAT_EDMY_VALUE);
    if (apptDate.isSame(moment(currentDate))) {
        apptTimeTpye = Enum.APPOINTMENT_TIME_TYPE.CURRENT;
    }

    if (apptDate.isBefore(currentDate)) {
        apptTimeTpye = Enum.APPOINTMENT_TIME_TYPE.PAST;
    }

    if (apptDate.isAfter(currentDate)) {
        apptTimeTpye = Enum.APPOINTMENT_TIME_TYPE.FUTURE;
    }

    return apptTimeTpye;
}

/**get service and clinic quota type */
export function loadQuotaType(where, clinicConfig) {
    const quotaDesc = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE_DESC, clinicConfig, where);
    const defaultQuotaDesc = 'N:Normal|F:Force|P:Public|';
    const quotaArr = quotaDesc.configValue ? quotaDesc.configValue.split('|') : defaultQuotaDesc.split('|');
    let newQuotaArr = CommonUtil.transformToMap(quotaArr);

    return newQuotaArr;
}

/**
 * map timeslot template detail list to redux store
 * @param {Array} tmsltTmplList timeslot template detail list
 */
export function mapTmsltTmpToStore(tmsltTmplList) {
    return tmsltTmplList && tmsltTmplList.map(item => {
        let _tmp = {
            ...item,
            startTime: item.stime,
            endTime: item.etime
        };
        const weekday = (Array(7).join(0) + item.weekday).slice(-7);
        for (let i = 0; i < weekday.length; i++) {
            _tmp[`wkd${i}`] = parseInt(weekday.charAt(i));
        }
        delete _tmp.stime;
        delete _tmp.etime;
        delete _tmp.weekday;
        return _tmp;
    }).sort((a, b) => moment(a.startTime, 'HH:mm').diff(moment(b.startTime, 'HH:mm'), 'minutes', true));
}

export function mapStoreToTmsltTmp(templateDetailList) {
    return templateDetailList && templateDetailList.map(item => {
        let _tmp = {
            ...item,
            stime: item.startTime,
            etime: item.endTime
        };
        let weekday = `${item.wkd0}${item.wkd1}${item.wkd2}${item.wkd3}${item.wkd4}${item.wkd5}${item.wkd6}`;
        _tmp.weekday = parseInt(weekday);
        delete _tmp.startTime;
        delete _tmp.endTime;
        delete _tmp.wkd0;
        delete _tmp.wkd1;
        delete _tmp.wkd2;
        delete _tmp.wkd3;
        delete _tmp.wkd4;
        delete _tmp.wkd5;
        delete _tmp.wkd6;
        return _tmp;
    });
}

export function getInitTmslTmp(loginUser) {
    let newTmp = _.cloneDeep(initTempDetailItem);
    newTmp.updateDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
    newTmp.createDtm = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
    newTmp.createBy = loginUser && loginUser.loginName;
    newTmp.updateBy = loginUser && loginUser.loginName;
    return newTmp;
}

export function getBatchCreateTempList(batchCreateObj, loginUser) {
    const { startTime, endTime, timeLen } = batchCreateObj;
    const fm = Enum.TIME_FORMAT_24_HOUR_CLOCK;
    const diff = moment(endTime, fm).diff(moment(startTime, fm), 'minutes');
    const tms = Math.ceil(diff / timeLen);
    let stime = startTime;
    let _tempDetails = [];
    for (let i = 0; i < tms; i++) {
        let etime = moment(stime, fm).add(timeLen, 'minutes').format(fm);
        if (i === tms - 1) {
            if (moment(etime, fm).isAfter(moment(endTime, fm))) {
                // etime = endTime;
                break;
            }
        }
        let newTemp = getInitTmslTmp(loginUser);
        for (let key in batchCreateObj) {
            if (['qt1', 'qt2', 'qt3', 'qt4', 'qt5', 'qt6', 'qt7', 'qt8'].includes(key)) {
                newTemp[key] = batchCreateObj[key];
            }
        }
        newTemp.overallQt = batchCreateObj.overallQt;
        newTemp.wkd0 = 1;
        newTemp.wkd1 = 1;
        newTemp.wkd2 = 1;
        newTemp.wkd3 = 1;
        newTemp.wkd4 = 1;
        newTemp.wkd5 = 1;
        newTemp.wkd6 = 1;
        newTemp.startTime = stime;
        newTemp.endTime = etime;
        _tempDetails.push(newTemp);
        stime = etime;
    }
    return _tempDetails;
}

/**load data that passed by waiting list  */
export function loadWaitListPassedData(bookData, waitData, encounterTypes, destinationList) {
    let memoStrList = [];
    if (waitData.cntryCdList) {
        let cntryCdList = waitData.cntryCdList.split('|');
        let cntryDescList = cntryCdList.map((item) => {
            let countryObj = destinationList.find(ele => ele.destinationId == item);
            return (countryObj && countryObj.destinationName) || '';
        });
        // let cntryDesc = cntryDescList.join(' | ');
        // memoStrList.push(cntryDesc.replace(/,/g, ' | '));
        memoStrList = memoStrList.concat(cntryDescList);
    }
    if (waitData.travelDtm) { memoStrList.push('Date: ' + moment(waitData.travelDtm).format(Enum.DATE_FORMAT_EDMY_VALUE)); }
    if (waitData.remark) { memoStrList.push('Memo: ' + waitData.remark); }
    //const selEncounter = encounterTypes.find(item => item.encntrTypeId === waitData.encntrTypeId);
    bookData.memo = memoStrList.join(' | ');
    bookData.siteId = waitData.siteId;
    //bookData.encounterTypeCd = selEncounter ? selEncounter.encntrTypeCd : '';
    bookData.encounterTypeId =waitData.encntrTypeId;
    // bookData.appointmentDate = moment().add(1, 'days').format(Enum.DATE_FORMAT_EYMD_VALUE);
    bookData.appointmentDate = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
    bookData.appointmentTime = moment().format(Enum.TIME_FORMAT_24_HOUR_CLOCK);

    return bookData;
}

/**load anonymous wait data*/
export function loadWaitListAnonData(waitData) {
    const anonPatDto = waitData.anonymousPatientDto;
    const contactPhone = _.cloneDeep(patientPhonesBasic);
    let mobile = RegistrationUtil.addPatientPhone(anonPatDto.phnTypeCd);
    mobile.phoneTypeCd = anonPatDto.phnTypeCd;
    mobile.phoneNo = anonPatDto.cntctPhn;
    mobile.countryCd = anonPatDto.ctryCd;
    mobile.areaCd = anonPatDto.areaCd;
    mobile.dialingCd = anonPatDto.dialingCd;
    let anonyomousBookingActiveInfo = {
        patientKey: anonPatDto.patientKey,
        docTypeCd: anonPatDto.priDocTypeCd,
        docNo: anonPatDto.priDocNo,
        surname: anonPatDto.engSurname || '',
        givenName: anonPatDto.engGivename || '',
        mobile: mobile,
        isHKIDValid: anonPatDto.priDocTypeCd === 'ID',
        version:anonPatDto.version
    };

    let anonPatientInfo = {
        patientKey: waitData.patientKey,
        surname: anonPatDto.engSurname || '',
        givenName: anonPatDto.engGivenName || ''
    };

    return { anonyomousBookingActiveInfo, anonPatientInfo };
}

export function processAppointmentData(data) {
    let rows = [];
    const mapClinicName = (value) => {
        const clinicList = getState(state => state.common.clinicList);
        let clinicObj = clinicList && clinicList.filter(item => item.siteId == value);
        let clinicName = (clinicObj && clinicObj[0] && clinicObj[0].clinicName) || '';
        return clinicName;
    };

    const mapClinicCd = (value) => {
        const clinicList = getState(state => state.common.clinicList);
        let clinicObj = clinicList && clinicList.filter(item => item.siteId == value);
        let clinicCd = (clinicObj && clinicObj[0] && clinicObj[0].siteCd) || '';
        return clinicCd;
    };

    const mapEncntrTypeDesc = (value) => {
        const encounterTypes = getState(state => state.common.encounterTypes);
        let obj = encounterTypes && encounterTypes.find(item => item.encntrTypeCd === value);
        return obj && obj.encntrTypeDesc;
    };

    if (data) {
        rows = data.map((appt) => {
            // let apptObj = { ...appt };
            let apptObj = transferApptTimeSlot(appt);
            apptObj['clinicName'] = mapClinicName(apptObj['siteId']);
            apptObj['clinicCd'] = mapClinicCd(apptObj['siteId']);
            apptObj['encntrTypeDesc'] = apptObj['encntrTypeDesc'] ? apptObj['encntrTypeDesc'] : mapEncntrTypeDesc(apptObj['encntrTypeCd']);
            apptObj['encounterTypeCd'] = apptObj['encntrTypeCd'];
            apptObj['subEncounterTypeCd'] = apptObj['rmCd'];
            apptObj['appointmentTime'] = moment(apptObj['apptDateTime']).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
            apptObj['caseTypeCd'] = (apptObj.caseTypeCd) || 'N';
            apptObj['apptTypeCd'] = (apptObj['apptTypeCd']) || 'N';
            apptObj['encounterTypeShortName'] = apptObj['encntrTypeDesc'];
            apptObj['subEncounterTypeShortName'] = apptObj['rmDesc'];
            apptObj['appointmentDate'] = moment(apptObj['apptDateTime']).format(Enum.DATE_FORMAT_EYMD_VALUE);
            apptObj['serviceCd'] = (apptObj.remarkTypeBaseVo && apptObj.remarkTypeBaseVo.svcCd) || '';
            apptObj['createdDtm'] = moment(apptObj['createDtm']).format(Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR);
            apptObj['hasNotify'] = false;
            apptObj['contactHistory'] = 'Add';
            apptObj['reminderStatus'] = 'Add';
            apptObj['specialRequest'] = 'Add';
            apptObj['apptDateTime'] = moment(apptObj['apptDateTime']).format(Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR);
            apptObj['apptDateEndTime'] = apptObj['apptDateEndTime'] && moment(apptObj['apptDateEndTime']).format(Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR) || '';
            apptObj['apptTimeRange'] = `${moment(apptObj['apptDateTime']).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)} - ${apptObj['apptDateEndTime'] && moment(apptObj['apptDateEndTime']).format(Enum.TIME_FORMAT_24_HOUR_CLOCK) || ''}`;
            apptObj['caseNo'] = (apptObj.caseNo) || '';
            let apptDetail = appt.appointmentDetlBaseVoList.filter((obj) => {
                return obj.isObs === 0;
            });
            apptObj['curApptDetail'] = apptDetail[0];
            let remarkDesc = (apptObj.remarkTypeBaseVo && apptObj.remarkTypeBaseVo.remarkDesc) || '';
            let memo = (apptObj.curApptDetail && apptObj.curApptDetail.memo) || '';
            apptObj['remarkAndMemo'] = remarkDesc + ' ' + memo;
            apptObj['remarkId'] = (apptObj.remarkTypeBaseVo && apptObj.remarkTypeBaseVo.remarkTypeId) || '';
            apptObj['encntrTypeId'] = (apptObj.curApptDetail && apptObj.curApptDetail.encntrTypeId) || 0;
            apptObj['rmId'] = (apptObj.curApptDetail && apptObj.curApptDetail.rmId) || 0;
            // apptObj['sessId'] = (apptObj.curApptDetail && apptObj.curApptDetail.sessId) || 0;
            apptObj['memo'] = (apptObj && apptObj.memo);

            let appointmentDetail = apptObj.appointmentDetlBaseVoList ? apptObj.appointmentDetlBaseVoList.find(x => x.isObs == 0) : null;
            let appointmentTimeslot = appointmentDetail ? appointmentDetail.mapAppointmentTimeSlotVosList.find(x => x.apptDetlId == appointmentDetail.apptDetlId) : null;
            apptObj['qtType'] = appointmentTimeslot ? appointmentTimeslot.qtType : null;

            return apptObj;
        }).sort((a, b) => {
            const aDateTime = moment(a.apptDateTime);
            const bDateTime = moment(b.apptDateTime);
            return aDateTime.isAfter(bDateTime, 'day') ? -1 : 1;
        });
    }
    return rows;
}

export function utilisationColorMap(obj, qtBooked, qt, overallQt, isUnavailablePeriodTmslt = 0) {
    let styleObj = { ...obj };
    styleObj.backgroundColor = 'white';
    if (qt === 0 || overallQt === 0 || isUnavailablePeriodTmslt === 1) {
        styleObj.backgroundColor = 'grey';
    } else {
        if (qtBooked * 100 / qt < 30) {
            styleObj.backgroundColor = 'white';
        }
        else if (qtBooked * 100 / qt < 70) {
            styleObj.backgroundColor = 'yellow';
        }
        else if (qtBooked * 100 / qt < 99) {
            styleObj.backgroundColor = 'tomato';
        }
        else if (qtBooked * 100 / qt >= 100) {
            styleObj.backgroundColor = 'violet';
        }
    }
    return styleObj.backgroundColor;
}

export function filterAllTimeSlotByQtType(timeSlotList, qtType) {
    if (!qtType) {
        return [];
    }
    let list = [];
    const _qtType = _.toLower(qtType);
    const svcCd = getState(state => state.login.service.svcCd);

    timeSlotList.forEach(item => {
        let slot = {
            total: 0,
            booked: 0
        };
        if (Number.isInteger(item[_qtType])) {
            slot.total = item[_qtType];
            slot.booked = item[`${_qtType}Booked`] || 0;
        }
        slot.overallQt = item.overallQt;
        slot.stime = item.stime;
        slot.etime = item.etime;
        slot.sessId = item.sessId;
        slot.tmsltId = item.tmsltId;
        slot.tmsltDate = item.tmsltDate;
        slot.isUnavailablePeriodTmslt = item.isUnavailablePeriodTmslt;
        if (svcCd === 'EHS') {
            slot.encntrTypeIdDefault = item.encntrTypeIdDefault;
            slot.encntrTypeIdDefaultDesc = item.encntrTypeIdDefaultDesc;
        }
        list.push(slot);
    });

    return list;
}

export function processPatientSummaryViewLog(data) {
    let rows = [];
    const mapClinicName = (value) => {
        const clinicList = getState(state => state.common.clinicList);
        let clinicObj = clinicList && clinicList.filter(item => item.siteId == value);
        let clinicName = (clinicObj && clinicObj[0] && clinicObj[0].clinicName) || '';
        return clinicName;
    };

    const mapEncntrTypeDesc = (value) => {
        const encounterTypes = getState(state => state.common.encounterTypes);
        let obj = encounterTypes && encounterTypes.find(item => item.encntrTypeCd === value);
        return obj && obj.encntrTypeDesc;
    };

    if (data) {
        rows = data.map((appt) => {
            let apptObj = { ...appt };
            apptObj['clinicName'] = mapClinicName(apptObj['siteId']);
            apptObj['encntrTypeDesc'] = mapEncntrTypeDesc(apptObj['encntrTypeCd']);
            return apptObj;
        }).sort((a, b) => {
            const aDateTime = moment(a.updateDtm);
            const bDateTime = moment(b.updateDtm);
            return aDateTime.isAfter(bDateTime) ? -1 : 1;
        });
    }
    return rows;
}

/**map room utilization data to grid data */
export function processRoomUtilizationData(data) {
    if (!data) return [];
    let sessRooms = [];
    for (let i = 0; i < data.length; i++) {
        let sessInd = sessRooms.findIndex(x => x.sessId === data[i]['sessId']);
        let rmDto = {
            rmId: data[i]['rmId'],
            rmDesc: data[i]['rmDesc'],
            rmCd: data[i]['rmCd'],
            sumBooked: data[i]['sumBooked'],
            sumQt: data[i]['sumQt'],
            stime: data[i]['stime']
        };
        if (sessInd === -1) {
            sessRooms.push({
                sessId: data[i]['sessId'],
                sessDesc: data[i]['sessDesc'],
                stime: data[i]['stime'],
                [`rmId_${data[i]['rmId']}`]: rmDto
            });
        } else {
            sessRooms[sessInd][`rmId_${data[i]['rmId']}`] = rmDto;
        }
    }
    sessRooms.sort((a, b) => moment(a.stime, Enum.TIME_FORMAT_24_HOUR_CLOCK).isAfter(moment(b.stime, Enum.TIME_FORMAT_24_HOUR_CLOCK)) ? 1 : -1);
    return sessRooms;
}

/**get quota display content */
export function getQuotaDisplayContent(booked, total, isShowAvailable) {
    let element1 = booked || 0;
    let element2 = total || 0;
    if (isShowAvailable) {
        element1 = element2 - element1;
        if (element1 < 0) {
            element1 = 0;
        }
    }
    return `${element1}/${element2}`;
}

/**map room utilization grid column */
export function processRoomUtilizationColumn(data, isShowAvailable) {
    if (!data) return [];
    let columnDef = [{
        field: 'sessDesc',
        headerName: '',
        suppressMenu: true,
        width: 120,
        suppressSizeToFit: true,
        cellStyle: {
            backgroundColor: '#7bc1d9',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }
    }];
    let columnDef_forRM = [];
    for (let i = 0; i < data.length; i++) {
        let objKeys = Object.keys(data[i]);
        objKeys
            .filter(x => x.includes('rmId_'))
            .forEach(key => {
                let roomInd = columnDef_forRM.findIndex(x => x.field === key);
                if (roomInd === -1) {
                    columnDef_forRM.push({
                        field: key,
                        headerName: data[i][key]['rmDesc'],
                        width: data[i][key]['rmDesc'].length * 9 + 65,
                        cellStyle: (params) => {
                            let booked = params.value ? params.value.sumBooked : 0;
                            let total = params.value ? params.value.sumQt : 0;
                            let style = {
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            };
                            style.backgroundColor = utilisationColorMap(null, booked, total, null);
                            return style;
                        },
                        valueFormatter: (params) => {
                            let booked = params.value ? params.value.sumBooked : 0;
                            let total = params.value ? params.value.sumQt : 0;
                            return getQuotaDisplayContent(booked, total, isShowAvailable);
                        }
                    });
                }
            });
    }
    columnDef_forRM.sort((a, b) => a.headerName.localeCompare(b.headerName));
    return columnDef.concat(columnDef_forRM);
}

/**get QUOTA_UTILISATION_DISPLAY config value */
export function getQuotaDisplaySiteParams(where) {
    const configs = getState(state => state.common.clinicConfig);
    let config = CommonUtil.getHighestPrioritySiteParams(Enum.CLINIC_CONFIGNAME.QUOTA_UTILISATION_DISPLAY, configs, where);
    let configVal = config && config.paramValue;
    return configVal;
}

/**get default encounter:
 * Get from site param: DEFAULT_ENCOUNTER_CD
 * If not yet set up, empty encounter type
 */
export function getDefaultEncounter({
    encntrId = null,
    encounterTypeList = null,
    svcCd = null,
    siteId = null
}) {
    let defaultEncounter = null;

    if (!encounterTypeList) {
        encounterTypeList = getState(state => state.common.encounterTypeList);
    }

    const loginClinic = getState(state => state.login.clinic);
    const loginService = getState(state => state.login.service);
    if (!svcCd) {
        svcCd = loginService.svcCd;
    }
    if (!siteId) {
        siteId = loginClinic.siteId;
    }
    const defaultEncounterCd = CommonUtil.getSiteParamsValueByName(Enum.CLINIC_CONFIGNAME.DEFAULT_ENCOUNTER_CD, svcCd, siteId);
    if (encntrId) {
        defaultEncounter = encounterTypeList.find(x => x.encntrTypeId === encntrId) || null;
    }

    if (!defaultEncounter) {
        if (defaultEncounterCd) {
            defaultEncounter = encounterTypeList.find(x => x.encounterTypeCd === defaultEncounterCd) || null;
        }
    }

    return defaultEncounter;
}

/**get default room:
 * Get from CLN_DEFAULT_RM_CONFIG (1 SVC_CD/SITE_ID/ENCOUNTER_TYPE_ID = 1 RM_ID) - (If record exists in Point 1)
 * If not yet set up, empty room
 */
export function getDefaultRoom({
    encntrId = null,
    roomId = null,
    rooms = null,
    svcCd = null,
    siteId = null
}) {
    let defaultRoom = null;

    const clnDefaultRmConfig = getState(state => state.common.clnDefaultRmConfig);
    const loginClinic = getState(state => state.login.clinic);
    const loginService = getState(state => state.login.service);
    if (!rooms) {
        rooms = getState(state => state.common.rooms);
    }
    if (!svcCd) {
        svcCd = loginService.svcCd;
    }
    if (!siteId) {
        siteId = loginClinic.siteId;
    }
    if (roomId) {
        defaultRoom = rooms.find(x => x.rmId === roomId) || null;
        if (defaultRoom) {
            return defaultRoom;
        }
    }
    if (encntrId) {
        let rmId = '';
        clnDefaultRmConfig.filter(item =>
            item.svcCd === svcCd
            && item.siteId === siteId
            && item.encounterTypeId === encntrId
            && item.status === 'A'
        ).forEach(roomMap => {
            rmId = roomMap.rmId;
        });
        defaultRoom = rooms.find(item => item.rmId === rmId) || null;
    }
    return defaultRoom;
}

/**get default encounter and room:
 * 1. Get from active Case No. (if any)
 * 2. Get from site param: DEFAULT_ENCOUNTER_CD
 * 3. Get from CLN_DEFAULT_RM_CONFIG (1 SVC_CD/SITE_ID/ENCOUNTER_TYPE_ID = 1 RM_ID) - (If record exists in Point 1)
 * If not yet set up, empty encounter type and/or room
 */
export function getDefaultEncounterAndRoom({
    encntrId = null,
    roomId = null,
    caseNoDto = null,
    encounterTypeList = null,
    svcCd = null,
    siteId = null
}) {
    let defaultEncounter = null, defaultRoom = null;

    if (!encounterTypeList) {
        encounterTypeList = getState(state => state.common.encounterTypeList);
    }
    if (caseNoDto && caseNoDto.caseNo) {
        if (caseNoDto.encounterTypeCd) {
            defaultEncounter = encounterTypeList.find(x => x.encounterTypeCd === caseNoDto.encounterTypeCd) || null;
            if (defaultEncounter && caseNoDto.subEncounterTypeCd) {
                defaultRoom = defaultEncounter.subEncounterTypeList.find(item => item.rmCd === caseNoDto.subEncounterTypeCd) || null;
            }
        }
    }
    if (defaultEncounter) {
        return {
            defaultEncounter,
            defaultRoom
        };
    }

    defaultEncounter = getDefaultEncounter({ encntrId, encounterTypeList, svcCd, siteId });
    if (defaultEncounter) {
        defaultRoom = getDefaultRoom({
            encntrId: defaultEncounter.encntrTypeId,
            roomId,
            rooms: defaultEncounter.subEncounterTypeList,
            svcCd,
            siteId
        });
    }

    return {
        defaultEncounter,
        defaultRoom
    };
}

export function getElapsedPeriodByEncounterTypeSetting(bookData, encounterTypeId, encounterTypes, inverted) {
    if (!encounterTypes) {
        encounterTypes = getState(state => state.common.encounterTypes);
    }
    let encounterTypesObj;
    if(inverted == 'inverted'){
        encounterTypesObj = encounterTypes;//encounterTypes 对象
    }else{
        encounterTypesObj = encounterTypes && encounterTypes.find(item => item.encntrTypeId === encounterTypeId);
    }

    // if (encounterTypesObj.apptInterval) {
    //     bookData.appointmentDate = null;
    //     bookData.appointmentTime = null;
    //     bookData.elapsedPeriod = encounterTypesObj.apptInterval;
    //     if (encounterTypesObj.apptIntervalUnit) {
    //         let intervalTypeObj = Enum.INTERVAL_TYPE.find(item => item.code === encounterTypesObj.apptIntervalUnit);
    //         let elapsedPeriodUnitObj = Enum.ELAPSED_PERIOD_TYPE.find(item => item.engDesc === (intervalTypeObj.engDesc || ''));
    //         bookData.elapsedPeriodUnit = elapsedPeriodUnitObj.code || '';
    //     } else {
    //         bookData.elapsedPeriodUnit = '';
    //     }
    // } else {
    //     bookData.appointmentDate = bookData.appointmentDate ? bookData.appointmentDate : moment();
    //     bookData.appointmentTime = bookData.appointmentTime ? bookData.appointmentTime : moment().set({ hour: 0, minute: 0, second: 0 });
    //     bookData.elapsedPeriod = '';
    //     bookData.elapsedPeriodUnit = '';
    // }
    const serviceCd = getState(state => state.login.service.svcCd);
    const patientInfo = getState(state => state.patient.patientInfo);
    const lmp = (() => {
        let _wrkEdc = serviceCd === 'ANT' && patientInfo?.antSvcInfo?.clcAntCurrent?.sts === caseSts.ACTIVE ? moment(patientInfo?.antSvcInfo?.clcAntCurrent?.wrkEdc).startOf('day') : null;
        let _lmp = _wrkEdc?.isValid?.() ? _wrkEdc.clone().add(-40, 'week').startOf('day') : null;
        return _lmp;
    })();

    if (!bookData.appointmentDate) {
        if (encounterTypesObj && encounterTypesObj.apptInterval) {
            bookData.appointmentDate = null;
            bookData.appointmentTime = null;
            bookData.appointmentDateTo = null;
            bookData.gestWeekFromWeek = null;
            bookData.gestWeekFromDay = null;
            bookData.gestWeekToWeek = null;
            bookData.gestWeekToDay = null;
            bookData.elapsedPeriod = encounterTypesObj.apptInterval;
            if (encounterTypesObj.apptIntervalUnit) {
                let intervalTypeObj = Enum.INTERVAL_TYPE.find(item => item.code === encounterTypesObj.apptIntervalUnit);
                if (intervalTypeObj) {
                    let elapsedPeriodUnitObj = Enum.ELAPSED_PERIOD_TYPE.find(item => item.engDesc === (intervalTypeObj.engDesc || ''));
                    bookData.elapsedPeriodUnit = elapsedPeriodUnitObj.code || '';
                } else {
                    bookData.appointmentDate = moment();
                    bookData.appointmentTime = moment().set({ hour: 0, minute: 0, second: 0 });
                    bookData.elapsedPeriod = '';
                    bookData.elapsedPeriodUnit = '';
                }
            } else {
                bookData.elapsedPeriodUnit = '';
            }
        } else {
            bookData.appointmentDate =  moment();
            bookData.appointmentTime =  moment().set({ hour: 0, minute: 0, second: 0 });
            bookData.elapsedPeriod = '';
            bookData.elapsedPeriodUnit = '';

            let gestWeek = getGestWeekByLmpAndApptDate(lmp, bookData.appointmentDate);
            if (gestWeek) {
                bookData.gestWeekFromWeek = gestWeek.week;
                bookData.gestWeekFromDay = gestWeek.day;
            }
        }
    }
    return bookData;
}

export function tmsltNoQtType() { }

export function transferApptTimeSlot(appt) {
    let _appt = _.cloneDeep(appt);
    let appointmentDetail = _appt.appointmentDetlBaseVoList ? _appt.appointmentDetlBaseVoList.find(x => x.isObs == 0) : null;
    let appointmentTimeslot = appointmentDetail ? appointmentDetail.mapAppointmentTimeSlotVosList.find(x => x.apptDetlId == appointmentDetail.apptDetlId) : null;
    if (appointmentTimeslot) {
        if (!appointmentTimeslot.tmsltId || appointmentTimeslot.tmsltId === -1) {
            _appt.apptDateEndTime = '';
        }
    }
    return _appt;
}

/**
 * @description Appointment/Attendance/BackTake Attendance Appt Type
 * @author Justin
 * @date 11/12/2020
 */
export function getAppointmentTypeDesc(apptTypeCd, isSqueeze, isUrgSqueeze) {
    let appType = '';
    if (apptTypeCd === APPT_TYPE_CODE.RE_SCHEDULED.code) {
        appType = APPT_TYPE_CODE.RE_SCHEDULED.engDesc;
    } else if (apptTypeCd === APPT_TYPE_CODE.NORMAL.code) {
        appType = APPT_TYPE_CODE.NORMAL.engDesc;
    } else if (apptTypeCd === APPT_TYPE_CODE.REPLACED.code) {
        appType = APPT_TYPE_CODE.REPLACED.engDesc;
    } else if (apptTypeCd === APPT_TYPE_CODE.WALK_IN.code) {
        appType = APPT_TYPE_CODE.WALK_IN.engDesc;
    }

    if (apptTypeCd !== APPT_TYPE_CODE.DELETED.code
        && apptTypeCd !== APPT_TYPE_CODE.RE_SCHEDULED.code
        && apptTypeCd !== APPT_TYPE_CODE.WALK_IN.code) {
        if (isSqueeze === 1) {
            appType = 'Squeeze-In';
        }
        if (isSqueeze === 1 && isUrgSqueeze === 1) {
            appType = 'Urgent Squeeze';
        }
    }
    return appType;
}

/**
 * @description get lmp date by edc
 * @author Justin
 * @date 16/12/2020
 */
export function getLmpDateByEdc(edc = null) {
    if (edc && moment(edc).isValid()) {
        return moment(edc).add(-280, 'days');
    } else {
        return null;
    }
}

/**
 * @description get edc date by lmp
 * @author Justin
 * @date 16/12/2020
 */
export function getEdcDateByLmp(lmp = null) {
    if (lmp && moment(lmp).isValid()) {
        return moment(lmp).add(280, 'days');
    } else {
        return null;
    }
}

/**
 * @description get gest week by lmp date
 * @author Justin
 * @date 16/12/2020
 */
export function getGestWeekByLmp(lmp = null) {
    if (lmp && moment(lmp).isValid()) {
        let diffDays = moment().diff(moment(lmp).set({ hour: 0, minute: 0, second: 0 }), 'days');
        return { currentGestWeek: Math.floor(diffDays / 7), currentGestDay: diffDays % 7 };
    } else {
        return null;
    }
}

/**
 * @description get gest week by edc date
 * @author Justin
 * @date 16/12/2020
 */
export function getGestWeekByEdc(edc = null) {
    if (edc && moment(edc).isValid()) {
        // let diffDays = moment(edc).set({ hour: 23, minute: 59, second: 59 }).diff(moment(), 'days');
        // let restDay = diffDays % 7;
        // return { currentGestWeek: 40 - Math.ceil(diffDays / 7), currentGestDay: restDay === 0 ? 0 : 7 - restDay };
        let today = moment().startOf('day');
        let wk0_0 = moment(edc).startOf('day').add(-40, 'week');
        let diff = today.diff(wk0_0, 'days');
        return { currentGestWeek: parseInt(diff >= 0 ? Math.floor(diff / 7) : Math.ceil(diff / 7)), currentGestDay: parseInt(diff % 7) };
    } else {
        return null;
    }
}

export function getGestWeekByLmpAndApptDate(lmp, apptDate) {
    let gestWeek = null;
    let _lmp = moment(lmp).startOf('day');
    let _apptDate = moment(apptDate).startOf('day');
    if (_lmp?.isValid?.() && _apptDate?.isValid?.()) {
        let diff = _apptDate.diff(_lmp, 'days');
        gestWeek = { week: parseInt(diff >= 0 ? Math.floor(diff / 7) : Math.ceil(diff / 7)), day: parseInt(diff % 7) };
    }
    return gestWeek;
}

/**
 * @description get gest date by lmp date
 * @author Justin
 * @date 16/12/2020
 */
export function getGestDateByLmp(lmp = null, week = 0, day = 0) {
    if (lmp && moment(lmp).isValid()) {
        return moment(lmp).add(parseInt(week) * 7 + parseInt(day), 'days');
    } else {
        return null;
    }
}

/**
 * @description calc date between lmpDate to gestDate;
 * @author Justin
 * @date 06/01/2021
 */
export function calcGestWeekByGestDateAndLmp(gestDate, lmp) {
    if(moment(lmp).isValid() && moment(gestDate).isValid()) {
        let diffDays = moment(gestDate).diff(moment(lmp).set({ hour:0, minute: 0, second: 0 }), 'days');
        let restDay = diffDays % 7 ;
        return { week: Math.floor(diffDays / 7), day: restDay };
    } else {
        return null;
    }
}

// FHS ANT service record status mapping
export function mapOthAppointmentDetailSts(recSts) {
    let sts = '';
    switch (recSts) {
        case othApptDtlStsMapping.ABANDONED: {
            sts = othApptDtlStsEnum.ABANDONED;
            break;
        }
        case othApptDtlStsMapping.CURRENT: {
            sts = othApptDtlStsEnum.CURRENT;
            break;
        }
        case othApptDtlStsMapping.DELETED: {
            sts = othApptDtlStsEnum.DELETED;
            break;
        }
        case othApptDtlStsMapping.REPLACED: {
            sts = othApptDtlStsEnum.REPLACED;
            break;
        }

        default:
            break;
    }
    return sts;
}

//FHS ANT service other appointment detail grid col
export function getOtherApptDetailGridCol(isLogTitle) {
    let col = [
        {
            headerName: '',
            colId: 'index',
            valueGetter: params => params.node.rowIndex + 1,
            minWidth: 60,
            maxWidth: 60,
            pinned: 'left',
            filter: false
        },
        {
            headerName: 'Date',
            field: 'date',
            minWidth: 150,
            maxWidth: 150,
            valueGetter: params => params.data.apptDatetime && moment(params.data.apptDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE)
        },
        {
            headerName: 'Time',
            field: 'time',
            minWidth: 110,
            maxWidth: 110,
            valueGetter: params => params.data.apptDatetime && moment(params.data.apptDatetime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
        },
        {
            headerName: 'Place',
            field: 'hcinstTxt',
            minWidth: 413,
            width: 413,
            //valueGetter: params =>params => params.value && moment(params.value).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
            tooltipValueGetter: (params) => params.value
        },
        {
            headerName: 'Booking Type',
            field: 'codAntHaApptTypeDesc',
            minWidth: 166,
            width: 166,
            //valueGetter: params =>params => params.value && moment(params.value).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
            tooltipValueGetter: (params) => params.value
        },
        {
            headerName: 'Remarks',
            field: 'remark',
            minWidth: 413,
            width: 413,
            //valueGetter: params =>params => params.value && moment(params.value).format(Enum.TIME_FORMAT_24_HOUR_CLOCK)
            tooltipValueGetter: (params) => params.value
        },
        {
            headerName: 'Status',
            field: 'recSts',
            minWidth: 115,
            maxWidth: 115,
            valueGetter: params => params.data.recSts && mapOthAppointmentDetailSts(params.data.recSts),
            tooltipValueGetter: (params) => params.value
        },
        {
            headerName: isLogTitle ? 'Created By' : 'Update By',
            field: isLogTitle ? 'createBy' : 'updateBy',
            minWidth: 175,
            maxWidth: 175,
            tooltipValueGetter: (params) => params.value
        },
        {
            headerName: isLogTitle ? 'Created On' : 'Update On',
            field: 'updateDtm',
            minWidth: 135,
            maxWidth: 135,
            valueGetter: params => {
                if (isLogTitle) {
                    return params.data.createDtm && moment(params.data.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
                } else {
                    return params.data.updateDtm && moment(params.data.updateDtm).format(Enum.DATE_FORMAT_EDMY_VALUE);
                }
            },
            tooltipValueGetter: (params) => params.value
        }
    ];
    return col;
}

export function getEnctrTypesByEnctrGroup(encounterTypes, pmiCaseEncntrGrpDetlDtos) {
    let avaliableEnctrTypes = [];
    if (!pmiCaseEncntrGrpDetlDtos || pmiCaseEncntrGrpDetlDtos.length === 0) {
        avaliableEnctrTypes = encounterTypes;
    } else {
        avaliableEnctrTypes = encounterTypes.filter(item => pmiCaseEncntrGrpDetlDtos.findIndex(x=>x.encntrTypeId===item.encntrTypeId)>-1);
        // if (avaliableEnctrTypes.length === 0) {
        //     avaliableEnctrTypes = encounterTypes;
        // }
    }
    return avaliableEnctrTypes;
}

export function checkIsOtherEncntrGrpAppt(caseNoInfo, appt, serviceCd, patientInfo) {
    const isPmiCaseWithEnctrGrp = CaseNoUtil.pmiCaseWithEnctrGrpVal();
    if (isPmiCaseWithEnctrGrp) {
        // if (!caseNoInfo || JSON.stringify(caseNoInfo) === '{}') {
        //     return false;
        // }
        const result = caseNoInfo.encntrGrpCd !== appt.encntrGrpCd;
        // if (serviceCd === 'ANT' && patientInfo.genderCd === Enum.GENDER_FEMALE_VALUE) {
        //     // if (caseNoInfo.encntrGrpCd !== appt.encntrGrpCd) {
        //     //     return true;
        //     // } else {
        //     //     return false;
        //     // }
        //     return result;
        // } else if(serviceCd === 'ANT' && patientInfo.genderCd !== Enum.GENDER_FEMALE_VALUE){
        //     return false;
        // }
        if (serviceCd === 'ANT') {
            if (patientInfo.genderCd === Enum.GENDER_FEMALE_VALUE) {
                return result;
            } else {
                return false;
            }
        } else {
            return result;
        }
    } else {
        return false;
    }
}

export function getEncntrGrpByEncntrId(encntrTypeId, bookingData) {
    const isPmiCaseWithEnctrGrp = CaseNoUtil.pmiCaseWithEnctrGrpVal();
    if (isPmiCaseWithEnctrGrp) {
        const encntrGrpList = getState(state => state.caseNo.encntrGrpList);
        const encntrGrp = encntrGrpList.find(x => x.pmiCaseEncntrGrpDetlDtos && x.pmiCaseEncntrGrpDetlDtos.findIndex(detl => detl.encntrTypeId === encntrTypeId) > -1);
        if (encntrGrp) {
            bookingData.encntrGrpCd = encntrGrp.encntrGrpCd;
            return bookingData;
        } else {
            return bookingData;
        }
    } else {
        return bookingData;
    }
}

export function setDefaultEncntrAndRoomByEncntrGrp(bookingData, encounterTypeList) {
    const isPmiCaseWithEnctrGrp = CaseNoUtil.pmiCaseWithEnctrGrpVal();
    if (isPmiCaseWithEnctrGrp) {
        const encntrGrpCd = bookingData.encntrGrpCd || '';
        if (encntrGrpCd) {
            let _bookingData = _.cloneDeep(bookingData);
            const encntrGrpList = getState(state => state.caseNo.encntrGrpList);
            const encntrGp = encntrGrpList.find(x => x.encntrGrpCd === encntrGrpCd);
            const _encounterTypes = getEnctrTypesByEnctrGroup(encounterTypeList, encntrGp.pmiCaseEncntrGrpDetlDtos);
            if (_encounterTypes.findIndex(x => x.encntrTypeId === _bookingData.encounterTypeId) === -1) {
                _bookingData.encounterTypeId = null;
                _bookingData.rmId = null;
            }
            return _bookingData;
        } else {
            let _bookingData = getEncntrGrpByEncntrId(bookingData.encounterTypeId, _.cloneDeep(bookingData));
            return _bookingData;
        }
    } else {
        return bookingData;
    }
}


export function readySearchCriteriaStr(searchCriteria) {
    let result = '';
    if (!searchCriteria) {
        return '';
    }
    searchCriteria.forEach((s, idx) => {
        result += `${s.label}${s.value}`;
        if (idx !== searchCriteria.length - 1) {
            result += '; ';
        }
    });
    return result;
}

export function getAppointmentSearchCriteria(searchCriteria) {
    if (searchCriteria) {
        if (searchCriteria.indexOf('<br/>') > -1) {
            searchCriteria = searchCriteria.replace('<br/>', ' ');
        }
        return searchCriteria;
    } else {
        return '';
    }
}

export function getIsAtndResetDisplayCancelStsVal(){
    const siteParam = getState(state => state.common.siteParams);
    const svcCd = getState(state => state.login.service.svcCd);
    const siteId = getState(state => state.login.clinic.siteId);
    return getIsAtndResetDisplayCancelSts(siteParam, svcCd, siteId);
}

export function getAppointmentRecordStatus(attnStatusCd, arrivalTime) {
    const isAtndRestDisplayCnacelSts = getIsAtndResetDisplayCancelStsVal();
    if (attnStatusCd === Enum.ATTENDANCE_STATUS.ATTENDED) {
        return 'Attended';
    } else if (attnStatusCd === Enum.ATTENDANCE_STATUS.NOT_ATTEND || '') {
        if (arrivalTime) {
            return 'Arrived';
        } else {
            return '';
        }
    } else if (isAtndRestDisplayCnacelSts === true) {
        if (attnStatusCd === Enum.ATTENDANCE_STATUS.CANCELLED) {
            return 'Cancelled';
        } else {
            return '';
        }
    } else {
        return '';
    }
}

export function isAttendedAppointment(attnStatusCd) {
    if (attnStatusCd === Enum.ATTENDANCE_STATUS.ATTENDED) {
        return true;
    } else if (attnStatusCd === Enum.ATTENDANCE_STATUS.NOT_ATTEND || attnStatusCd === Enum.ATTENDANCE_STATUS.CANCELLED) {
        return false;
    } else {
        return false;
    }
}

export function getDaysOfWeekDefault() {
    const siteParams = getState(state => state.common.siteParams);
    const svcCd = getState(state => state.login.service.svcCd);
    const siteId = getState(state => state.login.siteId);
    const daysOfWeekDefault = getApptSearchCriteriaDefault(siteParams, svcCd, siteId);

    return daysOfWeekDefault;
}

export function checkAppEncntrCaseStatusBeforeBook(bookingFunc) {
        bookingFunc && bookingFunc();
}

export function markMultipleSlotIdx(slot, appointmentListCart) {
    if (slot && slot.length > 0) {
        for (let i = 0; i < slot.length; i++) {
            if (slot.length > 0 && slot[i] && slot[i].normal) {
                slot[i].normal.forEach((s, ord) => {
                    s.encntrTypeId = appointmentListCart[i].encounterTypeId;
                    s.rmId = appointmentListCart[i].rmId;
                    s.idx = i;
                    s.ord = `${i}_${ord}`;
                    s.qtType = appointmentListCart[i].qtId;
                });
                slot[i].idx = i;
            }
        };
        slot = slot.filter(x => x);
        return slot;
    }
}

export const familyMembercolumns = (isConfirm)=>{
    return [
        { field: 'pmiGrpId', headerName: 'Family ID', flex: 1, hide: true },
        {
            field: 'pmiGrpName',
            headerName: 'Family No.',
            checkboxSelection: true,
            headerCheckboxSelection: isConfirm ? false : true,
            cellRenderer: 'PmiGroupComponent',
            flex: 1
        },
        {
            field: 'sdt',
            headerName: 'Last Encounter',
            valueFormatter: (params) => {
                return moment(params.sdt).format('DD-MM-YYYY');
            },
            flex: 1
        },
        { field: 'patientKey', headerName: 'PMI', cellRenderer: 'PmiComponent', flex: 1 },
        {
            field: 'engSurname',
            headerName: 'Name',
            valueFormatter: (params) => {
                return getFullName(params.data.engSurname, params.data.engGivename);
            },
            flex: 1
        },
        {
            field: 'dob',
            headerName: 'DOB',
            valueFormatter: (params) => {
                return moment(params.data.dob).format('DD-MM-YYYY');
            },
            flex: 1
        },
        { field: 'hkid', headerName: 'HKID', flex: 1 },
        { field: 'genderCd', headerName: 'Sex', flex: 1 }
    ];
};

export const familyBookingParamHandler = (param, selectedFamilyMember) => {
    if (selectedFamilyMember.length === 0) return param;
    else {
        // Add booking param into selectedFamilyMember
        let familyParam = selectedFamilyMember.map((data) => {
            return { ...param, ...data };
        });
        familyParam.push(param);
        const result = { pmiGrpId: selectedFamilyMember[0].pmiGrpId, bookings: familyParam };
        return result;
    }
};

export const familyBookingResultcolumns = (isAttend) => {
    return [
        { field: 'pmiGrpName', headerName: 'Family No.', flex: 1 },
        { field: 'apptDate', headerName: isAttend ? 'Arrival Time' : 'Appointment Date', flex: 2 },
        { field: 'patientKey', headerName: 'PMI', cellRenderer: 'PmiComponent', flex: 1 },
        {
            field: 'engSurname',
            headerName: 'Name',
            valueFormatter: (params) => {
                return getFullName(params.data.engSurname, params.data.engGivename);
            },
            flex: 1
        },
        {
            field: 'dob',
            headerName: 'DOB',
            valueFormatter: (params) => {
                return moment(params.data.dob).format('DD-MM-YYYY');
            },
            flex: 1
        },
        { field: 'hkid', headerName: 'HKID', flex: 1 },
        { field: 'genderCd', headerName: 'Sex', flex: 1 },
        { field: '', headerName: 'Status', cellRenderer: 'IsBookedComponent', flex: 1 }
    ];
};

/**
 *
 * @param {object} responseCodeByPatientKey
 * @returns
 */
export const checkBookingStatus = (responseCodeByPatientKey) => {
    return Object.keys(responseCodeByPatientKey).map((pmi) => {
        if (responseCodeByPatientKey[pmi] !== 0) return null;
        else return parseInt(pmi);
    });
};

export const familyBookingResultGenerator = (
    familyMemberData = [],
    selectedFamilyMember = [],
    patientInfo,
    apptDetails,
    successfulList = [],
    isStillProcess = false,
    isFamilyAttend = false
) => {
    let bookedMemberPatientKey = selectedFamilyMember.map((data) => data.patientKey);
    const apptDate = moment(apptDetails?.apptDate || apptDetails?.attendance?.arrivalTime).format(
        isFamilyAttend ? 'DD-MM-YYYY HH:mm' : 'DD-MM-YYYY'
    );
    bookedMemberPatientKey.push(patientInfo.patientKey);
    const result = familyMemberData
        .filter((patient) => bookedMemberPatientKey.includes(patient.patientKey))
        .map((data) => ({
            ...data,
            apptDate: apptDate,
            booked: isStillProcess ? isStillProcess : successfulList.includes(data.patientKey)
        }));
    return result;
};

/**
 *
 * @param {array} rowData
 * @param {array} patientList
 */
export const getSameApptPatientFamily = (rowData, patientList) => {
    return patientList.filter(
        (patient) =>
            patient.statusCd === Enum.ATTENDANCE_STATUS.NOT_ATTEND &&
            patient.appointmentTime === rowData.appointmentTime &&
            patient.encounterType === rowData.encounterType &&
            patient.pmiGrpName === rowData.pmiGrpName
    );
};

export const multiFamilyBookingParamHandler = (params, selectedFamilyMember) => {
    if (selectedFamilyMember.length === 0) return { normalConfirmList: params };
    else {
        // Add booking param into selectedFamilyMember
        let familyParam = selectedFamilyMember.map((data) => {
            return params.normalConfirmList.map((item) => {
                return { ...item, ...data };
            });
        });
        familyParam.push(params);
        const result = { pmiGrpId: selectedFamilyMember[0].pmiGrpId, bookings: familyParam };
        return result;
    }
};

export const checkIsSelectedPatient=(familyMemberData, selectedFamilyMember, patientKey, params)=>{
    const diffResult = _.differenceBy(familyMemberData, selectedFamilyMember, 'patientKey').filter(
        (patient) => patient.patientKey !== patientKey
    );
    const nonSelectedPatient = diffResult.filter((patient) => patient.patientKey === params.data.patientKey);
    if (nonSelectedPatient.length === 0) return true;
    else return false;
};

/**
 * Get appId for AutoPrintSlip
 * @param {object} apptInfo
 * @param {number} patientKey
 */
export const apptIdHandler = (apptInfo, patientKey) => {
    if (Array.isArray(apptInfo?.confirmAppointmentBaseVos)) {
        const appt = apptInfo.confirmAppointmentBaseVos.find((appt) => appt.patientKey === patientKey);
        if (appt) return appt.apptId;
        else return null;
    } else return apptInfo?.apptId || null;
};

export const checkPatientsCode = (isFamilyBooking = false, data) => {
    let list = [];
    if (isFamilyBooking) {
        for (const [key, value] of Object.entries(data.data.responseCodeByPatientKey))
            if (value === 104) list.push(key);
        return list;
    }
    return list;
};

export const checkBookingRuleParamsHandler = (
    checkBookingRuleParams,
    multiBook104List = [],
    isFamilyBooking = false
) => {
    if (isFamilyBooking) return { ...checkBookingRuleParams, patientKeys: multiBook104List }; //Add patientKeys
    return checkBookingRuleParams;
};

const patientInfoFormatter = (patientKey, familyMemberData = []) => {
    const patient = familyMemberData.find((member) => member.patientKey === patientKey);
    return `${patientKeyFormatter(patient)} - ${patient.engSurname} ${patient.engGivename}`;
};

export const familyReplaceAptDataGenerator = (replaceAppointmentCheckingVos = [], familyMemberData = []) => {
    return _.flatten(
        replaceAppointmentCheckingVos.map((apt) => {
            return apt.appointmentInfoBaseVo.map((aptInfo) => ({
                apptDate: moment(aptInfo.apptDateTime).format(Enum.APPOINTMENT_BOOKING_DATE),
                startTime: moment(aptInfo.apptDateTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK),
                slots: aptInfo.bookingUnit,
                site: aptInfo.svcCd,
                room: aptInfo.rmDesc,
                patientInfo: patientInfoFormatter(aptInfo.patientKey, familyMemberData),
                means:
                    aptInfo.appointmentDetlBaseVoList[0]?.mapAppointmentTimeSlotVosList?.length > 0
                        ? aptInfo.appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList[0].qtType
                        : '',
                encType: aptInfo.encntrTypeDesc,
                apptType: aptInfo.apptTypeCd,
                apptId: aptInfo.appointmentDetlBaseVoList[0]?.apptId,
                version: aptInfo.appointmentDetlBaseVoList[0]?.version,
                isCimsOneAppt: apt.cimsOneReplaceAppointmentInfoBaseVo.length > 0 ? 'Y' : '',
                minInterval: apt.minInterval,
                minIntervalUnit: apt.minIntervalUnit
            }));
        })
    );
};

export const familyReplaceOldParamsHandler = (familyBookingParam, familyReplaceAppointmentList) => {
    return {
        pmiGrpId: familyBookingParam.pmiGrpId,
        replaceOldDtos: _.flatten(
            familyBookingParam.bookings.map((booking) => ({
                confirmAppointmentDto: booking,
                replaceableAppointmentDtoList: familyReplaceAppointmentList
                    .filter((list) => list.patientInfo === booking.patientKey)
                    .map((list) => ({ apptId: list.apptId, version: list.version }))
            }))
        )
    };
};

export const familyMemberDialogTitle = (
    isAttend = false,
    showResult = false,
    isDateBack = false,
    isConfirm = false
) => {
    return isAttend && showResult
        ? 'Family Attendance Result'
        : isDateBack && showResult
        ? 'Family Date Back Attendance Result'
        : showResult
        ? 'Family Booking Result'
        : isConfirm
        ? 'Family Member'
        : 'Select Family Member';
};
