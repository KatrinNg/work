import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { withStyles } from '@material-ui/core';
import { Grid, Typography } from '@material-ui/core';
import SearchInput from '../../../../../components/TextField/CIMSSearchInput';
import CIMSList from '../../../../../components/List/CIMSList';
import MoveSideButtons from '../../../../../components/Buttons/MoveSideButtons';
import { ENCT_STATUS_TYPE, ACTION } from '../../../../../enums/administration/roomManagement/roomManagementEnum';
import { updateState } from '../../../../../store/actions/administration/roomManagement/roomManagementActions';
import { auditAction } from '../../../../../store/actions/als/logAction';
import AlsDesc from '../../../../../constants/ALS/alsDesc';
import { isActiveEnctType } from '../../../../../utilities/enctrAndRoomUtil';

const styles = (theme) => ({
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
        maxHeight: '58vh',
        height: '100%'
    },
    list: {
        height: '56vh',
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

class EnctAssignment extends React.Component {
    getFilterList = (list, searchVal) => {
        let _list = list || [];
        if (searchVal) {
            _list = _list.filter(item => _.toUpper(item.displayStr).includes(_.toUpper(searchVal)));
        }
        return _list;
    }

    updateState = (obj) => {
        this.props.updateState(obj);
    }

    handleSearchEncounter = (value, target) => {
        if (target === ENCT_STATUS_TYPE.AVAILABLE) {
            this.updateState({ searchAvailVal: value });
        }
        if (target === ENCT_STATUS_TYPE.SELECTED) {
            this.updateState({ searchAssignedVal: value });
        }
    }

    getSortedList = (list, searchVal) => {
        const _list = this.getFilterList(list, searchVal).sort((a, b) => {
            if (a.displayStr === b.displayStr) {
                return 0;
            } else {
                return a.displayStr > b.displayStr ? 1 : -1;
            }
        });
        return _list;
    }

    handleListItemClick = (index, action) => {
        if (action === ENCT_STATUS_TYPE.SELECTED) {
            this.updateState({ assginedIdx: index });
        }
        if (action === ENCT_STATUS_TYPE.AVAILABLE) {
            this.updateState({ availIdx: index });
        }
    }

    handleOnMove = (action) => {
        let obj = {};
        const { searchAvailVal, searchAssignedVal, availList, assignedList, availIdx, assginedIdx } = this.props;
        switch (action) {
            case ACTION.SR: {
                let _availableList = this.getSortedList(_.cloneDeep(availList), searchAvailVal);
                let selected = _availableList[parseInt(availIdx) || 0];
                let newAvailList = _.cloneDeep(availList).filter(item => item.encntrTypeId !== selected.encntrTypeId);
                let newAssignedList = _.cloneDeep(assignedList || []);
                newAssignedList.push(selected);
                obj = { availList: newAvailList, assignedList: newAssignedList };
                break;
            }
            case ACTION.SL: {
                let _assignedList = this.getSortedList(_.cloneDeep(assignedList), searchAssignedVal);
                let selected = _assignedList[parseInt(assginedIdx) || 0];
                let newAssignedList = _.cloneDeep(assignedList || []).filter(item => item.encntrTypeId !== selected.encntrTypeId);
                let newAvailList = _.cloneDeep(availList);
                newAvailList.push(selected);
                let _newAvailList = newAvailList.filter(item => isActiveEnctType(item));
                obj = { assignedList: newAssignedList, availList: _newAvailList };
                break;
            }
            case ACTION.AR: {
                let _availableList = this.getSortedList(_.cloneDeep(availList), searchAvailVal);
                let resetAvailList = _.cloneDeep(availList);
                let _assignedList = _.cloneDeep(assignedList || []);
                _availableList.forEach(item => {
                    _assignedList.push(item);
                });
                _availableList.forEach(item => {
                    resetAvailList = resetAvailList.filter(reset => reset.encntrTypeId !== item.encntrTypeId);
                });
                obj = { assignedList: _assignedList, availList: resetAvailList };
                break;
            }
            case ACTION.AL: {
                let _assignedList = this.getSortedList(_.cloneDeep(assignedList || []), searchAssignedVal);
                let resetAssignedList = _.cloneDeep(assignedList || []);
                let _availableList = _.cloneDeep(availList);
                _assignedList.forEach(item => {
                    _availableList.push(item);
                });
                _assignedList.forEach(item => {
                    resetAssignedList = resetAssignedList.filter(reset => reset.encntrTypeId !== item.encntrTypeId);
                });
                let newAvailList = _availableList.filter(item => isActiveEnctType(item));
                obj = { assignedList: resetAssignedList, availList: newAvailList };
                break;
            }
        }
        obj.availIdx = '';
        obj.assginedIdx = '';
        this.updateState(obj);
    }

    render() {
        const { id, classes, searchAvailVal, searchAssignedVal, availList, assignedList, availIdx, assginedIdx } = this.props;
        return (
            <Grid container alignItems="center" justify="center">
                <Grid item container className={classes.root} wrap="nowrap">
                    <Grid item container style={{ width: '45%' }}>
                        <Grid container><Typography className={classes.title}>Available Encounter Type(s)</Typography></Grid>
                        <Grid item container className={classes.searchContainer}>
                            <SearchInput
                                id={`${id}_available_search`}
                                value={searchAvailVal}
                                InputBaseProps={{
                                    placeholder: 'Search Encounter Type',
                                    onBlur: (e) => this.handleSearchEncounter(e.target.value, ENCT_STATUS_TYPE.AVAILABLE),
                                    onKeyDown: null,
                                    autoComplete: 'off'
                                }}
                                IconButtonProps={{
                                    onClick: null
                                }}
                                autoComplete={'off'}
                            />
                        </Grid>
                        <Grid item container className={classes.listContainer}>
                            <CIMSList
                                id={`${id}_available_list`}
                                data={this.getSortedList(availList, searchAvailVal)}
                                ListItemProps={{ button: true }}
                                classes={{
                                    list: classes.list,
                                    listItem: classes.listItem
                                }}
                                selectedIndex={availIdx || ''}
                                onListItemClick={(e, i) => this.handleListItemClick(i, ENCT_STATUS_TYPE.AVAILABLE)}
                                renderChild={item => <Typography style={{ width: '100%' }}>{item.displayStr}</Typography>}
                            // disabled={isNonEdit}
                            />
                        </Grid>
                    </Grid>
                    <MoveSideButtons
                        id={id}
                        allRightBtnProps={{
                            onClick: () => {
                                this.props.auditAction(AlsDesc.AR, null, null, false, 'cmn');
                                this.handleOnMove(ACTION.AR);
                            },
                            disabled: availList.length === 0
                        }}
                        singleRightBtnProps={{
                            onClick: () => {
                                this.props.auditAction(AlsDesc.SR, null, null, false, 'cmn');
                                this.handleOnMove(ACTION.SR);
                            },
                            disabled: availList.length === 0
                        }}
                        singleLeftBtnProps={{
                            onClick: () => {
                                this.props.auditAction(AlsDesc.SL, null, null, false, 'cmn');
                                this.handleOnMove(ACTION.SL);
                            },
                            disabled: assignedList.length === 0
                        }}
                        allLeftBtnProps={{
                            onClick: () => {
                                this.props.auditAction(AlsDesc.AL, null, null, false, 'cmn');
                                this.handleOnMove(ACTION.AL);
                            },
                            disabled: assignedList.length === 0
                        }}
                    />
                    <Grid item container style={{ width: '45%' }}>
                        <Grid container><Typography className={classes.title}>Assigned Encounter Type(s)</Typography></Grid>
                        <Grid item container className={classes.searchContainer}>
                            <SearchInput
                                id={`${id}_assigned_search`}
                                value={searchAssignedVal}
                                InputBaseProps={{
                                    placeholder: 'Search Enounter Type',
                                    onBlur: (e) => this.handleSearchEncounter(e.target.value, ENCT_STATUS_TYPE.SELECTED),
                                    onKeyDown: null,
                                    autoComplete: 'off'
                                }}
                                IconButtonProps={{
                                    onClick: null
                                }}
                            />
                        </Grid>
                        <Grid item container className={classes.listContainer}>
                            <CIMSList
                                id={`${id}_assigned_list`}
                                data={this.getSortedList(assignedList, searchAssignedVal)}
                                ListItemProps={{ button: true }}
                                classes={{
                                    list: classes.list,
                                    listItem: classes.listItem
                                }}
                                selectedIndex={assginedIdx || ''}
                                onListItemClick={(e, i) => this.handleListItemClick(i, ENCT_STATUS_TYPE.SELECTED)}
                                renderChild={item => <Typography style={{ width: '100%' }}>{item.displayStr}</Typography>}
                            // disabled={isNonEdit}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

const mapState = (state) => {
    return {
        searchAvailVal: state.roomManagement.searchAvailVal,
        searchAssignedVal: state.roomManagement.searchAssignedVal,
        availList: state.roomManagement.availList,
        assignedList: state.roomManagement.assignedList,
        availIdx: state.roomManagement.availIdx,
        assginedIdx: state.roomManagement.assginedIdx
    };
};

const dispatch = {
    updateState, auditAction
};

export default connect(mapState, dispatch)(withStyles(styles)(EnctAssignment));