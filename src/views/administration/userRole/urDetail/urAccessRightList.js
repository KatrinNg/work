import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import List from '@material-ui/core/List';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import {
    Typography,
    FormControlLabel,
    IconButton
} from '@material-ui/core';
import CIMSCheckBox from '../../../../components/CheckBox/CIMSCheckBox';
import * as CommonUtilities from '../../../../utilities/commonUtilities';
import Enum from '../../../../enums/enum';
import { openMenu, selectAccessRight } from '../../../../store/actions/administration/userRole';

const CustomList = withStyles({
    root: {
        padding: 0,
        margin: 0,
        height: 0
    }
})(List);

function addAccesRight(accessRights, value) {
    let list = [];
    list = list.concat(accessRights, value);
    return list;
}
function deleteAccessright(index, accessRights, cur) {
    let list = [];
    if (index === 0) {
        list = list.concat(accessRights.slice(1));
    } else if (index === accessRights.length - 1) {
        list = list.concat(accessRights.slice(0, -1));
    } else if (index > 0) {
        list = list.concat(
            accessRights.slice(0, index),
            accessRights.slice(index + 1)
        );
    } else {
        list = accessRights;
    }
    return list;
}

function findAllCheckedChild(accessRights, right, count, isRoot) {
    const childs = right.childCodAccessRightDtos ? right.childCodAccessRightDtos.length : 0;
    let result = accessRights.find(item => item.accessRightCd === right.accessRightCd);
    let totalChecked = count;

    if (result && !isRoot) {
        totalChecked++;
    }
    if (childs === 0) {

        return totalChecked;
    }
    else {
        right.childCodAccessRightDtos.forEach(child => {
            totalChecked = findAllCheckedChild(accessRights, child, totalChecked, false);
        });
    }


    return totalChecked;
}

function updateAllParent(menuList, curChild, state, accessRightList) {
    let parentGroup = CommonUtilities.groupAllParent(menuList, { 'all': menuList });

    let curParentSpli = curChild.itemHeader.split('^');
    let curChildName = curChild.accessRightName;
    let newAccessRights = accessRightList;
    curParentSpli = [].concat(['all'], curParentSpli);
    for (let i = curParentSpli.length; i > 0; i--) {
        let parentName = curParentSpli[i - 1];
        parentGroup[parentName] && parentGroup[parentName].forEach(parent => {
            let index = newAccessRights.findIndex(item => item.accessRightCd === parent.accessRightCd);

            if (parent.accessRightName === curChildName || curChildName === 'all') {
                let checkedChild = findAllCheckedChild(newAccessRights, parent, 0, true);
                if (state) {

                    if (index === -1 && parent.accessRightCd != curChild.accessRightCd) {
                        newAccessRights = addAccesRight(newAccessRights, { accessRightCd: parent.accessRightCd });
                    }
                }
                else {
                    if (checkedChild < 1) {
                        newAccessRights = deleteAccessright(index, newAccessRights);
                    }
                }
            }


        });
        curChildName = parentName !== 'all' ? parentName : curChildName;
    }
    return newAccessRights;
}

function updateAllChildren(curMenu, accessRightList, state) {
    if (curMenu.childCodAccessRightDtos.length === 0) {
        return;
    }
    let childGroup = CommonUtilities.groupAllChild(curMenu.childCodAccessRightDtos, []);
    let newAccessRights = accessRightList;
    childGroup.forEach(child => {
        if (child.accessRightCd === curMenu.accessRightCd) {
            return;
        }
        let index = newAccessRights.findIndex(item => item.accessRightCd === child.accessRightCd);
        if (state) {
            if (index === -1) {
                newAccessRights = addAccesRight(newAccessRights, { accessRightCd: child.accessRightCd });
            }
        }
        else {
            newAccessRights = deleteAccessright(index, newAccessRights);
        }
    });
    return newAccessRights;
}

const style = {
    checkPadding: {
        margin: 0,
        padding: 4
    },
    checkLabelMagin: {
        margin: 0
    },
    childStyle: {
        padding: '0 0 0 30px',
        margin: 0
    }
};

class URAccessRightList extends React.Component {

    updatParentState = (list, cd, cdName, state) => {
        parent.checked = state;

        let res = list.find(item => item[cdName] === cd);
        if (res !== undefined) {
            return;
        }
        else {
            list.forEach(right => {
                if (right.childCodAccessRightDtos.length !== 0) {
                    this.updatParentState(list, cd, cdName, state);
                }
            });
        }
    }

