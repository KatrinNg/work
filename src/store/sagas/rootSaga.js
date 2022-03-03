import { all, call, put } from 'redux-saga/effects';
import { commonSagas } from './commonSaga';
import * as commonAction from '../actions/common/commonAction';
import { registrationSaga } from './registration/registrationSaga';
import { loginSagas } from './loginSaga';
import { hkicSagas } from './hkicReaducerSaga';
import { administrationSaga } from './administrationSaga';
import { userAccountSaga } from './administration/userAccount/userAccountSaga';
import { userRoleSaga } from './administration/userRole/userRoleSaga';
import { timeslotTemplateSagas } from './appointment/timeslot/timeslotTemplateSaga';
import { generateTimeSlotSaga } from './appointment/timeslot/generateTimeSlotSaga';
import { editTimeSlotSaga } from './appointment/timeslot/editTimeSlotSaga';
import { timeslotPlanSaga } from './appointment/timeslot/timeslotPlanSaga';
import { bookingSaga } from './appointment/booking/bookingSaga';
import { changePasswordSagas } from './administration/changePassword/changePasswordSaga';
import { patientSaga } from './patient/patientSaga';
import { consultationSaga } from './consultation/consultationSaga';
import { prescriptionSaga } from './consultation/prescription/prescriptionSaga';
import { enctManagementSaga } from './administration/enctManagement/enctManagementSaga';
import { moeSaga } from './moe/moeSaga';
import { appointmentSlipFooterSaga } from './administration/appointmentSlipFooter/appointmentSlipFooterSaga';
import { forgetPasswordSaga } from './forgetPasswordSaga';
import { myFavouriteSaga } from './moe/myFavourite/myFavouriteSaga';
import { waitingListSaga } from './appointment/waitingListSaga';
import { mainFrameSaga } from './mainFrameSaga';
import { bookingAnonymousSaga } from './appointment/booking/bookingAnonymousSaga';
import { moePrintSaga } from './moe/moePrintSaga';
import { drugHistorySaga } from './moe/drugHistory/drugHistorySaga';
import { clinicalNoteSaga } from './clinicalNote/clinicalNoteSaga';
import { tagaNoteSaga } from './tagaNote/tagaNoteSaga';
import { assessmentSagas } from './assessment/assessmentSaga';
import { messageSaga } from './message/messageSaga';
import { manageClinicalNoteTemplateSaga } from './clinicalNote/manageClinicalNoteTemplateSaga';
import { manageTagaNoteTemplateSaga } from './tagaNote/manageTagaNoteTemplateSaga';
import { procedureSaga } from './consultation/dxpx/procedure/procedureSaga';
import { diagnosisSaga } from './consultation/dxpx/diagnosis/diagnosisSaga';
import { tokenTemplateManagementSaga } from './IOE/tokenTemplateManagement/tokenTemplateManagementSaga';
import { turnaroundTimeSaga } from './IOE/turnaroundTime/turnaroundTimeSaga';
import { specimenCollectionSaga } from './IOE/specimenCollection/specimenCollectionSaga';
import { serviceProfileSaga } from './IOE/serviceProfile/serviceProfileSaga';
import { attendanceCertSaga } from './certificate/attendanceCertificate/attendanceCertSaga';
import { sickLeaveSaga } from './certificate/sickLeave/sickLeaveSaga';
import { referralLetterSaga } from './certificate/referralLetter/referralLetterSaga';
import { calendarViewSaga } from './appointment/calendarViewSaga';
import { reportTemplateSaga } from './report/reportTemplateSaga';
import { yellowFeverSaga } from './certificate/yellowFever/yellowFeverSaga';
import { vaccineCertSaga } from './certificate/vaccineCert/vaccineCertSaga';
import { maternitySaga } from './certificate/maternity/maternitySaga';
import { generalLetterSaga } from './certificate/generalLetter/generalLetterSaga';
import { publicHolidaySaga } from './administration/publicHoliday/publicHolidaySaga';
import { patientSpecFuncSaga } from './patient/patientSpecFuncSaga';
import { backgroundInformationSaga } from './MRAM/backgroundInformation/backgroundInformationSaga';
import { mramSaga } from './MRAM/mramSaga';
import { mramHistorySaga } from './mramHistory/mramHistorySaga';
import { clinicalSummaryReportSaga } from './report/clinicalSummaryReportSaga';
import { apptEnquirySaga } from './appointment/apptEnquiry/apptEnquirySaga';
import { caseNoSaga } from './caseNo/caseNoSaga';
import { enquirySaga } from './enquiry/enquirySaga';
import { formNameSaga } from './IOE/formName/formNameSaga';
import { laboratoryReportSaga } from './IOE/laboratoryReport/laboratoryReportSaga';
import { effects } from 'store/models';
import { ixRequestSaga } from './IOE/ixRequest/ixRequestSaga';
import { backTakeAttendanceSaga } from './backTakeAttendance/backTakeAttendanceSaga';
import { ecsSaga } from './ECS/ecsSaga';
import { eHRSaga } from './EHR/eHRSaga';
import { redesignBookingSaga } from './appointment/booking/redesignBookingSaga';
import { dtsAppointmentBookingSaga } from './dts/appointment/dtsAppointmentBookingSaga';
import { attendanceSaga } from './attendance/attendanceSaga';
import { ctpSaga } from './consultation/careAndTreatmentPlan/ctpSaga';
import { unavailablePeriodManagementSaga } from './administration/unavailablePeriodManagement/unavailablePeriodManagementSaga';
import { dtsAppointmentAttendanceSaga } from './dts/appointment/dtsAppointmentAttendanceSaga';
import { dtsRemindAppointmentSaga } from './dts/appointment/dtsRemindAppointmentSaga';
import { dtsEmptyTimeslotSaga } from './dts/appointment/dtsEmptyTimeslotSaga';
import { dtsSearchAppointmentSaga } from './dts/appointment/dtsSearchAppointmentSaga';
import { dtsWaitingListSaga } from './dts/appointment/dtsWaitingListSaga';// DH Justin
import { dtsDefaultRoomSaga } from './dts/patient/DtsDefaultRoomSaga'; // DH Anthony
import { dtsPatientSummarySaga } from './dts/patient/DtsPatientSummarySaga'; //DH Miki
import { sessionManagementSaga } from './administration/sessionManagement/sessionManagementSaga';
import { medicalHistoriesSaga } from './medicalHistories/medicalHistoriesSaga';
import { certificateEformSaga } from './certificate/certificateEform/certificateEformSaga';
import { clientServiceViewSaga } from './payment/clientServiceView/clientServiceViewSaga';
import { clinicalDocSaga } from './clinicalDoc/clinicalDocSaga';
import { dtsCommonSaga } from './dts/dtsCommonSaga';
import { saamPatientSaga } from './saam/saamPatientSaga';
import { dtsPreloadDataSaga } from './dts/preload/dtsPreloadDataSaga'; //DH Miki
import { perioChartSaga } from './dts/clinicalContent/perioChartSaga';
import { dtsEncounterSaga } from './dts/clinicalContent/dtsEncounterSaga';
import { docSaga } from './consultation/doc/docSaga';
import { redistributionSaga } from './appointment/redistributionSaga';
import {alsLogSaga} from './als/alsLogSaga';
import {alsLogInfo,auditError} from '../actions/als/logAction';
import { officerInChargeSaga } from './IOE/officerInCharge/officerInChargeSaga';
// import {ALS_TRANSITION_ID_KEY} from '../alsMiddleware/actionToAlsActionDescMiddleware';
import { noticeBoardSaga } from './administration/noticeBoard/noticeBoardSaga';
import { apptSlipRemarksSaga } from './administration/apptSlipRemarks/apptSlipRemarksSaga';
import { dtsPatientSearchSaga } from './dts/patient/DtsPatientSearchSaga';
import { dtsDentalChartSaga } from './dts/clinicalContent/DtsDentalChartSaga';
import { dtsProbProcSaga } from './dts/clinicalContent/DtsProbProcSaga';
import { alsTransactionSaga } from './als/alsTransactionSaga';
import {roomManagementSaga} from './administration/roomManagement/roomManagementSaga';
import { changePasscodeSagas } from './administration/changePasscode/changePasscodeSaga';
import { procedureSetSaga } from './dts/clinicalContent/ProcedureSetSaga';
import { assessmentSaga } from './dts/clinicalContent/assessmentSaga';
import { scannerCertificateSaga } from './certificate/scannerCertificate/scannerCertificateSaga';
import { anServiceIDSaga } from './anServiceID/anServiceIDSaga';
import { bannerSaga } from './patient/bannerSaga';
import {otherAppointmentDetailsSaga} from './otherAppointmentDetails/otherAppointmentDetailsSaga';
import { familyNoSaga } from './familyNo/familyNoSaga';
import { patientTransferOutSagas } from './patientTransferOut';
import { defaulterTracingSagas } from './defaulterTracing';
import { transferOutSagas } from './transferOut';
import {antSaga} from './ant/antSaga';
import { gscEnquirySaga } from './gscEnquiry/gscEnquirySaga';
import { viewNeonatalLogSaga } from './viewNeonatalLog/viewNeonatalLogSaga';
import { ehsSpaControlSaga } from './ehs/ehsSpaControlSaga';
import { timeslotManagementV2Saga } from './appointment/timeslot/timeslotManagementV2Saga';
import { ideasSaga } from './ideas/ideasSaga';
import { imageViewerSaga } from './imageViewer/imageViewerSaga';

