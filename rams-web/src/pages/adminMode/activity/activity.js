import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Switch } from '@material-ui/core';
import CommonSelect from 'components/CommonSelect/CommonSelect';
import ColorButton from 'components/ColorButton/ColorButton';
import { ArrowRightAlt } from '@material-ui/icons';
import * as _ from 'lodash';
import clsx from 'clsx';
import pathIcon from 'resource/Icon/landing/path-copy-18.png';
import useStyles from './styles';
//import { data } from './mockData';
import ActivityDetail from './activityDetail';
import CommonPagination from 'components/CommonPagination/CommonPagination';
import { useSelector, useDispatch } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';

export default function Activity() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [inactiveBtn, setInactiveBtn] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [rows, setRows] = useState([]);
    const [storeData, setStoreData] = useState([]);
    const [detail, setDetail] = useState({ isShow: false, data: [], roomIndex: -1 });
    const roomList = useSelector((state) => state.adminmode.roomList);

    const RoomItem = (props) => {
        const { item } = props;
        return (
            <Grid
                className={
                    item.status === 'ACTIVE' ? clsx(classes.listItem) : clsx(classes.listItem, classes.listItemInactive)
                }
                onClick={() => handleSwitchPage(true, item, item.room_id)}
            >
                <Grid style={{ marginLeft: '16px' }}>{item.room_id}</Grid>
                <Grid className={classes.switch} style={{ marginRight: '9px' }}>
                    <img src={pathIcon} alt={'pathIcon'} />
                </Grid>
            </Grid>
        );
    };

    useEffect(() => {
        dispatch({
            type: ActionTypes.FETCH_ROOM_LIST_IN_ACTIVITY,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'OT',
            },
        });
        dispatch({
            type: ActionTypes.FETCH_ADMIN_CATEGORY_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'OT'
            },
        })
    }, []);

    useEffect(() => {
        if (!roomList) return;
        setStoreData(_.cloneDeep(roomList));
        const activeData = _.cloneDeep(roomList).filter((item) => {
            return item.status === 'ACTIVE';
        });
        setRows(_.cloneDeep(activeData));
    }, [detail.isShow, roomList]);

    const indexOfLastPost = currentPage * pageSize;
    const indexOfFirstPost = indexOfLastPost - pageSize;
    const currentPosts = rows?.slice(indexOfFirstPost, indexOfLastPost);

    function getCurrentPage(newCurrentPage) {
        setCurrentPage(newCurrentPage);
    }

    function handleSwitchChange(name) {
        let newStoreData = _.cloneDeep(storeData);
        if (inactiveBtn) {
            newStoreData = newStoreData.filter((item) => {
                return item.status === 'ACTIVE';
            });
        } else {
            newStoreData = newStoreData.filter((item) => {
                return item.room_id?.length > 0;
            });
        }

        setInactiveBtn(!inactiveBtn);
        setRows(newStoreData);

        setCurrentPage(1);
    }

    function calcActive(data) {
        let result = data.reduce((res, item) => {
            return res || item.status === 'ACTIVE';
        }, false);
        return result;
    }

    function handleSwitchPage(isShow, item, key, tempData) {
        setInactiveBtn(false);
        setRows(_.cloneDeep(storeData));
        setDetail({ ...detail, isShow: isShow, data: item, roomIndex: isShow ? key : -1 });
        if (tempData && tempData.length > 0) {
            let index = _.findIndex(tempData, function (obj) {
                return obj.key === key;
            });
            const res = calcActive(tempData) ? 'ACTIVE' : 'INACTIVE';
            rows[index].details = _.cloneDeep(tempData);
            rows[index].status = res;
            storeData[index].details = _.cloneDeep(tempData);
            storeData[index].status = res;
            setRows([...rows]);
            setStoreData([...storeData]);
        }
    }
    return detail.isShow ? (
        <ActivityDetail data={detail.data} handleSwitchPage={handleSwitchPage} roomId={detail.roomId}></ActivityDetail>
    ) : (
        <>
            <Grid container direction="column" alignItems="center" className={classes.containerDiv}>
                <Grid className={classes.headerDiv}>
                    <Grid item className={classes.title}>
                        <Typography
                            style={{ fontSize: '14px', fontWeight: 600, paddingTop: '5px', paddingBottom: '5px' }}
                        >
                            Activity
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
                                    id="activitySelect"
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
                        <Grid className={classes.switch} style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography style={{ fontSize: '14px', fontWeight: 500 }}>
                                Show Inactive Records:
                            </Typography>
                            <Switch
                                id={'activitySwitch'}
                                checked={inactiveBtn}
                                onChange={() => handleSwitchChange()}
                                name="activitySwitch"
                                inputProps={{ 'aria-label': 'checkbox' }}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid className={classes.content}>
                    <Grid style={{ margin: '6px 42px 10px 16px', display: 'flex', justifyContent: 'space-between' }}>
                        <Typography style={{ color: '#7b0400', fontSize: '14px', fontWeight: 600 }}>Room No</Typography>
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
                                return <RoomItem key={`currentposts-${item.room_id}`} item={item} />;
                            })
                        )}
                    </Grid>
                </Grid>
                <Grid className={classes.pagination}>
                    <Grid style={{ display: 'flex', flexDirection: 'column' }}>
                        <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Grid style={{ display: 'flex' }}>
                                {currentPosts?.length !== 0 && (
                                    <>
                                        <Typography>Showing</Typography>&nbsp;
                                        <Typography>
                                            {pageSize > currentPosts?.length ? currentPosts?.length : pageSize}
                                        </Typography>
                                        &nbsp;<Typography>of</Typography>&nbsp;<Typography>{rows?.length}</Typography>
                                        &nbsp;
                                        <Typography>entries</Typography>
                                    </>
                                )}
                            </Grid>
                            <CommonPagination
                                pageCallbackFn={getCurrentPage.bind(this)}
                                rows={rows || []}
                                pageSize={pageSize}
                                currentPage={currentPage}
                            ></CommonPagination>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}
