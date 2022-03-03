import * as PropTypes from 'prop-types';
import React from 'react';
import { checkIsSelectedPatient } from '../../../utilities/appointmentUtilities';

const PmiGroupComponent = ({ data, patientKey, isConfirm, familyMemberData, selectedFamilyMember }) => {
    const showGreyChecked = isConfirm
        ? checkIsSelectedPatient(familyMemberData, selectedFamilyMember, patientKey, data)
        : false;

    return data.data.patientKey === patientKey || showGreyChecked ? (
        <span>
            <span className="ag-icon ag-icon-checkbox-checked" style={{ color: 'lightgray', marginRight: '8%' }}></span>
            {data.data.pmiGrpName}
        </span>
    ) : isConfirm ? (
        <span>
            <span className="ag-icon ag-icon-checkbox-unchecked" style={{ color: 'lightgray', marginRight: '8%' }}></span>
            {data.data.pmiGrpName}
        </span>
    ) : (
        data.data.pmiGrpName
    );
};

PmiGroupComponent.propTypes = {
    data: PropTypes.object,
    patientKey: PropTypes.number,
    isConfirm: PropTypes.bool,
    familyMemberData: PropTypes.array,
    selectedFamilyMember: PropTypes.array
};

export default PmiGroupComponent;
