import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/styles/withStyles';
import SearchInput from '../../../../components/TextField/CIMSSearchInput';
import CIMSList from '../../../../components/List/CIMSList';
import _ from 'lodash';
import { PAGE_STATUS } from '../../../../enums/administration/enctManagement';
import { updateState, initRooms } from '../../../../store/actions/administration/enctManagement';
import MoveSideButtons from '../../../../components/Buttons/MoveSideButtons';
import {isActiveRoom} from '../../../../utilities/enctrAndRoomUtil';

const ROOM_TYPE = {
    AVAILABLE: 'AVAILABLE',
    SELECTED: 'SELECTED'
};
const ACTION = {
    AR: 'ALL_RIGHT',
    SR: 'SINGLE_RIGHT',
    SL: 'SINGLE_LEFT',
    AL: 'ALL_LEFT'
};

const getFilterList = (list, searchVal) => {
    let _list = list || [];
    if (searchVal) {
        _list = _list.filter(item => _.toUpper(item.displayStr).includes(_.toUpper(searchVal)));
    }
    return _list;
};

const getSortedList = memoize((list, searchVal) => {
    const _list = getFilterList(list, searchVal).sort((a, b) => {
        if (a.displayStr === b.displayStr) {
            return 0;
        } else {
            return a.displayStr > b.displayStr ? 1 : -1;
        }
    });
    return _list;
});

