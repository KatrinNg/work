import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Grid } from '@material-ui/core';
import moment from 'moment';
import { Dialog_Mode } from '../../../../enums/administration/noticeBoard';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CreateUpdateNoticeForm from './createUpdateNoticeForm';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import { updateField, uploadFile } from '../../../../store/actions/administration/noticeBoard/noticeBoardAction';
import Enum from '../../../../enums/enum';
import PreviewDialog from './previewDialog';
import { dtmIsDirty } from '../../../../utilities/noticeBoardUtilities';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';

class NoticeBoardDialog extends React.Component {

    handleDeleteNotice = () => {
        this.props.handleCloseNotice();
    }

    handlePreviewNotice = () => {
        this.props.handleCloseNotice();
    }

    handleSubmitNotice = () => {
        const { curSelNotice, pastEfftDate, pastExpyDate, noticeBk, efftDateSameOrGreater, expyDateSameOrEarly } = this.props;
        if (pastEfftDate || pastExpyDate || efftDateSameOrGreater || expyDateSameOrEarly) {
            return;
        }
        let params = _.cloneDeep(curSelNotice);
        params.efftDate = `${params.efftDate.format(Enum.DATE_FORMAT_EYMD_VALUE)} ${params.efftTime.format(Enum.TIME_FORMAT_24_HOUR_CLOCK)}`;
        params.expyDate = params.expyDate && params.expyTime ?
            `${params.expyDate.format(Enum.DATE_FORMAT_EYMD_VALUE)} ${params.expyTime.format(Enum.TIME_FORMAT_24_HOUR_CLOCK)}`
            : null;
        delete params.efftTime;
        delete params.expyTime;

        if (params.isNew !== 1) {
            delete params.newExpyDate;
        } else {
            params.newExpyDate = params.newExpyDate ? moment(params.newExpyDate).startOf('day').format(Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR) : null;
        }

        if (!dtmIsDirty(params.newExpyDate, noticeBk.newExpyDate) && noticeBk.newExpyDate) {
            params.newExpyDate = noticeBk.newExpyDate.format(Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR);
        }

        if (params.isUrg !== 1) {
            delete params.urgExpyDate;
        } else {
            params.urgExpyDate = params.urgExpyDate ? moment(params.urgExpyDate).startOf('day').format(Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR) : null;
        }

        if (!dtmIsDirty(params.urgExpyDate, noticeBk.urgExpyDate) && noticeBk.urgExpyDate) {
            params.urgExpyDate = noticeBk.urgExpyDate.format(Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR);
        }

        if (params.isImprtnt !== 1) {
            delete params.imprtntExpyDate;
        } else {
            params.imprtntExpyDate = params.imprtntExpyDate ? moment(params.imprtntExpyDate).startOf('day').format(Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR) : null;
        }
        if (!dtmIsDirty(params.imprtntExpyDate, noticeBk.imprtntExpyDate) && noticeBk.imprtntExpyDate) {
            params.imprtntExpyDate = noticeBk.imprtntExpyDate.format(Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR);
        }

        if (params.noticeId !== 0) {
            delete params.updateBy;
            delete params.updateDtm;
            delete params.createBy;
            delete params.createDtm;
        }
        if (params.svcCd === 'all') {
            // params.svcCd = '';
            delete params.svcCd;
        }
        params.isEnable = parseInt(params.isEnable);
        this.props.auditAction('Save Notice');
        this.props.handleSubmitNotice(params);
    }

    render() {
        const { dialogMode, curSelNotice, serviceList, file, openDialog, noticeBk, pastEfftDate, pastExpyDate, efftDateSameOrGreater, expyDateSameOrEarly } = this.props;
        let dialogTitle = '';
        switch (dialogMode) {
            case Dialog_Mode.CREATE:
                dialogTitle = 'Create Record';
                break;
            case Dialog_Mode.UPDATE:
                dialogTitle = 'Update Record';
                break;
            case Dialog_Mode.DELETE:
                dialogTitle = 'Confirm Delete';
                break;
            case Dialog_Mode.PREVIEW:
                dialogTitle = 'Notice Board Preview';
                break;
            default:
                break;
        }

        return (
            < CIMSPromptDialog
                open={openDialog}
                dialogTitle={dialogTitle}
                FormControlProps={dialogMode === Dialog_Mode.PREVIEW ? {
                    style: {
                        backgroundColor: '#4caf50'
                    }
                } : null}
                dialogContentText={
                    <Grid>
                        {
                            dialogMode == Dialog_Mode.CREATE || dialogMode == Dialog_Mode.UPDATE ?
                                <ValidatorForm
                                    ref="noticeForm"
                                    style={{ width: '920px', maxHeight: '785px', paddingTop: '10px', paddingBottom: '10px' }}
                                    onSubmit={this.handleSubmitNotice}
                                >
                                    <CreateUpdateNoticeForm
                                        file={file}
                                        notice={curSelNotice}
                                        serviceList={serviceList}
                                        dialogMode={dialogMode}
                                        noticeBk={noticeBk}
                                        pastEfftDate={pastEfftDate}
                                        pastExpyDate={pastExpyDate}
                                        efftDateSameOrGreater={efftDateSameOrGreater}
                                        expyDateSameOrEarly={expyDateSameOrEarly}
                                        uploadFile={this.props.uploadFile}
                                        updateField={this.props.updateField}
                                        auditAction={this.props.auditAction}
                                    />
                                </ValidatorForm>
                                :
                                null
                        }
                        {
                            dialogMode == Dialog_Mode.PREVIEW ?
                                <PreviewNotice />
                                :
                                null
                        }
                    </Grid>
                }
                buttonConfig={
                    dialogMode == Dialog_Mode.CREATE || dialogMode == Dialog_Mode.UPDATE ?
                        [
                            {
                                id: 'notice_save',
                                name: 'OK',
                                onClick: () => {
                                    this.refs.noticeForm.submit();
                                }
                            },
                            {
                                id: 'notice_close',
                                name: 'Cancel',
                                onClick: ()=>{
                                    this.props.auditAction(AlsDesc.CANCEL,null,null,false,'cmn');
                                    this.props.handleCloseNotice();
                                }
                            }
                        ]
                        :
                        [
                            {
                                id: 'notice_close',
                                name: 'Close',
                                onClick:()=>{
                                    this.props.auditAction(AlsDesc.CLOSE,null,null,false,'cmn');
                                    this.props.handleCloseNotice();
                                }
                            }
                        ]
                }
            />
        );
    }
}

function PreviewNotice(props) {
    return <PreviewDialog
        DonotShowDropDown
           />;
    //return <Notice/>;
}
const mapState = (state) => {
    return {
        curSelNotice: state.noticeBoard.curSelNotice,
        file: state.noticeBoard.file,
        serviceList: state.common.serviceList,
        pastEfftDate: state.noticeBoard.pastEfftDate,
        pastExpyDate: state.noticeBoard.pastExpyDate,
        efftDateSameOrGreater: state.noticeBoard.efftDateSameOrGreater,
        expyDateSameOrEarly: state.noticeBoard.expyDateSameOrEarly
    };
};

const dispatch = {
    updateField,
    uploadFile,
    auditAction
};

export default connect(mapState, dispatch)(NoticeBoardDialog);