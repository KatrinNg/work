import React from "react";
import ColorButton from 'components/ColorButton/ColorButton';
import { TextField, Box, Checkbox, Grid, Typography, InputAdornment, makeStyles } from '@material-ui/core';
import { ArrowRightAlt } from '@material-ui/icons';
import CommonSelect from "components/CommonSelect/CommonSelect"
import { ellipsis } from "utility/utils"

const useStyles = makeStyles(theme => (
    {
        footer: {
            display: "flex",
            flexDirection: "column",
        },
        pagination: {
            display: "flex",
            justifyContent: "space-between",
            height: "55px",
            background: "#ffffff",
            alignItems: "center",
            paddingRight: "25px",
            paddingLeft: "19px",
        }
    }))


export default function Footer(props) {

    const { pageNumbers, currentPage, setCurrentPage, pageSize, setPageSize, action, setAction, subAction, setSubAction, dropdownList, rows, setConfirm } = props

    const classes = useStyles()

    const isItemSelected = rows?.filter(item => item.check === true).length === 0 ? false : true

    function handleSubmit() {
        setConfirm({
            action: action,
            subAction: subAction
        })
    }

    return (
        <>
            <div className={classes.footer}>
                <div className={classes.pagination}>
                    <Box
                        sx={{
                            "& .MuiSelect-icon": {
                                display: "none"
                            },
                            "& .makeStyles-selectInput-16": {
                                paddingRight: "8px !important"
                            },
                        }}
                        style={{ display: "flex", alignItems: "center" }}>
                        <Typography style={{ fontize: "14px", fontWeight: 600 }}>
                            Show
                        </Typography>
                        <CommonSelect
                            id="batchCommonSelect"
                            placeholder={null}
                            style={{ marginLeft: "12px", marginRight: "8px", width: "73px", textAlign: "right" }}
                            value={pageSize}
                            items={[{ label: '10', value: '10' }, { label: '20', value: '20' }, { label: '30', value: '30' }, { label: '50', value: '50' }, { label: '100', value: '100' }]}
                            onChange={e => {
                                setPageSize(e.target.value)
                                setCurrentPage(1)
                            }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        borderRadius: "10px",
                                    },
                                },
                                anchorOrigin: {
                                    vertical: "top",
                                    horizontal: "center",
                                },
                                getContentAnchorEl: null,

                                MenuListProps: {
                                    style: {
                                        paddingBottom: 0,
                                    }
                                },
                                PopoverClasses: {
                                    style: {
                                        background: "blue",
                                        borderBottom: "1px solid black"
                                    }
                                },
                            }}

                        />
                        <Typography style={{ fontize: "14px", fontWeight: 600 }}>
                            entries
                        </Typography>
                    </Box>

                    <Grid style={{ display: "flex" }}>


                        <ColorButton
                            style={
                                currentPage === 1 || pageNumbers.length <= 1 ?
                                    { background: "#f2f2f2", color: "#b7b7b7", width: "65px", height: "30px", borderRadius: "15px", display: "flex", justifyContent: "center", alignItems: "center", marginRight: "6px", borderColor: "#f2f2f2" }
                                    :
                                    { background: "#3ab395", color: "#ffffff", width: "65px", height: "30px", borderRadius: "15px", display: "flex", justifyContent: "center", alignItems: "center", marginRight: "6px", borderColor: "#3ab395" }
                            }
                            variant="contained"
                            disabled={currentPage === 1 || pageNumbers.length <= 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            <ArrowRightAlt style={{ transform: "rotate(180deg)" }} />
                            <Typography style={{ fontSize: "14px" }}>Prev</Typography>
                        </ColorButton>

                        {pageNumbers?.length > 1 ? ellipsis(currentPage, pageNumbers.length).map((page, index) => {

                            if (page === "...") {
                                return <div>...</div>
                            } else {
                                return <ColorButton
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
                            disabled={currentPage === pageNumbers?.length || pageNumbers.length <= 1}
                            style={pageNumbers.length <= 1 || currentPage === pageNumbers?.length ? { background: "#f2f2f2", color: "#b7b7b7", borderColor: "#f2f2f2", width: "65px", height: "30px", borderRadius: "15px" } : { background: "#3ab395", borderColor: "#3ab395", color: "#ffffff", width: "65px", height: "30px", borderRadius: "15px", }}
                            variant="contained"
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            <Typography style={{ fontSize: "14px" }}>
                                Next</Typography><ArrowRightAlt />
                        </ColorButton>
                    </Grid>

                </div>
                <Grid container alignItems='center' justifyContent='space-between' style={{ background: "#d2f7ee", height: "100px" }}>
                    <Box sx={{
                        "& .MuiSvgIcon-root": {
                            transform: "scale(1.2,2)"
                        },
                        "& .MuiSelect-icon": {
                            top: "calc(50% - 13px)",
                            marginRight: "5px"
                        }
                    }} style={{ display: "flex", alignItems: "center", marginLeft: "19px" }}>
                        <Typography style={{ fontize: "14px", fontWeight: 600 }}>
                            Action
                        </Typography>
                        <CommonSelect
                            id="batchActionSelect"
                            placeholder={"-Select action-"}
                            style={{ marginLeft: "17px", marginRight: "26px", width: "250px", height: "40px" }}
                            items={[{ label: "到場見治療師", value: "到場見治療師" }, { label: "離場見治療師", value: "離場見治療師" }, { label: "到場、離場見治療師", value: "到場、離場見治療師" }, { label: "取消到場見治療師", value: "取消到場見治療師" }, { label: "取消離場見治療師", value: "取消離場見治療師" }, { label: "取消到場、離場見治療師", value: "取消到場、離場見治療師" }, { label: "Batch Change Gym Room", value: "Batch Change Gym Room" }, { label: "Batch Change Therapists", value: "Batch Change Therapists" }, { label: "In-active", value: "In-active" }]}
                            value={action}
                            onChange={e => { setAction(e.target.value); setSubAction("") }}
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
                        {(action === "Batch Change Gym Room" || action === "Batch Change Therapists") && <>
                            <Typography style={{ fontize: "14px", fontWeight: 600 }}>
                                {action === "Batch Change Gym Room" ? "To Room" : "To Therapist"}
                            </Typography>
                            <CommonSelect
                                id="batchActionSelect"
                                placeholder={"-Select-"}
                                style={{ marginLeft: "17px", marginRight: "26px", width: "151px", height: "40px" }}
                                items={(() => {
                                    if (action === "Batch Change Gym Room") {
                                        const result = dropdownList.room.filter(item => item.room_id !== "All")
                                        return result

                                    } else if (action === "Batch Change Therapists") {
                                        const result = dropdownList.therapist.filter(item => item.label !== "All Therapists")
                                        return result

                                    } else {
                                        return []
                                    }

                                })()}
                                value={subAction}
                                onChange={e => setSubAction(e.target.value)}
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
                                valueFiled={(()=>{
                                    if (action === "Batch Change Gym Room") {
                                        return "room_id"
                                    } else if(action === "Batch Change Therapists"){
                                        return "therapist_id"
                                    }
                                    return "value"
                                })()}
                                labelFiled={(()=>{
                                    if (action === "Batch Change Gym Room") {
                                        return "room_id"
                                    } else if(action === "Batch Change Therapists"){
                                         return "therapist_name"
                                    }
                                    return "label"
                                })()}

                            />
                        </>}
                    </Box>
                    <Grid>
                        <ColorButton style={{ height: 40, width: 110, borderRadius: "10px" }} variant="contained">Cancel</ColorButton>

                        <ColorButton onClick={handleSubmit} disabled={(() => {

                            if (!isItemSelected) {
                                return true
                            } else if ((action === "Batch Change Gym Room" || action === "Batch Change Therapists") && subAction === "" && isItemSelected) {
                                return true
                            } else if (action === "" && isItemSelected) {
                                return true
                            }

                            return false

                        })()}
                            style={{ marginRight: 24, marginLeft: 6, height: 40, width: 110, borderRadius: "10px" }} variant="contained" color="primary">Submit</ColorButton>
                    </Grid>
                </Grid>
            </div>
        </>
    )
}