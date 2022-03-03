import React from 'react';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import { editTemplate, copyTemplate, deleteTemplate, updateState, initTemplateDetail } from '../../../../../store/actions/appointment/timeslotTemplate';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import { StatusEnum } from '../../../../../enums/appointment/timeslot/timeslotTemplateEnum';
import { auditAction } from '../../../../../store/actions/als/logAction';
import AlsDesc from '../../../../../constants/ALS/alsDesc';

const TempButtons = (props) => {
    const { templateListSelected, templateList, status } = props;
    return (
        <Grid item container justify="flex-end">
            <CIMSButton
                id="timeslot_template_createBtn"
                children="Create"
                onClick={() => {
                    props.auditAction(AlsDesc.CREATE, null, null, false, 'ana');
                    if (status === StatusEnum.EDIT) {
                        props.openCommonMessage({
                            msgCode: '110706',
                            btnActions: {
                                btn1Click: () => {
                                    props.initTemplateDetail();
                                }
                            }
                        });
                    } else {
                        props.initTemplateDetail();
                    }
                }}
            />
            <CIMSButton
                id="timeslot_template_editBtn"
                children="Edit"
                disabled={templateListSelected === -1}
                onClick={() => {
                    props.auditAction(AlsDesc.EDIT, null, null, false, 'ana');
                    if (templateListSelected > -1) {
                        props.editTemplate(templateListSelected);
                    }
                }}
            />
            <CIMSButton
                id="timeslot_template_copyBtn"
                children="Copy"
                disabled={templateListSelected === -1}
                onClick={() => {
                    props.auditAction('Copy Template', null, null, false, 'ana');
                    if (templateListSelected > -1) {
                        props.copyTemplate();
                    }
                }}
            />
            <CIMSButton
                id="timeslot_template_deleteBtn"
                children="Delete"
                disabled={templateListSelected === -1}
                onClick={() => {
                    if (templateListSelected > -1) {
                        const temp = templateList.find(item => item.tmsltTmplProfileId === templateListSelected);
                        if (temp) {
                            props.auditAction(AlsDesc.DELETE);
                            props.deleteTemplate(temp);
                        }
                    }
                }}
            />
        </Grid>
    );
};

const mapState = state => ({
    status: state.timeslotTemplate.status,
    templateListSelected: state.timeslotTemplate.templateListSelected,
    templateList: state.timeslotTemplate.templateList
});

const mapDispatch = {
    editTemplate,
    copyTemplate,
    deleteTemplate,
    updateState,
    initTemplateDetail,
    openCommonMessage,
    auditAction
};

export default connect(mapState, mapDispatch)(TempButtons);