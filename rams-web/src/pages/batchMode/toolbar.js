import React, { useState } from 'react'
import { TextField, Box, Checkbox, Grid, Typography, InputAdornment, makeStyles } from '@material-ui/core';
import CommonSelect from "components/CommonSelect/CommonSelect"
import searchIcon from 'resource/Icon/search.svg';
import CustomTextField from 'components/Input/CustomTextField';
import ColorButton from 'components/ColorButton/ColorButton';
const useStyles = makeStyles(theme => (
    {
        toolbar: {
            background: "#eaeaea",
            height: "75px",
            padding: "18px 24px 17px 20px",
            display: "flex",
            alignItems: "center"
        }

    }))


export default function Toolbar(props) {
    const { room, setRoom, ward, setWard, dropdownList, therapist, setTherapist, setSearchValue, setCurrentPage, setAction, setSubAction } = props
    const classes = useStyles()

    const [value, setValue] = useState(null)


    function handleReset() {
        setRoom("All")
        setWard("All")
        setTherapist("")
        setSearchValue("")
        setValue("")
        setAction("")
        setSubAction("")
        setCurrentPage(1)
    }

    function handleSearch() {
        setSearchValue(value)
        setCurrentPage(1)
    }

    return (
        <Grid className={classes.toolbar}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    "& .MuiOutlinedInput-root": {
                        height: "40px",
                        borderRadius: "8px"
                    },
                    "& .MuiSvgIcon-root": {
                        transform: "scale(1.2,2)"
                    },
                    "& .MuiSelect-icon": {
                        top: "calc(50% - 13px)",
                        marginRight: "5px"
                    }
                }}
            >
                <Typography style={{ fontize: "14px", fontWeight: 600 }}>
                    Room
                </Typography>

                <CommonSelect
                    id="batchRoomSelectRoom"
                    placeholder={null}
                    style={{ marginLeft: "12px", marginRight: "8px", width: "85px", height: "40px" }}
                    items={dropdownList != null && dropdownList.room}   
                    value={room && room}
                    onChange={e => { setRoom(e.target.value); setCurrentPage(1) }}
                    MenuProps={{
                        anchorOrigin: {
                            vertical: "top",
                            horizontal: "left"
                        },
                        transformOrigin: {
                            vertical: "bottom",
                            horizontal: "left"
                        },
                        getContentAnchorEl: null

                    }}
                    valueFiled={"room_id"}
                    labelFiled={"room_id"}
                />
                <Typography style={{ fontize: "14px", fontWeight: 600 }}>
                    Ward
                </Typography>
                <CommonSelect
                    id="batchRoomSelect"
                    placeholder={null}
                    style={{ marginLeft: "12px", marginRight: "8px", width: "97px", height: "40px" }}
                    items={dropdownList != null && dropdownList.ward}
                    value={ward}
                    onChange={e => {setWard(e.target.value); setCurrentPage(1)}}
                    MenuProps={{
                        anchorOrigin: {
                            vertical: "top",
                            horizontal: "left"
                        },
                        transformOrigin: {
                            vertical: "bottom",
                            horizontal: "left"
                        },
                        getContentAnchorEl: null

                    }}
                />
                <Typography style={{ fontize: "14px", fontWeight: 600 }}>
                    Therapist
                </Typography>
                <CommonSelect
                    id="batchTherapistSelect"
                    placeholder={"-Select therapist-"}
                    style={{ marginLeft: "12px", marginRight: "8px", width: "260px", height: "40px" }}
                    items={dropdownList != null && dropdownList.therapist}
                    value={therapist}
                    valueFiled={"therapist_name"}
                    labelFiled={"therapist_name"}
                    onChange={e => {setTherapist(e.target.value); setCurrentPage(1)}}
                    MenuProps={{
                        anchorOrigin: {
                            vertical: "top",
                            horizontal: "left"
                        },
                        transformOrigin: {
                            vertical: "bottom",
                            horizontal: "left"
                        },
                        getContentAnchorEl: null
                    }}
                />

                <CustomTextField
                    id="batchModeSearch"
                    value={value}
                    onChange={e => {setValue(e.target.value)}}
                    placeholder={"Search"}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <img alt="searchIcon" src={searchIcon} />
                            </InputAdornment>
                        ),
                    }}
                    size="small"
                    style={{ width: "153px", background: "#ffffff", borderRadius: "8px", height: "40px" }}
                />
                <ColorButton style={{ borderRadius: "8px", width: "80px", border: "solid 1px #3ab395", backgroundColor: "#fff", color: "#3ab395", fontWeight: "600", marginLeft: "12px", marginRight: "5px" }} variant="contained" onClick={handleReset} >Reset</ColorButton>
                <ColorButton style={{ borderRadius: "8px", backgroundColor: "#3ab395", color: "#ffffff", borderColor: "#3ab395" }} variant="contained" onClick={handleSearch}>Search</ColorButton>
            </Box>

        </Grid>
    )
}