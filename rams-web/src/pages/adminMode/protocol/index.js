import React, { useState, useEffect } from 'react';
import { Grid, Typography, makeStyles, Box, InputAdornment, Switch } from "@material-ui/core";
import ColorButton from 'components/ColorButton/ColorButton';
import combinedShape from 'resource/Icon/adminMode/combined-shape.png'
import pathIcon from 'resource/Icon/landing/path-copy-18.png'
import useStyles from './styles'
import clsx from 'clsx';
import ProtocolDetail from './protocolDetail';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom'
import * as ActionTypes from 'redux/actionTypes';

export default function Protocol({ setShowProtocolList }) {
    const classes = useStyles()
    const history = useHistory()
    const dispatch = useDispatch()
    const { protocolList } = useSelector(state => state.adminmode);
    const [protocolDetail, setProtocolDetail] = useState({ isShow: false });
    const [addProtocol, setAddProtocol] = useState({ isShow: false });
    const [title, setTitle] = useState("Protocol")


    if (protocolDetail.isShow === true) {
        localStorage.setItem("currentPage", "protocolDetail")
    } else {
        localStorage.setItem("currentPage", "")
    }

    function popStateListener(event) {
        if (localStorage.getItem("currentPage") === "protocolDetail") {
            setProtocolDetail({ isShow: false })
            window.location.href = window.origin + "/" + "#/adminMode/detail"
        } else {
            window.removeEventListener('popstate', popStateListener);
        }
    }

    window.addEventListener('popstate', popStateListener);

    useEffect(() => {
        dispatch({
            type: ActionTypes.FETCH_PROTOCOL_DATA,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_SIDELIST_DATA,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_ADMIN_CATEGORY_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_POSITION_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_SET_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_REPETITION_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_RESISTANCE_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_RESISTANCE_UNIT_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_WALKING_AIDS_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_ASSISTIVE_DEVICE_1_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_ASSISTIVE_DEVICE_2_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_WEIGHT_BEARING_Status_1,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_ASSISTANCE_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_DURATION_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_GROUPLIST_DATA,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })
        dispatch({
            type: ActionTypes.FETCH_REGION_LIST,
            payload: {
                login_id: '@CMSIT',
                hosp_code: 'TPH',
                dept: 'PT'
            }
        })


    }, [])

    const handleSwitchPage = (protocolName, index) => {

        setProtocolDetail({ isShow: true, protocolName: protocolName, index: index })

        setTitle("Protocol Details")

    }

    return (
        <>

            <Grid className={classes.containerDiv} >
                <Grid className={classes.headerDiv}>
                    <Grid item className={classes.title}>
                        <Typography style={{ fontSize: "14px", fontWeight: 600, paddingTop: "5px", paddingBottom: "5px" }}>
                            {title}
                        </Typography>
                    </Grid>

                </Grid>
                {protocolDetail.isShow ? <ProtocolDetail protocolName={protocolDetail.protocolName} protocolIndex={protocolDetail.index} setTitle={setTitle} hideProtocolDetail={setProtocolDetail} />
                    :
                    addProtocol.isShow ? <ProtocolDetail setTitle={setTitle} hideAddProtocol={setAddProtocol} /> :
                        <Grid className={classes.content}>
                            <Grid className={classes.contentTitle}>
                                <Typography className={classes.font}>Protocol list</Typography>
                                <ColorButton 
                                    id={'protocolAddButton'}
                                    className={classes.addBtn} 
                                    onClick={() => {
                                        setAddProtocol({ ...addProtocol, isShow: true })
                                        setTitle("Protocol Details")
                                    }}
                                >
                                    <img src={combinedShape} style={{ marginRight: "8px" }} alt='combinedShape'/>
                                    <Typography style={{ color: "#39ad90", fontSize: "13px" }}>Add</Typography>
                                </ColorButton>
                            </Grid>
                            <Grid className={classes.listDiv}>
                                {protocolList && protocolList?.map((item, index) => (<>
                                    <Grid
                                        key={`protocolItemPT-${index}`}
                                        onClick={() => {
                                         
                                            handleSwitchPage(item.protocol_name, index)
                                        }}
                                        className={item.protocol_status === "ACTIVE" ? clsx(classes.listItem) : clsx(classes.listItem, classes.listItemInactive)}
                                    >
                                        <Typography style={{ fontSize: "14px" }}>{item.protocol_name}</Typography><img src={pathIcon} />
                                    </Grid>
                                </>
                                ))}
                            </Grid>
                        </Grid>
                }

            </Grid>
        </>
    )
}