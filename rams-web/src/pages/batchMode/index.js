import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Box, Checkbox, Grid, Typography, InputAdornment, makeStyles } from '@material-ui/core';
import CheckBox from "components/CheckBox/CheckBox";
import * as _ from 'lodash';
import sortingIcon from 'resource/Icon/batchMode/sorting.png';
import greenBallIcon from 'resource/Icon/batchMode/green-ball-tick.png';
import { useDispatch, useSelector } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';
import Toolbar from 'pages/batchMode/toolbar'
import Footer from 'pages/batchMode/footer'

const useStyles = makeStyles(theme => (
    {
        containerDiv: {
            background: "#ffffff",
            height: "100%",
            display: "flex",

        },
        header: {
            paddingLeft: "18px",
            display: "flex",
            borderBottom: "solid 1px #dfdfdf",
            height: "35px",
            background: "#ffffff"
        },
        headerName: {
            color: "#7b0400",
            fontSize: "14px",
            fontWeight: 600
        },
        checkbox: {
            marginLeft: "4px",
            marginRight: "0px"
        },
        listContainer: {
            display: "flex",
            paddingLeft: "18px",
            display: "flex",
            flex: 1,
            height: "100%",
            position: "relative"
        },
        listContainerAbsolute: {

            overflowY: "auto",
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#ffffff"

        },
        listItem: {
            display: "flex",
            paddingLeft: "18px",
            alignItems: "center",
            height: "45px"
        },
        itemStyle: {
            fontSize: "14px"
        },
        itemCheckIn: {
            display: "flex",
            justifyContent: "center"
        },
        noData: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%"
        }


    }))
