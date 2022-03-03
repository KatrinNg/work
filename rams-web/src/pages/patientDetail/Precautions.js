import React, { useState, useEffect } from 'react';
import Widget from 'components/Widget/Widget';
import PopupDialog from 'components/Popup/PopupDialog'
import CustomTextField from 'components/Input/CustomTextField';
import { Grid, Typography, makeStyles } from '@material-ui/core';

import { useDispatch, useSelector } from 'react-redux';
import * as ActionTypes from 'redux/actionTypes';
import * as _ from 'lodash';

const useStyles = makeStyles((theme) => ({
    precautionIcon: {
        height: '120px',
        width: '120px'
    },
    precautionIconGrid: {
        marginBottom: "30px",
        marginTop: "3px",
        paddingLeft: "10px",
        paddingRight: "20px"
    },
    precautionIconRemark: {
        paddingLeft: "15px",
    },
    precautionInfoIcon: {
        height: '70px',
        width: '70px',
    },
    precautionRemark: {
        fontSize: "14px",
        fontWeight: "600",
    },
    iconHeaderBg: {
        background: '#f1f1f1',
        borderRadius: '10px',
        marginBottom: '20px',
        [theme.breakpoints.down('xs')]: {
            background: 'transparent',
        }
    },
    iconHeaderStyle: {
        width: '280px',
        [theme.breakpoints.down('xs')]: {
            background: '#f1f1f1',
            borderRadius: '8px'
        }
    },
    iconHeaderStyle2: {
        width: '280px',
        [theme.breakpoints.down('xs')]: {
            display: 'none'
        }
    },
    iconStyle: {
        width: '285px',
        height: "70px",
        border: '1px solid #bbbbbb',
        borderRadius: '10px',
        marginBottom: '10px',
        display: "flex",
        alignItems: "center",
        fontSize: "16px",
        fontWeight: "normal",
        "& .MuiGrid-spacing-xs-2": {
            "& .MuiGrid-item": {
                paddingLeft: "25px"
            }
        },

    },
}));


