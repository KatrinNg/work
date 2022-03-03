import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Switch, InputAdornment } from '@material-ui/core';
import CommonSelect from 'components/CommonSelect/CommonSelect';
import ColorButton from 'components/ColorButton/ColorButton';
import CommonPagination from 'components/CommonPagination/CommonPagination';
import searchIcon from 'resource/Icon/adminMode/search.svg';
import CustomTextField from 'components/Input/CustomTextField';
import * as _ from 'lodash';
import useStyles from './styles';
import SearchSelectList from 'components/SearchSelectList/SearchSelectList';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useSelector, useDispatch } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';

const TreatmentDetail = (props) => {
    const { data, handleSwitchPage, roomId } = props;
    const classes = useStyles();
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [rows, setRows] = useState(_.cloneDeep(data.details));
    const [storeData, setStoreData] = useState(_.cloneDeep(data.details));
    const [inputValue, setInputValue] = useState();
    const [selectValue, setSelectValue] = useState();
    const indexOfLastPost = currentPage * pageSize;
    const indexOfFirstPost = indexOfLastPost - pageSize;
    const currentPosts = rows?.slice(indexOfFirstPost, indexOfLastPost);

    const roomTreatmentList = useSelector((state) => state.adminmode.activityListByRoom);
    const categoryGroupList = useSelector(state=>state.adminmode.categoryGroupList)

    const getCurrentPage = (newCurrentPage) => {
        setCurrentPage(newCurrentPage);
    };

    const handleSwitchChange = (e, category, name) => {
        const rowIndex = _.findIndex(rows, function (obj) {
            return obj.treatment_category === category && obj.treatment_name === name;
        });
        const storeDataIndex = _.findIndex(storeData, function (obj) {
            return obj.treatment_category === category && obj.treatment_name === name;
        });
        const status = e.target.checked ? 'ACTIVE' : 'INACTIVE';
        rows[rowIndex].status = status;
        storeData[storeDataIndex].status = status;
        for(let i in storeData){
            storeData[i].room_id = data.room_id
        }
        dispatch({
            type: ActionTypes.UPDATE_ACTIVITY_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'OT',
                room_id:data.room_id,
                room_treatment: [storeData[storeDataIndex]],
                callback: ({ status = '' }) => {
                    if(status === 'SUCCESS'){
                        setRows([...rows]);
                        setStoreData([...storeData]);
                    }
                },
            },
        });
    };

    function handleSearch(category, treatment) {
        if (!category && !treatment) {
            setRows(_.cloneDeep(storeData));
            setCurrentPage(1);
            return;
        }
        let newStoreData = _.cloneDeep(storeData);
        if (!category)
            newStoreData = newStoreData.filter((item) => {
                return item['treatment_name'].toLowerCase().includes(treatment.toLowerCase());
            });
        else if (!treatment)
            newStoreData = newStoreData.filter((item) => {
                return item['treatment_category'].toLowerCase().includes(category.toLowerCase());
            });
        else
            newStoreData = newStoreData
                .filter((item) => {
                    return item['treatment_category'].toLowerCase().includes(category.toLowerCase());
                })
                .filter((item) => {
                    return item['treatment_name'].toLowerCase().includes(treatment.toLowerCase());
                });
        setRows(newStoreData);
        setCurrentPage(1);
    }

    const handleSelect = (value, obj) => {
        setSelectValue(value);
        handleSearch(value, inputValue);
    };

    const handleSearchTextFieldChange = (e) => {
        setInputValue(e.target.value);
        handleSearch(selectValue, e.target.value);
    };

    useEffect(() => {
        dispatch({
            type: ActionTypes.FETCH_ACTIVITY_LIST_BY_ROOM,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'OT',
                room_id:data.room_id
            },
        });
        dispatch({
            type: ActionTypes.FETCH_CATEGORY_GROUPLIST_DATA,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'OT',
            },
        });
    }, [dispatch]);

    useEffect(() => {
        if (!roomTreatmentList) return;
        setRows(_.cloneDeep(roomTreatmentList));
        setStoreData(_.clone(roomTreatmentList));
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
                        id={'treatmentDetailSwitch'}
                        checked={item.status === 'ACTIVE' ? true : false}
                        onChange={(e) => handleSwitchChange(e, item.treatment_category, item.treatment_name)}
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
                            id={'treatmentDetailBackButton'}
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
                                    id={"treatmentDetailSelect"}
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
                        <Typography className={classes.detailTitle}>Treatment</Typography>
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
                            id={'treatmentDetailSearchSelectList'}
                            handleSelect={handleSelect}
                            value={selectValue}
                            labelFiled="category"
                            valueFiled="category"
                            placeholder="-"
                            options={categoryGroupList}
                            fullWidth={true}
                            isClear
                            closeBtnId={'category_select'}
                        />
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={4}>
                        <CustomTextField
                            id={"treatmentDetailInput"}
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
                <Grid className={classes.contentDetail}>
                    <Grid style={{ margin: '6px 0 10px', display: 'flex', justifyContent: 'space-between' }}>
                        <Grid item xs={3} className={classes.detailGridItem}>
                            <Typography className={classes.detailTitle}>Category</Typography>
                        </Grid>
                        <Grid item xs={2} className={classes.detailGridItem}>
                            <Typography className={classes.detailTitle}>Treatment</Typography>
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
                    <Grid className={classes.contentDetailAbsolute}>
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
                            currentPosts?.map((item) => {
                                return <ListItem key={`currentposts-${item.key}`} item={item} />;
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
            </Grid>
        </>
    );
};
export default TreatmentDetail;
