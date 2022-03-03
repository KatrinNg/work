
import React, { useState, useEffect } from 'react';
import useStyles from './styles';

import { Typography, TableRow, TableBody, TableHead, TableContainer, Table, TableCell } from '@material-ui/core';
import moment from "moment"

const weekdayName = Object.freeze({
    MON: "Monday",
    TUE: "Tuesday",
    WED: "Wednesday",
    THU: "Thursday",
    FRI: "Friday",
    SAT: "Saturday",
    SUN: "Sunday"
})


export default function TherapecuticDetails({ selectedDate, groupDetails, patientList }) {

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div >

            <div style={{ display: "flex", background: "#f1f1f1", borderTopLeftRadius: "10px", borderTopRightRadius: "10px", marginTop: "5px", height: "40px", alignItems: "center", width: "607px" }}>
                <div style={{ width: "220px", borderRight: "1px solid #b9b9b9", paddingLeft: "25px", height: "40px", display: "flex", alignItems: "center" }}><Typography style={{ fontSize: "14px" }}>Selected Date</Typography></div>
                <div style={{ display: "flex" }}>
                    <div style={{ width: "240px", paddingLeft: "20px" }}>
                        <Typography style={{ fontSize: "14px" }}>Patient Details</Typography>
                    </div>
                    <div>
                        <Typography style={{ fontSize: "14px" }}>Case No.</Typography>
                    </div>
                </div>
            </div>

            <TableContainer style={{ maxHeight: "280px", minHeight: "280px", background: "#fff7e1", width: "607px", marginRight: "1px" }}>
                <Table stickyHeader aria-label="sticky table" style={{ display: "flex" }}>

                    <div style={{ width: "220px", borderRight: "1px solid #b9b9b9", minHeight: "280px" }}>
                        <Typography style={{ fontSize: "14px", fontWeight: 500, paddingLeft: "23px", marginBottom: "8px" }}></Typography>
                        {(() => {
                            let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

                            if (selectedDate.length > 0) {
                                const result = selectedDate.map(item => {

                                    return (<Typography style={{ fontSize: "14px", fontWeight: 500, paddingLeft: "23px", marginBottom: "8px" }}><div style={{ display: "flex" }}><div style={{ width: "90px" }}>{moment(item).format("YYYY/MM/DD")}</div>{days[new Date(item).getDay()]}</div></Typography>
                                    )
                                })
                                return result
                            }

                        })()}

                    </div>

                    <div style={{ display: "flex", width: "240px" }}>

                        <div >
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex", width: "220px" }}>
                                    <div style={{ width: "20px", display: "flex", alignItems: "start", justifyContent: "center" }}></div>
                                    <Typography style={{ fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}></Typography>
                                </div>
                                <Typography style={{ fontSize: "14px", fontWeight: 500, paddingLeft: "20px", marginBottom: "8px" }}></Typography>
                            </div>
                            {patientList && patientList?.map(item => {
                                return (
                                    <div style={{ display: "flex" }}>
                                        <div style={{ display: "flex", width: "220px" }}>
                                            <div style={{ width: "20px", display: "flex", alignItems: "start", justifyContent: "center" }}>{item.selective_join === "Y" && "*"}</div>
                                            <Typography style={{ fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>{item.patient_name}<div style={{ fontSize: "14px", color: "#858585" }}>{item.remarks && "(" + item.remarks + ")"}</div></Typography>
                                        </div>
                                        <Typography style={{ fontSize: "14px", fontWeight: 500, paddingLeft: "20px", marginBottom: "8px" }}>{item.case_no}</Typography>
                                    </div>
                                )
                            })}

                        </div>

                    </div>

                </Table>
            </TableContainer>

        </div>

        <div style={{ display: "flex", height: "210px", width: "600px" }}>
            <div style={{ paddingRight: "15px", width: "170px", paddingLeft: "25px", display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
                <Typography><b>Room</b></Typography>
                <Typography><b>Category</b></Typography>
                <Typography><b>Activity Name</b></Typography>
                <Typography><b>Date</b></Typography>
                <Typography><b>Time</b></Typography>
                <Typography><b>Remark</b></Typography>
            </div>
            <div style={{ width: "480px", display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><Typography>{groupDetails.room_id}</Typography><Typography style={{ fontSize: "12px", paddingRight: "0" }}>*&ensp;Selective Join</Typography></div>
                <Typography>{groupDetails.category}</Typography>
                <Typography>{groupDetails.group_name}</Typography>
                <Typography>{groupDetails.start_date} to {groupDetails.end_date}</Typography>
                <Typography>{groupDetails.start_time} to {groupDetails.end_time}</Typography>
                <Typography>{(() => {
                    if (groupDetails.recurrent === "Y" && groupDetails.recurrent_details !== "") {
                        if (groupDetails.recurrent_details.split(";").length === 1) {
                            return `Every ${weekdayName[groupDetails.recurrent_details.split(";")[0]]}`
                        } else {
                            const result = groupDetails.recurrent_details.split(";").map(item => weekdayName[item]).join(", ")
                            const lastIndexOfComma = result.lastIndexOf(", ")

                            return `Every ${result.substring(0, lastIndexOfComma) + " and" + result.substring(lastIndexOfComma + 1)}`
                        }
                    }
                    return <div style={{ height: "24px" }}> </div>
                })()}</Typography>

            </div>
        </div>
    </div>

}