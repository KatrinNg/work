import React, { useState, useEffect } from 'react'
import { Grid, Typography, makeStyles, Box, InputAdornment, Switch } from "@material-ui/core";
import CustomTextField from 'components/Input/CustomTextField';
import CommonSelect from "components/CommonSelect/CommonSelect"
import searchIcon from 'resource/Icon/adminMode/search.svg';
import ColorButton from 'components/ColorButton/ColorButton';
import { ArrowRightAlt } from '@material-ui/icons';
import * as _ from 'lodash';
import arrowIcon from 'resource/Icon/adminMode/arrow.png';
import { useDispatch, useSelector } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';


const useStyles = makeStyles(theme => (
    {
        containerDiv: {
            background: "#e0e6f1",
            minHeight: "100%",
            display: "flex",
            width: "100%",

        },
        headerDiv: {
            background: "#ecf0f7",
            display: "flex",
            width: "100%",
            flexDirection: "column",
        },
        title: {
            background: "#d1f2ea",
            margin: "10px 9px 19px 11px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            border: "solid 1px #39ad90",
            backgroundColor: "#d1f2ea"
        },
        switch: {
            "& .MuiSwitch-track": {
                height: "130%",
                background: "#bdbdbd",
                borderRadius: "10px",

            },
            "& .MuiSwitch-thumb": {
                marginTop: "2px"
            },
            "& .MuiSwitch-colorSecondary.Mui-checked": {
                color: "#ffffff"
            },
            "& .MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track ": {
                background: "#39b194"
            }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                opacity: 1
            }
        },
        searchIcon: {
            "& g": {
                stroke: "green",
                fill: "green"
            }

        },
        searchInput: {
            "& .MuiFormControl-root": {
                height: "100%",
                borderColor: "transparent"
            },
            "& .MuiInputBase-root": {
                height: "100%",
            },
            "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "transparent"
            }
        },
        content: {
            paddingLeft: "32px",
            paddingRight: "29px",
            width: "100%",
            position: "relative",
            height: "100%",
            flex: 1

        },
        contentAbsolute: {
            overflowY: "auto",
            position: 'absolute',
            top: 35,
            left: 32,
            right: 29,
            bottom: 0,
        },
        pagination: {
            marginBottom: "20px", 
            width: "100%",
            paddingLeft: "32px",
            paddingRight: "26px",
            paddingTop: "35px",
            height: "132px"
        },
        buttonDiv: {
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
        }
    }
))



