import { Link, makeStyles, Typography } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { pad } from '../../../utilities/familyNoUtilities';
import { isTempPatient, switchPatient } from '../../../utilities/patientUtilities';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { changeTabsActive } from '../../../store/actions/mainFrame/mainFrameAction';
import { alsLogAudit } from '../../../store/actions/als/logAction';
import accessRightEnum from '../../../enums/accessRightEnum';

const useStyles = makeStyles({
    link: {
        cursor: 'pointer'
    }
});

const PmiComponent = ({ data, isRegist = false }) => {
    const classes = useStyles();

    const dispatch = useDispatch();

    const selectedPatientKey = useSelector((state) => state.patient?.patientInfo?.patientKey);

    const patientKey = useCallback(() => {
        return `${isTempPatient(data.data.idSts) ? 'T' : ''}${pad(data.data.patientKey, 10)}`;
    }, [data.data.patientKey]);

    const redirectHandler = () => {
        // console.log('[PUC] switch PMI from:', selectedPatientKey, 'to:', data.data.patientKey);
        if (selectedPatientKey === data.data.patientKey) {
            // console.log('[PUC] same PMI');
            dispatch(changeTabsActive(1, accessRightEnum.patientSpec));
        }
        else {
            dispatch(openCommonMessage({
                msgCode: '131004',
                btnActions: {
                    btn1Click: () => {
                        dispatch(alsLogAudit({
                            desc: `[Family No. Enquiry] Switch Patient. PMI: ${data.data.patientKey}`,
                            dest: 'patient',
                            functionName: 'Family No. Enquiry',
                            isEncrypt: true
                        }));
                        switchPatient({
                            patient: {
                                patientKey: data.data.patientKey,
                                appointmentId: null,
                                caseNo: ''
                            },
                            needPUC: true
                            // callback: (result) => {
                            //     console.log('[PUC]', result);
                            // }
                        });
                    }
                }
            }));
        }
    };

    return (
        <Typography>
            {isRegist ? (
                patientKey()
            ) : (
                <Link className={classes.link} onClick={redirectHandler}>
                    {patientKey()}
                </Link>
            )}
        </Typography>
    );
};

PmiComponent.propTypes = {
    data: PropTypes.object,
    isRegist: PropTypes.bool
};

export default PmiComponent;
