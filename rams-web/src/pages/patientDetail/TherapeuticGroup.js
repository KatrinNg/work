import React, { useState, useEffect } from 'react';
import Widget from 'components/Widget/Widget';
import { FormControlLabel, TextField, Typography, Grid, Paper, makeStyles } from '@material-ui/core';
import ColorButton from 'components/ColorButton/ColorButton';
import * as _ from 'lodash';
import CheckBox from "components/CheckBox/CheckBox";
import CustomTextField from 'components/Input/CustomTextField';
import calendarIcon from 'resource/Icon/calendar/calendar-details.png';
import PopupDialog from 'components/Popup/PopupDialog';
import roomIcon from 'resource/Icon/calendar/room.png';
import patientIcon from 'resource/Icon/calendar/patient.png';
import Calendar from './therapecutic_calerdar'
import Details from './therapecutic_details';
import { useDispatch, useSelector } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';
import moment from "moment"

const weekDayNum = Object.freeze({
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
    SUN: 0
})


const useStyles = makeStyles((theme) => ({
    therapeuticPopupActivetBtn: {
        width: "50%",
        height: "34px",
        margin: "0  2px 0",
        padding: "10px ",
        borderRadius: "8px",
        background: "#fff",
        border: "0px",
        boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.15)",
        color: "#282b2d",
        fontFamily: "SFProText",
        fontSize: "12px",
        fontWeight: 500,
    },
    therapeuticPopupInactivetBtn: {
        width: "50%",
        height: "34px",
        margin: "0  2px 0",
        padding: "10px",
        background: "#f9f9f9",
        fontFamily: "SFProText",
        fontSize: "12px",
        fontWeight: 500,
        border: "0",
        color: "#282b2d",
        display: "flex",
        justifyContent: "center"
    },
    therapeuticCategory: {
        background: "#f9f9f9",
        borderRadius: "8px",
        border: "solid 1px #dfdfdf",
        width: "300px",
        height: "45px",
        margin: "13px 13px 1px 14px",
        padding: "13px 15px 12px",
        fontSize: "14px",
        fontWeight: "500",
        color: "#3f3f3f",
        justifyContent: "flex-start",
    },
    therapeuticCategorySelected: {
        background: "#3ab395",
        borderRadius: "8px",
        border: "solid 1px #dfdfdf",
        width: "300px",
        height: "45px",
        margin: "13px 13px 1px 14px",
        padding: "13px 15px 12px",
        fontSize: "14px",
        fontWeight: "500",
        color: "#fff",
        justifyContent: "flex-start"
    },
    therapeuticTitle: {
        fontSize: "16px",
        fontWeight: "600",
        marginLeft: "14px",
    },
    therapeuticTitle2: {
        fontSize: "16px",
        fontWeight: "600",
    },
    groupDivStyle: {
        width: '300px',
        height: '80px',
        margin: '13px 7px 10px 14px',
        padding: '10px 19px 12px 10px',
        borderRadius: '8px',
        border: 'solid 1px #dfdfdf',
        background: '#f9f9f9',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: "center",
    },
    groupDivStyleSeleted: {
        width: '300px',
        height: '80px',
        margin: '13px 7px 10px 14px',
        padding: '10px 19px 12px 10px',
        borderRadius: '8px',
        border: 'solid 1px #dfdfdf',
        background: '#3ab395',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: "center",
        color: "#ffffff",
    },
    therapeuticDetailsBtn: {
        color: "#3ab395",
        border: "1px solid #3ab395",
        borderRadius: '8px',
        display: "flex",
        justifyContent: "space-between",
        height: "30px",
        width: "80px",
    },
    therapeuticSelectedListDiv: {
        width: '300px',
        margin: '13px 0px 8px',
        padding: '10px 12px',
        borderRadius: '8px',
        background: '#3ab395',
        display: "flex",
        alignItems: "center",
        paddingTop: "10px",
        paddingBottom: "6px"
    },
    therapeuticThirdGrid: {
        background: "#f1f1f1",
        marginTop: "-2px",
        borderLeft: "solid 1px #a6acb9",
        minHeight: '100%'
    },
    therapeuticSecondGrid: {
        paddingRight: "3px"
    },
    therapeuticFirstGrid: {
        marginBottom: "8px"
    },
    therapeuticBtnDiv: {
        width: "230px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px",
        "& .MuiFormControlLabel-root": {
            marginRight: "2px"
        }
    },
    therapeuticTextField: {
        background: "#2c967c",
        fontSize: "14px",
        width: "230px",
        height: "45px",
        border: 0,
        borderRadius: "8px",
        marginBottom: "10px",
        "& .MuiOutlinedInput-input": {
            fontFamily: "PingFangHK-regular",
            color: "#ffffff"
        },
        "& .MuiOutlinedInput-notchedOutline": {
            border: '0px'
        }

    },
}));