export default function MainContentUI({id,list, title, onSave, fieldName = 'display_name'}) {
    const classes = useStyles()
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1)
    const [showAllBtn, setShowAllBtn] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [rows, setRows] = useState()
    const [storeAllData, setStoreAllData] = useState()
    const [inputValue, setInputValue] = useState()
    const [storeActiveData, setStoreActiveData] = useState()
    const [isChange, setIsChange] = useState(false)


    useEffect(() => {
        if (list.length !== 0) {
            if (showAllBtn) {
                setStoreAllData(list)
                if (inputValue) {
                    let newData = _.cloneDeep(list)
                    newData = newData.filter(item => {
                        return item[fieldName].toLowerCase().includes(inputValue.toLowerCase())
                    })
                    setRows(newData)

                } else {
                    setRows(list)
                }

            } else {
                let newData = _.cloneDeep(list)
                newData = newData.filter(item => item.status === "ACTIVE")

                setStoreActiveData(newData)

                if (inputValue) {
                    newData = newData.filter(item => {
                        return item[fieldName].toLowerCase().includes(inputValue.toLowerCase())
                    })
                    setRows(newData)

                    if (newData.length > 0 && newData.length <= (currentPage - 1) * pageSize) {
                        setCurrentPage(1)
                    }
                } else {
                    setRows(newData)

                    if (newData.length > 0 && newData.length <= (currentPage - 1) * pageSize) {
                        setCurrentPage(1)
                    }
                }

            }
        }


    }, [list, showAllBtn])

    const indexOfLastPost = currentPage * pageSize;
    const indexOfFirstPost = indexOfLastPost - pageSize
    const currentPosts = rows?.slice(indexOfFirstPost, indexOfLastPost)

    const pageNumbers = []

    for (let i = 1; i <= Math.ceil(rows?.length / pageSize); i++) {
        pageNumbers.push(i)
    }

    function ellipsis(currentPage, totalPage) {

        const arr = []

        if (totalPage < 8) {
            for (let i = 1; i < totalPage + 1; i++) {
                arr.push(i)
            }
        } else {
            if (currentPage < 5) {

                for (let i = 1; i < 5 + 1; i++) {
                    arr.push(i)
                }
                arr.push("...")
                arr.push(totalPage)
            }
            else if (totalPage - currentPage <= 3) {
                arr.push(1)
                arr.push("...")
                for (let i = totalPage - 4; i <= totalPage; i++) {
                    arr.push(i)
                }
            } else {
                arr.push(1)
                arr.push("...")
                for (let i = currentPage - 1; i < currentPage + 2; i++) {
                    arr.push(i)
                }
                arr.push("...")
                arr.push(totalPage)
            }
        }
        return arr
    }

    function handleSwitchChange(name) {

        if (name === "showAllData") {

            if (isChange) {

                dispatch({
                    type: ActionTypes.MESSAGE_OPEN_MSG,
                    payload: {
                        open: true,
                        messageInfo: {
                            message: 'Please save changes',
                            messageType: 'warning',
                            btn2Label: 'OK',
                        },
                    }
                });

            } else {
                setInputValue("")
                setShowAllBtn(!showAllBtn)
                setCurrentPage(1)
            }

        } else {

            if (showAllBtn) {
                let newData = _.cloneDeep(storeAllData)
                let newRowData = _.cloneDeep(rows)

                newRowData.forEach(item => {
                    if (item[fieldName] === name) {
                        item.status = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                    }
                })

                newData.forEach(item => {
                    if (item[fieldName] === name) {
                        item.status = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                    }
                })

                setRows(newRowData)
                setStoreAllData(newData)

            } else {
                let newData = _.cloneDeep(storeActiveData)
                let newRowData = _.cloneDeep(rows)
                newRowData.forEach(item => {
                    if (item[fieldName] === name) {
                        item.status = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                    }
                })

                newData.forEach(item => {
                    if (item[fieldName] === name) {
                        item.status = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                    }
                })

                setRows(newRowData)
                setStoreActiveData(newData)

            }
            setIsChange(true)
        }

    }

    function handleCancel() {

        if (showAllBtn) {
            setStoreAllData(list)

            if (inputValue) {
                let newData = _.cloneDeep(list)
                newData = newData.filter(item => {

                    return item[fieldName].toLowerCase().includes(inputValue.toLowerCase())
                })
                setRows(newData)
            } else {
                setRows(list)
            }


        } else {
            let newData = _.cloneDeep(list)

            newData = newData.filter(item => item.status === "ACTIVE")

            setStoreActiveData(newData)

            if (inputValue) {
                newData = newData.filter(item => {

                    return item[fieldName].toLowerCase().includes(inputValue.toLowerCase())
                })
                setRows(newData)
            } else {
                setRows(newData)
            }

        }

        setIsChange(false)
    }

    function handleSearch(value) {

        if (showAllBtn) {
            let newData = _.cloneDeep(storeAllData)
            newData = newData.filter(item => {

                return item[fieldName].toLowerCase().includes(value.toLowerCase())
            })
            setRows(newData)

            if (newData.length > 0 && newData.length <= (currentPage - 1) * pageSize) {
                setCurrentPage(1)
            }

        } else {
            let newData = _.cloneDeep(storeActiveData)

            newData = newData.filter(item => {

                return item[fieldName].toLowerCase().includes(value.toLowerCase())
            })

            setRows(newData)

            if (newData.length > 0 && newData.length <= (currentPage - 1) * pageSize) {
                setCurrentPage(1)
            }
        }

    }

    function handleSave() {

        if (showAllBtn) {
            const changeItem = []
            const newData = _.cloneDeep(list)
            newData.forEach(item => {
                storeAllData.forEach(item2 => {
                    if (item[fieldName] === item2[fieldName]) {
                        if (item.status !== item2.status) {
                            changeItem.push(item)
                            item.status = item2.status

                        }
                    }
                })
            })
            onSave(changeItem, newData)
            


        } else {
            const changeItem = []
            const newData = _.cloneDeep(list)
            newData.forEach(item => {
                storeActiveData.forEach(item2 => {
                    if (item[fieldName] === item2[fieldName]) {
                        if (item.status !== item2.status) {
                            changeItem.push(item)
                            item.status = item2.status

                        }
                    }
                })
            })

            onSave(changeItem, newData)

            
        }
        setIsChange(false)
    }

    return (
        <Grid container direction="column" alignItems="center" className={classes.containerDiv} >
            <Grid className={classes.headerDiv}>
                <Grid item className={classes.title}>
                    <Typography style={{ fontSize: "14px", fontWeight: 600, paddingTop: "5px", paddingBottom: "5px" }}>
                        {title}
                    </Typography>
                </Grid>
                <Grid style={{ marginBottom: "15px", marginLeft: "17px", marginRight: "17px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Grid style={{ display: "flex", alignItems: "center" }}>
                        <Typography style={{ fontSize: "14px", fontWeight: 500 }}>
                            Show
                        </Typography>
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
                                id={`${id}Select`}
                                placeholder={null}
                                style={{ marginLeft: "12px", marginRight: "8px", width: "75px", height: "30px", marginTop: "5px" }}
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
                        <Typography style={{ fontSize: "14px", fontWeight: 500 }}>
                            entries
                        </Typography>
                    </Grid>
                    <Grid className={classes.switch} style={{ display: "flex", alignItems: "center" }}>
                        <Typography style={{ fontSize: "14px", fontWeight: 500 }}>
                            Show Inactive Records:
                        </Typography>
                        <Switch
                            id={`${id}Switch`}
                            checked={showAllBtn}
                            onChange={() => handleSwitchChange("showAllData")}
                            name="weightBearingSwitch"
                            inputProps={{ 'aria-label': 'checkbox' }}
                        />
                    </Grid>
                    <Box className={classes.searchInput}>
                        <CustomTextField
                            id={`${id}Input`}
                            onChange={e => {
                                setInputValue(e.target.value)
                                if (e.target.value === "") {

                                    if (showAllBtn) {
                                        setRows(storeAllData)
                                    } else {

                                        setRows(storeActiveData)
                                    }

                                } else {
                                    handleSearch(e.target.value)
                                }

                            }}
                            placeholder={"Search"}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <img src={searchIcon} alt='searchIcon'/>
                                    </InputAdornment>
                                ),
                            }}
                            value={inputValue}
                            size="small"
                            style={{ width: "221px", borderRadius: "8px", height: "35px", background: "#f4f8f7" }}
                        />
                    </Box>
                </Grid>
            </Grid>

            <Grid className={classes.content}>
                <Grid style={{ margin: "6px 42px 10px 16px", display: "flex", justifyContent: 'space-between' }} >
                    <Typography style={{ color: "#7b0400", fontSize: "14px", fontWeight: 600 }}>Name</Typography>
                    <Typography style={{ color: "#7b0400", fontSize: "14px", fontWeight: 600 }}>Active</Typography>
                </Grid>
                <Grid className={classes.contentAbsolute}>
                    {(currentPosts && currentPosts?.length === 0) || currentPosts === undefined?
                        <Grid style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>No record</Grid>
                        :
                        currentPosts?.map((item, index) => {
                            return <Grid key={`currentposts-${index}`} style={{ background: "#ffffff", display: "flex", justifyContent: "space-between", borderRadius: "6px", height: "40px", marginBottom: "5px", alignItems: "center" }}>
                                <Grid style={{ marginLeft: "16px" }}>{item[fieldName]}</Grid>
                                <Grid className={classes.switch} style={{ marginRight: "30px" }}><Switch
                                    id={`${id}ListSwitch${index}`}
                                    checked={item.status === "ACTIVE"}
                                    onChange={() => handleSwitchChange(item[fieldName])}
                                    name="weightBearingSwitch"
                                    inputProps={{ 'aria-label': 'checkbox' }}
                                /></Grid>

                            </Grid>
                        })}
                </Grid>
            </Grid>
            <Grid className={classes.pagination}>
                <Grid style={{ display: "flex", flexDirection: "column" }}>
                    <Grid style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Grid style={{ display: "flex" }}>
                            {(currentPosts && currentPosts?.length !== 0  )&& <><Typography>Showing</Typography>&nbsp;<Typography>{indexOfFirstPost + 1}</Typography>&nbsp;<Typography>to</Typography>&nbsp;<Typography>{indexOfLastPost > rows?.length ? rows?.length : indexOfLastPost}</Typography>&nbsp;<Typography>of</Typography>&nbsp;<Typography>{rows?.length}</Typography>&nbsp;<Typography>entries</Typography></>}
                        </Grid>
                        {!isChange ?
                            <Grid style={{ display: "flex", marginTop: "4px", marginBottom: "4px" }}>
                                <ColorButton
                                    id={'commonPaginationPrevButton'}
                                    style={
                                        currentPage === 1 || currentPosts?.length === 0 ?
                                            { background: "#f2f2f2", color: "#b7b7b7", width: "65px", height: "30px", borderRadius: "15px", display: "flex", justifyContent: "center", alignItems: "center", marginRight: "6px", borderColor: "#f2f2f2" }
                                            :
                                            { background: "#3ab395", color: "#ffffff", width: "65px", height: "30px", borderRadius: "15px", display: "flex", justifyContent: "center", alignItems: "center", marginRight: "6px", borderColor: "#3ab395" }
                                    }
                                    variant="contained"
                                    disabled={currentPage === 1 || currentPosts?.length === 0}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    <ArrowRightAlt style={{ transform: "rotate(180deg)" }} />
                                    <Typography style={{ fontSize: "14px" }}>Prev</Typography>
                                </ColorButton>
                                {pageNumbers?.length > 1 ? ellipsis(currentPage, pageNumbers.length).map((page, index) => {

                                    if (page === "...") {
                                        return <div key={`dot-${index}`}>...</div>
                                    } else {
                                        return <ColorButton
                                            id={'commonPaginationPageButton'}
                                            key={`pagination-${index}`}
                                            style={currentPage === page ?
                                                { background: "#3ab395", color: "#ffffff", minWidth: "15px", width: "15px", height: "30px", borderRadius: "55%", marginRight: "6px", borderColor: "#3ab395", padding: 15 }
                                                :
                                                { background: "transparent", color: "#62676a", minWidth: "15px", width: "15px", height: "30px", borderRadius: "55%", marginRight: "6px", border: "1px solid transparent", padding: 15 }
                                            }
                                            variant="contained"
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            <Typography style={{ fontSize: "14px", padding: 0 }}>
                                                {page}
                                            </Typography>
                                        </ColorButton>
                                    }

                                }) : <ColorButton
                                    id={'commonPaginationPageButton'}
                                    key={`pagination`}
                                    style={{ background: "#3ab395", color: "#ffffff", minWidth: "15px", width: "15px", height: "30px", borderRadius: "55%", marginRight: "6px", borderColor: "#3ab395", padding: 15 }

                                    }
                                    variant="contained"
                                >
                                    <Typography style={{ fontSize: "14px", padding: 0 }}>
                                        {1}
                                    </Typography>
                                </ColorButton>}
                                <ColorButton
                                    id={'commonPaginationNextButton'}
                                    disabled={currentPage === pageNumbers?.length || pageNumbers.length <= 1}
                                    style={pageNumbers.length <= 1 || currentPage === pageNumbers?.length ? { background: "#f2f2f2", color: "#b7b7b7", borderColor: "#f2f2f2", width: "65px", height: "30px", borderRadius: "15px" } : { background: "#3ab395", borderColor: "#3ab395", color: "#ffffff", width: "65px", height: "30px", borderRadius: "15px", }}
                                    variant="contained"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    <Typography style={{ fontSize: "14px" }}>
                                        Next</Typography><ArrowRightAlt />
                                </ColorButton>
                            </Grid>
                            :
                            <Grid className={classes.buttonDiv}>
                                <ColorButton id={`${id}CancelButton`} onClick={() => handleCancel()} style={{ height: 40, width: 110, borderRadius: "10px" }} variant="contained">Cancel</ColorButton>
                                <ColorButton id={`${id}SaveButton`} onClick={() => handleSave()} style={{ marginLeft: 6, height: 40, width: 110, borderRadius: "10px" }} variant="contained" color="primary">Save</ColorButton>
                            </Grid>}
                    </Grid>
                </Grid>


            </Grid>


        </Grid>
    )
}