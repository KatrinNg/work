import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CIMSButtonGroup from '../../../../components/Buttons/CIMSButtonGroup';
import {
    resetAll,
    saveUserRole,
    searchAccessRight,
    updateState
} from '../../../../store/actions/administration/userRole';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import URBasicInfo from './urBasicInfo';
import URMember from './urMember';
import URAccessRightPanel from './urAccessRightPanel';
import { PAGE_STATUS } from '../../../../enums/administration/userRole';
import AccessRightEnum from '../../../../enums/accessRightEnum';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import { isClinicalAdminSetting } from '../../../../utilities/userUtilities';
import { isClinicalUser } from './urBasicInfo';

class URDetail extends React.Component {

    componentDidMount() {
        let accessRightParams = { functionType: '', statusCd: 'A' };
        this.props.searchAccessRight(accessRightParams);
        this.initDoClose();
    }

    componentWillUnmount() {
        this.props.updateCurTab(AccessRightEnum.userRole, null);
    }

    isViewOnly = () => {
        const { urDetail, isSystemAdmin, isServiceAdmin, isClinicalAdmin } = this.props;
        const viewOnly = !isSystemAdmin && urDetail.isBaseRole === 1 || ((!isSystemAdmin && !isServiceAdmin && !isClinicalAdmin) || isClinicalAdminSetting());
        return viewOnly;
    }

    checkIsDirty = () => {
        const { pageStatus } = this.props;
        const viewOnly = this.isViewOnly();
        return viewOnly ? false : pageStatus === PAGE_STATUS.ADDING || pageStatus === PAGE_STATUS.EDITING;
    }

    handleSave = (closeTab) => {
        this.props.updateState({ doCloseCallbackFunc: closeTab || null });
        this.refs.form.submit();
    }

    initDoClose = () => {
        let doClose = CommonUtil.getDoCloseFunc_2(AccessRightEnum.userRole, this.checkIsDirty, this.handleSave);
        this.props.updateCurTab(AccessRightEnum.userRole, doClose);
    };

    handleOnSubmit = () => {
        const { urDetail, selectedList } = this.props;
        let submitData = {
            status: urDetail.status,
            roleDesc: urDetail.roleDesc,
            roleId: urDetail.roleId,
            roleName: urDetail.roleName,
            uamUserDtos: selectedList,
            version: urDetail.version,
            codAccessRightDtos: urDetail.accessRights,
            svcCd: urDetail.svcCd,
            isClinicalUser: isClinicalUser(this.props.urallMenuList, this.props.uraccessRights) ? 1 : 0
        };
        this.props.auditAction(AlsDesc.SAVE);
        this.props.saveUserRole(submitData);
    }

    handleCancel = () => {
        this.props.auditAction(AlsDesc.CANCEL, null, null, false, 'user');
        this.props.openCommonMessage({
            msgCode: '110361',
            btnActions: {
                btn1Click: () => {
                    // this.props.updateState({ pageStatus: PAGE_STATUS.VIEWING });
                    this.props.resetAll();
                }
            }
        });
    }

    render() {
        const {
            classes,
            pageStatus
        } = this.props;

        const viewOnly = this.isViewOnly();

        return (
            <Grid className={classes.root}>
                <Grid container spacing={1}>
                    <Grid item container xs={6} direction="column" spacing={1}>
                        <Grid item container>
                            <ValidatorForm
                                style={{ width: '100%' }}
                                ref="form"
                                onSubmit={this.handleOnSubmit}
                                focusFail
                            >
                                <URBasicInfo disabled={pageStatus === PAGE_STATUS.VIEWING} />
                            </ValidatorForm>
                        </Grid>
                        <Grid item container>
                            <URMember
                                id={'userRole_userMember'}
                                disabled={pageStatus === PAGE_STATUS.VIEWING}
                            />
                        </Grid>
                    </Grid>
                    <Grid item container xs={6}>
                        <URAccessRightPanel
                            innerRef={ref => this.userRoleAccessRightPanelRef = ref}
                            disabled={pageStatus === PAGE_STATUS.VIEWING}
                        />
                    </Grid>
                </Grid>
                <CIMSButtonGroup
                    buttonConfig={
                        [
                            {
                                id: 'userRoleSaveButton',
                                name: 'Save',
                                disabled: pageStatus === PAGE_STATUS.VIEWING || viewOnly,
                                onClick: ()=>this.handleSave()
                            },
                            {
                                id: 'userRoleCancelButton',
                                name: 'Cancel',
                                onClick: this.handleCancel
                            }
                        ]
                    }
                />
            </Grid>
        );
    }
}

const styles = theme => ({
    root: {
        padding: theme.spacing(1) / 2,
        height: 'calc(100vh - 105px)'
    }
});

const mapState = (state) => {
    return {
        pageStatus: state.userRole.pageStatus,
        serviceCd: state.login.service.serviceCd,
        accessRights: state.login.accessRights,
        selectedList: state.userRole.urMember.selectedList,
        urDetail: state.userRole.urDetail,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin,
        urallMenuList: state.userRole.urDetail.allMenuList,
        uraccessRights: state.userRole.urDetail.accessRights
    };
};

const mapDispatch = {
    updateState,
    resetAll,
    saveUserRole,
    searchAccessRight,
    openCommonMessage,
    updateCurTab,
    auditAction
};

export default connect(mapState, mapDispatch)(withStyles(styles)(URDetail));
