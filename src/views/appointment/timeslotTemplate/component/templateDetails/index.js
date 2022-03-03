import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import DetailForm from './detailForm';
import DetailList from './detailList';
import CIMSButtonGroup from '../../../../../components/Buttons/CIMSButtonGroup';
import { StatusEnum } from '../../../../../enums/appointment/timeslot/timeslotTemplateEnum';
import { insertTemplate, updateTemplate, updateState, initPage } from '../../../../../store/actions/appointment/timeslotTemplate';
import Enum from '../../../../../enums/enum';
import AccessRightEnum from '../../../../../enums/accessRightEnum';
import * as AppointmentUtil from '../../../../../utilities/appointmentUtilities';
import * as CommonUtil from '../../../../../utilities/commonUtilities';
import { deleteTabs, updateCurTab } from '../../../../../store/actions/mainFrame/mainFrameAction';
import _ from 'lodash';
import { auditAction } from '../../../../../store/actions/als/logAction';
import AlsDesc from '../../../../../constants/ALS/alsDesc';

class TemplateDetails extends React.Component {

    componentDidMount() {
        this.initDoClose();
    }

    checkIsDirty = () => {
        const { status } = this.props;
        return status === StatusEnum.EDIT || status === StatusEnum.NEW || status === StatusEnum.COPY;
    }

    saveFunc = (closeTab) => {
        this.props.updateState({ doCloseCallback: closeTab });
        this.handleSave();
    }

    initDoClose = () => {
        this.doClose = CommonUtil.getDoCloseFunc_2(AccessRightEnum.timeslotTemplate, this.checkIsDirty, this.saveFunc);
        this.props.updateCurTab(AccessRightEnum.timeslotTemplate, this.doClose);
    }

    integrateTemp = () => {
        const {
            templateList,
            templateDetailList,
            templateDetailInfo,
            templateListSelected,
            status,
            loginUser,
            clinic,
            service
        } = this.props;
        let _tmsltTmp = {};
        if (status === StatusEnum.NEW || status === StatusEnum.COPY) {
            _tmsltTmp = {
                ..._tmsltTmp,
                createBy: loginUser.loginName,
                updateBy: loginUser.loginName,
                createDtm: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                updateDtm: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                siteId: clinic.siteId,
                svcCd: service.svcCd,
                tmsltTmplDesc: templateDetailInfo.templateDesc,
                tmsltTmplName: templateDetailInfo.templateName
            };
            let tmsltTmplList = AppointmentUtil.mapStoreToTmsltTmp(templateDetailList);
            _tmsltTmp.tmsltTmplList = this.mapQuotaType(tmsltTmplList);
        } else {
            _tmsltTmp = templateList.find(item => item.tmsltTmplProfileId === templateListSelected);
            _tmsltTmp = {
                ..._tmsltTmp,
                updateBy: loginUser.loginName,
                updateDtm: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                tmsltTmplDesc: templateDetailInfo.templateDesc,
                tmsltTmplName: templateDetailInfo.templateName
            };
            let tmsltTmplList = AppointmentUtil.mapStoreToTmsltTmp(templateDetailList);
            _tmsltTmp.tmsltTmplList = this.mapQuotaType(tmsltTmplList);
        }
        return _tmsltTmp;
    }

    mapQuotaType = (tmsltTmplList) => {
        const { quotaConfig } = this.props;
        const quotaList = quotaConfig && quotaConfig[0] && quotaConfig[0].urgQtAllocateSeq.split(';');
        for (let key in tmsltTmplList) {
            if (['qt1', 'qt2', 'qt3', 'qt4', 'qt5', 'qt6', 'qt7', 'qt8'].includes(key)) {
                if (quotaList.findIndex(item => _.toLower(item) === key) > -1) {
                    tmsltTmplList[key] = tmsltTmplList[key] || null;
                } else {
                    tmsltTmplList[key] = tmsltTmplList[key] || 0;
                }
            }
            if (key === 'overallQt') {
                tmsltTmplList[key] = tmsltTmplList[key] || 0;
            }
        }
        return tmsltTmplList;
    }

    handleSave = () => {
        const { status, formRef } = this.props;
        const validCase = this.props.onSubmit();
        validCase.then(result => {
            if (result) {
                const params = this.integrateTemp();
                if (status === StatusEnum.NEW || status === StatusEnum.COPY) {
                    this.props.auditAction('Create Timeslot Template');
                    this.props.insertTemplate(params);
                } else if (status === StatusEnum.EDIT) {
                    this.props.auditAction('Save Timeslot Template Update');
                    this.props.updateTemplate(params);
                }
            } else {
                formRef && formRef.current && formRef.current.focusFail();
            }
        });
    }

    handleCancel = () => {
        const { status } = this.props;
        this.props.auditAction(AlsDesc.CANCEL, null, null, false, 'ana');
        if (status === StatusEnum.VIEW) {
            this.props.deleteTabs(AccessRightEnum.timeslotTemplate);
        } else {
            this.props.initPage();
        }
    }

    render() {
        const { classes, status } = this.props;
        return (
            <Grid container className={classes.root}>
                <Grid item container>
                    <Typography variant="h6" className={classes.title}>Template Details</Typography>
                </Grid>
                <Grid item container>
                    <DetailForm />
                </Grid>
                <Grid item container>
                    <DetailList />
                </Grid>
                <Grid item container>
                    <CIMSButtonGroup
                        buttonConfig={
                            [
                                {
                                    id: 'timeslot_template_detail_saveBtn',
                                    name: 'Save',
                                    disabled: status === StatusEnum.VIEW,
                                    onClick: this.handleSave
                                },
                                {
                                    id: 'timeslot_template_detail_cancelBtn',
                                    name: 'Cancel',
                                    onClick: this.handleCancel
                                }
                            ]
                        }
                    />
                </Grid>
            </Grid>
        );
    }
}

const styles = theme => ({
    root: {
        width: '99%'
    },
    title: {
        color: theme.palette.primaryColor,
        fontWeight: 'bold',
        margin: `${theme.spacing(1)}px 0px`
    }
});

const mapState = state => ({
    status: state.timeslotTemplate.status,
    templateList: state.timeslotTemplate.templateList,
    templateDetailList: state.timeslotTemplate.templateDetailList,
    templateDetailInfo: state.timeslotTemplate.templateDetailInfo,
    templateListSelected: state.timeslotTemplate.templateListSelected,
    loginUser: state.login.loginInfo,
    clinic: state.login.clinic,
    service: state.login.service,
    quotaConfig: state.common.quotaConfig
});

const mapDispatch = {
    insertTemplate,
    updateTemplate,
    updateState,
    updateCurTab,
    initPage,
    deleteTabs,
    auditAction
};

export default connect(mapState, mapDispatch)(withStyles(styles)(TemplateDetails));