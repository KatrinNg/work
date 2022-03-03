import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import { CLEAN_LOGIN_INFO } from '../actions/login/loginActionType';
import storage from 'redux-persist/lib/storage/session';
import LoginReducer from './loginReducer';
import hkicReducer from './hkicReducer';
import UserProfileReducer from './administration/userProfile/userProfileReducer';
import UserAccountReducer from './administration/userAccount/userAccountReducer';
import RegistrationReducer from './registration/registrationReducer';
import TimeslotTempReducer from './appointment/timeSlot/timeslotTempReducer';
import GenerateTimeSlotReducer from './appointment/timeSlot/generateTimeSlotReducer';
// import EditTimeSlotReducer from './appointment/timeSlot/editTimeSlotReducer';
import TimeslotPlanReducer from './appointment/timeSlot/timeslotPlanReducer';
import { bookingInformation } from './appointment/booking/bookingReducer';
import UserRoleReducer from './administration/userRole/userRoleReducer';
import CommonReducer from './commonReducer';
import ChangePasswordReducer from './administration/changePassword/changePasswordReducer';
import PatientReducer from './patient/patientReducer';
import ConsultationReducer from './consultation/consultationReducer';
import clinicalNoteReducer from './clinicalNote/clinicalNoteReducer';
import assessmentReducer from './assessment/assessmentReducer';
import PrescriptionReducer from './consultation/prescription/prescriptionReducer';
import AppointmentSlipFooterReducer from './administration/appointmentSlipFooter/appointmentSlipFooterReducer';
import EnctManagementReducer from './administration/enctManagement/enctManagementReducer';
import moeReducer from './moe/moeReducer';
import forgetPasswordReducer from './forgetPasswordReducer';
import mainFrameReducer from './mainFrameReducer';
import myFavouriteReducer from './moe/myFavourite/myFavouriteReducer';
import drugHistoryReducer from './moe/drugHistory/drugHistoryReducer';
import moePrintReducer from './moe/moePrintReducer';
import bookingAnonymousInformation from './appointment/booking/bookingAnonymousReducer';
import waitingListReducer from './appointment/waitingListReducer';
import manageClinicalNoteTemplateReducer from './clinicalNote/manageClinicalNoteTemplateReducer';
import diagnosisReducer from './consultation/dxpx/diagnosis/diagnosisReducer';
import procedureReducer from './consultation/dxpx/procedure/procedureReducer';
import tokenTemplateManagementReducer from './IOE/tokenTemplateManagement/tokenTemplateManagementReducer';
import turnaroundTimeReducer from './IOE/turnaroundTime/turnaroundTimeReducer';
import specimenCollectionReducer from './IOE/specimenCollection/specimenCollectionReducer';
import serviceProfileReducer from './IOE/serviceProfile/serviceProfileReducer';
import AttendanceCertReducer from './certificate/attendanceCertificate/attendanceCertReducer';
import SickLeaveReducer from './certificate/sickLeave/sickLeaveReducer';
import ReferralLetterReducer from './certificate/referralLetter/referralLetterReducer';
import CalendarViewReducer from './appointment/calendarViewReducer';
import reportTemplateReducer from './report/reportTemplateReducer';
import MessageReducer from './message/messageReducer';
import YellowFeverReducer from './certificate/yellowFever/yellowFeverReducer';
import PublicHolidayReducer from './administration/publicHoliday/publicHolidayReducer';
import PatientSpecFuncReducer from './patient/patientSpecFuncReducer';
import DepartmentFavouriteReducer from './moe/departmentFavourite/departmentFavouriteReducer';
import backgroundInformationReducer from './MRAM/backgroundInformation/backgroundInformationReducer';
import eyesReducer from './MRAM/eyes/eyesReducer';
import feetReducer from './MRAM/feet/feetReducer';
import measurementAndLabTestReducer from './MRAM/measurementAndLabTest/measurementAndLabTestReducer';
import otherComplicationsReducer from './MRAM/otherComplications/otherComplicationsReducer';
import riskProfileReducer from './MRAM/riskProfile/riskProfileReducer';
import carePlanReducer from './MRAM/carePlan/carePlanReducer';
import mramReducer from './MRAM/mramReducer';
import dietAssessmentReducer from './MRAM/dietAssessment/dietAssessmentReducer';
import apptEnquiryReducer from './appointment/apptEnquiry/apptEnquiryReducer';
import vaccineCertReducer from './certificate/vaccineCert/vaccineCertReducer';
import enquiryReducer from './IOE/enquiry/enquiryReducer';
import laboratoryReportReducer from './IOE/laboratoryReport/laboratoryReportReducer';
import { reducers } from 'store/models';
import ixRequestReducer from './IOE/ixRequest/ixRequestReducer';
import caseNoReducer from './caseNo/caseNoReducer';
import BackTakeAttendanceReducer from './appointment/backTakeAttendacne/backTakeAttendanceReducer';
import ecsReducer from './ECS/ecsReducer';
import eHRReducer from './EHR/eHRReducer';
import maternityReducer from './certificate/maternity/maternityReducer';
import generalLetterReducer from './certificate/generalLetter/generalLetterReducer';
import { redesignBookingInformation } from './appointment/booking/redesignBookingReducer';
import dtsAppointmentBookingReducer from './dts/appointment/bookingReducer';
import AttendenceReducer from './attendance/attendanceReducer';
import TimeslotManagementReducer from './appointment/timeSlot/timeslotManagementReducer';
import CareAndTreatmentPlanReducer from './consultation/careAndTreatmentPlan/ctpReducer';
import UnavailablePeriodManagementReducer from './administration/unavailablePeriodManagement/unavailablePeriodManagementReducer';
import dtsAppointmentAttendanceReducer from './dts/appointment/attendanceReducer';
import dtsRemindAppointmentReducer from './dts/appointment/remindAppointmentReducer';
import dtsPatientSummaryReducer from './dts/patient/DtsPatientSummaryReducer'; //DH Miki
import dtsDefaultRoomReducer from './dts/patient/DtsDefaultRoomReducer'; // DH Anthony
import dtsEmptyTimeslotReducer from './dts/appointment/emptyTimeslotReducer';
import dtsSearchAppointmentReducer from './dts/appointment/searchAppointmentReducer';
import dtsWaitingListReducer from './dts/appointment/waitingListReducer';
import sessionManagementReducer from './administration/sessionManagement/sessionManagementReducer';
import manageTagaNoteTemplateReducer from './tagaNote/manageTagaNoteTemplateReducer';
import medicalHistoriesReducer from './medicalHistories/medicalHistoriesReducer';
import { drawingUIReducer } from './documentUpload/DrawingUIReducer';
import pdfNImageUIReducer from './documentUpload/PDFnImageUIReducer';
import clinicalDocReducer from './clinicalDoc/clinicalDocReducer';
import certificateEformReducer from './certificate/certificateEform';
import scannerCertificateReducer from './certificate/scannerCertificate/scannerCertificateReducer';
import ClientAndServiceReducer from './payment/clientServiceView/clientServiceViewReducer';
import saamPatientReducer from './saam/saamPatientReducer';
import encounterReducer from './dts/clinicalContent/encounterReducer';
import dtsProbProcReducer from './dts/clinicalContent/DtsProbProcReducer';
import dtsDentalChartReducer from './dts/clinicalContent/DtsDentalChartReducer';
import treatmentPlanReducer from './dts/clinicalContent/treatmentPlanReducer';
import dtsPreloadDataReducer from './dts/preload/DtsPreloadDataReducer'; //DH Miki
import perioChartReducer from './dts/clinicalContent/perioChartReducer';
import docReducer from './consultation/docReducer';
import transactionReducer from './als/transactionReducer';
import redistributionReducer from './appointment/redistributionReducer';
import dtsPatientSearchReducer from './dts/patient/DtsPatientSearchReducer';
import noticeBoardReducer from './administration/noticeBoard/noticeBoardReducer';
import apptSlipRemarksReducer from './administration/apptSlipRemarks/apptSlipRemarksReducer';
import alsLogReducer from './als/logReducer';
import RoomMangement from './administration/roomManagement/roomManagementReducer';
import ChangePasscodeReducer from './administration/changePasscode/changePasscodeReducer';
import CimsStyle from './cimsStyle/cimsStyle';
import procedureSetReducer from './dts/clinicalContent/procedureSetReducer';
import dtsAssessmentReducer from './dts/clinicalContent/assessmentReducer';
import AnSvcIdReducer from './anServiceID/anServiceIDReducer';
import familyNoReducer from './familyNo/familyNoReducer';
import ehsSpaControlReducer from './ehs/ehsSpaControlReducer';
import timeslotManagementV2Reducer from './appointment/timeSlot/timeslotManagementV2Reducer';
import ideasRecuder from './ideas/ideasReducer';