export default function TherapeuticGroup() {

    const { processedList, selectedTherapeuticGroup, therapeuticGroupList } = useSelector(state => {

        const { therapeuticGroupList, selectedTherapeuticGroup } = state.patientDetail

        const newTherapeuticGroupList = _.cloneDeep(therapeuticGroupList);

        if (typeof (selectedTherapeuticGroup) !== "string" || (Array.isArray(selectedTherapeuticGroup) === true && selectedTherapeuticGroup.length !== 0)) {
            for (const item in newTherapeuticGroupList) {

                selectedTherapeuticGroup?.forEach(item2 => {

                    if (item === item2.category) {

                        newTherapeuticGroupList[item][`group`].forEach((item3, index) => {

                            if (item3.group_name === item2.group_name) {

                                newTherapeuticGroupList[item][`group`][index][`selected`] = true
                                newTherapeuticGroupList[item][`group`][index][`remarks`] = item2.remarks
                                newTherapeuticGroupList[item][`group`][index][`selectiveJoin`] = item2.selective_join
                            }
                        })
                    }
                })

            }
        }

        const arr = []
        for (const item in newTherapeuticGroupList) {
            arr.push({ category: item, group: newTherapeuticGroupList[item].group, selected: newTherapeuticGroupList[item].selected })
        }

        return {
            processedList: arr,
            selectedTherapeuticGroup: selectedTherapeuticGroup,
            therapeuticGroupList: therapeuticGroupList
        }
    })

    const classes = useStyles();
    const dispatch = useDispatch();
    const [openDialog, setOpenDialog] = useState(false);
    const [popupTitle, setPopupTitle] = useState()
    const [popupContent, setPopupContent] = useState()
    const [contentToUseEffect, setContentToUseEffect] = useState()
    const [activePopupPage, setActivePopupPage] = useState({
        page1: true,
        page2: false
    })

    const handleCheck = (value, selectType, selected) => {

        const newList = _.cloneDeep(selectedTherapeuticGroup);

        if (selectType === "groupSelect") value = value
        if (selectType === "selectedList" || selectType === "selectiveJoin") value = value.group


        if (selectType === "groupSelect" || selectType === "selectedList") {
            if (selected === true) {
                for (let i = 0; i < newList.length; i++) {

                    if (newList[i].category === value.category && newList[i].group_name === value.group_name) {

                        newList.splice(i, 1)

                    }
                }

            } else if (selected === undefined || selected === false) {
                newList.push({
                    "selective_join": "N",
                    "group_name": value.group_name,
                    "dept": value.dept,
                    "hosp_code": value.hosp_code,
                    "category": value.category,
                    "remarks": value.remarks
                })
            }

        }


        if (selectType === "selectiveJoin") {

            if (selected === true) {
                for (let i = 0; i < newList.length; i++) {

                    if (newList[i].category === value.category && newList[i].group_name === value.group_name) {


                        newList[i].remarks = ""
                        newList[i].selective_join = "N"

                    }
                }
            } else {
                for (let i = 0; i < newList.length; i++) {

                    if (newList[i].category === value.category && newList[i].group_name === value.group_name) {

                        newList[i].selective_join = "Y"

                    }
                }
            }
        }

        dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                selectedTherapeuticGroup: newList
            }
        })
    }

    function handleCategoryClick(category) {
        let newList = _.cloneDeep(therapeuticGroupList);

        for (const item in newList) {

            newList[item][`selected`] = false

            if (item === category) {
                newList[item][`selected`] = true
            }
        }

        dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                therapeuticGroupList: newList
            }
        })
    }



    function handleInput(inputValue, value) {
        value = value.group

        const newList = _.cloneDeep(selectedTherapeuticGroup);

        for (let i = 0; i < newList.length; i++) {

            if (newList[i].category === value.category && newList[i].group_name === value.group_name) {

                newList[i].remarks = inputValue

            }
        }

        dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                selectedTherapeuticGroup: newList
            }
        })
    }

    useEffect(() => {

        setPopupContent(
            <>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: "390px", height: "40px", background: "#f9f9f9", border: "solid 1px #ebebeb", borderRadius: "8px", display: "flex", alignItems: "center" }}>
                        <button onClick={() => setActivePopupPage({ ...activePopupPage, page1: true, page2: false })} className={activePopupPage.page1 === true ? classes.therapeuticPopupActivetBtn : classes.therapeuticPopupInactivetBtn}>Date</button>
                        <button onClick={() => setActivePopupPage({ ...activePopupPage, page1: false, page2: true })} className={activePopupPage.page2 === true ? classes.therapeuticPopupActivetBtn : classes.therapeuticPopupInactivetBtn}><span>Patient Details</span></button>
                    </div>
                </div>
                <div>
                    {activePopupPage.page1 === true ? <Calendar events={contentToUseEffect?.events} /> : <Details selectedDate={contentToUseEffect?.selectedDate} groupDetails={contentToUseEffect?.groupDetails} patientList={contentToUseEffect?.patientList} />}
                </div>
            </>
        )

    }, [contentToUseEffect, activePopupPage])

    const getDateRange = function (startDate, endDate) {
        const arr = []
        for (let i = startDate; i <= endDate; i.setDate(i.getDate() + 1)) {
            arr.push(new Date(i))
        }
        return arr
    }

    function handlePopUp(item, type) {

        if (type === "groupSelect") {
            item = item
        }

        if (type === "selectedList") {
            item = item.group
        }

        let sendContent = { events: [], groupDetails: {}, patientList: [], selectedDate: [] }
        if (item.end_date && item.start_date) {
            const dateList = getDateRange(new Date(item.start_date), new Date(item.end_date)).map(item => {
                return moment(item.toISOString()).format("YYYY-MM-DD")
            })


            let selectedDate = []
            let events = []
            if (item.recurrent === "Y" && item.recurrent_details !== "") {
                const recurrentDates = item.recurrent_details.split(";").map(item => weekDayNum[item])

                dateList.forEach(dateItem => {

                    recurrentDates.forEach(dateItem2 => {

                        if (new Date(dateItem).getDay() === dateItem2) {

                            selectedDate.push(dateItem)
                        }
                    })

                })
                if (selectedDate.length > 0) {
                    events = selectedDate.map(item2 => {
                        return {
                            category: item.category,
                            color: "red",
                            title: item.group_name,
                            start: item2,
                            end: item2,
                            isRecurrent: true
                        }
                    })
                }
            } else {
                events = dateList.map(item2 => {
                    return {
                        category: item.category,
                        color: "red",
                        title: item.group_name,
                        start: item2,
                        end: item2
                    }
                })
                selectedDate = dateList
            }

            sendContent = { ...sendContent, events: events, selectedDate: selectedDate }

        }


        dispatch({
            type: ActionTypes.FETCH_THERAPEUTIC_GROUP_PATIENT_LIST,
            payload: {
                login_id: "@CMSIT",
                dept: item.dept,
                hosp_code: item.hosp_code,
                category: item.category,
                group_name: item.group_name,
                callback: (patientList) => {

                    if (typeof (patientList) === "string") {
                        patientList = []
                    }

                    setPopupTitle(
                        <div style={{ display: "flex", alignItems: "center", minWidth: "200px" }}>
                            <div style={{ width: "20px", height: "20px", background: "red", marginRight: "7px", borderRadius: "3px" }}></div>
                            {item.group_name}&nbsp;&nbsp;
                            {<img style={{ marginRight: "1px", height: "20px", width: "20px" }} src={roomIcon} />}{item.room_id === "" ? "-" : item.room_id}&nbsp;&nbsp;
                            {<img style={{ marginRight: "2px", height: "20px", width: "20px" }} src={patientIcon} />}{patientList.length}

                        </div>)

                    setContentToUseEffect({ ...sendContent, groupDetails: item, patientList: patientList })

                    setOpenDialog(true)
                }
            }
        })

    }

    return (

        <div>
            <PopupDialog
                id={'TherapeuticPop'}
                open={openDialog}
                title={popupTitle}
                content={popupContent}
                maxWidth={"642px"}
                topCloseBtn={true}
                closeAction={() => {
                    setOpenDialog(false)
                    setActivePopupPage({
                        page1: true,
                        page2: false
                    })
                }}
            />

            <Widget noBodyPadding style={{ paddingBottom: "0" }} title={'Therapeutic Group'}>
                <Grid container spacing={3} style={{ marginTop: "4px" }}>
                    <Grid item md={4} className={classes.therapeuticFirstGrid}>
                        <Typography className={classes.therapeuticTitle}>Category</Typography>

                        {processedList && processedList.map((item, index) => {
                            return <ColorButton
                                key={`therapeuticGroupList-${index}`}
                                style={item.selected === true ? { background: "#3ab395", color: "#fff", } : { background: "#f9f9f9", color: "#3f3f3f", borderColor: "#dfdfdf", }}
                                className={item.selected === true ? classes.therapeuticCategory : classes.therapeuticCategory}
                                variant="contained"
                                color="primary"
                                onClick={() => handleCategoryClick(item.category)}
                            >
                                {item.category} {`(${item.group.length})`}
                            </ColorButton>

                        })}

                    </Grid>
                    <Grid item md={4} className={classes.therapeuticSecondGrid}>

                        <Typography className={classes.therapeuticTitle2} style={{ marginLeft: "5px" }}>Group</Typography>

                        {(() => {
                            if (processedList) {
                                const list = processedList.filter(item => item.selected === true)

                                if (list.length === 0) {
                                    return (<div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "40%", marginBottom: "50%" }}><Typography style={{ color: "#c4c4c4", fontSize: "14px", fontFamily: "PingFangHK-regular" }}>Please select category first</Typography></div>)
                                } else {
                                    return (
                                        list?.[0]?.group?.map((item, index) => {
                                            return (<div key={`therapeuticSelectedGroup-${index}`} className={item.selected ? classes.groupDivStyleSeleted : classes.groupDivStyle} style={{ marginLeft: "5px" }} >
                                                <div><CheckBox icon_size={20} checked={item.selected ? true : false} onChange={() => handleCheck(item, "groupSelect", item.selected)} /></div>
                                                <div><div style={{ marginBottom: "8px" }}>{item.group_name}</div><ColorButton onClick={() => handlePopUp(item, "groupSelect")} style={{ color: "#3ab395" }} className={classes.therapeuticDetailsBtn}> <img src={calendarIcon} /> Details</ColorButton></div>
                                            </div>)
                                        })
                                    )
                                }
                            }
                        })()}


                    </Grid>
                    <Grid item md={4} className={classes.therapeuticThirdGrid}>
                        <Typography className={classes.therapeuticTitle2}>Therapeutic Groups (Selected)</Typography>

                        {(() => {
                            const arrList = []

                            if (processedList) {
                                for (let i = 0; i < processedList.length; i++) {
                                    if (processedList[i].group.length > 0) {
                                        for (let a = 0; a < processedList[i].group.length; a++) {
                                            if (processedList[i].group[a].selected === true) {
                                                arrList.push({ category: processedList[i].category, group: processedList[i].group[a] })
                                            }
                                        }
                                    }
                                }
                            }

                            if (arrList.length === 0) {
                                return (<div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "40%", marginBottom: "50%" }}><Typography style={{ color: "#c4c4c4", fontSize: "14px", fontFamily: "PingFangHK-regular" }}><div style={{ display: "flex", justifyContent: "center" }}>No selected</div>therapeutic groups</Typography></div>)
                            } else {
                                return arrList.map((item, index) => {
                                    return (<div key={`therapeuticSeletcedList-${index}`} className={classes.therapeuticSelectedListDiv}>
                                        <div><CheckBox icon_size={20} checked={item.group.selected ? true : false} onChange={() => handleCheck(item, "selectedList", item.group.selected)} /></div>
                                        <div>
                                            <Typography style={{ color: "#ffffff", fontSize: "14px" }}>{item.category} -
                                                <div style={{ color: "#ffeb00", marginBottom: "3px" }}>{item.group.group_name}</div>
                                            </Typography>
                                            <div className={classes.therapeuticBtnDiv}>
                                                <ColorButton style={{ color: "#3ab395" }} onClick={() => handlePopUp(item, "selectedList")} className={classes.therapeuticDetailsBtn}><img src={calendarIcon} /> Details</ColorButton>

                                                <CheckBox icon_size={20} checked={item.group.selectiveJoin === "Y" ? true : false} label={<span style={{ color: "#ffffff", fontSize: "14px", fontFamily: "PingFangHK-Regular" }}>Selective Join</span>} onChange={() => handleCheck(item, "selectiveJoin", item.group.selectiveJoin === "Y")} />
                                            </div>

                                            {item.group.selectiveJoin === "Y" &&
                                                <CustomTextField
                                                    InputProps={{
                                                        className: classes.therapeuticTextField,
                                                    }}
                                                    onChange={e => handleInput(e.target.value, item)}
                                                    value={item.group.remarks}
                                                    fullWidth
                                                    placeholder="Remarks"

                                                />}

                                        </div>

                                    </div>)
                                })
                            }
                        })()}


                    </Grid>

                </Grid>
            </Widget>
        </div>
    )
}