const id = 'enctRoom';
const EnctRoom = (props) => {
    const {
        classes,
        enctDetailRoom,
        pageStatus,
        changingInfo
    } = props;

    const {
        searchAvailableVal,
        searchSelectedVal,
        availableList,
        selectedList,
        availableIndex,
        selectedIndex
    } = enctDetailRoom;

    const onChange = (obj) => {
        props.updateState({
            enctDetailRoom: {
                ...enctDetailRoom,
                ...obj
            }
        });
    };

    React.useEffect(() => {
        props.initRooms();
    }, [changingInfo.siteId]);

    const handleListItemClick = (index, action) => {
        if (action === ROOM_TYPE.SELECTED) {
            onChange({ selectedIndex: index });
        }
        if (action === ROOM_TYPE.AVAILABLE) {
            onChange({ availableIndex: index });
        }
    };

    const handleOnMove = (action) => {
        let obj = {};
        switch (action) {
            case ACTION.SR: {
                let _availableList = getSortedList(_.cloneDeep(availableList), searchAvailableVal);
                let selected = _availableList[parseInt(availableIndex) || 0];
                let newAvailList = _.cloneDeep(availableList).filter(item => item.rmId !== selected.rmId);
                let newSelectedList = _.cloneDeep(selectedList);
                newSelectedList.push(selected);
                obj = { availableList: newAvailList, selectedList: newSelectedList };
                break;
            }
            case ACTION.SL: {
                let _selectedList = getSortedList(_.cloneDeep(selectedList), searchSelectedVal);
                let selected = _selectedList[parseInt(selectedIndex) || 0];
                let newSelectedList = _.cloneDeep(selectedList).filter(item => item.rmId !== selected.rmId);
                let newAvailList = _.cloneDeep(availableList);
                newAvailList.push(selected);
                let _newAvailList=newAvailList.filter(x=>isActiveRoom(x));
                obj = { selectedList: newSelectedList, availableList: _newAvailList };
                break;
            }
            case ACTION.AR: {
                let _availableList = getSortedList(_.cloneDeep(availableList), searchAvailableVal);
                let resetAvailList = _.cloneDeep(availableList);
                let _selectedList = _.cloneDeep(selectedList);
                _availableList.forEach(item => {
                    _selectedList.push(item);
                });
                _availableList.forEach(item => {
                    resetAvailList = resetAvailList.filter(reset => reset.rmId !== item.rmId);
                });
                obj = { selectedList: _selectedList, availableList: resetAvailList };
                break;
            }
            case ACTION.AL: {
                let _selectedList = getSortedList(_.cloneDeep(selectedList), searchSelectedVal);
                let resetSelectedList = _.cloneDeep(selectedList);
                let _availableList = _.cloneDeep(availableList);
                _selectedList.forEach(item => {
                    _availableList.push(item);
                });
                _selectedList.forEach(item => {
                    resetSelectedList = resetSelectedList.filter(reset => reset.rmId !== item.rmId);
                });
                let newAvailList=_availableList.filter(x=>isActiveRoom(x));
                obj = { selectedList: resetSelectedList, availableList: newAvailList };
                break;
            }
        }
        obj.availableIndex = '';
        obj.selectedIndex = '';
        onChange(obj);
    };

    const handleSearchRole = (value, target) => {
        if (target === ROOM_TYPE.AVAILABLE) {
            onChange({ searchAvailableVal: value });
        }
        if (target === ROOM_TYPE.SELECTED) {
            onChange({ searchSelectedVal: value });
        }
    };

    const isNonEdit = pageStatus === PAGE_STATUS.NONEDITABLE;

    return (
        <Grid container alignItems="center" justify="center">
            <Grid item container className={classes.root} wrap="nowrap">
                <Grid item container style={{ width: '45%' }}>
                    <Grid container><Typography className={classes.title}>Available Room(s)</Typography></Grid>
                    <Grid item container className={classes.searchContainer}>
                        <SearchInput
                            id={`${id}_availableSearch`}
                            value={searchAvailableVal}
                            InputBaseProps={{
                                placeholder: 'Search Room',
                                onBlur: (e) => handleSearchRole(e.target.value, ROOM_TYPE.AVAILABLE),
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
                            id={`${id}_availableList`}
                            data={getSortedList(availableList, searchAvailableVal)}
                            ListItemProps={{ button: true }}
                            classes={{
                                list: classes.list,
                                listItem: classes.listItem
                            }}
                            selectedIndex={availableIndex || ''}
                            onListItemClick={(e, i) => handleListItemClick(i, ROOM_TYPE.AVAILABLE)}
                            renderChild={item => <Typography style={{ width: '100%' }}>{item.displayStr}</Typography>}
                            disabled={isNonEdit}
                        />
                    </Grid>
                </Grid>
                <MoveSideButtons
                    id={id}
                    allRightBtnProps={{
                        onClick: () => handleOnMove(ACTION.AR),
                        disabled: availableList.length === 0 || isNonEdit
                    }}
                    singleRightBtnProps={{
                        onClick: () => handleOnMove(ACTION.SR),
                        disabled: availableList.length === 0 || isNonEdit
                    }}
                    singleLeftBtnProps={{
                        onClick: () => handleOnMove(ACTION.SL),
                        disabled: selectedList.length === 0 || isNonEdit
                    }}
                    allLeftBtnProps={{
                        onClick: () => handleOnMove(ACTION.AL),
                        disabled: selectedList.length === 0 || isNonEdit
                    }}
                />
                <Grid item container style={{ width: '45%' }}>
                    <Grid container><Typography className={classes.title}>Assigned Room(s)</Typography></Grid>
                    <Grid item container className={classes.searchContainer}>
                        <SearchInput
                            id={`${id}_selectedSearch`}
                            value={searchSelectedVal}
                            InputBaseProps={{
                                placeholder: 'Search Room',
                                onBlur: (e) => handleSearchRole(e.target.value, ROOM_TYPE.SELECTED),
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
                            id={`${id}_selectedList`}
                            data={getSortedList(selectedList, searchSelectedVal)}
                            ListItemProps={{ button: true }}
                            classes={{
                                list: classes.list,
                                listItem: classes.listItem
                            }}
                            selectedIndex={selectedIndex || ''}
                            onListItemClick={(e, i) => handleListItemClick(i, ROOM_TYPE.SELECTED)}
                            renderChild={item => <Typography style={{ width: '100%' }}>{item.displayStr}</Typography>}
                            disabled={isNonEdit}
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
        backgroundColor: theme.palette.background.cimsBackgroundColor,
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

const mapState = state => ({
    changingInfo: state.enctManagement.enctDetailGeneral.changingInfo,
    enctDetailRoom: state.enctManagement.enctDetailRoom,
    pageStatus: state.enctManagement.pageStatus
});

const mapDispatch = {
    updateState,
    initRooms
};

export default connect(mapState, mapDispatch)(withStyles(styles)(EnctRoom));