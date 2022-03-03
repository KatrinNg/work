import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    AppBar,
    Drawer,
    Divider
} from '@material-ui/core';
import {
    updateState
} from '../../../../store/actions/administration/userRole';
import AccessRightList from './urAccessRightList';
import Enum from '../../../../enums/enum';
import _ from 'lodash';
// import AccessRightEnum from '../../../../enums/accessRightEnum';
import * as CommonUtilties from '../../../../utilities/commonUtilities';
import * as siteParamsUtilities from '../../../../utilities/siteParamsUtilities';

const drawerWidth = 240;

const styles = (theme) => ({
    root: {
        width: '100%'
    },
    h6Title: {
        marginTop: 4,
        marginBottom: 4
    },
    listNav: {
        width: '100%'
    },
    accessRightGpListItem: {
        padding: '0px 16px'
    },
    accessRightGpDiv: {
        border: 'solid 1px',
        marginRight: 10
    },
    appBar: {
        position: 'relative',
        paddingLeft: theme.spacing(2),
        borderRadius: theme.spacing(1) / 2
    },
    drawerRoot: {
        float: 'left',
        width: drawerWidth
    },
    drawerPaperRoot: {
        position: 'unset'
    },
    containerRoot: {
        border: 'solid 1px'
    },
    menuAvatarRoot: {
        width: 15,
        height: 15,
        borderRadius: '5%',
        paddingRight: 5
    },
    accessRightContent: {
        marginLeft: drawerWidth,
        marginTop: 45,
        position: 'absolute'
    }
});

class URAccessRightPanel extends React.Component {
    state = {
        allMatchTypeMenuList: []
    }

    handleListItemClick = (right) => {
        const { selectedRightCd, allMenuList } = this.props.urDetail;
        let selected = selectedRightCd === right.accessRightCd ? '' : right.accessRightCd;
        let _allMenuList = _.cloneDeep(allMenuList);
        if(selected
            && selected !== Enum.ACCESS_RIGHT_RIGHT_SELECTION.PRIVILEGES_RIGHT.ACCESS_RIGHT_CODE
            && selected !== Enum.ACCESS_RIGHT_RIGHT_SELECTION.CODE_ACCESS_RIGHT.ACCESS_RIGHT_CODE
            && selected !== Enum.ACCESS_RIGHT_RIGHT_SELECTION.REPORT_RIGHT.ACCESS_RIGHT_CODE
        ){
            let index = _allMenuList.findIndex(item => item.accessRightCd === selected);
            CommonUtilties.changeAllRightsOpenStatus(_allMenuList[index], true);
        }
        this.props.updateState({
            urDetail: {
                ...this.props.urDetail,
                allMenuList: _allMenuList,
                selectedRightCd: selected
            }
        });
    }

    getSelectedMenuList = (selected, allMenuList) => {
        let newMenuList = [];
        switch (selected) {
            case Enum.ACCESS_RIGHT_RIGHT_SELECTION.PRIVILEGES_RIGHT.ACCESS_RIGHT_CODE:
                newMenuList = allMenuList.filter(item => item.accessRightType === Enum.ACCESS_RIGHT_TYPE.BUTTON);
                break;
              case Enum.ACCESS_RIGHT_RIGHT_SELECTION.CODE_ACCESS_RIGHT.ACCESS_RIGHT_CODE:
                newMenuList = allMenuList.filter(item => item.accessRightType === Enum.ACCESS_RIGHT_TYPE.CODE_ACCESS);
                break;
              case Enum.ACCESS_RIGHT_RIGHT_SELECTION.REPORT_RIGHT.ACCESS_RIGHT_CODE:
                newMenuList = allMenuList.filter(item => item.accessRightType === Enum.ACCESS_RIGHT_TYPE.REPORT);
                break;
              default:
                newMenuList = allMenuList.filter(item => item.accessRightCd === selected);
        }
        return newMenuList;
    }

