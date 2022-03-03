import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as familyNoActionType from '../../../../store/actions/familyNo/familyNoActionType';
import FamilyNoDataGrid from './FamilyNoDataGrid';
import FamilySearchFormGroup from './FamilySearchFormGroup';
import * as PropTypes from 'prop-types';

const FamilyNoEnquiry = ({ isRegist = false, updatePatientBaseInfo, toggle, isSearchDialogOpen }) => {
    const familyNo = useSelector((state) => state.familyNo);

    const dispatch = useDispatch();

    const resetData = useCallback(() => dispatch({ type: familyNoActionType.RESET_DATA }), [dispatch]);

    useEffect(() => resetData(), []);

    return (
        <>
            <FamilySearchFormGroup
                isRegist={isRegist}
                rowData={familyNo.familyData}
                isSearchDialogOpen={isSearchDialogOpen}
            />

            <FamilyNoDataGrid
                isRegist={isRegist}
                rowData={familyNo.familyData}
                updatePatientBaseInfo={updatePatientBaseInfo}
                toggle={toggle}
            />
        </>
    );
};

FamilyNoEnquiry.propTypes = {
    isRegist: PropTypes.bool,
    updatePatientBaseInfo: PropTypes.func,
    toggle: PropTypes.func,
    isSearchDialogOpen: PropTypes.bool
};

export default FamilyNoEnquiry;