const Precautions = ({ title }) => {

    const { patientDetailsType: userRole, patientDetail, precautionList } = useSelector(state => state.patientDetail)
    const selectedPrecaution = patientDetail?.precautions?.split(";")
    const remark1 = patientDetail?.precautions_remarks_1
    const remark2 = patientDetail?.precautions_remarks_2

    const classes = useStyles();
    const dispatch = useDispatch();

    const [openDialog, setOpenDialog] = useState(false);
    const [popupDialogContent, setPopupDialogContent] = useState()
    const [iconContent, setIconContent] = useState()

    useEffect(() => {
        if (patientDetail) {

            const result = precautionList.map(item => {
                return { id: item.precaution_id, name: item.precaution_name, status: selectedPrecaution?.includes(item.precaution_id) ? <img className={classes.precautionIcon} src={
                    item.precaution_id.substring(0,2) === userRole?  require(`resource/Icon/${userRole.toUpperCase()}/${item.precaution_id.toLowerCase()}.jpg`) : null} /> : <img className={classes.precautionIcon}  src={
                        item.precaution_id.substring(0,2) === userRole?  require(`resource/Icon/${userRole.toUpperCase()}/off_${item.precaution_id.toLowerCase()}.jpg`) :null}/> }
            })

            setIconContent(result)
        } 
    }, [userRole, patientDetail])

    useEffect(() => {

        setPopupDialogContent(<>
            <Grid container className={classes.iconHeaderBg} spacing={2} justifyContent={"space-between"}>
                <Grid item className={classes.iconHeaderStyle}>
                    <Grid container spacing={2} justifyContent={"space-between"}>
                        <Grid item style={{ paddingLeft: '20px' }}>Precautions</Grid>
                        <Grid item style={{ paddingRight: '13px' }}>Icons</Grid>
                    </Grid>
                </Grid>

                <Grid item className={classes.iconHeaderStyle2}>
                    <Grid container spacing={2} justifyContent={"space-between"}>
                        <Grid item style={{ paddingLeft: '11px' }}>Precautions</Grid>
                        <Grid item style={{ paddingRight: '20px' }}>Icons</Grid>
                    </Grid>
                </Grid>

            </Grid>
            <Grid container spacing={3} justifyContent={"space-between"} >
                <Grid item md={6} style={{paddingLeft:"5px", paddingTop:0}}>
                    {precautionList && precautionList.map((item, index) => {
                        return index < 6 &&
                            <Grid item className={classes.iconStyle} key={`precautionIcon-${index}`}>
                                <Grid container spacing={2} alignItems={"center"} justifyContent={"space-between"}>
                                    <Grid item >{item.precaution_name}</Grid>
                                    <Grid item><img className={classes.precautionInfoIcon} src={item.precaution_id.substring(0,2) === userRole?  require(`resource/Icon/${userRole.toUpperCase()}/plain-icon/${item.precaution_id.toLowerCase()}.jpg`): null} /></Grid>
                              
                                </Grid>
                            </Grid>
                    }
                    )}
                </Grid>
                <Grid item md={6} style={{paddingLeft:"5px", paddingTop:0}}>
                    {precautionList && precautionList.map((item, index) => {
                        return index >= 6 &&
                            <Grid item className={classes.iconStyle} key={`precautionIcon-${index}`}>
                                <Grid container spacing={2} alignItems={"center"} justifyContent={"space-between"}>
                                    <Grid item >{item.precaution_name}</Grid>
                                    <Grid item><img className={classes.precautionInfoIcon} src={item.precaution_id.substring(0,2) === userRole? require(`resource/Icon/${userRole.toUpperCase()}/plain-icon/${item.precaution_id?.toLowerCase()}.jpg`): null} /></Grid>
                                 
                                </Grid>
                            </Grid>
                    }
                    )}
                </Grid>

            </Grid>

        </>)

    }, [userRole, precautionList])

    function toggleIcon(icon) {
        if (selectedPrecaution.includes(icon)) {
            const index = selectedPrecaution.findIndex(item => item === icon)

            selectedPrecaution.splice(index, 1)

        } else {
            if (selectedPrecaution[0] === '') {
                selectedPrecaution.splice(0, 1)
            }
            selectedPrecaution.push(icon)
        }

        const newPatientDetail = _.cloneDeep(patientDetail);

        newPatientDetail.precautions = selectedPrecaution.join(";")

        dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                patientDetail: newPatientDetail
            }
        })
    }

    function handleRemarkChange(value, field) {
        const newPatientDetail = _.cloneDeep(patientDetail);

        if (field === "remark1") newPatientDetail.precautions_remarks_1 = value;
        if (field === "remark2") newPatientDetail.precautions_remarks_2 = value;

        dispatch({
            type: ActionTypes.SET_PATIENT_DETAIL,
            payload: {
                patientDetail: newPatientDetail
            }
        })
    }


    return (<>
        <Widget title={title} openPopup={() => setOpenDialog(true)}>

            <PopupDialog
                id={'PrecautionPop'}
                open={openDialog}
                title={"List of Precautions"}
                content={popupDialogContent}
                topCloseBtn={true}
                closeAction={() => setOpenDialog(false)}
                maxWidth={"615px"}
            />

            <Grid container spacing={6} justifyContent="flex-start" className={classes.precautionIconGrid}>
                {iconContent && iconContent.map((icon, index) => <Grid item key={`iconContent-${index}`} md={2} ><div onClick={() => toggleIcon(icon.id)}>{icon.status}</div></Grid>)}
            </Grid>

            <Grid container spacing={2} alignItems="center" className={classes.precautionIconRemark}>
                <Grid item ><Typography className={classes.precautionRemark}>Remark 1&thinsp;</Typography></Grid>
                <Grid item  >

                    <CustomTextField value={remark1} onChange={e => handleRemarkChange(e.target.value, "remark1")} fullWidth placeholder="Remark 1" style={{ paddingRight: "5px", paddingLeft: "3px", width: "835px" }} />
                </Grid>

            </Grid>
            <Grid container spacing={2} alignItems="center" className={classes.precautionIconRemark}>
                <Grid item ><Typography className={classes.precautionRemark}>Remark 2</Typography></Grid>
                <Grid item >
                    <CustomTextField value={remark2} onChange={e => handleRemarkChange(e.target.value, "remark2")} fullWidth placeholder="Remark 2" style={{ paddingRight: "5px", paddingLeft: "3px", width: "835px" }} />
                </Grid>

            </Grid>

        </Widget>
    </>)
}

export default Precautions;