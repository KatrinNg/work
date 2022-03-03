import React,{useState,useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import * as ActionTypes from 'redux/actionTypes';
import {Box,InputAdornment,Grid,Typography} from '@material-ui/core'
import CommonSelect from 'components/CommonSelect/CommonSelect'
import CustomTextField from 'components/Input/CustomTextField'
import ColorButton from 'components/ColorButton/ColorButton'
import CommonPagination from 'components/CommonPagination/CommonPagination'
import GroupDetail from './groupDetail'
import * as _ from 'lodash';
import searchIcon from 'resource/Icon/adminMode/search.svg'
import combinedShape from 'resource/Icon/adminMode/combined-shape.png'
import pathIcon from 'resource/Icon/landing/path-copy-18.png'
import useStyles from './styles'

const Group = () => {

    const classes = useStyles()
    const dispatch = useDispatch()
    const [storeData, setStoreData] = useState()
    const [rows, setRows] = useState()
    const [inputValue, setInputValue] = useState()
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [detail, setDetail] = useState({ isShow: false, data: [], index: -1 });
    const [isAdd,setIsAdd] = useState(false)

    const {groupList} = useSelector(state=>state.adminmode)

    useEffect(()=>{
        dispatch({
            type: ActionTypes.FETCH_GROUPLIST_DATA,
            payload: {
                login_id:"@CMSIT",
                dept:"OT",
                hosp_code:"TPH"
            }
        })
        
    },[dispatch])   

    useEffect(()=>{
        if(inputValue){
            handleSearch()
        }
    },[inputValue])  //eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setRows(_.cloneDeep(groupList))
        setStoreData(_.cloneDeep(groupList))
    }, [groupList])

    const handleSearch = () => {
        let newStoreData = _.cloneDeep(storeData)
        newStoreData = newStoreData.filter(item => {
            return item.group_name.toLowerCase().includes(inputValue.toLowerCase())
        })
        setRows(newStoreData)
    }

    const getCurrentPage = (newCurrentPage) => {
        setCurrentPage(newCurrentPage);
    }

    const handleChange = (e) =>{
        if (e.target.value === "") {
            let newStoreData = _.cloneDeep(storeData)
            newStoreData = newStoreData.filter(item => {
                return item.group_name?.length > 0
            })
            setRows(newStoreData)
        }
        setInputValue(e.target.value)
    }


    const indexOfLastPost = currentPage * pageSize;
    const indexOfFirstPost = indexOfLastPost - pageSize
    const currentPosts = rows?.slice(indexOfFirstPost, indexOfLastPost)

    const pageNumbers = []
    for (let i = 1; i <= Math.ceil(rows?.length / pageSize); i++) {
        pageNumbers.push(i)
    }

    const handleSwitchPage = (isShow, item, index)=>{
        setRows(_.cloneDeep(storeData));
        setIsAdd(false)
        setDetail({ ...detail, isShow: isShow, data: item, index: isShow ? index : -1 });
    }

    const GroupItem = (props) => {
        const { item,index } = props;
        return (
            <Grid container style={item.status==='INACTIVE'?{backgroundColor:'#d8d8d8'}:{backgroundColor:'#ffffff'}} className={classes.listItem} onClick={item.disabled?null:() => handleSwitchPage(true, item, index)}>
                <Grid item xs={6}>{item.group_name}</Grid>
                <Grid item xs style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <Box>{item.category}</Box>
                    <Box><img src={pathIcon} alt={'pathIcon'} /></Box>
                </Grid>
            </Grid>
        );
    };

    const add = () => {
        setIsAdd(true)
        setDetail({  isShow: true, data: [], index: -1 });
    }

    return detail.isShow ? (
        <>
            <GroupDetail
                detail={detail}
                handleSwitchPage={handleSwitchPage}
                isAdd={isAdd}
                storeData={storeData}
                currentPage={currentPage}
                pageSize={pageSize}
                setCurrentPage={setCurrentPage}
            />
        </>
    ):
    (
        <>
            <Box className={classes.container}>
                <Box className={classes.header}>
                    <Box className={classes.headerTitle}>
                        <Box style={{fontWeight:600}}>{'Therapeutic Group - Group'}</Box>
                    </Box>
                    <Box className={classes.headerContent}>
                        <Box style={{display:'flex',alignItems:'center'}}>
                            <Box>{'Show'}</Box>
                                <Box sx={{
                                    "& .MuiSelect-select.MuiSelect-select ": {
                                        background: "#f5f5f5",
                                        borderRadius: "4px",
                                        borderColor: "transparent",
                                        display: "flex",
                                        alignItems: "center",
                                    },
                                    "& .MuiSvgIcon-root": {
                                        transform: "scale(1.2,2)"
                                    },
                                }}>
                                    <CommonSelect
                                        id={'groupSelect'}
                                        placeholder={null}
                                        style={{ marginLeft: "12px", marginRight: "8px", width: "75px", height: "30px"}}
                                        items={[{ label: "10", value: "10" }, { label: "20", value: "20" }, { label: "30", value: "30" }, { label: "50", value: "50" }, { label: "100", value: "100" }]}
                                        MenuProps={{
                                            anchorOrigin: {
                                                vertical: "top",
                                                horizontal: "left"
                                            },
                                            transformOrigin: {
                                                vertical: "bottom",
                                                horizontal: "left"
                                            },
                                            getContentAnchorEl: null,
                                        }}
                                        value={pageSize}
                                        onChange={e => {
                                            if (currentPage >= 2) {
                                                setCurrentPage(1)
                                                setPageSize(e.target.value)
                                            } else {
                                                setPageSize(e.target.value)
                                            }
                                        }}
                                    />
                                </Box>
                            <Box>{'entries'}</Box>
                        </Box>
                        <Box className={classes.searchInput}>
                            <CustomTextField
                                id={'groupInput'}
                                onChange={(e)=>{handleChange(e)}}
                                placeholder={"Search"}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" onClick={handleSearch} style={{cursor:'pointer'}}>
                                            <img src={searchIcon} alt='searchIcon'/>
                                        </InputAdornment>
                                    ),
                                }}
                                value={inputValue}
                                size="small"
                                style={{ width: "221px", background: "#ffffff", borderRadius: "8px", height: "35px"}}
                            />
                            <ColorButton id={'groupAddButton'} className={classes.addButton} onClick={add}>
                                <img src={combinedShape} alt='combinedShape'/>
                                <span style={{marginLeft:8}}>Add</span>
                            </ColorButton>
                        </Box>
                    </Box>
                </Box>

                <Box className={classes.content}>
                    <Grid container style={{padding:'8px 48px 13px 48px'}}>
                        <Grid item xs={6} style={{ color: "#7b0400", fontWeight: 600}}>Group</Grid>
                        <Grid item xs={6} style={{ color: "#7b0400", fontWeight: 600}}>Category</Grid>
                    </Grid>
                    <Grid className={classes.contentAbsolute}>
                        {currentPosts && currentPosts?.length === 0 ?
                            <Grid style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>No record</Grid>
                            :
                            currentPosts?.map((item, index) => {
                                return <GroupItem key={`currentposts-${index}`} item={item} index={index}/>
                            })
                        }
                    </Grid>
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
                                        </Typography>&nbsp;
                                        <Typography>of</Typography>&nbsp;<Typography>{rows?.length}</Typography>&nbsp;
                                        <Typography>entries</Typography>
                                    </>
                                )}
                            </Grid>
                            <CommonPagination
                                rows={rows}
                                pageSize={pageSize}
                                currentPage={currentPage}
                                pageCallbackFn={getCurrentPage.bind(this)}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

export default Group