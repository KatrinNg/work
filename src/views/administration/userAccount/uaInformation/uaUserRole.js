import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/styles/withStyles';
import SearchInput from '../../../../components/TextField/CIMSSearchInput';
import CIMSList from '../../../../components/List/CIMSList';
import _ from 'lodash';
import { PAGE_STATUS } from '../../../../enums/administration/userAccount';
import { GFMIS_ROLE_MAPPING } from '../../../../enums/enum';
import {
    listAllUserRole,
    updateState
} from '../../../../store/actions/administration/userAccount/userAccountAction';
import { USER_ROLE_TYLE } from '../../../../enums/administration/userAccount/index';
import MoveSideButtons from '../../../../components/Buttons/MoveSideButtons';
import { isSelfEditing, isExistConflictShroffRole, isSelectedConflictShroffRole } from '../utils';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';

const id = 'uaUserRole';


const UAUserRole = (props) => {
    const {
        classes, searchAvailableVal, searchSelectedVal, availableUserRoleList, selectedUserRoleList, //NOSONAR
        availableIndex, selectedIndex, userInfo, uaServiceList, updateState, uaUserRole, pageStatus,
        isSystemAdmin, isServiceAdmin, loginId //NOSONAR
    } = props;

    const updateUserRole = (uaRoleData) => {
        updateState({ uaUserRole: uaRoleData });
    };

    const [curAvailRoleList, setCurAvailRoleList] = useState(() => {
        return [];
    });

    // useEffect(() => {
    //     const isUserAdmin = userInfo.isAdmin === 0;
    //     // let statuses=[]
    //     let svcCds = [];
    //     if (isUserAdmin) {
    //         // statuses.push()

    //     }
    //     uaServiceList.forEach(item => svcCds.push(item.svcCd));
    //     // props.listAllUserRole({ statuses: ['!D'], svcCds: svcCds });
    //     props.listAllUserRole({ statuses: ['!D'] });
    // }, []);

    const loadCurAvailRoleList = () => {
        let _curAvailRoleList = _.cloneDeep(availableUserRoleList);
        let svcCds = [];
        uaServiceList.forEach(item => svcCds.push(item.svcCd));
        if (searchAvailableVal) {
            _curAvailRoleList = _curAvailRoleList.filter(item => {
                if (item.svcCd) {
                    return (svcCds.find(ele => ele === item.svcCd) && _.toUpper(item.roleName).includes(_.toUpper(searchAvailableVal)));
                }
                else {
                    return _.toUpper(item.roleName).includes(_.toUpper(searchAvailableVal));
                }
            });
        } else {
            _curAvailRoleList = _curAvailRoleList.filter(item => {
                if (item.svcCd) {
                    return svcCds.find(ele => ele === item.svcCd);
                } else {
                    return true;
                }
            });
        }

        if (selectedUserRoleList.length > 0) {
            selectedUserRoleList.forEach(selRole => {
                _curAvailRoleList = _curAvailRoleList.filter(item => item.roleId !== selRole.roleId);
            });
        }

        return _curAvailRoleList;
    };

    useEffect(() => {
        let newAvailRoleList = loadCurAvailRoleList();
        setCurAvailRoleList(newAvailRoleList);
    }, [uaServiceList, searchAvailableVal, searchSelectedVal, selectedUserRoleList]);

    const handleListItemClick = (index, action) => {
        const _uaUserRole = _.cloneDeep(uaUserRole);
        if (action === USER_ROLE_TYLE.SELECTED) {
            _uaUserRole.selectedIndex = index;
        }
        if (action === USER_ROLE_TYLE.AVAILABLE) {
            _uaUserRole.availableIndex = index;
        }
        updateUserRole(_uaUserRole);
    };

    const handleOnMove = (action) => {
        const _uaUserRole = _.cloneDeep(uaUserRole);
        let selRole = null;
        switch (action) {
            case 'SR': {
                // let _availableList = availableUserRoleList;
                // if (searchAvailableVal) {
                //     _availableList = availableUserRoleList.filter(item => item.roleName.includes(searchAvailableVal));
                // }
                let selIdx = parseInt(availableIndex) || 0;
                selRole = curAvailRoleList[selIdx];

                if (_.toUpper(selRole.roleName) === GFMIS_ROLE_MAPPING.RCP_SHROFF_OPERATOR ||
                _.toUpper(selRole.roleName) === GFMIS_ROLE_MAPPING.RCP_SHROFF_SUPERVISOR ||
                _.toUpper(selRole.roleName) === GFMIS_ROLE_MAPPING.RCP_SHROFF_ADMIN) {
                    if(isExistConflictShroffRole(selectedUserRoleList)) {
                        props.openCommonMessage({ msgCode: '110383' });
                        break;
                    }
                }
                // let newAvailRoleList = availableUserRoleList.filter(item => item.roleId !== selRole.roleId);
                // _uaUserRole.availableUserRoleList = newAvailRoleList;
                _uaUserRole.selectedUserRoleList.push(selRole);

                break;
            }
            case 'SL': {
                let _selectedRoleList = selectedUserRoleList;
                if (searchSelectedVal) {
                    _selectedRoleList = selectedUserRoleList.filter(item => _.toUpper(item.roleName).includes(_.toUpper(searchSelectedVal)));
                }
                let selIdx = parseInt(selectedIndex) || 0;
                selRole = _selectedRoleList[selIdx];
                let newSelRoleList = selectedUserRoleList.filter(item => item.roleId !== selRole.roleId);
                _uaUserRole.selectedUserRoleList = newSelRoleList;
                // _uaUserRole.availableUserRoleList.push(selRole);
                break;
            }
            case 'AR': {
                let _curAvailRoleList = _.cloneDeep(availableUserRoleList);
                let svcCds = [];
                uaServiceList.forEach(item => svcCds.push(item.svcCd));
                if (searchAvailableVal) {
                    _curAvailRoleList = _curAvailRoleList.filter(item => {
                        if (item.svcCd) {
                            return (svcCds.find(ele => ele === item.svcCd) && _.toUpper(item.roleName).includes(_.toUpper(searchAvailableVal)));
                        }
                        else {
                            return _.toUpper(item.roleName).includes(_.toUpper(searchAvailableVal));
                        }
                    });
                } else {
                    _curAvailRoleList = _curAvailRoleList.filter(item => {
                        if (item.svcCd) {
                            return svcCds.find(ele => ele === item.svcCd);
                        } else {
                            return true;
                        }
                    });
                }

                if (isSelectedConflictShroffRole(_curAvailRoleList)) {
                    _uaUserRole.curAvailRoleList = _curAvailRoleList.filter(x => _.toUpper(x.roleName) === GFMIS_ROLE_MAPPING.RCP_SHROFF_SUPERVISOR);
                    _uaUserRole.selectedUserRoleList = _curAvailRoleList.filter(x => _.toUpper(x.roleName) !== GFMIS_ROLE_MAPPING.RCP_SHROFF_SUPERVISOR && _.toUpper(x.roleName) !== GFMIS_ROLE_MAPPING.RCP_SHROFF_ADMIN);
                } else {
                    _uaUserRole.curAvailRoleList = [];
                    _uaUserRole.selectedUserRoleList = _curAvailRoleList;
                }
                break;
            }
            case 'AL': {
                let _selectedRoleList = _.cloneDeep(selectedUserRoleList);
                // let resetSelectedRoleList = selectedUserRoleList;
                if (searchSelectedVal) {
                    _selectedRoleList = selectedUserRoleList.filter(item => !_.toUpper(item.roleName).includes(_.toUpper(searchSelectedVal)));
                } else {
                    _selectedRoleList = [];
                }

                _uaUserRole.selectedUserRoleList = _selectedRoleList;
                // let _availRoleList = _.cloneDeep(availableUserRoleList);
                // _selectedRoleList.forEach(role => {
                //     _availRoleList.push(role);
                // });
                // _uaUserRole.availableUserRoleList = _availRoleList;
                // _selectedRoleList.forEach(role => {
                //     resetSelectedRoleList = resetSelectedRoleList.filter(reset => reset.roleId !== role.roleId);
                // });
                // _uaUserRole.selectedUserRoleList = resetSelectedRoleList;
                break;
            }
        }
        // _uaUserRole.availableUserRoleList.sort((a, b) => { return a.seq - b.seq; });
        _uaUserRole.selectedUserRoleList.sort((a, b) => { return a.seq - b.seq; });
        _uaUserRole.availableIndex = '';
        _uaUserRole.selectedIndex = '';
        updateUserRole(_uaUserRole);
    };

    const handleSearchRole = (value, target) => {
        const _uaUserRole = _.cloneDeep(uaUserRole);
        if (target === USER_ROLE_TYLE.AVAILABLE) {
            _uaUserRole.searchAvailableVal = value;
        }

        if (target === USER_ROLE_TYLE.SELECTED) {
            _uaUserRole.searchSelectedVal = value;
        }
        updateUserRole(_uaUserRole);
    };


    /**CIMST-2869 Enhancement for self-editing: UAM-ALL users NOT allow to edit */
    const isNonEdit = pageStatus === PAGE_STATUS.NONEDITABLE || isSelfEditing(loginId, userInfo.userId, pageStatus);
    // const curAvailRoleList = searchAvailableVal ? availableUserRoleList.filter(item => item.roleName.includes(searchAvailableVal) && item.svcCd === service.svcCd) : availableUserRoleList;
    // const curAvailRoleList = loadCurAvailRoleList(availableUserRoleList, searchAvailableVal);

    return (
        <Grid container alignItems="center" justify="center">
            <Grid item container className={classes.root} wrap="nowrap">
                <Grid item container style={{ width: '45%' }}>
                    <Grid container><Typography className={classes.title}>Available User Role List</Typography></Grid>
                    <Grid item container className={classes.searchContainer}>
                        <SearchInput
                            id={`${id}_availableSearch`}
                            value={searchAvailableVal}
                            InputBaseProps={{
                                placeholder: 'Search User Role',
                                onBlur: (e) => handleSearchRole(e.target.value, USER_ROLE_TYLE.AVAILABLE),
                                onKeyDown: null,
                                // upperCase: true,
                                autoComplete: 'off',
                                disabled: !isSystemAdmin && !isServiceAdmin
                            }}
                            IconButtonProps={{
                                onClick: null
                            }}
                            autoComplete={'off'}
                        />
                    </Grid>
                    <Grid item container className={classes.listContainer}>
                        <CIMSList
                            id={`${id}_availableList`}
                            data={curAvailRoleList}
                            ListItemProps={{ button: true }}
                            classes={{
                                list: classes.list,
                                listItem: classes.listItem
                            }}
                            selectedIndex={availableIndex || ''}
                            onListItemClick={(e, i) => handleListItemClick(i, USER_ROLE_TYLE.AVAILABLE)}
                            renderChild={item => <Typography style={{ width: '100%' }}>{item.roleName}</Typography>}
                            disabled={isNonEdit || (!isSystemAdmin && !isServiceAdmin)}
                        />
                    </Grid>
                </Grid>
                <MoveSideButtons
                    id={id}
                    allRightBtnProps={{
                        onClick: () => handleOnMove('AR'),
                        disabled: curAvailRoleList.length === 0 || isNonEdit || (!isSystemAdmin && !isServiceAdmin)
                    }}
                    singleRightBtnProps={{
                        onClick: () => handleOnMove('SR'),
                        disabled: curAvailRoleList.length === 0 || isNonEdit || (!isSystemAdmin && !isServiceAdmin)
                    }}
                    singleLeftBtnProps={{
                        onClick: () => handleOnMove('SL'),
                        disabled: selectedUserRoleList.length === 0 || isNonEdit || (!isSystemAdmin && !isServiceAdmin)
                    }}
                    allLeftBtnProps={{
                        onClick: () => handleOnMove('AL'),
                        disabled: selectedUserRoleList.length === 0 || isNonEdit || (!isSystemAdmin && !isServiceAdmin)
                    }}
                />
                <Grid item container style={{ width: '45%' }}>
                    <Grid container><Typography className={classes.title}>Selected User Role List</Typography></Grid>
                    <Grid item container className={classes.searchContainer}>
                        <SearchInput
                            id={`${id}_selectedSearch`}
                            value={searchSelectedVal}
                            InputBaseProps={{
                                placeholder: 'Search User Role',
                                onBlur: (e) => handleSearchRole(e.target.value, USER_ROLE_TYLE.SELECTED),
                                onKeyDown: null,
                                // upperCase: true,
                                autoComplete: 'off',
                                disabled: !isSystemAdmin && !isServiceAdmin
                            }}
                            IconButtonProps={{
                                onClick: null
                            }}
                        />
                    </Grid>
                    <Grid item container className={classes.listContainer}>
                        <CIMSList
                            id={`${id}_selectedList`}
                            data={searchSelectedVal ? selectedUserRoleList.filter(item => _.toUpper(item.roleName).includes(_.toUpper(searchSelectedVal))) : selectedUserRoleList}
                            ListItemProps={{ button: true }}
                            classes={{
                                list: classes.list,
                                listItem: classes.listItem
                            }}
                            selectedIndex={selectedIndex || ''}
                            onListItemClick={(e, i) => handleListItemClick(i, USER_ROLE_TYLE.SELECTED)}
                            renderChild={item => <Typography style={{ width: '100%' }}>{item.roleName}</Typography>}
                            disabled={isNonEdit || (!isSystemAdmin && !isServiceAdmin)}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

const styles = theme => ({
    root: {
        width: '70%',
        paddingTop: 10
    },
    title: {
        textDecorationLine: 'underline',
        fontWeight: 'bold'
    },
    listContainer: {
        border: '1px solid #ccc',
        borderRadius: 6,
        backgroundColor: theme.palette.cimsBackgroundColor,
        overflow: 'auto',
        maxHeight: 'calc(100vh * 0.65)',
        height: '100%'
    },
    list: {
        height: 'calc(100vh * 0.63)',
        width: '100%',
        overflowY: 'auto'
    },
    listItem: {
        borderTop: `1px solid ${theme.palette.grey[300]}`,
        display: 'flex',
        flexDirection: 'column'
    },
    searchContainer: {
        margin: '8px 0px'
    }
});

const mapState = state => ({
    // searchAvailableVal: state.userAccount.uaUserRole.searchAvailableVal || '',
    // searchSelectedVal: state.userAccount.uaUserRole.searchSelectedVal || '',
    // availableUserRoleList: state.userAccount.uaUserRole.availableUserRoleList,
    // selectedUserRoleList: state.userAccount.uaUserRole.selectedUserRoleList,
    uaUserRole: state.userAccount.uaUserRole,
    pageStatus: state.userAccount.pageStatus,
    ...state.userAccount.uaUserRole,
    ...state.userAccount.uaGeneral,
    isSystemAdmin: state.login.isSystemAdmin,
    isServiceAdmin: state.login.isServiceAdmin,
    isClinicalAdmin: state.login.isClinicalAdmin,
    loginId: state.login.loginInfo.loginId
});

const mapDispatch = {
    listAllUserRole,
    updateState,
    openCommonMessage
};

export default connect(mapState, mapDispatch)(withStyles(styles)(UAUserRole));