import React, { useState, useEffect } from 'react';
import {useSelector,useDispatch} from 'react-redux'
import * as ActionTypes from 'redux/actionTypes';
import { Box, Typography, Grid, Switch } from '@material-ui/core';
import CommonSelect from 'components/CommonSelect/CommonSelect';
import CommonPagination from 'components/CommonPagination/CommonPagination';
import TreatmentDetail from './treatmentDetail';
import pathIcon from 'resource/Icon/landing/path-copy-18.png';
// import { mockDate } from './mockDate';
import * as _ from 'lodash';
import clsx from 'clsx';
import useStyles from './styles';

const Treatment = () => {
    const classes = useStyles();
    const dispatch = useDispatch()
    const [storeData, setStoreData] = useState();
    const [rows, setRows] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [inactiveBtn, setInactiveBtn] = useState(false);
    const [detail, setDetail] = useState({ isShow: false, data: [], roomIndex: -1 });

    // const { roomList } = useSelector(state => state.adminmode)
    const { typeName, roomList } = useSelector(
        (state) => {
            const {patientDetailsType='PT'} = state.patientDetail;
            const {roomList} = state.adminmode;
            return {
                typeName: patientDetailsType==='PT'?'Treatment':'Activity',
                roomList: roomList,
                // g_room: patientDetail.room_id
            }
        }
    );

    const getCurrentPage = (newCurrentPage) => {
        setCurrentPage(newCurrentPage);
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
    }, [dispatch]);

    useEffect(() => {
        if (!roomList) return;
        setStoreData(_.cloneDeep(roomList));
        const activeData = _.cloneDeep(roomList).filter((item) => {
            return item.status === 'ACTIVE';
        });
        setRows(_.cloneDeep(activeData));
    }, [detail.isShow, roomList]);

    const handleSwitchChange = (name) => {
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
    };

    const indexOfLastPost = currentPage * pageSize;
    const indexOfFirstPost = indexOfLastPost - pageSize;
    const currentPosts = rows?.slice(indexOfFirstPost, indexOfLastPost);

    const handleSwitchPage = (isShow, item, key, tempData) => {
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
    };

    const calcActive = (data) => {
        let result = data.reduce((res, item) => {
            return res || item.active;
        }, false);
        return result;
    };

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
    // const treatment_or_activities = g_patientDetailsType === 'PT' ? 'Treatments': 'Activities'

    return detail.isShow ? (
        <TreatmentDetail data={detail.data} handleSwitchPage={handleSwitchPage} roomId={detail.roomId} />
    ) : (
        <Box className={classes.containerDiv}>
            <Box style={{ padding: '11px 10px', backgroundColor: '#ecf0f7' }}>
                <Box className={classes.rightContentTitle}>{typeName}</Box>
                <Box style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', marginLeft: 6, marginRight: 66 }}>
                        <Box>{'Show'}</Box>
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
                                id={"treatmentSelect"}
                                placeholder={null}
                                style={{ marginLeft: '12px', marginRight: '8px', width: '75px', height: '30px' }}
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
                        <Box>{'entries'}</Box>
                    </Box>
                    <Grid className={classes.switch} style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography style={{ fontSize: '14px', fontWeight: 500 }}>Show Inactive Records:</Typography>
                        <Switch
                            id={'treatmentSwitch'}
                            checked={inactiveBtn}
                            onChange={() => handleSwitchChange('inactive')}
                            name="treatmentSwitch"
                            inputProps={{ 'aria-label': 'checkbox' }}
                        />
                    </Grid>
                </Box>
            </Box>
            <Box className={classes.content}>
                <Box className={classes.roomNo}>Room No</Box>
                <Box className={classes.contentAbsolute}>
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
                            return <RoomItem key={`currentposts-${item.key}`} item={item} />;
                        })
                    )}
                </Box>
            </Box>
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
                                    &nbsp;
                                    <Typography>of</Typography>&nbsp;<Typography>{rows?.length}</Typography>&nbsp;
                                    <Typography>entries</Typography>
                                </>
                            )}
                        </Grid>
                        <CommonPagination
                            rows={rows || []}
                            pageSize={pageSize}
                            currentPage={currentPage}
                            pageCallbackFn={getCurrentPage.bind(this)}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Treatment;
