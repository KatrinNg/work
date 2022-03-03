import React, { useState, useEffect } from 'react';
import { Grid, Typography } from '@material-ui/core';
import ColorButton from 'components/ColorButton/ColorButton';
import combinedShape from 'resource/Icon/adminMode/combined-shape.png';
import pathIcon from 'resource/Icon/landing/path-copy-18.png';
import useStyles from './styles';
import clsx from 'clsx';
import ProtocolDetail from './protocolDetail';
import * as ActionTypes from 'redux/actionTypes';
import { useSelector, useDispatch } from 'react-redux';

export default function ProtocolOT() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const protocolList = useSelector((state) => state.adminmode.protocolOTData);
    const [protocolDetail, setProtocolDetail] = useState({ isShow: false, protocolName: '' });
    const [addProtocol, setAddProtocol] = useState({ isShow: false, protocolName: '' });
    const [title, setTitle] = useState('Protocol');

    const handleSwitchPage = (protocolName, index) => {
        setProtocolDetail({ ...protocolDetail, isShow: true, protocolName: protocolName, index: index });
        setTitle('Protocol Details');
    };

    useEffect(() => {
        dispatch({
            type: ActionTypes.FETCH_PROTOCOL_DATA,
            payload: {
                dept: 'OT',
                hosp_code:'TPH',
                login_id:'@CMSIT'
            },
        });

        dispatch({
            type:ActionTypes.FETCH_SIDELIST_DATA,
            payload:{
                dept: 'OT',
                hosp_code: 'TPH',
                login_id: '@CMSIT'
            }
        });
        dispatch({
            type:ActionTypes.FETCH_POSITION_LIST,
            payload:{
                dept:'OT',
                hosp_code:'TPH',
                login_id:'@CMSIT'
            }
        });

        dispatch({
            type:ActionTypes.FETCH_DURATION_LIST,
            payload:{
                dept:'OT',
                hosp_code:'TPH',
                login_id:'@CMSIT'
            }
        });

        dispatch({
            type:ActionTypes.FETCH_WEIGHT_BEARING_Status_1,
            payload:{
                dept:'OT',
                hosp_code:'TPH',
                login_id:'@CMSIT'
            }
        });

        dispatch({
            type:ActionTypes.FETCH_WEIGHT_BEARING_STATUS_2,
            payload:{
                dept:'OT',
                hosp_code:'TPH',
                login_id:'@CMSIT'
            }
        });

        dispatch({
            type:ActionTypes.FETCH_ASSISTIVE_DEVICE_1_LIST,
            payload:{
                dept:'OT',
                hosp_code:'TPH',
                login_id:'@CMSIT'
            }
        });

        dispatch({
            type:ActionTypes.FETCH_ASSISTIVE_DEVICE_2_LIST,
            payload:{
                dept:'OT',
                hosp_code:'TPH',
                login_id:'@CMSIT'
            }
        });

        dispatch({
            type: ActionTypes.FETCH_WALKING_AIDS_LIST,
            payload: {
                dept:'OT',
                hosp_code:'TPH',
                login_id:'@CMSIT'
            }
        })

        dispatch({
            type: ActionTypes.FETCH_ASSISTANCE_LIST,
            payload: {
                dept:'OT',
                hosp_code:'TPH',
                login_id:'@CMSIT'
            }
        })

    }, [dispatch]);

    return (
        <>
            <Grid className={classes.containerDiv}>
                <Grid className={classes.headerDiv}>
                    <Grid item className={classes.title}>
                        <Typography
                            style={{ fontSize: '14px', fontWeight: 600, paddingTop: '5px', paddingBottom: '5px' }}
                        >
                            {title}
                        </Typography>
                    </Grid>
                </Grid>
                {protocolDetail.isShow ? (
                    <ProtocolDetail
                        protocolName={protocolDetail.protocolName}
                        setTitle={setTitle}
                        hideProtocolDetail={setProtocolDetail}
                        protocolIndex={protocolDetail.index}
                    />
                ) : addProtocol.isShow ? (
                    <ProtocolDetail setTitle={setTitle} hideAddProtocol={setAddProtocol} />
                ) : (
                    <Grid className={classes.content}>
                        <Grid className={classes.contentTitle}>
                            <Typography className={classes.font}>Protocol list</Typography>
                            <ColorButton
                                id={'protocolAddButton'}
                                className={classes.addBtn}
                                onClick={() => {
                                    setAddProtocol({ ...addProtocol, isShow: true });
                                    setTitle('Protocol Details');
                                }}
                            >
                                <img src={combinedShape} style={{ marginRight: '8px' }} alt={'add'} />
                                <Typography style={{ color: '#39ad90', fontSize: '13px' }}>Add</Typography>
                            </ColorButton>
                        </Grid>
                        <Grid className={classes.listDiv}>
                            {protocolList &&
                                protocolList?.map((item, index) => (
                                    <Grid
                                        key={`protocolItemOT-${index}`}
                                        onClick={() => {
                                            handleSwitchPage(item.protocol_name, index);
                                        }}
                                        className={
                                            item.protocol_status === 'ACTIVE'
                                                ? clsx(classes.listItem)
                                                : clsx(classes.listItem, classes.listItemInactive)
                                        }
                                    >
                                        <Typography style={{ fontSize: '14px' }}>{item.protocol_name}</Typography>
                                        <img src={pathIcon} alt={''} />
                                    </Grid>
                                ))}
                        </Grid>
                    </Grid>
                )}
            </Grid>
        </>
    );
}
