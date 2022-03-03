import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Switch, InputAdornment } from '@material-ui/core';
import CommonSelect from 'components/CommonSelect/CommonSelect';
import ColorButton from 'components/ColorButton/ColorButton';
import searchIcon from 'resource/Icon/adminMode/search.svg';
import CustomTextField from 'components/Input/CustomTextField';
import * as _ from 'lodash';
import useStyles from './styles';
import SearchSelectList from 'components/SearchSelectList/SearchSelectList';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import CommonPagination from 'components/CommonPagination/CommonPagination';
import { useSelector, useDispatch } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';

export default function ActivityDetail(props) {
    const { data, handleSwitchPage, roomId } = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const roomTreatmentList = useSelector((state) => state.adminmode.activityListByRoom);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [rows, setRows] = useState([]);
    const [storeData, setStoreData] = useState([]);
    const [inputValue, setInputValue] = useState();
    const [selectValue, setSelectValue] = useState();
    const indexOfLastPost = currentPage * pageSize;
    const indexOfFirstPost = indexOfLastPost - pageSize;
    const currentPosts = rows?.slice(indexOfFirstPost, indexOfLastPost);
    const categoryList = useSelector((state) => state.adminmode.categoryList);
    const [isChange, setIsChange] = useState(false);

    function handleSwitchChange(e, category, name, doc) {
        if (!isChange) setIsChange(true);
        const rowIndex = _.findIndex(rows, function (obj) {
            return obj.treatment_category === category && obj.treatment_name === name && obj.treatment_doc === doc;
        });
        const storeDataIndex = _.findIndex(storeData, function (obj) {
            return obj.treatment_category === category && obj.treatment_name === name && obj.treatment_doc === doc;
        });
        const status = e.target.checked ? 'ACTIVE' : 'INACTIVE';
        rows[rowIndex].status = status;
        setRows([...rows]);
        storeData[storeDataIndex].status = status;
        setStoreData([...storeData]);
    }

    function handleSearch(category, activity,cancel) {
        if (!category && !activity) {
            setRows(_.cloneDeep(storeData));
            setCurrentPage(1);
            return;
        }
        let newStoreData = cancel?_.cloneDeep(roomTreatmentList):_.cloneDeep(storeData);
        if (!category)
            newStoreData = newStoreData.filter((item) => {
                return item['treatment_name'].toLowerCase().includes(activity.toLowerCase());
            });
        else if (!activity)
            newStoreData = newStoreData.filter((item) => {
                return item['treatment_category'].toLowerCase().includes(category.toLowerCase());
            });
        else
            newStoreData = newStoreData
                .filter((item) => {
                    return item['treatment_category'].toLowerCase().includes(category.toLowerCase());
                })
                .filter((item) => {
                    return item['treatment_name'].toLowerCase().includes(activity.toLowerCase());
                });
        setRows(newStoreData);
        if(!cancel)
        setCurrentPage(1);
    }

    function handleSelect(value, obj) {
        setSelectValue(value);
        handleSearch(value, inputValue);
    }

    function handleSearchTextFieldChange(e) {
        setInputValue(e.target.value);
        handleSearch(selectValue, e.target.value);
    }

    function getCurrentPage(newCurrentPage) {
        setCurrentPage(newCurrentPage);
    }

    function handleCancel() {
        let newData = _.cloneDeep(roomTreatmentList);
        setStoreData(newData);
        setRows(newData);
        if(selectValue||inputValue)
        handleSearch(selectValue, inputValue,true);
        setIsChange(false);
    }

    function handleSave() {
        const changeItem = [];
        const newData = _.cloneDeep(roomTreatmentList);
        newData.forEach((item) => {
            storeData.forEach((item2) => {
                if (
                    item['treatment_name'] === item2['treatment_name'] &&
                    item['treatment_category'] === item2['treatment_category'] &&
                    item['treatment_doc'] === item2['treatment_doc']
                ) {
                    if (item.status !== item2.status) {
                        changeItem.push(item);
                        item.status = item2.status;
                    }
                }
            });
        });
        const room_treatment = changeItem.map((item) => item = { ...item, room_id: data.room_id })
        dispatch({
            type: ActionTypes.UPDATE_ACTIVITY_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'OT',
                room_id: data.room_id,
                room_treatment: room_treatment,
                callback: (data) => {
                    if (data?.status === 'SUCCESS') {
                        setIsChange(false);
                    }
                    dispatch({
                        type: ActionTypes.MESSAGE_OPEN_MSG,
                        payload: {
                            open: true,
                            messageInfo: {
                                message: data.status === 'SUCCESS' ? 'Save successfully' : 'Save failed',
                                messageType: 'success',
                                btn2Label: 'OK',
                            },
                        },
                    });
                },
            },
        });
        
    }

    useEffect(() => {
        dispatch({
            type: ActionTypes.FETCH_ACTIVITY_LIST_BY_ROOM,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'OT',
                room_id: data.room_id,
            },
        });
    }, [data.room_id, dispatch]);

    useEffect(() => {
        if (!roomTreatmentList) return;
        setRows(_.cloneDeep(roomTreatmentList));
        setStoreData(_.cloneDeep(roomTreatmentList));
    }, [roomTreatmentList]);

    const ListItem = (props) => {
        const { item } = props;
        return (
            <Grid className={classes.listItem}>
                <Grid item className={classes.detailGridItem} xs={3}>
                    {item.treatment_category}
                </Grid>
                <Grid item className={classes.detailGridItem} xs={2}>
                    {item.treatment_name}
                </Grid>
                <Grid item className={classes.detailGridItem} xs={4}>
                    {item.treatment_doc}
                </Grid>
                <Grid item className={classes.detailGridItem} xs={2}>
                    {item.barcode}
                </Grid>
                <Grid
                    item
                    style={{ position: 'relative', left: '-12px' }}
                    className={[classes.detailGridItem, classes.switch].join(' ')}
                    xs={1}
                >
                    <Switch
                        id={'activityDetailSwitch'}
                        checked={item.status === 'ACTIVE' ? true : false}
                        onChange={(e) => handleSwitchChange(e, item.treatment_category, item.treatment_name,item.treatment_doc)}
                        name="activeSwitch"
                        inputProps={{ 'aria-label': 'checkbox' }}
                    />
                </Grid>
            </Grid>
        );
    };

    return (
        <>
            <Grid container direction="column" alignItems="center" className={classes.containerDiv}>
                <Grid className={classes.headerDiv}>
                    <Grid item className={classes.title}>
                        <Typography
                            style={{ fontSize: '14px', fontWeight: 600, paddingTop: '5px', paddingBottom: '5px' }}
                        >
                            {data.room_id}
                        </Typography>
                    </Grid>
                    <Grid
                        style={{
                            marginBottom: '15px',
                            marginLeft: '17px',
                            marginRight: '17px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <ColorButton
                            id={'activityDetailBackButton'}
                            onClick={() => handleSwitchPage(false, [], roomId, rows)}
                            startIcon={<ArrowBackIosIcon />}
                            style={{
                                fontFamily: 'PingFangTC',
                                fontsize: '16px',
                                color: '#39ad90',
                                backgroundColor: '#ecf0f7',
                                borderColor: '#ecf0f7',
                                marginRight: '50px',
                            }}
                        >
                            <Typography style={{ position: 'relative', left: '-10px' }}>Back</Typography>
                        </ColorButton>
                        <Grid style={{ display: 'flex', alignItems: 'center', marginRight: '66px' }}>
                            <Typography style={{ fontSize: '14px', fontWeight: 500 }}>Show</Typography>
                            <Box
                                sx={{
                                    '& .MuiSelect-select.MuiSelect-select ': {
                                        background: '#f5f5f5',
                                        borderRadius: '4px',
                                        borderColor: 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        transform: 'scale(1.2,2)',
                                    },
                                }}
                            >
                                <CommonSelect
                                    id={"activityDetailSelect"}
                                    placeholder={null}
                                    style={{
                                        marginLeft: '12px',
                                        marginRight: '8px',
                                        width: '75px',
                                        height: '30px',
                                        marginTop: '5px',
                                    }}
                                    items={[
                                        { label: '10', value: '10' },
                                        { label: '20', value: '20' },
                                        { label: '30', value: '30' },
                                        { label: '50', value: '50' },
                                        { label: '100', value: '100' },
                                    ]}
                                    MenuProps={{
                                        anchorOrigin: {
                                            vertical: 'top',
                                            horizontal: 'left',
                                        },
                                        transformOrigin: {
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        },
                                        getContentAnchorEl: null,
                                    }}
                                    value={pageSize}
                                    onChange={(e) => {
                                        if (currentPage >= 2) {
                                            setCurrentPage(1);
                                            setPageSize(e.target.value);
                                        } else {
                                            setPageSize(e.target.value);
                                        }
                                    }}
                                />
                            </Box>
                            <Typography style={{ fontSize: '14px', fontWeight: 500 }}>entries</Typography>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid className={classes.searchBox} style={{ width: '100%', display: 'flex' }}>
                    <Grid item xs={6}>
                        <Typography className={classes.detailTitle}>Category</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className={classes.detailTitle}>Activity</Typography>
                    </Grid>
                </Grid>
                <Grid className={classes.searchBox} style={{ width: '100%', display: 'flex' }}>
                    <Grid
                        item
                        xs={4}
                        style={{
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#f5f5f5',
                        }}
                    >
                        <SearchSelectList
                            id={'activityDetailSearchSelectList'}
                            handleSelect={handleSelect}
                            value={selectValue}
                            labelFiled="name"
                            valueFiled="value"
                            placeholder="-"
                            options={categoryList}
                            fullWidth={true}
                            isClear
                            closeBtnId={'category_select'}
                        />
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={4}>
                        <CustomTextField
                            id={"activityDetailInput"}
                            onChange={(e) => {
                                handleSearchTextFieldChange(e);
                            }}
                            placeholder={'Search'}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <img src={searchIcon} alt="searchIcon" />
                                    </InputAdornment>
                                ),
                            }}
                            value={inputValue}
                            size="small"
                            style={{
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: '#f5f5f5',
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid className={classes.content}>
                    <Grid style={{ margin: '6px 0 10px', display: 'flex', justifyContent: 'space-between' }}>
                        <Grid item xs={3} className={classes.detailGridItem}>
                            <Typography className={classes.detailTitle}>Category</Typography>
                        </Grid>
                        <Grid item xs={2} className={classes.detailGridItem}>
                            <Typography className={classes.detailTitle}>Activity</Typography>
                        </Grid>
                        <Grid item xs={4} className={classes.detailGridItem}>
                            <Typography className={classes.detailTitle}>Documentation</Typography>
                        </Grid>
                        <Grid item xs={2} className={classes.detailGridItem}>
                            <Typography className={classes.detailTitle}>Barcode No.</Typography>
                        </Grid>
                        <Grid item xs={1} className={classes.detailGridItem}>
                            <Typography className={classes.detailTitle}>Active</Typography>
                        </Grid>
                    </Grid>
                    <Grid className={classes.contentAbsolute}>
                        {currentPosts && currentPosts?.length === 0 ? (
                            <Grid
                                style={{
                                    display: 'flex',
                                    width: '100%',
                                    height: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                No record
                            </Grid>
                        ) : (
                            currentPosts?.map((item, index) => {
                                return (
                                    <ListItem
                                        key={`currentposts-${item.treatment_category}-${item.treatment_name}-${item.treatment_doc}`}
                                        item={item}
                                    />
                                );
                            })
                        )}
                    </Grid>
                </Grid>
                <Grid className={classes.pagination}>
                    <Grid style={{ display: 'flex', flexDirection: 'column' }}>
                        <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Grid style={{ display: 'flex' }}>
                                {currentPosts && currentPosts?.length !== 0 && (
                                    <>
                                        <>
                                            <Typography>Showing</Typography>&nbsp;
                                            <Typography>{indexOfFirstPost + 1}</Typography>&nbsp;
                                            <Typography>to</Typography>&nbsp;
                                            <Typography>
                                                {indexOfLastPost > rows?.length ? rows?.length : indexOfLastPost}
                                            </Typography>
                                            &nbsp;<Typography>of</Typography>&nbsp;
                                            <Typography>{rows?.length}</Typography>&nbsp;
                                            <Typography>entries</Typography>
                                        </>
                                    </>
                                )}
                            </Grid>
                            {!isChange ? (
                                <CommonPagination
                                    pageCallbackFn={getCurrentPage.bind(this)}
                                    rows={rows || []}
                                    pageSize={pageSize}
                                    currentPage={currentPage}
                                ></CommonPagination>
                            ) : (
                                <Grid className={classes.buttonDiv}>
                                    <ColorButton
                                        id={'activityCancelButton'}
                                        onClick={() => handleCancel()}
                                        style={{ height: 40, width: 110, borderRadius: '10px' }}
                                        variant="contained"
                                    >
                                        Cancel
                                    </ColorButton>
                                    <ColorButton
                                        id={'activitySaveButton'}
                                        onClick={() => handleSave()}
                                        style={{ marginLeft: 6, height: 40, width: 110, borderRadius: '10px' }}
                                        variant="contained"
                                        color="primary"
                                    >
                                        Save
                                    </ColorButton>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}
