import React from 'react';
import { connect } from 'react-redux';
import { PAGESTATUS } from '../../../enums/certificate/certEformEnum';
import * as CertUtil from '../../../utilities/certificateUtilities';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import { handleClose } from '../../../store/actions/certificate/certificateEform';

class ButtonContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            pageStatus,
            encounterInfo
        } = this.props;

        return (
            <CIMSButtonGroup
                buttonConfig={
                    [
                        {
                            id: 'certificate_eform_saveBtn',
                            name: 'Save',
                            style: { display: CertUtil.isPastEncounterDate(encounterInfo && encounterInfo.encounterDate) ? 'none' : '' },
                            disabled: pageStatus !== PAGESTATUS.CERT_ADDING && pageStatus !== PAGESTATUS.CERT_EDITING,
                            onClick: () => { this.props.handleSubmit('SAVE'); }
                        },
                        {
                            id: 'certificate_eform_saveAndPrintBtn',
                            name: 'Save & Print',
                            style: { display: CertUtil.isPastEncounterDate(encounterInfo && encounterInfo.encounterDate) ? 'none' : '' },
                            disabled: pageStatus !== PAGESTATUS.CERT_ADDING && pageStatus !== PAGESTATUS.CERT_EDITING,
                            onClick: () => { this.props.handleSubmit('SAVE_PRINT'); }
                        },
                        {
                            id: 'certificate_eform_printBtn',
                            name: 'Print',
                            disabled: pageStatus !== PAGESTATUS.CERT_SELECTED,
                            onClick: () => { this.props.handleSubmit('PRINT'); }
                        },
                        {
                            id: 'certificate_eform_cancelBtn',
                            name: 'Cancel',
                            onClick: () => { this.props.handleClose(); }
                        }
                    ]
                }
            />
        );
    }
}

const mapState = state => ({
    pageStatus: state.certificateEform.pageStatus,
    encounterInfo: state.patient.encounterInfo
});

const mapDispatch = {
    handleClose
};

export default connect(mapState, mapDispatch)(ButtonContainer);