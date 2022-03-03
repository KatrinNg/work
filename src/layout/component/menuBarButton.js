import React, { Component } from 'react';
import {
    Avatar,
    Grid,
    Typography,
    MenuList,
    MenuItem,
    Button,
    Popper,
    Fade,
    Paper,
    IconButton
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import { withRouter } from 'react-router-dom';
import { NavigateNext } from '@material-ui/icons';
import * as CommonUtilities from '../../utilities/commonUtilities';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import {
    addTabs
    , changeTabsActive
    , deleteSubTabs
} from '../../store/actions/mainFrame/mainFrameAction';
import { updatePatientListField } from '../../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import { connect } from 'react-redux';
import accessRightEnum from '../../enums/accessRightEnum';
import * as _ from 'lodash';
import * as UserUtilities from '../../utilities/userUtilities';

const styles = theme => ({
    gridRoot: {
        marginBottom: 8,
        width: 'auto',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap'
    },
    gridRootPadding: {
        paddingRight: 10
    },
    gridRootNoPadding: {
        paddingRight: 0
    },
    avatarRoot: {
        display: 'flex',
        width: 20,
        height: 20,
        borderRadius: '5%'
    },
    menuAvatarRoot: {
        width: 15,
        height: 15,
        borderRadius: '5%',
        paddingRight: 5
    },
    paperRoot: {
        border: '1px solid #CCC',
        boxShadow: '4px 3px 5px -1px rgba(0,0,0,0.2), 5px 6px 8px 0px rgba(0,0,0,0.14), 4px 2px 14px 0px rgba(0,0,0,0.12)'
    },
    btnRoot: {
        color: theme.palette.primary.main,
        verticalAlign: 'middle',
        textTransform: 'none',
        padding: '2px 3px',
        minWidth: 0,
        borderRadius: '5px',
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.default
        }
    },
    btnSelectedRoot: {
        verticalAlign: 'middle',
        textTransform: 'none',
        padding: '2px 3px',
        minWidth: 0,
        borderRadius: '5px',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.background.default,
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.default
        }
    },
    titleRoot: {
        fontWeight: 600,
        color: 'inherit'
    },
    titleRootNormalFont: {
        fontSize: '16px'
    },
    titleRootSmallFont: {
        fontSize: '12px'
    },
    menuListRoot: {
        padding: 0
    },
    menuItemRoot: {
        minHeight: '25px',
        padding: '8px 10px',
        paddingRight: 40,
        // backgroundColor: theme.palette.background.default,
        backgroundColor:theme.palette.cimsBackgroundColor,
        color: theme.palette.primary.main,
        '&:hover': {
            padding: '8px 10px',
            paddingRight: 40,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.default
        },
        '&.Mui-disabled': {
            color: theme.palette.grey[400]
        }
    },
    menuItemFont: {
        color: 'inherit'
    },
    menuItemNormalFont: {
        fontSize: '16px'
    },
    menuItemSmallFont: {
        fontSize: '12px'
    },
    popperRoot: {
        zIndex: 1200
    },
    iconRoot: {
        color: '#B8BCB9',
        padding: 0,
        paddingRight: 5,
        right: 0,
        position: 'absolute'
    }
});

