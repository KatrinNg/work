import { Button, makeStyles } from '@material-ui/core';
import Badge from '@material-ui/core/Badge';
import PersonIcon from '@material-ui/icons/Person';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { auditAction } from '../../../../../../store/actions/als/logAction';
import { getFamilyBooking } from '../../../../../../store/actions/appointment/booking/bookingAction';
import { familyMemberNumberGenerator } from '../../../../../../utilities/familyNoUtilities';
import FamilyMemberDialog from './FamilyMemberDialog';
import { FamilyNumberContextProvider } from './FamilyNumberContext';

const useStyles = makeStyles((theme) => ({
    badge: {
        marginLeft: theme.spacing(1)
    }
}));

const FamilyNumberBtn = ({ isConfirm, isAttend, isDateBack, appointmentId, disabled, isShowHistory, isEdit }) => {
    const classes = useStyles();

    const dispatch = useDispatch();

    const audit = useCallback(
        (desc = '', handleByOriginalApi = true, pmi = null) =>
            dispatch(auditAction(desc, null, null, handleByOriginalApi, 'ana', pmi)),
        [dispatch]
    );

    const {
        selectedFamilyMember,
        selectedAttnFamilyMember,
        selectedDateBackFamilyMember,
        isRedirectByPatientList,
        familyMemberData,
        attnFamilyMemberData,
        dateBackFamilyMemberData
    } = useSelector((state) => state.bookingInformation);

    const getFamilyBookingData = useCallback((patient) => dispatch(getFamilyBooking(patient)), [dispatch]);

    const [isOpen, setisOpen] = useState(false);

    const toggle = () => {
        !isOpen && audit('Click Family Member Btn', false);
        setisOpen(!isOpen);
    };

    /**
     * isAttend: Attendance
     * isDateBack: Date Back Attendance
     * else Appointment
     */
    const familyMember = useMemo(() => {
        if (isAttend) return familyMemberNumberGenerator(selectedAttnFamilyMember, attnFamilyMemberData);
        else if (isDateBack) return familyMemberNumberGenerator(selectedDateBackFamilyMember, dateBackFamilyMemberData);
        else return familyMemberNumberGenerator(selectedFamilyMember, familyMemberData);
    }, [
        isAttend,
        isDateBack,
        selectedFamilyMember.length,
        selectedAttnFamilyMember.length,
        selectedDateBackFamilyMember.length,
        familyMemberData.length,
        attnFamilyMemberData.length,
        dateBackFamilyMemberData.length
    ]);

    const totelFamilyMember = useMemo(() => {
        if (isAttend) return attnFamilyMemberData.length;
        else if (isDateBack) return dateBackFamilyMemberData.length;
        else return familyMemberData.length;
    }, [isAttend, isDateBack, familyMemberData.length, attnFamilyMemberData.length, dateBackFamilyMemberData.length]);

    // Fetch data when appointmentId udpated
    useEffect(() => {
        if (appointmentId && (isShowHistory || !isRedirectByPatientList))
            getFamilyBookingData({ appointmentId, isShowHistory, isAttend, isDateBack, isConfirm });
    }, [appointmentId]);

    // console.log(
    //     isAttend,
    //     isDateBack,
    //     selectedFamilyMember.length,
    //     selectedAttnFamilyMember.length,
    //     selectedDateBackFamilyMember.length,
    //     familyMemberData.length,
    //     attnFamilyMemberData.length,
    //     dateBackFamilyMemberData.length,
    //     familyMember,
    //     totelFamilyMember.length,
    //     disabled
    // );
    return (
        <FamilyNumberContextProvider
            value={{ isConfirm, isAttend, isDateBack, isShowHistory, appointmentId, isRedirectByPatientList, isEdit }}
        >
            <FamilyMemberDialog isOpen={isOpen} toggle={toggle} />

            <Button id="familyMemberBtn" variant="contained" color="primary" onClick={toggle} disabled={disabled}>
                Family Member
                <Badge
                    className={classes.badge}
                    color="secondary"
                    badgeContent={
                        (disabled && (isAttend || isDateBack)) || totelFamilyMember.length < 2 ? null : familyMember
                    }
                    showZero
                >
                    <PersonIcon />
                </Badge>
            </Button>
        </FamilyNumberContextProvider>
    );
};

FamilyNumberBtn.prototype = {
    isConfirm: PropTypes.bool,
    isAttend: PropTypes.bool,
    appointmentId: PropTypes.number,
    disabled: PropTypes.bool,
    isShowHistory: PropTypes.bool,
    isDateBack: PropTypes.bool,
    isEdit: PropTypes.bool
};

export default FamilyNumberBtn;