    render() {
        const { classes, urDetail, disabled, svcCd, clinicConfig } = this.props;
        const allMatchTypeMenuList = urDetail.allMenuList.filter(item => item.accessRightType === Enum.ACCESS_RIGHT_TYPE.FUNCTION);
        const privilegesRight = Enum.ACCESS_RIGHT_RIGHT_SELECTION.PRIVILEGES_RIGHT.ACCESS_RIGHT_MAP;
        const codeAccessRight = Enum.ACCESS_RIGHT_RIGHT_SELECTION.CODE_ACCESS_RIGHT.ACCESS_RIGHT_MAP;
        const reportRight = Enum.ACCESS_RIGHT_RIGHT_SELECTION.REPORT_RIGHT.ACCESS_RIGHT_MAP;
        const eformRight = Enum.ACCESS_RIGHT_RIGHT_SELECTION.EFORM_RIGHT.ACCESS_RIGHT_MAP;

        const isFilterReportByRole = siteParamsUtilities.getIsFilterReportByRole(clinicConfig, svcCd);

        const totalMenuLength = allMatchTypeMenuList.length;

        const curSelectedMenu = this.getSelectedMenuList(urDetail.selectedRightCd, urDetail.allMenuList);

        let accessRightType = null;
        switch (urDetail.selectedRightCd) {
            case Enum.ACCESS_RIGHT_RIGHT_SELECTION.REPORT_RIGHT.ACCESS_RIGHT_CODE:
                accessRightType = Enum.ACCESS_RIGHT_TYPE.REPORT;
                break;
              case Enum.ACCESS_RIGHT_RIGHT_SELECTION.PRIVILEGES_RIGHT.ACCESS_RIGHT_CODE:
                accessRightType = Enum.ACCESS_RIGHT_TYPE.BUTTON;
                break;
              case Enum.ACCESS_RIGHT_RIGHT_SELECTION.CODE_ACCESS_RIGHT.ACCESS_RIGHT_CODE:
                accessRightType = Enum.ACCESS_RIGHT_TYPE.CODE_ACCESS;
                break;
              case Enum.ACCESS_RIGHT_RIGHT_SELECTION.EFORM_RIGHT.ACCESS_RIGHT_CODE:
                accessRightType = Enum.ACCESS_RIGHT_TYPE.EFORM;
                break;
              default:
                accessRightType = Enum.ACCESS_RIGHT_TYPE.FUNCTION;
        }

        return (
            <Paper className={classes.root}>
                <AppBar className={classes.appBar}>
                    <Typography variant="h6" color="inherit" noWrap>Access Control</Typography>
                </AppBar>
                <Drawer
                    open
                    variant={'permanent'}
                    classes={{
                        root: classes.drawerRoot,
                        paper: classes.drawerPaperRoot
                    }}
                >
                    <List>
                        {
                            allMatchTypeMenuList.map((right, idx) => {
                                return (
                                    <ListItem
                                        className={classes.accessRightGpListItem}
                                        id={`userRole_accessRight_panel_accessRightGroup_listItem_${idx}`}
                                        key={idx}
                                        button
                                        value={right.accessRightCd}
                                        disabled={disabled}
                                        onClick={() => { this.handleListItemClick(right); }}
                                        selected={urDetail.selectedRightCd === right.accessRightCd}
                                    >
                                        <ListItemText
                                            primary={<div dangerouslySetInnerHTML={{ __html: right.accessRightName }}></div>}
                                        />
                                    </ListItem>
                                );
                            })
                        }
                    </List>
                    <Divider />
                    <List>
                        {
                            privilegesRight.map(right => {
                                return (
                                    <ListItem
                                        className={classes.accessRightGpListItem}
                                        id={`userRole_accessRight_panel_accessRightGroup_listItem_${totalMenuLength}`}
                                        key={totalMenuLength}
                                        button
                                        value={totalMenuLength}
                                        disabled={disabled}
                                        onClick={() => { this.handleListItemClick(right); }}
                                        selected={urDetail.selectedRightCd === right.accessRightCd}
                                    >
                                        <ListItemText
                                            primary={<div dangerouslySetInnerHTML={{ __html: right.accessRightName }}></div>}
                                        />
                                    </ListItem>
                                );
                            })
                        }
                    </List>
                    <Divider />
                    <List>
                        {
                            eformRight.map(right => {
                                return (
                                    <ListItem
                                        className={classes.accessRightGpListItem}
                                        id={`userRole_accessRight_panel_accessRightGroup_listItem_${totalMenuLength + 1}`}
                                        key={totalMenuLength + 1}
                                        button
                                        value={totalMenuLength + 1}
                                        disabled={disabled}
                                        onClick={() => { this.handleListItemClick(right); }}
                                        selected={urDetail.selectedRightCd === right.accessRightCd}
                                    >
                                        <ListItemText
                                            primary={<div dangerouslySetInnerHTML={{ __html: right.accessRightName }}></div>}
                                        />
                                    </ListItem>
                                );
                            })
                        }
                    </List>
                    {isFilterReportByRole ?
                    <>
                        <Divider />
                        <List>
                            {
                                reportRight.map(right => {
                                    return (
                                        <ListItem
                                            className={classes.accessRightGpListItem}
                                            id={`userRole_accessRight_panel_accessRightGroup_listItem_${totalMenuLength + 2}`}
                                            key={totalMenuLength + 2}
                                            button
                                            value={totalMenuLength + 2}
                                            disabled={disabled}
                                            onClick={() => { this.handleListItemClick(right); }}
                                            selected={urDetail.selectedRightCd === right.accessRightCd}
                                        >
                                            <ListItemText
                                                primary={<div dangerouslySetInnerHTML={{ __html: right.accessRightName }}></div>}
                                            />
                                        </ListItem>
                                    );
                                })
                            }
                        </List>
                    </>
                    : null}
                    {svcCd === 'DTS' ?
                    <>
                        <Divider />
                        <List>
                            {
                                codeAccessRight.map(right => {
                                    return (
                                        <ListItem
                                            className={classes.accessRightGpListItem}
                                            id={`userRole_accessRight_panel_accessRightGroup_listItem_${totalMenuLength + 3}`}
                                            key={totalMenuLength + 3}
                                            button
                                            value={totalMenuLength + 3}
                                            disabled={disabled}
                                            onClick={() => { this.handleListItemClick(right); }}
                                            selected={urDetail.selectedRightCd === right.accessRightCd}
                                        >
                                            <ListItemText
                                                primary={<div dangerouslySetInnerHTML={{ __html: right.accessRightName }}></div>}
                                            />
                                        </ListItem>
                                    );
                                })
                            }
                        </List>
                    </>
                    : null}
                </Drawer>
                <Grid container className={classes.accessRightContent}>
                    <AccessRightList
                        id={'functionAccessRight'}
                        roleClass={classes}
                        disabled={disabled}
                        selectedMenu={curSelectedMenu}
                        accessRightType={accessRightType}
                    />
                </Grid>
            </Paper>
        );
    }
}

const mapState = (state) => {
    return {
        pageStatus: state.userRole.pageStatus,
        urDetail: state.userRole.urDetail,
        clinicConfig: state.common.clinicConfig,
        svcCd: state.login.service.svcCd
    };
};

const mapDispatch = {
    updateState
};

export default connect(mapState, mapDispatch)(withStyles(styles)(URAccessRightPanel));