let patientCall = CommonUtilities.getPatientCall();
class MenuBarButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mainAnchor: null,
            subAnchor: {}
        };
    }

    handleOpen = (event) => {
        this.setState({ mainAnchor: event.currentTarget });
    }

    handleClose = () => {
        this.setState({ mainAnchor: null, subAnchor: {} });
    }

    //Added by Renny for close other subtabs when open encounter summary on 20200521
    // handleCloseAllSubTabs = (data) => {
    //     const { subTabs, deleteSubTabs, changeTabsActive, loginUserRoleList } = this.props;//NOSONAR
    //     let tabList = _.cloneDeep(subTabs);

    //     // Updated By Tim: Base role = CIMS-COUNTER -> Always open Patient Summary
    //     let cimsCounterRoleList = loginUserRoleList.filter(item => item.uamRoleDto.status === 'A' && item.uamRoleDto.roleName === 'CIMS-COUNTER');
    //     if (cimsCounterRoleList.length > 0) {
    //         let patientSummaryTabIndex = tabList.findIndex(item => item.name === accessRightEnum.patientSummary);
    //         if (patientSummaryTabIndex !== -1) {
    //             tabList.splice(patientSummaryTabIndex, 1);
    //         }
    //     }
    //     //End Base role = CIMS-COUNTER -> Always open Patient Summary

    //     let delFunc = (deep, name) => {
    //         if (parseInt(deep) === 2) {
    //             deleteSubTabs(name);
    //         }
    //     };
    //     CommonUtilities.closeAllTabs(tabList, delFunc, changeTabsActive).then(result => {
    //         if (result) {
    //             this.props.addTabs(data);
    //         }
    //     });
    // };
    //End added by Renny for close other subtabs when open encounter summary on 20200521

    handleOnClick = (data) => {
        const { patientInfo } = this.props;
        if (data && data.isPatRequired === 'Y' && (!patientInfo || !patientInfo.patientKey)) {
            this.props.addTabs({
                name: accessRightEnum.patientSpec,
                label: `${patientCall}-specific Function(s)`,
                disableClose: true,
                path: 'indexPatient',
                deep: 1,
                isPatRequired: 'N'
            });
            this.props.updatePatientListField({ isFocusSearchInput: true });
        } else {
            //Added by Renny for close other subtabs when open encounter summary on 20200521
            // if (data.name === accessRightEnum.encounterSummary) {
            //     const { subTabsActiveKey } = this.props;
            //     if (subTabsActiveKey === accessRightEnum.encounterSummary) return;
            //     this.handleCloseAllSubTabs(data);
            // } else {
                this.props.addTabs(data);
        //     }
        }
        //End added by Renny for close other subtabs when open encounter summary on 20200521
    }

    handleOpenChild = (event, name) => {
        let { subAnchor } = this.state;
        subAnchor[name] = event.currentTarget;
        this.setState({ subAnchor });
    }

    handleCloseChild = (e, name) => {
        let { subAnchor } = this.state;
        delete subAnchor[name];
        this.setState({ subAnchor });
    }

    isMenuItemDisabled = (menu, pucHandle) => {
        const { service } = this.props;
        if (menu.name === accessRightEnum.clientServiceView && !(service && service.svcCd === 'THS')) {
            return true;
        } else if (menu.isClinical === 'Y' && pucHandle) {
            return true;
        }
        // return false;
        return menu.disabled ? true : false;
    }

    //eslint-disable-next-line
    getMenuList = (data, parent) => {
        const { classes, name, loginInfo, pucChecking } = this.props;
        const id = 'menuBarButton' + name + 'MenuPopper';
        const pucHandle = UserUtilities.isPucHandle(loginInfo, pucChecking);
        return data.map(menu => {
            const childs = menu.child ? menu.child.length : 0;
            if (childs === 0) {
                return (
                    <MenuItem
                        disabled={this.isMenuItemDisabled(menu, pucHandle)}
                        id={id + 'MenuItem' + menu.name}
                        key={menu.name}
                        className={classes.menuItemRoot}
                        disableGutters
                        onClick={(e) => { this.handleOnClick(menu); this.handleClose(); e && e.stopPropagation ? e.stopPropagation() : window.event.cancelBubble = true; }}
                    >
                        <Typography className={[classes.menuItemFont, (this.props.width == 'xl' ? classes.menuItemNormalFont : classes.menuItemSmallFont)]}>{menu.label}</Typography>
                    </MenuItem>
                );
            }
            else {
                return (
                    <MenuItem
                        id={`${id}MenuItem${menu.name}`}
                        key={menu.name}
                        className={classes.menuItemRoot}
                        disabled={this.isMenuItemDisabled(menu, pucHandle)}
                        disableGutters
                        onMouseEnter={(e) => { this.handleOpenChild(e, menu.name); }}
                        onMouseLeave={(e) => { this.handleCloseChild(e, menu.name); }}
                    >
                        {menu.icon ? <Avatar src={`data:image/gif;base64,${menu.icon}`} className={classes.menuAvatarRoot} /> : null}
                        <Typography className={[classes.menuItemFont, (this.props.width == 'xl' ? classes.menuItemNormalFont : classes.menuItemSmallFont)]}>{menu.label}</Typography>
                        <IconButton
                            justify={'flex-end'}
                            color="primary"
                            className={classes.iconRoot}
                        >
                            <NavigateNext />
                        </IconButton>
                        <Popper
                            open={this.state.subAnchor[menu.name] !== undefined}
                            anchorEl={this.state.subAnchor[menu.name]}
                            placement="right-start"
                            transition
                            className={classes.popperRoot}
                            modifiers={{
                                offset: {
                                    offset: '-1px'
                                }
                            }}
                        >
                            {
                                ({ TransitionProps }) => (
                                    <Fade {...TransitionProps} timeout={{ enter: 350, exit: 0 }}>
                                        <Paper className={classes.paperRoot}>
                                            <MenuList className={classes.menuListRoot}>
                                                {this.getMenuList(menu.child, menu)}
                                            </MenuList>
                                        </Paper>
                                    </Fade>)}
                        </Popper>
                    </MenuItem>
                );
            }
        });
    }

    render() {
        const { classes, icon, name, label, selected, childMenu, menuData } = this.props;
        const id = 'menuBarButton' + name + 'MenuPopper';
        return (
            <Grid id={'menuBarButton' + name} container alignItems="center" justify="center" className={[classes.gridRoot, (this.props.width == 'xl' ? classes.gridRootPadding : classes.gridRootNoPadding)]}>
                {icon ? <Avatar src={`data:image/gif;base64,${icon}`} className={classes.avatarRoot} /> : null}
                {childMenu && childMenu.length > 0 ?
                    <Button
                        disableFocusRipple
                        aria-describedby={id}
                        classes={{
                            root: selected ? classes.btnSelectedRoot : classes.btnRoot
                        }}
                        disabled={menuData.disabled}
                        onMouseEnter={this.handleOpen}
                        onMouseLeave={this.handleClose}
                        id={'menuBarButton' + name + 'button'}
                        tabIndex={-1}
                    >
                        <Typography variant="subtitle1" className={[classes.titleRoot, (this.props.width == 'xl' ? classes.titleRootNormalFont : classes.titleRootSmallFont )]}>{label}</Typography>
                        <Popper
                            id={id}
                            open={this.state.mainAnchor !== null}
                            anchorEl={this.state.mainAnchor}
                            placement="bottom-start"
                            transition
                            className={classes.popperRoot}
                        >
                            {
                                ({ TransitionProps }) => (
                                    <Fade {...TransitionProps} timeout={{ enter: 350, exit: 0 }}>
                                        <Paper className={classes.paperRoot}>
                                            <MenuList className={classes.menuListRoot}>
                                                {this.getMenuList(childMenu, null)}
                                            </MenuList>
                                        </Paper>
                                    </Fade>
                                )
                            }
                        </Popper>
                    </Button>
                    :
                    <Button
                        aria-describedby={id}
                        classes={{
                            root: selected ? classes.btnSelectedRoot : classes.btnRoot
                        }}
                        onClick={() => { this.handleOnClick(menuData); }}
                        id={'menuBarButton' + name + 'button'}
                        tabIndex={-1}
                        disabled={menuData.disabled}
                    >
                        <Typography variant="subtitle1" className={[classes.titleRoot, (this.props.width == 'xl' ? classes.titleRootNormalFont : classes.titleRootSmallFont )]}>{label}</Typography>
                    </Button>
                }
            </Grid>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        tabs: state.mainFrame.tabs,
        patientInfo: state.patient.patientInfo,
        subTabs: state.mainFrame.subTabs,
        subTabsActiveKey: state.mainFrame.subTabsActiveKey,
        loginUserRoleList: state.common.loginUserRoleList,
        service: state.login.service,
        loginInfo: state.login.loginInfo,
        pucChecking: state.patient.pucChecking
    };
};

const dispatchToProps = {
    openCommonMessage,
    updatePatientListField,
    addTabs,
    deleteSubTabs,
    changeTabsActive
};

export default withRouter(connect(mapStateToProps, dispatchToProps)(withWidth()(withStyles(styles)(MenuBarButton))));