function safe(sagaFn) {
    return function* (action) {
        while (true) {
            try {
                yield call(sagaFn, action);
              } catch (e) {
                console.log('catch exception',e);
                yield put(auditError((e && e.message) || 'Frontend unknown error'));
                yield put(alsLogInfo({
                  desc: 'Frontend root Saga error: ' + (e && e.message) || 'Frontend unknown error',
                  content: JSON.stringify(e, Object.getOwnPropertyNames(e))
                }));
                yield put(commonAction.openWarnSnackbar((e && e.message) || 'Server error'));
            }
        }
    };
}

export default function* rootSaga() {
  const sagas = [
    ...eHRSaga,
    ...ecsSaga,
    ...commonSagas,
    ...registrationSaga,
    ...loginSagas,
    ...hkicSagas,
    ...administrationSaga,
    ...userAccountSaga,
    ...userRoleSaga,
    ...timeslotTemplateSagas,
    ...generateTimeSlotSaga,
    ...editTimeSlotSaga,
    ...timeslotPlanSaga,
    ...bookingSaga,
    ...bookingAnonymousSaga,
    ...changePasswordSagas,
    ...patientSaga,
    ...attendanceSaga,
    ...consultationSaga,
    ...prescriptionSaga,
    ...enctManagementSaga,
    ...moeSaga,
    ...appointmentSlipFooterSaga,
    ...forgetPasswordSaga,
    ...myFavouriteSaga,
    ...moePrintSaga,
    ...waitingListSaga,
    ...mainFrameSaga,
    ...drugHistorySaga,
    ...clinicalNoteSaga,
    ...assessmentSagas,
    ...messageSaga,
    ...manageClinicalNoteTemplateSaga,
    ...procedureSaga,
    ...diagnosisSaga,
    ...tokenTemplateManagementSaga,
    ...turnaroundTimeSaga,
    ...specimenCollectionSaga,
    ...serviceProfileSaga,
    ...attendanceCertSaga,
    ...sickLeaveSaga,
    ...maternitySaga,
    ...referralLetterSaga,
    ...calendarViewSaga,
    ...reportTemplateSaga,
    ...yellowFeverSaga,
    ...generalLetterSaga,
    ...publicHolidaySaga,
    ...patientSpecFuncSaga,
    ...backgroundInformationSaga,
    ...mramSaga,
    ...mramHistorySaga,
    ...clinicalSummaryReportSaga,
    ...vaccineCertSaga,
    ...apptEnquirySaga,
    ...caseNoSaga,
    ...enquirySaga,
    ...formNameSaga,
    ...laboratoryReportSaga,
    ...effects,
    ...ixRequestSaga,
    ...backTakeAttendanceSaga,
    ...redesignBookingSaga,
    // ...locationEncounterSaga,
    // ...calendarSaga,
    // ...attendanceSagas,
    ...dtsAppointmentBookingSaga,
    ...ctpSaga,
    ...unavailablePeriodManagementSaga,
    ...dtsAppointmentAttendanceSaga,
    ...dtsEmptyTimeslotSaga,
    ...dtsSearchAppointmentSaga,
    ...dtsWaitingListSaga, // Justin
    ...dtsDefaultRoomSaga, // Anthony
    ...dtsPatientSummarySaga, //DH Miki
    ...dtsRemindAppointmentSaga,
    ...sessionManagementSaga,
    ...tagaNoteSaga,
    ...manageTagaNoteTemplateSaga,
    ...medicalHistoriesSaga,
    ...certificateEformSaga,
    ...scannerCertificateSaga,
    ...clientServiceViewSaga,
    ...clinicalDocSaga,
    ...saamPatientSaga,
    ...dtsPreloadDataSaga, //DH Miki
    ...dtsCommonSaga,
    ...perioChartSaga,
    ...dtsEncounterSaga,
    ...docSaga,
    ...redistributionSaga,
    ...noticeBoardSaga,
    ...apptSlipRemarksSaga,
    ...officerInChargeSaga,
    ...alsLogSaga,
    ...alsTransactionSaga,
    ...roomManagementSaga,
    ...dtsPatientSearchSaga,
    ...dtsDentalChartSaga,
    ...dtsProbProcSaga,
    ...changePasscodeSagas,
    ...procedureSetSaga,
    ...assessmentSaga,
    ...anServiceIDSaga,
    ...bannerSaga,
    ...otherAppointmentDetailsSaga,
    ...familyNoSaga,
    ...patientTransferOutSagas,
    ...defaulterTracingSagas,
    ...antSaga,
    ...gscEnquirySaga,
    ...viewNeonatalLogSaga,
    ...transferOutSagas,
    ...ehsSpaControlSaga,
    ...timeslotManagementV2Saga,
    ...ideasSaga,
    ...imageViewerSaga
  ].map(item => {
    if (typeof item === 'function') {
      return safe(item)();
    } else {
      return item;
    }
  });
  yield all(sagas);
}