export default function Index() {
    const classes = useStyles()
    const [rows, setRows] = useState([])
    const [room, setRoom] = useState("All")
    const [ward, setWard] = useState("All")
    const [therapist, setTherapist] = useState("All Therapists")
    const [checkAll, setCheckAll] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [action, setAction] = useState("")
    const [subAction, setSubAction] = useState("")
    const [confirm, setConfirm] = useState("")
    const [sortClickNum, setSortClickNum] = useState(0)
    const [sorted, setSorted] = useState({
        case_no: { status: false, num: 0 },
        patient_name: { status: false, num: 0 },
        therapist_name: { status: false, num: 0 }
    })

    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [dropdownList, setDropdownList] = useState()
    const dispatch = useDispatch();


    const indexOfLastPost = currentPage * pageSize;
    const indexOfFirstPost = indexOfLastPost - pageSize
    const currentPosts = rows?.slice(indexOfFirstPost, indexOfLastPost)

    const pageNumbers = []

    for (let i = 1; i <= Math.ceil(rows?.length / pageSize); i++) {
        pageNumbers.push(i)
    }

    const { batchPatientList, batchRoomList, batchTherapistList } = useSelector(state => state.batchMode)

    useEffect(() => {
        dispatch({
            type: ActionTypes.FETCH_BATCHMODE_PATIENT_LIST,
            payload: {
                "login_id": "@CMSIT",
                "hosp_code": "TPH",
                "dept": "PT",
            },

        });
        dispatch({
            type: ActionTypes.FETCH_BATCHMODE_ROOM_LIST,
            payload: {
                "login_id": "@CMSIT",
                "dept": "PT",
                "hosp_code": "TPH",
            },
        })
        dispatch({
            type: ActionTypes.FETCH_BATCHMODE_THERAPIST_LIST,
            payload: {
                "login_id": "@CMSIT",
                "dept": "PT",
                "hosp_code": "TPH",
            },
        })
    }, [])

    useEffect(() => {

        if(batchPatientList.length !== 0 && batchTherapistList.length !==0){
            let newData = _.cloneDeep(batchPatientList)

                     newData.forEach(item=>{
                        batchTherapistList.forEach(item2=>{
                             if(item.therapist_id === item2.therapist_id){
                                   item.therapist_name = item2.therapist_name
                             }
                             })
                     })

                    newData = newData.filter(item => item.status.toUpperCase() === "ACTIVE")

                    if (room === "All") {
                        newData = newData.filter(item => item.case_no.length > 0)
                    } else {
                        newData = newData.filter(item => item.room_id === room)
                    }

                    if (ward === "All") {
                        newData = newData.filter(item => item.case_no.length > 0)
                    } else {
                        newData = newData.filter(item => item.ward === ward)
                    }

                    if (therapist === "All Therapists" || therapist === "") {
                        newData = newData.filter(item => item.case_no.length > 0)
                    } else {
                        newData = newData.filter(item => item.therapist_name === therapist)
                    }

                    if (searchValue !== "") {
                        newData = newData.filter(item => {
                            return item.case_no.toLowerCase().includes(searchValue.toLowerCase()) || item.patient_name.toLowerCase().includes(searchValue.toLowerCase()) || item.therapist_id.toLowerCase().includes(searchValue.toLowerCase()) || item.room_id.toLowerCase().includes(searchValue.toLowerCase()) || item.ward.toLowerCase().includes(searchValue.toLowerCase()) || item.bed.toLowerCase().includes(searchValue.toLowerCase())
                        })
                    } else {
                        newData = newData.filter(item => item.case_no.length > 0)
                    }

                    for (const item of Object.entries(sorted).sort(([, a], [, b]) => a.num - b.num)) {

                        if (sorted[item[0]][`status`] === false) {

                            newData = newData.sort((a, b) => {
                                return b[item[0]].localeCompare(a[item[0]], undefined, {
                                    numeric: true,
                                    sensitivity: 'base'
                                });
                            })
                        } else {
                            newData = newData.sort((a, b) => {

                                return a[item[0]].localeCompare(b[item[0]], undefined, {
                                    numeric: true,
                                    sensitivity: 'base'
                                });
                            })
                        }
                    }

                    setRows(newData)
        }

    }, [batchPatientList, batchTherapistList])

    useEffect(() => {
        const list = {
            room: [{ room_id: "All" }],
            ward: [{ label: "All", value: "All" }],
            therapist: [{ therapist_name: "All Therapists", therapist_id: "All Therapists" }]
        }

        if (batchRoomList.length > 0) {
            list.room = list.room.concat(batchRoomList.filter(item => item.status.toUpperCase() === "ACTIVE"))
        }

        if (batchPatientList.length > 0) {
            const wardSet = new Set()
            batchPatientList.forEach(item => {
                wardSet.add(item.ward)
            })

            list.ward = list.ward.concat(Array.from(wardSet).sort((a, b) => {
                return a.localeCompare(b, undefined, {
                    numeric: true,
                    sensitivity: 'base'
                })
            }).map(item => {
                return { label: item, value: item }
            })
            )
        }

        if(batchTherapistList.length > 0) {
            list.therapist = list.therapist.concat(batchTherapistList.sort((a,b)=>{
                return a.therapist_name.localeCompare(b.therapist_name, undefined, {
                                       numeric: true,
                                       sensitivity: 'base'
                                   });

            }))
        }

        setDropdownList(list)

    }, [batchRoomList, batchPatientList])


    useEffect(() => {

        if (checkAll) {

            setCheckAll(false)
        }

        let newData = _.cloneDeep(batchPatientList)

        newData.forEach(item=>{
               batchTherapistList.forEach(item2=>{
                    if(item.therapist_id === item2.therapist_id){
                            item.therapist_name = item2.therapist_name
                     }
               })
       })

        newData.forEach(item => {
            item.check = false
        })

        newData = newData.filter(item => item.status.toUpperCase() === "ACTIVE")


        if (room === "All") {

            newData = newData.filter(item => item.case_no?.length > 0)
        } else {

            newData = newData.filter(item => item.room_id === room)
        }


        if (ward === "All") {
            newData = newData.filter(item => item.case_no.length > 0)
        } else {

            newData = newData.filter(item => item.ward === ward)
        }


        if (therapist === "All Therapists" || therapist === "") {
            newData = newData.filter(item => item.case_no.length > 0)
        } else {

            newData = newData.filter(item => item.therapist_name === therapist)
        }


        if (searchValue !== "") {
            newData = newData.filter(item => {

                return item.case_no.toLowerCase().includes(searchValue.toLowerCase()) || item.patient_name.toLowerCase().includes(searchValue.toLowerCase()) || item.therapist_id.toLowerCase().includes(searchValue.toLowerCase()) || item.room_id.toLowerCase().includes(searchValue.toLowerCase()) || item.ward.toLowerCase().includes(searchValue.toLowerCase()) || item.bed.toLowerCase().includes(searchValue.toLowerCase())
            })
        }

        setRows(newData)
    }, [room, ward, therapist, searchValue, batchTherapistList])

    useEffect(() => {

        if (confirm) {

            const arr = []
            rows.forEach(item => {
                if (item.check === true) {
                    arr.push(item)
                }
            })

            const newData = _.cloneDeep(batchPatientList)

            let action = null

            switch (confirm?.action) {
                case "Batch Change Gym Room":
                    arr.forEach(a => {
                        a[`room_id`] = confirm.subAction
                        newData.forEach((b, index) => {
                            if (a.case_no === b.case_no) {

                                newData[index][`room_id`] = confirm.subAction

                            }
                        })
                    })
                    action = 7
                    break;
                case "Batch Change Therapists":
                    arr.forEach(a => {
                        a[`therapist_id`] = confirm.subAction
                        newData.forEach((b, index) => {
                            if (a.case_no === b.case_no) {
                                newData[index][`therapist_id`] = confirm.subAction
                            }
                        })
                    })
                    action = 8
                    break;
                case "到場見治療師":
                    arr.forEach(a => {
                        a[`subsequent_attend_login`] = a[`subsequent_attend_login`].substring(0, 3) + "Y"
                        a[`subsequent_attend_logout`] = a[`subsequent_attend_logout`].substring(0, 3) + "N"
                        newData.forEach((b, index) => {
                            if (a.case_no === b.case_no) {
                                newData[index][`subsequent_attend_login`] = newData[index][`subsequent_attend_login`].substring(0, 3) + "Y"
                                newData[index][`subsequent_attend_logout`] = newData[index][`subsequent_attend_logout`].substring(0, 3) + "N"
                            }
                        })
                    })
                    action = 1
                    break;
                case "離場見治療師":
                    arr.forEach(a => {
                        a[`subsequent_attend_login`] = a[`subsequent_attend_login`].substring(0, 3) + "N"
                        a[`subsequent_attend_logout`] = a[`subsequent_attend_logout`].substring(0, 3) + "Y"
                        newData.forEach((b, index) => {
                            if (a.case_no === b.case_no) {
                                newData[index][`subsequent_attend_login`] = newData[index][`subsequent_attend_login`].substring(0, 3) + "N"
                                newData[index][`subsequent_attend_logout`] = newData[index][`subsequent_attend_logout`].substring(0, 3) + "Y"
                            }
                        })
                    })
                    action = 2
                    break;
                case "到場、離場見治療師":
                    arr.forEach(a => {
                        a[`subsequent_attend_login`] = a[`subsequent_attend_login`].substring(0, 3) + "Y"
                        a[`subsequent_attend_logout`] = a[`subsequent_attend_logout`].substring(0, 3) + "Y"
                        newData.forEach((b, index) => {
                            if (a.case_no === b.case_no) {
                                newData[index][`subsequent_attend_login`] = newData[index][`subsequent_attend_login`].substring(0, 3) + "Y"
                                newData[index][`subsequent_attend_logout`] = newData[index][`subsequent_attend_logout`].substring(0, 3) + "Y"
                            }
                        })
                    })
                    action = 3
                    break;
                case "取消到場見治療師":
                    arr.forEach(a => {
                        a[`subsequent_attend_login`] = a[`subsequent_attend_login`].substring(0, 3) + "N"
                        newData.forEach((b, index) => {
                            if (a.case_no === b.case_no) {
                                newData[index][`subsequent_attend_login`] = newData[index][`subsequent_attend_login`].substring(0, 3) + "N"
                            }
                        })
                    })
                    action = 4
                    break;
                case "取消離場見治療師":
                    arr.forEach(a => {
                        a[`subsequent_attend_logout`] = a[`subsequent_attend_logout`].substring(0, 3) + "N"
                        newData.forEach((b, index) => {
                            if (a.case_no === b.case_no) {
                                newData[index][`subsequent_attend_logout`] = newData[index][`subsequent_attend_logout`].substring(0, 3) + "N"
                            }
                        })
                    })
                    action = 5
                    break;
                case "取消到場、離場見治療師":
                    arr.forEach(a => {
                        a[`subsequent_attend_login`] = a[`subsequent_attend_login`].substring(0, 3) + "N"
                        a[`subsequent_attend_logout`] = a[`subsequent_attend_logout`].substring(0, 3) + "N"
                        newData.forEach((b, index) => {
                            if (a.case_no === b.case_no) {
                                newData[index][`subsequent_attend_login`] = newData[index][`subsequent_attend_login`].substring(0, 3) + "N"
                                newData[index][`subsequent_attend_logout`] = newData[index][`subsequent_attend_logout`].substring(0, 3) + "N"
                            }
                        })
                    })
                    action = 6
                    break;
                case "In-active":
                    arr.forEach(a=>{
                        a[`status`] = "INACTIVE"
                        newData.forEach((b, index)=>{
                            if(a.case_no === b.case_no){
                                newData[index][`status`] = "INACTIVE"
                            }
                        })
                    })
                    action = 9
                    break;
            }

            dispatch({
                type: ActionTypes.SAVE_BATCHMODE_PATIENT_LIST,
                payload: {
                    "login_id": "@CMSIT",
                    "hosp_code": "TPH",
                    "dept":"PT",
                    "action": action,
                    "patient_requests": arr,
                    callback: ({data}) => {

                        if(data.status === "Bad Request"){
                             dispatch({
                                       type: ActionTypes.MESSAGE_OPEN_MSG,
                                       payload: {
                                       open: true,
                                        messageInfo: {
                                                    message: 'Error',
                                                    messageType: 'error',
                                                    btn2Label: 'OK',
                                                    },
                                                    }
                              });
                        }
                        if (data.response.status === "SUCCESS") {
                            newData.forEach(item => {
                                item.check = false
                            })
                            dispatch({
                                type: ActionTypes.SET_BATCHMODE_DATA,
                                payload: {
                                    batchPatientList: newData
                                }
                            });
                            setCheckAll(false)
                            setConfirm("")
                            dispatch({
                                type: ActionTypes.MESSAGE_OPEN_MSG,
                                payload: {
                                    open: true,
                                    messageInfo: {
                                        message: 'Batch Operation is submitted successfully.',
                                        messageType: 'success',
                                        btn2Label: 'OK',
                                    },
                                }
                            });

                        }
                    }
                }
            })

        }

    }, [confirm])

    function sortArray(field) {

        if (sorted[field][`status`] === true) {

            setRows([...rows].sort((a, b) => {

                return b[field].localeCompare(a[field], undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
            }))

        } else {

            setRows([...rows].sort((a, b) => {

                return a[field].localeCompare(b[field], undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
            }))
        }


        setSorted({ ...sorted, [`${field}`]: { status: !sorted[field][`status`], num: sortClickNum + 1 } });
        setSortClickNum(sortClickNum + 1)
    }


    function handleCheck(item) {

        if (item === "checkAll") {

            const newArray = [...rows]

            for (const item of newArray) {
                item[`check`] = !checkAll
            }

            setRows(newArray)

            setCheckAll(!checkAll)


        } else {

            const newArray = [...rows]

            for (const x of newArray) {
                if (x.case_no === item.case_no) {
                    item.check = !item.check
                }
            }

            setRows(newArray)


            if (checkAll === true) {
                setCheckAll(false)
            }

            const result = [...newArray].filter(item => item.check !== true)

            if (result.length === 0) {
                setCheckAll(true)
            }
        }
    }


    return (<>
        <Grid direction="column" className={classes.containerDiv} >
            <Toolbar
                room={room}
                setRoom={setRoom}
                ward={ward}
                setWard={setWard}
                dropdownList={dropdownList}
                therapist={therapist}
                setTherapist={setTherapist}
                setSearchValue={setSearchValue}
                setCurrentPage={setCurrentPage}
                setAction={setAction}
                setSubAction={setSubAction}
            />

            <Grid className={classes.header}>
                <CheckBox
                    checked={checkAll}
                    icon_size={20}
                    className={classes.checkbox}
                    disableRipple
                    disableFocusRipple
                    onClick={() => handleCheck("checkAll")}
                />
                <Grid style={{ width: "150px", display: "flex", alignItems: "center" }}><Typography className={classes.headerName}>HN Number</Typography> <img alt="sortingIcon" style={{ marginLeft: "7px", width: "7px", height: "13px" }} src={sortingIcon} onClick={() => sortArray("case_no")} /></Grid>
                <Grid style={{ width: "187px", display: "flex", alignItems: "center" }}><Typography className={classes.headerName}>Name</Typography><img alt="sortingIcon" style={{ marginLeft: "7px", width: "7px", height: "13px" }} src={sortingIcon} onClick={() => { sortArray("patient_name"); }} /></Grid>
                <Grid style={{ width: "198px", display: "flex", alignItems: "center" }}><Typography className={classes.headerName}>Therapist</Typography><img alt="sortingIcon" style={{ marginLeft: "7px", width: "7px", height: "13px" }} src={sortingIcon} onClick={() => { sortArray("therapist_name"); }} /></Grid>
                <Grid style={{ width: "62px", display: "flex", alignItems: "center" }}><Typography className={classes.headerName}>Ward</Typography></Grid>
                <Grid style={{ width: "73px", display: "flex", alignItems: "center" }}><Typography className={classes.headerName}>Bed</Typography></Grid>
                <Grid style={{ width: "107px", display: "flex", alignItems: "center" }}><Typography className={classes.headerName}>Gym Room</Typography></Grid>
                <Grid style={{ width: "92px", display: "flex", alignItems: "center" }}><Typography className={classes.headerName}>Check In</Typography></Grid>
                <Grid style={{ width: "92px", display: "flex", alignItems: "center" }}><Typography className={classes.headerName}>Check Out</Typography></Grid>
            </Grid>

            <Grid className={classes.listContainer}>
                <Grid className={classes.listContainerAbsolute}>
                    {currentPosts?.length > 0 && currentPosts.map((item, index) => {
                        batchTherapistList.forEach(item2=>{
                            if(item2.therapist_id === item.therapist_id){
                                item.therapist_name = item2.therapist_name
                            }
                        })
                        return (
                            <>
                                <Grid className={classes.listItem} style={item.check ? { background: "#e0f8f1" } : index % 2 === 0 ? { background: "#ffffff" } : { background: "#f7f7f7" }}>
                                    <CheckBox
                                        checked={item.check === true ? true : false}
                                        icon_size={20}
                                        className={classes.checkbox}
                                        disableRipple
                                        disableFocusRipple
                                        onClick={() => handleCheck(item)}
                                    />
                                    <Grid style={{ display: "flex", flexDirection: "column", width: "150px" }}><Typography className={classes.itemStyle}>{item.case_no}</Typography></Grid>
                                    <Grid style={{ display: "flex", flexDirection: "column", width: "187px" }}><Typography className={classes.itemStyle}>{item.patient_name}</Typography></Grid>
                                    <Grid style={{ display: "flex", flexDirection: "column", width: "198px" }}><Typography className={classes.itemStyle}>{item.therapist_name}</Typography></Grid>
                                    <Grid style={{ display: "flex", flexDirection: "column", width: "62px" }}><Typography className={classes.itemStyle}>{item.ward}</Typography></Grid>
                                    <Grid style={{ display: "flex", flexDirection: "column", width: "73px" }}><Typography className={classes.itemStyle}>{item.bed}</Typography></Grid>
                                    <Grid style={{ display: "flex", flexDirection: "column", width: "107px" }}><Typography className={classes.itemStyle}>{item.room_id}</Typography></Grid>
                                    <Grid style={{ display: "flex", flexDirection: "column", width: "59px" }}><Typography className={classes.itemCheckIn}>{item.subsequent_attend_login.substring(3, 4) === "Y" ? <img alt="greenBall" src={greenBallIcon} /> : ""}</Typography></Grid>
                                    <Grid style={{ display: "flex", flexDirection: "column", width: "59px", marginLeft: "45px" }}><Typography className={classes.itemCheckIn}>{item.subsequent_attend_logout.substring(3, 4) === "Y" ? <img alt="greenBall" src={greenBallIcon} /> : ""}</Typography></Grid>
                                </Grid>
                            </>)
                    })}
                    {currentPosts?.length === 0 && <div className={classes.noData}>No Record</div>}
                </Grid>
            </Grid>

            <Footer
                pageNumbers={pageNumbers}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                action={action}
                setAction={setAction}
                subAction={subAction}
                setSubAction={setSubAction}
                dropdownList={dropdownList}
                rows={rows}
                setConfirm={setConfirm}
            />
        </Grid>
    </>)
}