    handleSelectAccessRight = (e, checked, curMenu, parentCd, type, parent, child, accessRightType) => {
        const { selectedMenu, accessRights } = this.props;
        let newAccessRights = accessRights;

        let index;

        index = newAccessRights.findIndex(item => item.accessRightCd === curMenu.accessRightCd);

        if (checked) {
            newAccessRights = addAccesRight(newAccessRights, { accessRightCd: curMenu.accessRightCd });
        }
        else {
            newAccessRights = deleteAccessright(index, newAccessRights);
        }
        if (accessRightType !== Enum.ACCESS_RIGHT_TYPE.BUTTON && accessRightType !== Enum.ACCESS_RIGHT_TYPE.REPORT) {
            if (parent !== null) {
                newAccessRights = updateAllParent(selectedMenu, curMenu, checked, newAccessRights);
            }
            newAccessRights = updateAllParent(selectedMenu, curMenu, checked, newAccessRights);
            if (curMenu.childCodAccessRightDtos.length !== 0) {
                newAccessRights = updateAllChildren(curMenu, newAccessRights, checked);
            }
        }
        this.props.selectAccessRight(newAccessRights);
    }

    findIndeterminateCheckBox = (right, accessRights) => {
        let isParent = false;
        let checkedChildCount = findAllCheckedChild(accessRights, right, 0, true);
        let tempChildGp = CommonUtilities.groupAllChild(right.childCodAccessRightDtos, []);

        if (right.childCodAccessRightDtos && right.childCodAccessRightDtos.length > 0) {
            isParent = true;
        }

        return isParent && checkedChildCount > 0 && checkedChildCount < tempChildGp.length;
    }


    accessRightTree = (data, parent) => {
        const { classes, openMenu, accessRights, accessRightType, disabled, id } = this.props;
        if (!data) {
            return null;
        }

        return data.map(right => {
            if (right.accessRightType !== accessRightType) {
                return;
            }
            const childs = right.childCodAccessRightDtos ? right.childCodAccessRightDtos.length : 0;
            const type = parent === null ? 'parent' : 'child';
            if (childs === 0) {
                return (
                    <Collapse
                        key={right.accessRightCd}
                        in
                        timeout="auto"
                        className={parent ? classes.childStyle : null}
                        unmountOnExit
                        style={{
                            display: parent ? (parent.open ? 'block' : 'none') : 'block',
                            flex: 1
                        }}
                    >
                        <FormControlLabel
                            key={right.accessRightCd}
                            control={
                                <CIMSCheckBox
                                    value={right.accessRightCd}
                                    name={right.accessRightName}
                                    id={id + 'label_' + right.accessRightCd}
                                    disabled={disabled}
                                    className={classes.checkPadding}
                                    onChange={(...arg) => this.handleSelectAccessRight(...arg, right, parent !== null ? parent.accessRightCd : null, type, parent, null, accessRightType)}
                                    ref={`${right.accessRightCd}`}
                                />
                            }
                            className={classes.checkLabelMagin}
                            checked={accessRights.findIndex(arItem => arItem.accessRightCd === right.accessRightCd) > -1}
                            label={<Typography variant="subtitle1">{right.accessRightName}</Typography>}
                        />
                    </Collapse >
                );
            }
            else {
                return (
                    <Typography
                        component={'div'}
                        key={right.accessRightCd}
                        className={parent ? classes.childStyle : null}
                        style={{
                            display: parent ? (parent.open ? 'block' : 'none') : 'block',
                            position: 'relative',
                            flex: 1
                        }}
                    >
                        <FormControlLabel
                            control={
                                <CIMSCheckBox
                                    value={right.accessRightCd}
                                    name={right.accessRightName}
                                    disabled={disabled}
                                    className={classes.checkPadding}
                                    onChange={(...arg) => this.handleSelectAccessRight(...arg, right, right.accessRightCd, type, parent, right.childCodAccessRightDtos, accessRightType)}
                                    id={id + 'label_' + right.accessRightCd}
                                    ref={`${right.accessRightCd}`}
                                    indeterminate={this.findIndeterminateCheckBox(right, accessRights)}
                                />
                            }
                            className={classes.checkLabelMagin}
                            checked={accessRights.findIndex(arItem => arItem.accessRightCd === right.accessRightCd) > -1}
                            label={<Typography variant="subtitle1">{right.accessRightName}</Typography>}
                        />
                        {
                            childs > 0 ?
                                <IconButton
                                    onClick={() => openMenu(right.accessRightCd)}
                                    style={{ position: 'absolute', right: 5, padding: 0 }}
                                >
                                    {right.open ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                                : null
                        }
                        {
                            this.accessRightTree(right.childCodAccessRightDtos, right)
                        }
                    </Typography>
                );

            }
        });
    }

    render() {
        const { selectedMenu, id } = this.props;

        return (
            <CustomList
                id={id + 'allMenu'}
                style={{ padding: 0, margin: 0, height: '70vh', width: '36vw', overflow: 'auto' }}
                component="nav"
                aria-labelledby="nested-list-subheader"
            >

                {
                    this.accessRightTree(selectedMenu, null)
                }
            </CustomList>
        );
    }
}

const mapState = (state) => {
    return {
        accessRights: state.userRole.urDetail.accessRights
    };
};

const mapDispatch = {
    openMenu,
    selectAccessRight
};

export default connect(mapState, mapDispatch)(withStyles(style)(URAccessRightList));