const clinicalNotePresistConfig = {
    key: 'clinicalNote',
    storage: storage,
    whitelist: ['sysConfig']
};

const messagePresistConfig = {
    key: 'message',
    storage: storage,
    blacklist: ['openMessageDialog', 'openSnackbar']
};

const loginPressistConfig = {
    key: 'login',
    storage: storage,
    blacklist: ['isLoginSuccess', 'isNeedForceLogin', 'errorMessage']
};

const commonPressistConfig = {
    key: 'common',
    storage: storage,
    whitelist: ['encounterTypeList', 'clinicConfig', 'listConfig', 'serviceList', 'clinicList', 'commonCodeList', 'deleteReasonsList']
};

const patientPressistConfig = {
    key: 'patient',
    storage: storage,
    whitelist: ['nationalityList', 'countryList']
};

const registrationPressistConfig = {
    key: 'registration',
    storage: storage,
    whitelist: ['codeList']
};

const caseNoPressistConfig = {
    key: 'caseNo',
    storage: storage,
    whitelist: ['casePrefixList', 'isAutoGen', 'codeListDtos']
};

const appointmentSlipFooterConfig = {
    key: 'appointmentSlipFooter',
    storage: storage,
    whitelist: ['encounterList', 'subEncounterList']
};

const certificateEformPressistConfig = {
    key: 'certificateEform',
    storage: storage,
    blacklist: ['clinicalDocImportDialogOpen']
};

