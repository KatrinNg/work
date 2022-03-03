import React,{useState,useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import * as ActionTypes from 'redux/actionTypes';
import {Box,InputAdornment,Grid,Typography} from '@material-ui/core'
import CommonSelect from 'components/CommonSelect/CommonSelect'
import CustomTextField from 'components/Input/CustomTextField'
import ColorButton from 'components/ColorButton/ColorButton'
import ListEdit from './ListEdit';
import * as _ from 'lodash';
import searchIcon from 'resource/Icon/adminMode/search.svg'
import CommonPagination from 'components/CommonPagination/CommonPagination'
import Shape from 'resource/Icon/adminMode/shape.svg'
import SaveImg from 'resource/Icon/adminMode/path.svg'
import useStyles from './styles'

const VitalSignType = () => {

    const classes = useStyles()
    const dispatch = useDispatch()
    const [storeData, setStoreData] = useState()
    const [rows, setRows] = useState()
    const [inputValue, setInputValue] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [edit,setEdit] = useState(false)
    const [minEditData,setMinEditData] = useState([])
    const [maxEditData,maxMinEditData] = useState([])
    const [value,setValue] = useState('')

    const {vitalSignTypeList} = useSelector(state=>state.adminmode)

    let list = [
        {
            name:'sbp',label:'Systolic BP',minimumValue:vitalSignTypeList?.sbp_lower || '',maximumValue:vitalSignTypeList?.sbp_upper || ''
        },
        {
            name:'dbp',label:'Diastolic BP',minimumValue:vitalSignTypeList?.dbp_lower || '',maximumValue:vitalSignTypeList?.dbp_upper || ''
        },
        {
            name:'spo2',label:'SpO₂',minimumValue:vitalSignTypeList?.spo2 || ''
        },
        {
            name:'pulse',label:'Pulse',minimumValue:vitalSignTypeList?.pulse_lower || '',maximumValue:vitalSignTypeList?.pulse_upper || ''
        },
    ]

    const getList = () => {
        dispatch({
            type: ActionTypes.FETCH_VITALSIGNTYPELIST_DATA,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'OT',
            }
        })
    }

    useEffect(()=>{
        getList()
    },[dispatch])

    useEffect(() => {
        setRows(_.cloneDeep(list))
        setStoreData(_.cloneDeep(list))
        setInputValue(value)
    }, [vitalSignTypeList])

    useEffect(()=>{
        if(inputValue){
            handleSearch()
        }
    },[inputValue])

    const getCurrentPage = (newCurrentPage) => {
        setCurrentPage(newCurrentPage);
    }

    const handleSearch = () => {
        let newStoreData = _.cloneDeep(storeData)
        newStoreData = newStoreData?.filter(item => {
            return item.name.toLowerCase().includes(inputValue.toLowerCase())
        })
        setRows(newStoreData)
    }

    const handleChange = (e) =>{
        if (e.target.value === "") {
            let newStoreData = _.cloneDeep(storeData)
            newStoreData = newStoreData.filter(item => {
                return item.name?.length > 0
            })
            setRows(newStoreData)
        }
        setInputValue(e.target.value)
    }

    const saveCancel = (flag) => {
        if(flag){
            let allObj = {}
            let obj = {}
            minEditData?.forEach((item)=>{
                const {index,minimumValue} = item
                rows[index].minimumValue = minimumValue
            })
            maxEditData?.forEach((item)=>{
                const {index,maximumValue} = item
                rows[index].maximumValue = maximumValue
            })
            rows.forEach((item)=>{
                if(item.name !== 'spo2'){
                    let bothObj={[item.name.concat('_lower')]:item.minimumValue,[item.name.concat('_upper')]:item.maximumValue}
                    obj={...obj,...bothObj}
                }else{
                    let singleObj = {}
                    singleObj={[item.name]:item.minimumValue}
                    obj={...obj,...singleObj}
                }
            })
            storeData.forEach((item)=>{
                if(item.name !== 'spo2'){
                    let bothObj={[item.name.concat('_lower')]:item.minimumValue,[item.name.concat('_upper')]:item.maximumValue}
                    allObj={...allObj,...bothObj}
                }else{
                    let singleObj = {}
                    singleObj={[item.name]:item.minimumValue}
                    allObj={...allObj,...singleObj}
                }
            })

            dispatch({
                type:ActionTypes.UPDATE_VITALSIGNTYPELIST_DATA,
                payload:{
                    login_id:'@CMSIT', 
                    hosp_code:'TPH',
                    dept:'OT',
                    evital_default: { hosp_code: 'TPH', ...allObj, ...obj },
                    callback: () => {
                        // getList()
                        dispatch({
                            type: ActionTypes.MESSAGE_OPEN_MSG,
                            payload: {
                                open: true,
                                messageInfo: {
                                    message: 'Save successfully',
                                    messageType: 'success',
                                    btn2Label: 'OK',
                                },
                            }
                        });
                    }
                }
            })
        }
        setEdit(false)
        setValue(inputValue)
        setInputValue()
    }

    const indexOfLastPost = currentPage * pageSize;
    const indexOfFirstPost = indexOfLastPost - pageSize
    const currentPosts = rows?.slice(indexOfFirstPost, indexOfLastPost)

    const pageNumbers = []
    for (let i = 1; i <= Math.ceil(rows?.length / pageSize); i++) {
        pageNumbers.push(i)
    }


    return (
        <Box className={classes.container}>
            <Box className={classes.header}>
                <Box className={classes.headerTitle}>
                    <Box style={{fontWeight:600}}>{'Vital Sign Type List'}</Box>
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
                                    id={"vitalSignTypeSelect"}
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
                    <Box style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <Box className={classes.searchInput}>
                            <CustomTextField
                                id={"vitalSignTypeInput"}
                                onChange={(e)=>{handleChange(e)}}
                                placeholder={"Search"}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" style={{cursor:'pointer'}}>
                                            <img src={searchIcon} alt='searchIcon'/>
                                        </InputAdornment>
                                    ),
                                }}
                                value={inputValue}
                                size="small"
                                style={{ width: "221px", borderRadius: "8px", height: "35px", background: "#f4f8f7" }}
                            />
                        </Box>
                        {
                            edit?
                            <Box>
                                <ColorButton 
                                    id={'vitalSignTypeCancelButton'}
                                    onClick={()=>{saveCancel(false)}} style={{height:35,marginLeft:20}}
                                >
                                    {'Cancel'}
                                </ColorButton>
                                <ColorButton 
                                    id={'vitalSignTypeSaveButton'}
                                    style={{height:35,backgroundColor: '#39ad90',color: '#fff',marginLeft: 10}} 
                                    onClick={()=>{saveCancel(true)}}
                                    startIcon={<img alt="save" src={SaveImg} />} 
                                >
                                    {'Save'}
                                </ColorButton>
                            </Box>:
                            <Box>
                                <ColorButton 
                                    id={'vitalSignTypeEditButton'}
                                    style={{backgroundColor: '#39ad90',color: '#fff',height:35,marginLeft:20}} 
                                    onClick={()=>{setEdit(true)}}
                                    startIcon={<img alt="shape" src={Shape} />}
                                >
                                    {'Edit'}
                                </ColorButton>
                            </Box>
                        }
                    </Box>
                </Box>
            </Box>

            <Box className={classes.content}>
                <Grid style={{ margin: "6px 49px 10px 48px", display: "flex", justifyContent: 'space-between' }} >
                    <Box style={{ color: "#7b0400", fontWeight: 600 }}>Name</Box>
                    <Grid style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box style={{ color: "#7b0400", fontWeight: 600, marginRight:69 }}>Minimum value</Box>
                        <Box style={{ color: "#7b0400", fontWeight: 600 }}>Maximum value</Box>
                    </Grid>
                </Grid>
                <Grid className={classes.contentAbsolute}>
                    {currentPosts && currentPosts?.length === 0 ?
                        <Grid style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>No record</Grid>
                        :
                        currentPosts?.map((item, index) => {
                            return (
                                <>
                                    {
                                        edit?
                                        <ListEdit 
                                            rowData={item} 
                                            index={index}
                                            minEditData={minEditData}
                                            maxEditData={maxEditData}
                                            currentPage={currentPage}
                                            pageSize={pageSize}
                                        />:
                                        <RowItem 
                                            rowData={item} 
                                            index={index}
                                        />
                                    }
                                </>
                            )
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
                                    <Typography>{indexOfFirstPost + 1}</Typography>&nbsp;
                                    <Typography>to</Typography>&nbsp;
                                    <Typography>{indexOfLastPost > rows?.length ? rows?.length : indexOfLastPost}</Typography>&nbsp;
                                    <Typography>of</Typography>&nbsp;<Typography>{rows?.length}
                                    </Typography>&nbsp;<Typography>entries</Typography>
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
    )
}

const RowItem = (props) => {
    const classes = useStyles()
    const {index,rowData,others} = props
    return (
        <Grid {...others} key={`currentposts-${index}`} style={{ background: "#ffffff",padding: "0 62px 0 16px", display: "flex", justifyContent: "space-between", borderRadius: "6px", height: "40px", marginBottom: "5px", alignItems: "center" }}>
            <Box>{rowData.label}</Box>
            <Grid style={{ width:190,display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>{rowData.minimumValue}</Box>
                <Box>{rowData.maximumValue}</Box>
            </Grid>
        </Grid>
    )
}

export default VitalSignType