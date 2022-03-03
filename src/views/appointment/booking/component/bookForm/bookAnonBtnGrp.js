import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import { deleteTabs } from '../../../../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import accessRightEnum from '../../../../../enums/accessRightEnum';
import { anonPageStatus, UpdateMeans } from '../../../../../enums/appointment/booking/bookingEnum';
import Enum from '../../../../../enums/enum';
import * as CommonUtil from '../../../../../utilities/commonUtilities';
import {auditAction} from '../../../../../store/actions/als/logAction';
import AlsDesc from '../../../../../constants/ALS/alsDesc';

const BookFormBtnGrp = React.forwardRef((props, ref) => {
    const {
        pageStatus,
        anonPatientInfo,
        bookingData,
        isDirty,
        deleteTabs, //NOSONAR
        handleBtnClick, //NOSONAR
        newOrUpdate,
        openCommonMessage, //NOSONAR
        handleOpenDeleteReason, //NOSONAR
        handleGestationCalc, //NOSONAR
        isUseGestCalc //NOSONAR
    } = props;

    const isBookBtnDisabled = React.useMemo(() => anonPatientInfo && anonPatientInfo.patientKey && !parseInt(anonPatientInfo.deadInd) ? false : true, [anonPatientInfo]);
    const isNewCaseBookShow = React.useMemo(() => {
        return anonPatientInfo
        && parseInt(anonPatientInfo.patientKey) > 0
        && CommonUtil.isNewCaseBookingFlow()
        && CommonUtil.isUseCaseNo();
    }, [anonPatientInfo]);

    const isShowGestationCalc = React.useMemo(() => {
        return isUseGestCalc && bookingData && bookingData.encounterTypeCd === 'ENC_NEW';
    }, [bookingData]);

    return (
        <Grid item container alignItems="flex-end" justify="flex-end" style={{ 'marginTop': '2rem' }}>
            {
                pageStatus === anonPageStatus.CONFIRMED ?
                    null
                    :
                    <div>
                        {
                            isShowGestationCalc ?
                                <CIMSButton
                                    id="bookingAnonymous_btn_gestationCalBtn"
                                    style={{ marginRight: 0 }}
                                    onClick={() => { props.auditAction('Open Gestation Calculator', null, null, false, 'ana'); handleGestationCalc(); }}
                                    children="Gestation Calculator"
                                />
                                : null
                        }
                        {
                            // pageStatus === anonPageStatus.UPDATE ?
                            newOrUpdate === UpdateMeans.UPDATE ?
                                <>
                                    <CIMSButton
                                        id="bookingAnonymous_btn_update"
                                        style={{ marginRight: 0 }}
                                        onClick={() => { props.auditAction('Click Update Button', null, null, false, 'ana'); handleBtnClick('Update'); }}
                                        disabled={!isDirty}
                                    >Update</CIMSButton>
                                    <CIMSButton
                                        id="bookingAnonymous_btn_cancel"
                                        style={{ marginRight: 0 }}
                                        children="Delete"
                                        onClick={() => { props.auditAction('Open Delete Reason Dialog', null, null, false, 'ana'); handleOpenDeleteReason();}}
                                    />
                                </>
                                :
                                <>
                                    {
                                        isNewCaseBookShow ?
                                            <CIMSButton
                                                id="bookingAnonymous_btn_newCaseBooking"
                                                style={{ marginRight: 0 }}
                                                onClick={() => { props.auditAction('Click New Case Booking Button', null, null, false, 'ana'); handleBtnClick('NewCaseBook'); }}
                                                disabled={isBookBtnDisabled}
                                                children="New Case Booking"
                                            /> : null
                                    }
                                    <CIMSButton
                                        id="bookingAnonymous_btn_book"
                                        style={{ marginRight: 0 }}
                                        onClick={() => { props.auditAction('Click Book Button', null, null, false, 'ana'); handleBtnClick('Book'); }}
                                        disabled={isBookBtnDisabled}
                                    >Book</CIMSButton>
                                </>
                        }
                        <CIMSButton
                            id="bookingAnonymous_btn_close"
                            style={{ marginRight: 0 }}
                            onClick={() => {
                                props.auditAction(AlsDesc.CLOSE,null,null,false,'ana');
                                if (pageStatus === anonPageStatus.UPDATE && isDirty) {
                                    openCommonMessage({
                                        msgCode: '110018',
                                        btnActions: {
                                            btn1Click: () => {
                                                deleteTabs(accessRightEnum.bookingAnonymous);
                                            }
                                        }
                                    });
                                } else {
                                    deleteTabs(accessRightEnum.bookingAnonymous);
                                }
                            }}

                        >Close</CIMSButton>
                    </div>
            }
        </Grid>
    );
});


const mapStatetoProps = (state) => {
    return ({
        bookingData: state.bookingAnonymousInformation.bookingData,
        anonPatientInfo: state.bookingAnonymousInformation.anonPatientInfo,
        pageStatus: state.bookingAnonymousInformation.pageStatus,
        newOrUpdate: state.bookingAnonymousInformation.newOrUpdate
    });
};

const mapDispatchtoProps = {
    openCommonMessage, deleteTabs,auditAction
};

export default connect(mapStatetoProps, mapDispatchtoProps)(BookFormBtnGrp);