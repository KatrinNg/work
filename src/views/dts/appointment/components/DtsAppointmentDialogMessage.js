import React, { useRef, useState, useEffect, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import moment from 'moment';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Typography,
    Tabs,
    Tab,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@material-ui/core';
import {
    InfoOutlined,
    HelpOutlineOutlined,
    WarningRounded
} from '@material-ui/icons';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import * as DtsBookingEnum from '../../../../enums/dts/appointment/bookingEnum';
import { DTS_DATE_DISPLAY_FORMAT} from '../../../../constants/dts/DtsConstant';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { setAppointmentMessageObj } from '../../../../store/actions/dts/appointment/bookingAction';

const useStyles = makeStyles(theme => ({
    dialogTitle: {
        fontWeight: 'bold',
        fontSize: '1.5rem',
        textAlign: 'center'
    },
    contentWrapper: {
        padding: 24
    },
    tabContainer: {
        // width: '100%',
        //border: `1px solid ${theme.palette.grey[300]}`,
        padding: '8px 0px 0px'
    },
    detail_warp: {
        height: '100%',
        width: '100%'
    },
    tabActive: {
        color: theme.palette.white,
        backgroundColor: theme.palette.primary.main
    },
    tab: {
        color: theme.palette.black,
        backgroundColor: '#0579c842',
        borderTop: `1px solid ${theme.palette.grey[300]}`,
        borderRight: `1px solid ${theme.palette.grey[300]}`,
        borderLeft: `1px solid ${theme.palette.grey[300]}`
    },
    messageSection: {
        border: `1px solid ${theme.palette.grey[300]}`,
        minHeight: '300px'
    },
    nestedList: {
        paddingLeft: theme.spacing(4)
    },
    messageTitle: {
        fontWeight: 'bold',
        fontSize: '1.25rem'
    },
    listIndex:{
        width: theme.spacing(4),
        position:'relative'
    },
    listIndexText:{
        position: 'absolute',
        top: '0'
    },
    iconFont: {
        width: '1em',
        height: '1em',
        fontSize: '40pt',
        color: '#0579C8'
    },
    basicHeader: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        padding:'0px 8px!important'
    },
    basicCell: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        borderStyle: 'none!important',
        borderBottom: '1px solid rgba(224, 224, 224, 1)!important',
        padding:'0px 8px!important'

    }
}));


