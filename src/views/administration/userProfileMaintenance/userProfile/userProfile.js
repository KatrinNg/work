import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import SearchInput from '../../../compontent/searchInput';
import {
    FormControl,
    Grid,
    Typography
} from '@material-ui/core';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import { withStyles } from '@material-ui/core/styles';
import ButtonStatusEnum from '../../../../enums/administration/buttonStatusEnum';
import * as FieldName from '../../../../enums/administration/fieldName';
import {
    resetAll,
    cancelEdit,
    insertUserProfile,
    updateUserProfile,
    addUserProfile,
    editUserProfile,
    searchUserProfile,
    getUserById,
    updateState,
    updateField,
    clearUserRelatedRole
} from '../../../../store/actions/administration/administrationAction';

import { getCodeList } from '../../../../store/actions/common/commonAction';
import * as administrationActionType from '../../../../store/actions/administration/administrationActionType';
import { codeList } from '../../../../constants/codeList';
import _ from 'lodash';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import CIMSButtonGroup from '../../../../components/Buttons/CIMSButtonGroup';
import { updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import UserProfileBasicInfoPanel from '../component/userProfileBasicInfoPanel';
import UserProfileRelatedRolePanel from '../component/userProfileRelatedRolePanel';
import Enum from '../../../../enums/enum';

const styles = () => ({
    panelPadding: {
        padding: '0px 8px'
    },
    button: {
        margin: 4,
        textTransform: 'none'
    },
    buttonLabel: {
        fontSize: 12
    }

});


class UserProfile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            callbackFunc: null
        };
    }

    componentDidMount() {
        let params = [
            codeList.gender
        ];
        this.props.getCodeList({
            params,
            actionType: administrationActionType.PUT_CODE_LIST
        });
        this.props.updateCurTab('F024', this.doClose);
        this.props.updateField('userExpiryDate', moment().add(10, 'years'));
        this.props.updateField('efftDate', moment());
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    handleOnSubmit = () => {
        let data = _.cloneDeep(this.props.userSearchData);
        let { callbackFunc } = this.state;
        data.userExpiryDate = moment(data.userExpiryDate).format(Enum.DATE_FORMAT_EYMD_VALUE);
        data.efftDate = moment(data.efftDate).format(Enum.DATE_FORMAT_EYMD_VALUE);
        if (this.props.userProfileStatus === ButtonStatusEnum.ADD) {
            delete data.userId;
            delete data.version;
            delete data.password;
            this.props.insertUserProfile(data, callbackFunc);
        } else if (this.props.userProfileStatus === ButtonStatusEnum.EDIT) {
            delete data.password;
            this.props.updateUserProfile(data, callbackFunc);
        }
    }

    handleSearch = value => {
        value = value.trim().toUpperCase();
        const params = { parameter: value };
        this.props.searchUserProfile(params);
    }

    handleOnSelect = item => {
        if (JSON.stringify(item) !== '{}') {
            let params = { id: item.userId };
            this.props.getUserById(params);
            this.refs.form.resetValidations();
        }
    }

    handleCreateUser = () => {
        this.props.addUserProfile();
    }

    handleEditUser = () => {
        this.props.editUserProfile();
    }

    handleCancel = () => {
        this.props.cancelEdit();
        this.props.clearUserRelatedRole();
        this.refs.form.resetValidations();
    }

    handleChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        if (name === 'engSurname' || name === 'engGivenName') {
            value = value.toUpperCase(value);
            if (e.target.getAttribute('maxlength')) {
                value = value.slice(0, e.target.getAttribute('maxlength'));
            }
        }
        if (name === 'loginName') {
            value = value.replace(/[^A-Za-z0-9]/ig, '');
        }
        if (name === 'contactPhone') {
            value = value.replace(/[^0-9]/ig, '');
        }
        this.props.updateField(name, value);
    }

    handleSelectChange = (e, name) => {
        let value = e.value;
        this.props.updateField(name, value);
    }

    handleDateChange = (e, name) => {
        this.props.updateField(name, e);
    }

    handleSubmitError = () => {
        let { callbackFunc } = this.state;
        callbackFunc(false);
        // this.props.updateCanClose(false);
    }

    // different tabs should have diffenent 'isDirty' functions
    // isDirty = () => {
    //     const { userProfileStatus } = this.props;
    //     return userProfileStatus === ButtonStatusEnum.ADD || this.props.userProfileStatus === ButtonStatusEnum.EDIT;
    // }

    // doClose = (callback) => {
    //     const isDirty = this.isDirty();
    //     if (isDirty) {
    //         this.setState({ callbackFunc: callback });
    //         this.props.openCommonMessage({
    //             msgCode: '110033',
    //             btnActions: {
    //                 btn1Click: () => {
    //                     this.refs.form.submit();
    //                 },
    //                 btn2Click: () => {
    //                     callback(true);
    //                 }
    //             }
    //         });
    //     }
    //     else {
    //         callback(true);
    //     }

    // }

    doClose = (callback) => {
        function isDirty(status) {     //different tabs have diffenent 'isDirty' functions
            if (status === ButtonStatusEnum.ADD || status === ButtonStatusEnum.EDIT) {
                return true;
            }
            return false;
        }

        const { userProfileStatus } = this.props;
        if (isDirty(userProfileStatus)) {
            this.setState({ callbackFunc: callback });
            this.props.openCommonMessage({      // prompt save or cancel
                msgCode: '110033',
                btnActions: {
                    btn1Click: () => {
                        this.refs.form.submit();
                    },
                    btn2Click: () => {
                        callback(true);
                    }

                }
            });
        }
        else {
            callback(true);
        }
    }

    render() {
        const { classes, userSearchData, pageCodeList, userRelatedRoleData, serviceList } = this.props;

        let isInputDisabled = true;
        if (this.props.userProfileStatus === ButtonStatusEnum.ADD || this.props.userProfileStatus === ButtonStatusEnum.EDIT) {
            isInputDisabled = false;
        }
        return (
            <Grid>
                <Grid container className={!isInputDisabled ? 'hide' : null} alignItems="center" justify="space-between">
                    <Typography component="div">
                        <SearchInput
                            id="userProfileSearchInput"
                            limitValue={4}
                            displayField={['engSurname', 'engGivenName', 'loginName', 'email']}
                            inputPlaceHolder="Search by User Name/Login Name/Email"
                            upperCase
                            onChange={this.handleSearch}
                            dataList={this.props.userSearchList}
                            onSelectItem={this.handleOnSelect}
                            clearDataList={() => this.props.updateState({ userSearchList: [] })}
                        />
                    </Typography>
                    <Typography component="div">
                        <CIMSButton
                            id={FieldName.USER_PROFILE_CREATE}
                            disabled={this.props.userProfileStatus !== ButtonStatusEnum.VIEW && this.props.userProfileStatus !== ButtonStatusEnum.SEARCH}
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={this.handleCreateUser}
                        >Create User</CIMSButton>
                        <CIMSButton
                            id={FieldName.USER_PROFILE_EDIT}
                            disabled={this.props.userProfileStatus !== ButtonStatusEnum.DATA_SELECTED && this.props.userProfileStatus !== ButtonStatusEnum.SEARCH}
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={this.handleEditUser}
                        >Edit User</CIMSButton>
                    </Typography>
                </Grid>
                <Grid container item xs={12} direction={'row'}>
                    <Grid container item xs={6} className={classes.panelPadding}>
                        <FormControl fullWidth>
                            <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError} style={{ display: this.props.userProfileStatus === ButtonStatusEnum.VIEW ? 'none' : '' }}>
                                {/* <Grid container item xs={6}> */}
                                <UserProfileBasicInfoPanel
                                    id={'user_profile_basic_info_panel'}
                                    userSearchData={userSearchData}
                                    isInputDisabled={isInputDisabled}
                                    pageCodeList={pageCodeList}
                                    handleChange={this.handleChange}
                                    handleSelectChange={this.handleSelectChange}
                                    handleDateChange={this.handleDateChange}
                                />
                                {/* </Grid> */}
                            </ValidatorForm>
                        </FormControl>
                    </Grid>
                    {
                        userRelatedRoleData && userRelatedRoleData.length > 0 ?
                            <Grid container item xs={6} className={classes.panelPadding}>
                                <UserProfileRelatedRolePanel
                                    id={'user_profile_related_role_panel'}
                                    userRelatedRoleData={userRelatedRoleData}
                                    serviceList={serviceList}
                                />
                            </Grid>
                            : null
                    }
                </Grid>
                <CIMSButtonGroup
                    buttonConfig={
                        [
                            {
                                id: FieldName.USER_PROFILE_SAVE,
                                name: 'Save',
                                disabled: isInputDisabled,
                                // type: 'submit',
                                classes: {
                                    root: classes.button
                                },
                                onClick: () => this.refs.form.submit()

                            },
                            {
                                id: FieldName.USER_PROFILE_CANCEL,
                                name: 'Cancel',
                                onClick: this.handleCancel,
                                classes: {
                                    root: classes.button
                                }
                            }
                        ]
                    }
                />
                {/* <EditModeMiddleware componentName={accessRightEnum.userProfile} when={!isInputDisabled} doClose={this.doClose}/> */}
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        userProfileStatus: state.userProfile.status,
        userSearchList: state.userProfile.userSearchList,
        userSearchData: state.userProfile.userSearchData,
        pageCodeList: state.userProfile.pageCodeList,
        canCloseTab: state.mainFrame.canCloseTab,
        subTabs: state.mainFrame.subTabs,
        tabs: state.mainFrame.tabs,
        tabsActiveKey: state.mainFrame.tabsActiveKey,
        userRelatedRoleData: state.userProfile.userRelatedRoleData,
        serviceList: state.common.serviceList
    };
};

const mapDispatchToProps = {
    resetAll,
    cancelEdit,
    insertUserProfile,
    updateUserProfile,
    addUserProfile,
    editUserProfile,
    searchUserProfile,
    getUserById,
    getCodeList,
    updateField,
    openCommonMessage,
    updateCurTab,
    clearUserRelatedRole,
    updateState
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserProfile));