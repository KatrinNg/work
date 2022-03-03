import React, { useState } from 'react';
import CIMSButton from '../../components/Buttons/CIMSButton';
import _ from 'lodash';
import SPPPrintGumLabelDialog from './sPPPrintGumLabelDialog';
import EHSConfirmationDialog from './eHSConfirmationDialog';

const LabelButton = props => {
    const {
        id,
        svcCd,
        handlePrintGumLabel,
        handlePrintSPPGumLabel = null,
        handlePrintEHSGumLabel = null,
        children,
        isShowButton = svcCd === 'THS' || svcCd === 'FCS' || svcCd === 'ANT' || svcCd === 'SHS' || svcCd === 'SPP' || svcCd === 'CGS' || svcCd === 'EHS',
        classes,
        auditAction
    } = props;

    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
    const [openPrintGumLabelDialog, setOpenPrintGumLabelDialog] = useState(false);

    const handleOnClick = () => {
        if (svcCd === 'SPP') {
            setOpenPrintGumLabelDialog(true);
        } else if (svcCd === 'EHS') {
            setOpenConfirmationDialog(true);
        } else {
            auditAction('Print Gum Label', null, null, false, 'patient');
            handlePrintGumLabel();
        }
    };

    return (
        isShowButton ? (
            <>
                <CIMSButton
                    id={id}
                    classes={classes}
                    onClick={handleOnClick}
                    children={children}
                />
                {
                    openConfirmationDialog && svcCd === 'EHS' ?
                        <EHSConfirmationDialog
                            id={id + '_confirmationDialog'}
                            open={openConfirmationDialog}
                            handleConfirm={(confirmationForm) => {
                                setOpenConfirmationDialog(false);
                                handlePrintEHSGumLabel && handlePrintEHSGumLabel(confirmationForm);
                            }}
                            handleCancel={() => {
                                setOpenConfirmationDialog(false);
                            }}
                        /> : null
                }
                {
                    openPrintGumLabelDialog && svcCd === 'SPP' ?
                        <SPPPrintGumLabelDialog
                            id={'print_gum_label_dialog'}
                            openPrintGumLabelDialog={openPrintGumLabelDialog}
                            closePrintGumLabelDialog={() => {
                                auditAction('Close Print Gum Label Dialog', null, null, false, 'patient');
                                setOpenPrintGumLabelDialog(false);
                            }}
                            handlePrintSPPGumLabel={(selectedCategory) => {
                                auditAction('Click Generate in Print Gum Label Dialog', null, null, false, 'patient');
                                setOpenPrintGumLabelDialog(false);
                                handlePrintSPPGumLabel && handlePrintSPPGumLabel(selectedCategory);
                            }}
                        /> : null
                }
            </>
        ) : null
    );
};

export default LabelButton;