const DtsAppointmentDialogMessage = React.forwardRef((props, ref) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const messageObj = useSelector(state => state.dtsAppointmentBooking.appointmentMessageObj);

    const {
        messageLevel,
        outputVoList,
        confirmAction
    } = messageObj;
    const [tabValue, setTabValue] = useState(null);
    const tabsRef = useRef(null);
    const gridRef = useRef(null);
    let gridApi = null;
    let gridColumnApi = null;
    // const handleExited = () => {

    // };

    useEffect(() => {
        //console.log(tabsRef.current.children);
//        let appointmentEntrysHaveMessage = confirmAppointmentEntryVoList?.filter((appointmentEntry)=>(appointmentEntry.messageEntryVoList?.length > 0));
        let outputVosHaveMessage = outputVoList?.filter((outputVo)=>(outputVo.messageVo.messageEntryVoList?.length > 0));
        if (outputVosHaveMessage && outputVosHaveMessage.length > 0){
            setTabValue(outputVosHaveMessage[0]);
        }
    }, [outputVoList]);

    const renderMessageTab = (outputVo, index) => {
//        if (!appointmentEntry.messageEntryVoList?.length > 0){
        if (!outputVo.messageVo.messageEntryVoList?.length > 0){
                return <></>;
        }
        else {
            return <Tab id={'CIMS-Appointment-Message-Dialog-tab-' + index}
                className={(tabValue === outputVo) ? classes.tabActive : classes.tab}
                value={outputVo}
                label={
                        <Typography style={{ fontSize: 16, textTransform: 'none' }}>
{/*                            {moment(appointmentEntry.confirmAppointmentDto.apptDate).format('DD/MM/YYYY')}
*/}
                            {moment(outputVo.inputDto.apptDate).format('DD/MM/YYYY')}
                        </Typography>
                    }
                   />;
        }
    };

    const onGridReady = params => {
        gridApi = params.api;
        gridColumnApi = params.columnApi;
    };

    const displayRelatedAppointment = (messageObj) => {
        if (messageObj.relatedAppointmentList?.length > 0){
            let columnDefs = [
                {
                    headerName: 'Appt. Date',
                    valueGetter: (params) => moment(params.data.appointmentDateTime).format(DTS_DATE_DISPLAY_FORMAT),
                    //valueGetter: (params) => params.data.appointmentDateTime,
                    cellClass: classes.basicCell,
                    headerClass: classes.basicHeader,
                    width: 180
                },
                {
                    headerName: 'Start Time',
                    valueGetter: (params) => moment(params.data.appointmentDateTime).format('HH:mm'),
                    //valueGetter: (params) => params.data.appointmentDateTime,
                    cellClass: classes.basicCell,
                    headerClass: classes.basicHeader,
                    width: 180
                },
                {
                    headerName: 'Site',
                    valueGetter: (params) => params.data.siteCode,
                    cellClass: classes.basicCell,
                    headerClass: classes.basicHeader,
                    width: 180
                },
                {
                    headerName: 'Enc. Type',
                    valueGetter: (params) => params.data.encounterTypeDescription,
                    cellClass: classes.basicCell,
                    headerClass: classes.basicHeader,
                    width: 180
                },
                {
                    headerName: 'Appt. Type',
                    valueGetter: (params) => (dtsUtilities.getAppointmentTypeDescription(params.data)),
                    cellClass: classes.basicCell,
                    headerClass: classes.basicHeader,
                    width: 180
                }
            ];

            return <Grid item md={12}>
                        <CIMSDataGrid
                            ref={gridRef}
                            disableAutoSize
                            suppressGoToRow
                            suppressDisplayTotal
                            gridTheme="ag-theme-balham"
                            divStyle={{
                                width: '100%',
                                height: '300px',
                                display: 'block'
                            }}
                            gridOptions={{
                                columnDefs: columnDefs,
                                rowData: messageObj.relatedAppointmentList,
                                suppressRowClickSelection: false,
                                //rowSelection: 'multiple',
                                rowSelection: 'single',
                                onGridReady: onGridReady,
                                getRowHeight: () => 32,
                                getRowNodeId: item => item.appointmentId,
                                frameworkComponents: {
                                },
                                onRowClicked: params => {
                                    //this.props.setAppointment(params.data);
                                },
                                onRowDoubleClicked: params => {
                                    //this.handleRowClick(params, true);
                                },
                                postSort: rowNodes => {
                                    let rowNode = rowNodes[0];
                                    if (rowNode) {
                                        setTimeout(
                                            rowNode => {
                                                rowNode.gridApi.refreshCells();
                                            },
                                            100,
                                            rowNode
                                        );
                                    }
                                },
                                pagination: true,
                                paginationPageSize: 5
                            }}
                        />
                    </Grid>;
        }
        else {
            return null;
        }
    };

    const displayMessageSection = () => {
        if (tabValue){
//            const { messageEntryVoList } = tabValue;
            const { messageVo } = tabValue;
            let messageEntryVoList = messageVo.messageEntryVoList;
            if (messageEntryVoList?.length > 0) {
                let messageEntryGroup = _.groupBy(messageEntryVoList, (e) => (e.header));
                messageEntryGroup = Object.entries(messageEntryGroup);
                return (
                    <List
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                        className={classes.root}
                    >{messageEntryGroup.map((messageEntry, index) => {
                        let header = messageEntry[0];
                        let messageList = messageEntry[1];
                        return (
                            <>
                                <ListItem key={'CIMS-Appointment-Message-Group-Header_' + index}>
                                    <Typography className={classes.messageTitle}>{header}</Typography>
                                </ListItem>
                                <List component="div" disablePadding>
                                    {messageList.map((messageObj, index2) => {
                                        return <ListItem
                                            className={classes.nestedList}
                                            key={'CIMS-Appointment-Message-Group-Header_' + index + '_message_' + index2}
                                               >
                                            <ListItemIcon className={classes.listIndex}>
                                            <Typography className={classes.listIndexText}>{index2 + 1}</Typography>
                                            </ListItemIcon>
                                            <ListItemText primary={
                                                <Grid container>
                                                    <Grid item md={12}>
                                                        <div id={'CIMS-Message-Dialog-Description_' + index + '_message_' + index2} dangerouslySetInnerHTML={{__html:messageObj.description}}></div>
                                                    </Grid>
                                                    {displayRelatedAppointment(messageObj)}
                                                </Grid>
                                            }
                                            />
                                        </ListItem>;
                                    })}
                                </List>
                            </>
                        );
                    })}
                    </List>);
            }
        }

        return null;
    };

    const closeDialog = () => dispatch(setAppointmentMessageObj({}));
    const confirmAppointemnt = () => {
        dispatch(confirmAction);
        closeDialog();
    };

    return (
        <Dialog
            id="CIMS-Appointment-Message-Dialog"
            fullWidth
            open={messageObj.messageLevel}
            maxWidth="lg"
            //onExited={handleExited}
            disableEnforceFocus={false}
        >
            {/* title */}
            <DialogTitle
                disableTypography
                classes={{
                    root: classes.dialogTitle
                }}
            >
                {DtsBookingEnum.BookingMessageLevel.find(t => t.code === messageLevel)?.description}
            </DialogTitle>
            <Divider />
            {/* content */}
            <DialogContent
                classes={{
                    root: classes.contentWrapper
                }}
            >
                <div className={classes.detail_warp}>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="stretch"
                    >
                        <Grid item md={11} className={classes.tabContainer}>
                            <Grid container>
                                <Grid item md={12}>
                                {
                                    (() => {
                                        if (outputVoList && outputVoList.length >= 2) {
                                            return (
                                                <Tabs
                                                    value={tabValue}
                                                    onChange={(e, value) => { setTabValue(value); }}
                                                    indicatorColor={'primary'}
                                                    ref={tabsRef}
                                                >
                                                    {
                                                        outputVoList && outputVoList.map(renderMessageTab)
                                                    }
                                                </Tabs>
                                            );
                                        }
                                        else
                                        {
                                            return (
                                                <></>
                                            );
                                        }
                                    })()
                                }
                                </Grid>
                                <Grid item md={12} className={classes.messageSection}>
                                    {
                                        displayMessageSection()
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item md={1}>
                            <Typography style={{ textAlign: 'center',position:'relative',top:'50%',marginTop:'-30px' }} component="div">
                                {(() => {
                                    switch (messageLevel) {
                                        case DtsBookingEnum.BookingMessageLevelError:
                                            return (
                                                <WarningRounded className={classes.iconFont} />
                                            );
                                        case DtsBookingEnum.BookingMessageLevelConfirm:
                                            return (
                                                <HelpOutlineOutlined className={classes.iconFont} />
                                            );
                                        case DtsBookingEnum.BookingMessageLevelInfo:
                                            return (
                                                <InfoOutlined className={classes.iconFont} />
                                            );
                                        default:
                                            break;
                                    }
                                })()}
                            </Typography>
                        </Grid>
                    </Grid>
                </div>
            </DialogContent>
            <div>
                <Divider />
                <DialogActions>
                    <Typography component="div">
                        <Grid
                            container
                            direction="row"
                            justify="flex-end"
                            alignItems="center"
                        >
                            {
                                (() => {
                                    switch (messageLevel) {
                                        case DtsBookingEnum.BookingMessageLevelError:
                                            return (
                                                <>
                                                    <CIMSButton
                                                        id="CIMS-Appointment-Message-Dialog-Error-OK"
                                                        classes={{
                                                            label: classes.body2
                                                        }}
                                                        onClick={closeDialog}
                                                    >OK</CIMSButton>
                                                </>
                                            );
                                        case DtsBookingEnum.BookingMessageLevelConfirm:
                                            return (
                                                <>
                                                    <CIMSButton
                                                        id="CIMS-Appointment-Message-Dialog-Confirm-OK"
                                                        classes={{
                                                            label: classes.body2
                                                        }}
                                                        onClick={confirmAppointemnt}
                                                    >OK</CIMSButton>
                                                    <CIMSButton
                                                        id="CIMS-Appointment-Message-Dialog-Confirm-Cancel"
                                                        classes={{
                                                            label: classes.body2
                                                        }}
                                                        onClick={closeDialog}
                                                    >Cancel</CIMSButton>
                                                </>
                                            );
                                        case DtsBookingEnum.BookingMessageLevelInfo:
                                            return (
                                                <>
                                                    <CIMSButton
                                                        id="CIMS-Appointment-Message-Dialog-Info-OK"
                                                        classes={{
                                                            label: classes.body2
                                                        }}
                                                        onClick={closeDialog}
                                                    >OK</CIMSButton>
                                                </>
                                            );
                                        default:
                                            break;
                                    }
                                })()
                            }
                        </Grid>
                    </Typography>
                </DialogActions>
            </div>
        </Dialog>
    );
});

export default DtsAppointmentDialogMessage;