const appReducer = combineReducers({
    config: (state = {}) => state,
    login: persistReducer(loginPressistConfig, LoginReducer),
    hkicReducer,
    common: persistReducer(commonPressistConfig, CommonReducer),
    userProfile: UserProfileReducer,
    userAccount: UserAccountReducer,
    userRole: UserRoleReducer,
    // userRole2: UserRoleReducer2,
    registration: persistReducer(registrationPressistConfig, RegistrationReducer),
    timeslotTemplate: TimeslotTempReducer,
    generateTimeSlot: GenerateTimeSlotReducer,
    editTimeSlot: TimeslotManagementReducer,
    timeslotPlan: TimeslotPlanReducer,
    bookingInformation: bookingInformation,
    redesignBookingInformation: redesignBookingInformation,
    bookingAnonymousInformation: bookingAnonymousInformation,
    changePassword: ChangePasswordReducer,
    attendance: AttendenceReducer,
    patient: persistReducer(patientPressistConfig, PatientReducer),
    consultation: ConsultationReducer,
    prescription: PrescriptionReducer,
    appointmentSlipFooter: persistReducer(appointmentSlipFooterConfig, AppointmentSlipFooterReducer),
    // appointmentSlipFooter: AppointmentSlipFooterReducer,
    enctManagement: EnctManagementReducer,
    moe: moeReducer,
    forgetPassword: forgetPasswordReducer,
    mainFrame: mainFrameReducer,
    moeMyFavourite: myFavouriteReducer,
    moePrint: moePrintReducer,
    waitingList: waitingListReducer,
    moeDrugHistory: drugHistoryReducer,
    assessment: assessmentReducer,
    clinicalNote: persistReducer(clinicalNotePresistConfig, clinicalNoteReducer),
    manageClinicalNoteTemplate: manageClinicalNoteTemplateReducer,
    procedureReducer: procedureReducer,
    diagnosisReducer: diagnosisReducer,
    tokenTemplateManagement: tokenTemplateManagementReducer,
    turnaroundTime: turnaroundTimeReducer,
    specimenCollection: specimenCollectionReducer,
    serviceProfile: serviceProfileReducer,
    attendanceCert: AttendanceCertReducer,
    sickLeave: SickLeaveReducer,
    maternity: maternityReducer,
    referralLetter: ReferralLetterReducer,
    generalLetter: generalLetterReducer,
    calendarView: CalendarViewReducer,
    reportTemplate: reportTemplateReducer,
    message: persistReducer(messagePresistConfig, MessageReducer),
    yellowFever: YellowFeverReducer,
    vaccineCert: vaccineCertReducer,
    publicHoliday: PublicHolidayReducer,
    unavailablePeriodManagement: UnavailablePeriodManagementReducer,
    patientSpecFunc: PatientSpecFuncReducer,
    departmentFavourite: DepartmentFavouriteReducer,
    backgroundInformation: backgroundInformationReducer,
    eyes: eyesReducer,
    feet: feetReducer,
    measurementAndLabTest: measurementAndLabTestReducer,
    otherComplications: otherComplicationsReducer,
    riskProfile: riskProfileReducer,
    mram: mramReducer,
    dietAssessment: dietAssessmentReducer,
    carePlan: carePlanReducer,
    apptEnquiry: apptEnquiryReducer,
    enquiry: enquiryReducer,
    laboratoryReport: laboratoryReportReducer,
    ixRequest: ixRequestReducer,
    ...reducers,
    caseNo: persistReducer(caseNoPressistConfig, caseNoReducer),
    backTakeAttendance: BackTakeAttendanceReducer,
    ecs: ecsReducer,
    ehr: eHRReducer,
    dtsAppointmentBooking: dtsAppointmentBookingReducer,
    dtsAppointmentAttendance: dtsAppointmentAttendanceReducer,
    ctp: CareAndTreatmentPlanReducer,
    dtsRemindAppointment: dtsRemindAppointmentReducer,
    dtsWaitingList:dtsWaitingListReducer,
    dtsEmptyTimeslot: dtsEmptyTimeslotReducer,
    dtsSearchAppointment: dtsSearchAppointmentReducer,
    sessionManagement: sessionManagementReducer,
    manageTagaNoteTemplate: manageTagaNoteTemplateReducer,
    medicalHistories: medicalHistoriesReducer,
    certificateEform: certificateEformReducer, // persistReducer(certificateEformPressistConfig, certificateEformReducer),
    dtsDefaultRoom: dtsDefaultRoomReducer, // DH Anthony
    clientSvcView: ClientAndServiceReducer,
    drawingUIReducer,
    pdfNImageUIReducer,
    clinicalDoc: clinicalDocReducer,
    dtsPatientSummary: dtsPatientSummaryReducer, //DH Miki
    saamPatient: saamPatientReducer,
    clinicalContentEncounter: encounterReducer,
    clinicalContentPerioChart: perioChartReducer,
    dtsDentalChart: dtsDentalChartReducer,
    dtsProbProc: dtsProbProcReducer,
    clinicalContentTreatmentPlanReducer: treatmentPlanReducer,
    dtsPreloadData: dtsPreloadDataReducer, //DH Miki
    alsTransaction: transactionReducer,
    doc: docReducer,
    redistribution: redistributionReducer,
    alsLogInfo: alsLogReducer,
    noticeBoard: noticeBoardReducer,
    apptSlipRemarks: apptSlipRemarksReducer,
    roomManagement: RoomMangement,
    dtsPatientSearch:dtsPatientSearchReducer,
    changePasscode: ChangePasscodeReducer,
    cimsStyle:CimsStyle,
    clinicalContentProcedureSet: procedureSetReducer,
    scannerCertificate: scannerCertificateReducer,
    clinicalContentAssessment: dtsAssessmentReducer,
    anSvcId:AnSvcIdReducer,
    familyNo: familyNoReducer,
    ehsSpaControl: ehsSpaControlReducer,
    timeslotManagementV2: timeslotManagementV2Reducer,
    ideas: ideasRecuder
});


const rootReducer = (state, action) => {
    if (action.type === CLEAN_LOGIN_INFO) {
        state = undefined;
    }
    return appReducer(state, action);
};

export default rootReducer;
