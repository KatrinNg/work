import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import _ from 'lodash';
import {
    Grid,
    Paper,
    Typography,
    IconButton,
    SvgIcon
} from '@material-ui/core';
import DoubleArrowRight from '../../../../images/double_arrow_right.svg';
import { KeyboardArrowRight, KeyboardArrowLeft } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import SearchInput from '../../../../components/TextField/CIMSSearchInput';
import CIMSList from '../../../../components/List/CIMSList';
import { updateState } from '../../../../store/actions/administration/userRole';
import { isSelf } from '../utils';

const styles = theme => ({
    h6Title: {
        marginTop: 4,
        marginBottom: 4,
        fontWeight: 'bold',
        color: theme.palette.primaryColor
    },
    root: {
        width: '100%'
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
        maxHeight: '44vh',
        height: '100%'
    },
    list: {
        height: '42vh',
        width: '100%',
        overflow: 'overlay'
    },
    listItem: {
        borderTop: `1px solid ${theme.palette.grey[300]}`,
        display: 'flex',
        flexDirection: 'column'
    },
    buttonContainer: {
        width: 'min-content',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    button: {
        margin: theme.spacing(2),
        textTransform: 'none'
    },
    searchContainer: {
        margin: '8px 0px'
    }
});

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

const isSelectedSelf = memoize((loginId, list, searchVal, index) => {
    if (!_.toString(index)) return false;
    let _list = getSortedList(_.cloneDeep(list), searchVal);
    let selected = _list[parseInt(index)];
    return isSelf(loginId, selected && selected.userId);
});

class URMember extends React.Component {
    onChange = (obj) => {
        const { urMember } = this.props;
        this.props.updateState({
            urMember: {
                ...urMember,
                ...obj
            }
        });
    };

    handleListItemClick = (index, action) => {
        const {
            availableList,
            searchAvailableVal,
            selectedList,
            searchSelectedVal,
            loginId
        } = this.props;
        if (action === ROOM_TYPE.SELECTED) {
            if (isSelectedSelf(loginId, selectedList, searchSelectedVal, index)) {
                return;
            }
            this.onChange({ selectedIndex: index });
        }
        if (action === ROOM_TYPE.AVAILABLE) {
            if (isSelectedSelf(loginId, availableList, searchAvailableVal, index)) {
                return;
            }
            this.onChange({ availableIndex: index });
        }
    };

    handleOnMove = (action) => {
        const {
            searchAvailableVal,
            searchSelectedVal,
            availableList,
            selectedList,
            availableIndex,
            selectedIndex,
            loginId
        } = this.props;
        let obj = {};
        switch (action) {
            case ACTION.SR: {
                let _availableList = getSortedList(_.cloneDeep(availableList), searchAvailableVal);
                let selected = _availableList[parseInt(availableIndex)];
                let newAvailList = _.cloneDeep(availableList).filter(item => item.userId !== selected.userId);
                let newSelectedList = _.cloneDeep(selectedList);
                newSelectedList.push(selected);
                obj = { availableList: newAvailList, selectedList: newSelectedList };
                break;
            }
            case ACTION.SL: {
                let _selectedList = getSortedList(_.cloneDeep(selectedList), searchSelectedVal);
                let selected = _selectedList[parseInt(selectedIndex)];
                let newSelectedList = _.cloneDeep(selectedList).filter(item => item.userId !== selected.userId);
                let newAvailList = _.cloneDeep(availableList);
                newAvailList.push(selected);
                obj = { selectedList: newSelectedList, availableList: newAvailList };
                break;
            }
            case ACTION.AR: {
                let _availableList = (getSortedList(_.cloneDeep(availableList), searchAvailableVal) || []).filter(item => !isSelf(loginId, item.userId));
                let resetAvailList = _.cloneDeep(availableList);
                let _selectedList = _.cloneDeep(selectedList);
                _availableList.forEach(item => {
                    _selectedList.push(item);
                });
                _availableList.forEach(item => {
                    resetAvailList = resetAvailList.filter(reset => reset.userId !== item.userId);
                });
                obj = { selectedList: _selectedList, availableList: resetAvailList };
                break;
            }
            case ACTION.AL: {
                let _selectedList = (getSortedList(_.cloneDeep(selectedList), searchSelectedVal) || []).filter(item => !isSelf(loginId, item.userId));
                let resetSelectedList = _.cloneDeep(selectedList);
                let _availableList = _.cloneDeep(availableList);
                _selectedList.forEach(item => {
                    _availableList.push(item);
                });
                _selectedList.forEach(item => {
                    resetSelectedList = resetSelectedList.filter(reset => reset.userId !== item.userId);
                });
                obj = { selectedList: resetSelectedList, availableList: _availableList };
                break;
            }
        }
        obj.availableIndex = '';
        obj.selectedIndex = '';
        this.onChange(obj);
    };

    handleChangeSearch = (value, target) => {
        if (target === ROOM_TYPE.AVAILABLE) {
            this.onChange({ searchAvailableVal: value });
        }
        if (target === ROOM_TYPE.SELECTED) {
            this.onChange({ searchSelectedVal: value });
        }
    };

    render() {
        const {
            classes,
            id,
            theme,
            disabled,
            searchAvailableVal,
            searchSelectedVal,
            availableList,
            selectedList,
            availableIndex,
            selectedIndex
        } = this.props;
        return (
            <Paper className={classes.root}>
                <Grid container style={{ padding: theme.spacing(1) }}>
                    <Grid item container>
                        <Typography variant="h6" className={classes.h6Title}>User Role Member</Typography>
                    </Grid>
                    <Grid item container alignItems="center">
                        <Grid item container wrap="nowrap" justify="space-between">
                            <Grid item container style={{ width: '45%' }}>
                                <Grid container><Typography className={classes.title}>Available User List</Typography></Grid>
                                <Grid item container className={classes.searchContainer}>
                                    <SearchInput
                                        id={`${id}_availableSearch`}
                                        value={searchAvailableVal}
                                        InputBaseProps={{
                                            placeholder: 'Search User',
                                            onBlur: (e) => this.handleChangeSearch(e.target.value, ROOM_TYPE.AVAILABLE),
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
                                        onListItemClick={(e, i) => this.handleListItemClick(i, ROOM_TYPE.AVAILABLE)}
                                        renderChild={item => <Typography style={{ width: '100%' }}>{item.displayStr}</Typography>}
                                        disabled={disabled}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item className={classes.buttonContainer}>
                                <IconButton
                                    id={`${id}_moveAllRight`}
                                    color="primary"
                                    className={classes.button}
                                    onClick={() => this.handleOnMove(ACTION.AR)}
                                    disabled={availableList.length === 0 || disabled}
                                >
                                    <SvgIcon component={DoubleArrowRight} children={<></>} />
                                </IconButton>
                                <IconButton
                                    id={`${id}_moveSingleRight`}
                                    color="primary"
                                    className={classes.button}
                                    onClick={() => this.handleOnMove(ACTION.SR)}
                                    disabled={availableList.length === 0 || !_.toString(availableIndex) || disabled}
                                >
                                    <KeyboardArrowRight />
                                </IconButton>
                                <IconButton
                                    id={`${id}_moveSingleLeft`}
                                    color="primary"
                                    className={classes.button}
                                    onClick={() => this.handleOnMove(ACTION.SL)}
                                    disabled={selectedList.length === 0 || !_.toString(selectedIndex) || disabled}
                                >
                                    <KeyboardArrowLeft />
                                </IconButton>
                                <IconButton
                                    id={`${id}_moveAllLeft`}
                                    color="primary"
                                    className={classes.button}
                                    onClick={() => this.handleOnMove(ACTION.AL)}
                                    disabled={selectedList.length === 0 || disabled}
                                >
                                    <SvgIcon component={DoubleArrowRight} children={<></>} style={{ transform: 'rotate(180deg)' }} />
                                </IconButton>
                            </Grid>
                            <Grid item container style={{ width: '45%' }}>
                                <Grid container><Typography className={classes.title}>Selected User List</Typography></Grid>
                                <Grid item container className={classes.searchContainer}>
                                    <SearchInput
                                        id={`${id}_selectedSearch`}
                                        value={searchSelectedVal}
                                        InputBaseProps={{
                                            placeholder: 'Search User',
                                            onBlur: (e) => this.handleChangeSearch(e.target.value, ROOM_TYPE.SELECTED),
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
                                        onListItemClick={(e, i) => this.handleListItemClick(i, ROOM_TYPE.SELECTED)}
                                        renderChild={item => <Typography style={{ width: '100%' }}>{item.displayStr}</Typography>}
                                        disabled={disabled}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        );
    }
}

const mapState = state => ({
    urMember: state.userRole.urMember,
    searchAvailableVal: state.userRole.urMember.searchAvailableVal,
    searchSelectedVal: state.userRole.urMember.searchSelectedVal,
    availableList: state.userRole.urMember.availableList,
    selectedList: state.userRole.urMember.selectedList,
    availableIndex: state.userRole.urMember.availableIndex,
    selectedIndex: state.userRole.urMember.selectedIndex,
    loginId: state.login.loginInfo.loginId
});

const mapDispatch = {
    updateState
};

export default connect(mapState, mapDispatch)(withStyles(styles, { withTheme: true })(URMember));