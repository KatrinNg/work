import React, { createContext, useReducer } from 'react';

const RegPatientListContext = createContext();

const initialState = {
    isGum: false,
    selectedPmi: '',
    pdfData: '',
    gumLabelbase64: ''
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'reset':
            return initialState;
        default:
            try {
                return { ...state, ...action.state };
            } catch (e) {
                throw new Error(e);
            }
    }
};

export const RegPatientListContextProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const updateState = (state) => dispatch({state});

    return (
        <RegPatientListContext.Provider value={{ state, dispatch, updateState, ...props.value }}>
            {props.children}
        </RegPatientListContext.Provider>
    );
};

export default RegPatientListContext;
