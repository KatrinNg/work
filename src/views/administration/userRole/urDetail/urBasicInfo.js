import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Paper,
    Typography,
    Switch,
    FormControlLabel,
    Checkbox
} from '@material-ui/core';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import ValidatorEnum from '../../../../enums/validatorEnum';
import { PAGE_STATUS } from '../../../../enums/administration/userRole';
import CommonMessage from '../../../../constants/commonMessage';
import * as CommonUtilities from '../../../../utilities/commonUtilities';
import { updateState, updateReplicableRole } from '../../../../store/actions/administration/userRole';
import Enum from '../../../../enums/enum';
import memoize from 'memoize-one';

const styles = theme => ({
    root: {
        padding: theme.spacing(1)
    },
    list: {
        flex: 1,
        height: 200,
        border: '1px solid #ccc',
        borderRadius: 6,
        backgroundColor: theme.palette.cimsBackgroundColor
    },
    listItem: {
        paddingTop: 4,
        paddingBottom: 4
    },
    h6Title: {
        marginTop: 4,
        marginBottom: 4,
        fontWeight: 'bold',
        color: theme.palette.primaryColor
    },
    button: {
        margin: theme.spacing(1),
        textTransform: 'none'
    },
    buttonLabel: {
        fontSize: 12
    },
    icon: {
        margin: theme.spacing(2)
    },
    accessRightGrid: {
        height: 'calc(100% - 76px)',
        overflow: 'auto',
        borderTop: '1px solid #e6e6e6',
        marginLeft: 4,
        paddingTop: 4
    }
});

function RequiredTips() {
    return (
        <span style={{ color: 'red' }}>*</span>
    );
}

export const isClinicalUser = memoize((allMenuList, selectedList) => {
    if (!selectedList || selectedList.length === 0 || !allMenuList || allMenuList.length === 0) {
        return false;
    }
    const isClinical = (menus) => {
        let filterMenus = menus.filter(x => selectedList.findIndex(s => s.accessRightCd === x.accessRightCd) > -1);
        if (filterMenus.findIndex(x => x.isClinical === 'Y') !== -1) {
            return true;
        } else {
            if (filterMenus.findIndex(x => x.childCodAccessRightDtos && x.childCodAccessRightDtos.length > 0) !== -1) {
                let isCli = false;
                for (let i = 0; i < filterMenus.length; i++) {
                    if (isClinical(filterMenus[i].childCodAccessRightDtos)) {
                        isCli = true;
                    }
                }
                return isCli;
            } else {
                return false;
            }
        }
    };
    return isClinical(allMenuList);
});

class URBasicInfo extends React.Component {

    onChange = (obj) => {
        const { urDetail } = this.props;
        this.props.updateState({
            urDetail: {
                ...urDetail,
                ...obj
            }
        });
    }

    render() {
        const { classes, urDetail, serviceList, pageStatus, disabled } = this.props;
        const serviceName = CommonUtilities.getServiceNameByServiceCd(urDetail.svcCd, serviceList);

        return (
            <Paper className={classes.root}>
                <Grid container spacing={1}>
                    <Grid item container>
                        <Typography variant="h6" className={classes.h6Title}>Basic Information</Typography>
                    </Grid>

                    <Grid item container xs={9} style={{ display: pageStatus === PAGE_STATUS.EDITING && !urDetail.svcCd ? 'none' : 'flex' }}>
                        <FastTextFieldValidator
                            id="userRoleServiceTextField"
                            disabled
                            value={serviceName}
                            label="Service"
                            variant="outlined"
                        />
                    </Grid>

                    <Grid item container xs={9}>
                        <FastTextFieldValidator
                            id={'userRoleNameTextFiled'}
                            upperCase
                            trim="all"
                            calActualLength
                            variant="outlined"
                            label={<>User Role Name<RequiredTips /></>}
                            inputProps={{ maxLength: 50 }}
                            validators={[
                                ValidatorEnum.required,
                                ValidatorEnum.userRoleName
                            ]}
                            errorMessages={[
                                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                CommonMessage.VALIDATION_NOTE_USER_ROLE_NAME()
                            ]}
                            warning={[
                                ValidatorEnum.isEnglishWarningChar
                            ]}
                            warningMessages={[
                                CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()
                            ]}
                            disabled={pageStatus !== PAGE_STATUS.ADDING}
                            value={urDetail.roleName || ''}
                            onBlur={e => this.onChange({ roleName: e.target.value })}
                        />
                    </Grid>

                    <Grid item container xs={9}>
                        <FastTextFieldValidator
                            id={'userRoleDescriptionTextField'}
                            label={<>User Role Description<RequiredTips /></>}
                            variant="outlined"
                            inputProps={{ maxLength: 130 }}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            disabled={disabled}
                            trim="all"
                            calActualLength
                            value={urDetail.roleDesc || ''}
                            onBlur={e => this.onChange({ roleDesc: e.target.value })}
                        />
                    </Grid>

                    <Grid item container xs={9} style={{ display: pageStatus === PAGE_STATUS.EDITING && !urDetail.svcCd ? 'none' : 'flex' }}>
                        <SelectFieldValidator
                            id={'userRoleCopyFromSelectField'}
                            options={urDetail.replicableRole.map(item => ({ value: item.roleId, label: item.roleName }))}
                            isDisabled={disabled}
                            value={urDetail.replicableRoleSelect}
                            addNullOption
                            onChange={e => { this.props.updateReplicableRole(e.value); }}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Copy from</>
                            }}
                        />
                    </Grid>

                    <Grid item container xs={9}>
                        <FormControlLabel
                            labelPlacement="end"
                            label="Clinical User"
                            color="primary"
                            control={<Checkbox id="userRole_clinicalUser" />}
                            checked={isClinicalUser(this.props.allMenuList, this.props.accessRights)}
                            disabled
                        />
                    </Grid>

                    <Grid
                        item
                        container
                        xs={9}
                        alignItems="center"
                        style={{ display: pageStatus === PAGE_STATUS.EDITING && urDetail.svcCd ? 'flex' : 'none' }}
                    >
                        <Typography variant="h6" style={{ marginRight: 24, marginLeft: 4 }}>Status</Typography>
                        <FormControlLabel
                            labelPlacement="end"
                            label={urDetail.status === Enum.COMMON_STATUS_ACTIVE ? 'Active' : 'Inactive'}
                            control={
                                <Switch
                                    id={'userRoleActiveSwitch'}
                                    style={{ height: 20 }}
                                    checked={urDetail.status === Enum.COMMON_STATUS_ACTIVE}
                                    onChange={e => this.onChange({ status: e.target.checked ? Enum.COMMON_STATUS_ACTIVE : Enum.COMMON_STATUS_INACTIVE })}
                                    color="primary"
                                    disabled={disabled}
                                />
                            }
                        />
                    </Grid>
                </Grid>
            </Paper>
        );
    }
}

const mapState = (state) => {
    return {
        pageStatus: state.userRole.pageStatus,
        urDetail: state.userRole.urDetail,
        serviceCd: state.login.service.serviceCd,
        serviceList: state.common.serviceList,
        allMenuList: state.userRole.urDetail.allMenuList,
        accessRights: state.userRole.urDetail.accessRights
    };
};

const mapDispatch = {
    updateState,
    updateReplicableRole
};


export default connect(mapState, mapDispatch)(withStyles(styles)(URBasicInfo));