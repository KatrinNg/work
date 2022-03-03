import { Grid } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePatientBaseInfo } from '../../../../../store/actions/registration/registrationAction';
import FamilyNoChiefCheckbox from './FamilyNoChiefCheckbox';
import FamilyNoRadioBtn from './FamilyNoRadioBtn';
import FamilyNoSearchField from './FamilyNoSearchField';

const FamilyNoFormGroup = ({ comDisabled, isNextReg }) => {
    const patientBaseInfo = useSelector((state) => state.registration.patientBaseInfo);

    const isFamilyNoValid = useSelector((state) => state.registration.isFamilyNoValid);

    // const isNextReg = useSelector((state) => state.registration.isNextReg);

    const dispatch = useDispatch();

    const updatePatientBaseInfoAction = useCallback((object) => dispatch(updatePatientBaseInfo(object)), [dispatch]);

    return (
        <Grid item container xs={12} spacing={1}>
            <Grid item container xs={3}>
                <FamilyNoRadioBtn
                    isNextReg={isNextReg}
                    familyNoType={patientBaseInfo.familyNoType}
                    updatePatientBaseInfo={updatePatientBaseInfoAction}
                    comDisabled={comDisabled}
                />
            </Grid>

            <Grid item container xs={9}>
                <FamilyNoSearchField
                    isNextReg={isNextReg}
                    pmiGrpName={patientBaseInfo.pmiGrpName}
                    familyNoType={patientBaseInfo.familyNoType}
                    isFamilyNoValid={isFamilyNoValid}
                    updatePatientBaseInfo={updatePatientBaseInfoAction}
                    comDisabled={comDisabled}
                />

                <FamilyNoChiefCheckbox
                    isChief={patientBaseInfo.isChief}
                    familyNoType={patientBaseInfo.familyNoType}
                    pmiGrpId={patientBaseInfo.pmiGrpId}
                    updatePatientBaseInfo={updatePatientBaseInfoAction}
                    comDisabled={comDisabled}
                />
            </Grid>
        </Grid>
    );
};

FamilyNoFormGroup.propTypes = {
    comDisabled: PropTypes.bool,
    isNextReg: PropTypes.bool
};

export default FamilyNoFormGroup;
