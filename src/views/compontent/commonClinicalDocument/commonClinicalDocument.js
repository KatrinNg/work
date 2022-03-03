import React, { Component } from 'react';
import { connect } from 'react-redux';
import ClinicalDocumentDialog from '../../jos/gscEnquiry/component/clinicalDocument/ClinicalDocumentDialog';
import { closeCommonClinicalDocument } from '../../../store/actions/common/commonAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';

class CommonClinicalDocument extends Component {

    handleClose = () => {
        this.props.closeCommonClinicalDocument();
    }

    render() {
        let clinicalDocumentProps = {
            open: this.props.open,
            handleClose: this.handleClose,
            openCommonMessage: this.props.openCommonMessage,
            ...this.props.clnicalDocumentParams
        };
        return (
            <ClinicalDocumentDialog {...clinicalDocumentProps}/>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        open: state.common.openCommonClinicalDocument,
        clnicalDocumentParams: state.common.commonClinicalDocumentParams
    };
};

const mapDispatch = {
    closeCommonClinicalDocument,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatch)(CommonClinicalDocument);