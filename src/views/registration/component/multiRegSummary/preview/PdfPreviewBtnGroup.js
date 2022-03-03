import { Box, Button, DialogActions, makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import Select from 'react-select';
import AlsDesc from '../../../../../constants/ALS/alsDesc';
import { ExportTypeOptions } from '../../../../../enums/enum';
import { auditAction } from '../../../../../store/actions/als/logAction';
import { printGumLabel, printRegSummary } from '../../../../../store/actions/registration/registrationAction';
import RegPatientListContext from '../RegPatientListContext';

const useStyles = makeStyles((theme) => ({
    button: {
        marginLeft: theme.spacing(2)
    },
    selectInput: {
        width: '20%'
    }
}));

const customStyles = {
    control: (styles) => ({
        ...styles,
        backgroundColor: 'transparent',
        borderColor: 'hsl(0deg 0% 68%)'
    }),
    menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
    menu: (provided, state) => ({ ...provided, zIndex: 9999, width: state.selectProps.width })
};

const PdfPreviewBtnGroup = ({ toggle }) => {
    const classes = useStyles();

    const { registeredPatientList, state } = useContext(RegPatientListContext);

    const { isGum, pdfData, gumLabelbase64 } = state;

    const dispatch = useDispatch();

    const [printType, setprintType] = useState('PDF');

    const audit = useCallback(
        (desc = '', handleByOriginalApi = true, pmi = null) =>
            dispatch(auditAction(desc, null, null, handleByOriginalApi, 'patient', pmi)),
        [dispatch]
    );

    const downloadRegSummaryHandler = () => {
        audit(`Download Multi-Patient Reg Summary as ${printType}`);
        dispatch(printRegSummary('download', printType, registeredPatientList));
    };

    const printRegSummaryHandler = useCallback(() => {
        audit(`Print Multi-Patient Reg Summary`);
        dispatch(
            printRegSummary('print', null, null, pdfData, (result) => {
                if (result) toggle();
            })
        );
    }, [pdfData]);

    const printGumLabelHandler = useCallback(() => {
        audit(`Print Gum Label`, false);
        dispatch(
            printGumLabel(null, null, null, gumLabelbase64, (result) => {
                if (result) toggle();
            })
        );
    }, [gumLabelbase64]);

    const onChange = (e) => setprintType(e.value);

    const closeDialog = () => {
        audit(AlsDesc.CLOSE, false);
        toggle();
    };

    return (
        <Box mt={3}>
            <DialogActions>
                {!isGum && (
                    <>
                        <Select
                            width="300px"
                            isSearchable={false}
                            menuPlacement="top"
                            menuPortalTarget={document.body}
                            styles={customStyles}
                            className={classes.selectInput}
                            placeholder="Document Type"
                            name="Export Type"
                            value={ExportTypeOptions.find((option) => option.value === printType)}
                            onChange={onChange}
                            options={ExportTypeOptions}
                        />
                        <Button
                            id="downloadBtn"
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            onClick={downloadRegSummaryHandler}
                        >
                            Download
                        </Button>
                    </>
                )}

                <Button
                    id="printBtn"
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={isGum ? printGumLabelHandler : printRegSummaryHandler}
                >
                    Print
                </Button>

                <Button
                    id="closeBtn"
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={closeDialog}
                >
                    Close
                </Button>
            </DialogActions>
        </Box>
    );
};

PdfPreviewBtnGroup.propTypes = {
    toggle: PropTypes.func
};

export default PdfPreviewBtnGroup;
