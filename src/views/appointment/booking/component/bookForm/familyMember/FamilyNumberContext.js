import React, { createContext } from 'react';
import PropTypes from 'prop-types';

const initProps = {
    isConfirm: false,
    isAttend: false,
    isDateBack: false,
    isShowHistory: false,
    appointmentId: 0,
    isRedirectByPatientList: false
};

const FamilyNumberContext = createContext(initProps);

export default FamilyNumberContext;

export const FamilyNumberContextProvider = (props) => {
    const { children, value } = props;
    return <FamilyNumberContext.Provider value={{ ...initProps, ...value }}>{children}</FamilyNumberContext.Provider>;
};

FamilyNumberContextProvider.propTypes = {
    isConfirm: PropTypes.bool,
    isAttend: PropTypes.bool,
    isDateBack: PropTypes.bool,
    isShowHistory: PropTypes.bool,
    appointmentId: PropTypes.number,
    isRedirectByPatientList: PropTypes.bool
};
