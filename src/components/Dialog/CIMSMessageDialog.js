import React, { Component } from 'react';
import { connect } from 'react-redux';
import { cleanCommonMessageDetail, closeCommonMessage } from '../../store/actions/message/messageAction';
import Message from '@ha/ha-cims-message-engine/lib/Message';
class CIMSMessageDialog extends Component {
    render() {
        let {commonMessageDetail, openMessageDialog, closeCommonMessage, commonMessageList, cleanCommonMessageDetail} = this.props;
        const messageParams = {
            commonMessageDetail,
            openMessageDialog,
            closeCommonMessage,
            commonMessageList,
            cleanCommonMessageDetail
        };
        return (
		   <Message {...messageParams}/>        );
    }
}

const mapStateToProps = state => {
    return {
        commonMessageList: state.message.commonMessageList,
        openMessageDialog: state.message.openMessageDialog,
        commonMessageDetail: state.message.commonMessageDetail
    };
};

const mapDispatchToProps = {
    cleanCommonMessageDetail,
    closeCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(CIMSMessageDialog);
