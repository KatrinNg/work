import React, { Component, useRef } from 'react';
import { connect } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import Enum from '../../../../enums/enum';
import { PageStatus as pageStatusEnum, BookMeans } from '../../../../enums/appointment/booking/bookingEnum';
import { AppointmentUtil, CommonUtil, EnctrAndRmUtil } from '../../../../utilities';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import CIMSPdfViewer from '../../components/CIMSPdfViewer';
import DtsPrintAppointmentSlipDialog from './DtsPrintAppointmentSlipDialog';
import { print } from '../../../../utilities/printUtilities';

import { Grid, Typography } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import Input from '@material-ui/core/Input';

import Checkbox from '@material-ui/core/Checkbox';
import MaterialTable from 'material-table';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { updateState } from '../../../../store/actions/appointment/booking/bookingAction';
import logo from '../img/cims_title.png';
import _ from 'lodash';
import moment from 'moment';

import {
    setRedirect,
    dtsUpdateState,
    dtsGetAppointmentSlip,
    dtsOpenPreviewWindow
} from '../../../../store/actions/dts/patient/DtsPatientSummaryAction';
import {
    setSelectedAppointmntTask
} from '../../../../store/actions/dts/appointment/attendanceAction';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { isThisSecond } from 'date-fns';
import DtsButton from '../../components/DtsButton';
// const rows = this.getFutureAppointmentList(this.props.futureAppointmentList, this.props.selectedAppointmentTask);
// const headCells = [
//     { field: 'rmCd', title: 'Room No.\n 診室編號' },
//     { field: 'date', title: 'Appointment Date & Time \n 預約日期及時間(dd-mm-yyyy)' },
//     { field: 'encType', title: 'Encounter Type \n 約期類別' },
//     { field: 'other', title: '未決定' }
// ];

const styles = ({
    root: {
        fontSize: '18px',
        boxShadow: 'none !important',
        '& .MuiInputBase-input': {
            fontSize: '18px'
        },
        '& .MuiInput-underline:after': {
            borderBottom: '0px solid #cccccc'
        }
    },
    input: {
        fontSize: '18px',
        marginBottom: '0px',
        marginTop: '5px',
        width: '100%'
    },
    row: {
        width: 480
    },
    dialogPaper: {
        width: '1400px'
    },
    textPaper: {
        textAlign: 'end',
        boxShadow: 'none',
        fontSize: '12px'
    },
    paper: {
        textAlign: 'center',
        boxShadow: 'none',
        '&.MuiFilledInput-multiline': {
            padding: '0px'
        }
    },
    textarea: {
        width: '100%',
        padding: '0px',
        '& .MuiInputBase-input': {
            height: '70px',
            padding: '5px'
        }
    },
    radioLabel: {
        fontSize: '12px'
    },
    container: {
        padding: '10px 0px'
    },
    basicHeader: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        padding: '0px 8px!important',
        textAlign: 'center',
        fontSize: 18
    },
    basicCell: {
        fontFamily: 'Microsoft JhengHei, Calibri!important',
        borderStyle: 'none!important',
        borderBottom: '1px solid rgba(224, 224, 224, 1)!important',
        padding: '0px 8px!important',
        fontSize: 18
        // '&:last-child': {
        //     //padding: '8px',
        //     paddingRight: '8px'
        // }
    }
});

class DtsAppointmentSlipFormDialog extends Component {
    constructor(props) {
        super(props);
        const { classes } = props;
        let columnDefs = [
            {
                headerName: '',
                field: '',
                minWidth: 40,
                maxWidth: 40,
                headerCheckboxSelection: true,
                checkboxSelection: true,
                // checkboxSelection: params => (this.handleRowChecked(params.data.sequence)),
                // onSelectionChanged: params=> (this.handleRowChecked(params)),
                cellClass: classes.basicCell,
                filter: false,
                headerClass: classes.basicHeader
            },
            {
                headerName: 'Surgery',
                //valueGetter: (params) => (params.data.timeslots[0].roomId),
                valueGetter: (params) => (params.data.rmCd),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 120

            },
            {
                headerName: 'Appointment Date',
                //valueGetter: (params) => (moment(params.data.date).format(Enum.DATE_FORMAT_DMY) + '(' + moment(params.data.date).format('ddd') + ')'),
                valueGetter: (params) => (params.data.dateAndTime),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 280
            },
            {
                headerName: 'Enc. Type',
                // cellRenderer: 'overflowTypographyRenderer',
                valueGetter: (params) => (params.data.encType),
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 300
            },
            {
                headerName: 'Remarks',
                // cellRenderer: 'makeAppointmentIconRenderer',
                cellClass: classes.basicCell,
                filter: false,
                sortable: false,
                headerClass: classes.basicHeader,
                width: 300
            }
        ];

        this.state = {
            dtsPrintAppointmentSlipDialogOpen: false,
            printMode: 'normal',
            remarkResult: ['', '', '', ''],
            appointment: [],
            appointmentList: this.getFutureAppointmentList(this.props.futureAppointmentList),
            chosenAppointments: [],
            selectedAppointments: this.getFutureAppointmentList(this.props.futureAppointmentList),
            columnDefs: columnDefs,
            futureAppointmentList:[],
            rowData: [],
            copiedText: '',
            tempMemoValue: ''
        };

        this.refGrid = React.createRef();
    }

    componentDidMount() {
        console.log("dtsAppointmentSlipDialog");
        console.log(this.props.futureAppointmentList);
        this.setState({ 
            futureAppointmentList :this.props.futureAppointmentList, 
            rowData: this.props.futureAppointmentList ? this.getFutureAppointmentList(this.props.futureAppointmentList) : [] 
        });
        this.props.remarkTypeList && this.props.remarkTypeList.map(list => {
            this.setState({ ["Remark" + list.remarkTypeId]: false });
        });
        // if(this.props.futureAppointmentList === [] || this.props.futureAppointmentList === undefined){
        //     if(this.props.patient != null) {
        //         this.props.getPatientAppointment(
        //             {
        //                 patientKey: this.props.patient.patientKey,
        //                 appointmentDateFrom: dtsUtilities.formatDateParameter(moment().subtract(5, 'years').set('hour', 0).set('minute', 0)),
        //                 appointmentDateTo: dtsUtilities.formatDateParameter(moment().add(5, 'years').set('hour', 23).set('minute', 59)),
        //                 includeDeletedAppointments: 1
        //             }
        //             , callback
        //         );
        //         this.getFutureAppointmentList(this.props.patientAppointmentList);
        //     }
        // }
    }

    componentDidUpdate(prevProps) {
        // if ((this.props.futureAppointmentList !== []) && (this.props.futureAppointmentList !== this.state.futureAppointmentList)) {
        //     this.setState({ 
        //         rowData: this.props.futureAppointmentList ? this.getFutureAppointmentList(this.props.futureAppointmentList) : [] 
        //     });
        // }
    }
    getFutureAppointmentList = (futureAppointmentList) => {
        let filterAppointmentList = [];
        if (futureAppointmentList) {
            futureAppointmentList.forEach(list => {
                filterAppointmentList.push({
                    'rmCd': list.roomCode,
                    'dateAndTime': dtsUtilities.getFutureAppointmentListDateWithTimeWeekInChinese(list),
                    // '01-02-2021 08:45 AM/上午 Mon/星期一'
                    'encType': list.encounterTypeDescription || "",
                    'remark': '',
                    'tableData': { 'checked': true }
                });
            });
        }
        // console.log(filterAppointmentList);
        return filterAppointmentList;
    }

    // onGridReady = params => {
    //     this.gridApi = params.api;
    //     this.gridColumnApi = params.columnApi;
    // };

    handleClose = () => {
        this.handleChange({ 'memo': '', 'remarkId': '' });
        this.props.remarkTypeList.map(remarkType => {
            this.setState({ ["Remark" + remarkType.remarkTypeId]: false });
        });
        this.setState({ copiedText: '', tempMemoValue: '' });
        this.props.setSelectedAppointmntTask({ selectedAppointmentTask: null });
        this.props.closeConfirmDialog();
    };
    getClinic = () => {
        let clinic = { "clinicName": "", "clinicNameChi": "", "addrEng": "", "addrChi": "", "phoneNo": "/", "fax": "/", "emailAddr": "/" };
        if (this.props.selectedAppointmentTask != null && this.props.selectedAppointmentTask != undefined) {
            let temp = this.props.clinicList.find(item => item.siteId === this.props.selectedAppointmentTask.siteId);
            if (temp != undefined || temp != null) {
                clinic = temp;
                return clinic;
            }
        } else {
            return clinic;
        }
    }
    handlePreivewDtsAppointmentSlipClick = () => {
        const { patientInfo } = this.props;
        let clinic = this.getClinic();
        if (this.state.printMode == "normal") {
            this.props.dtsGetAppointmentSlip({
                address: " ",
                appointments: this.state.selectedAppointments,
                clinicAddress: (patientInfo && patientInfo.commLangCd == "T") ? clinic.addrChi : clinic.addrEng || " ",
                clinicName: (patientInfo && patientInfo.commLangCd == "T") ? clinic.clinicNameChi : clinic.clinicName || " ",
                fax: clinic.fax || " ",
                tel: clinic.phoneNo || " ",
                remarks: this.getRemark() || " ",
                patientKey: patientInfo.patientKey || " ",
                engSurname: patientInfo.engSurname || " ",
                engGivename: patientInfo.engGivename || " ",
                chiName: patientInfo.nameChi || " ",
                emailAddr: clinic.emailAddr || " "
            });
            this.handleOpenDtsPrintAppointmentSlipDialog();
        }
    }
    handleOpenDtsPrintAppointmentSlipDialog = () => {
        this.setState({ dtsPrintAppointmentSlipDialogOpen: true });
    };

    handleCloseDtsPrintAppointmentSlipDialog = () => {
        this.setState({ dtsPrintAppointmentSlipDialogOpen: false });
        this.props.dtsUpdateState({ openDtsPrintAppointmentSlipDialog: false, appointmentSlipData: null });
        this.handleClose();
    };

    handlePrintModeChange = (e) => {
        let tempMode = this.state.printMode;
        tempMode = e.target.value;
        this.setState({ printMode: tempMode });
    }
    handleRemarkChange = (event, idx) => {
        if (event.target.checked === true) {
            // let tempResult = this.state.remarkResult;
            let tempResult = [...this.state.remarkResult, event.target.id];
            let value = "";
            this.props.remarkTypeList && this.props.remarkTypeList.map(list => {
                if (list.remarkTypeId === idx) { value = list.remarkDesc; }
            });
            // if (idx === 0) { value = "閣下／貴子女於本診所的牙齒矯正治療排期將至，請依照以下約期前來本診所覆診。"; }
            // if (idx === 1) { value = "下次覆診時，病人需由父或母陪同。"; }
            // if (idx === 2) { value = "覆診時請攜回固定器以作檢查。"; }
            // if (idx === 3) { value = "覆診時請攜回所有矯齒裝置以作檢查。"; }
            tempResult[idx] = value;
            this.setState({
                remarkResult: tempResult,
                ["Remark" + idx]: event.target.checked
            });
        }
        if (event.target.checked === false) {
            let tempResult = this.state.remarkResult;
            tempResult[idx] = "";
            this.setState({
                remarkResult: tempResult,
                [event.target.name]: event.target.checked
            });
        }
    };

    handleChange = (obj) => {
        const { serviceCd, encounterTypes, clinicList } = this.props;
        let bookingData = _.cloneDeep(this.props.bookingData);
        bookingData = {
            ...bookingData,
            ...obj
        };
        const objKeys = Object.keys(obj);
        if (objKeys.includes('qtType')) {
            if (obj.qtType === 'W') {
                bookingData.appointmentDate = moment();
                bookingData.appointmentTime = moment();
                bookingData.elapsedPeriod = 1;
                bookingData.elapsedPeriodUnit = 'week';
                this.props.updateState({ pageStatus: pageStatusEnum.WALKIN });
                bookingData['caseTypeCd'] = '';
            }
            if (this.props.bookingData.qtType === 'W' && obj.qtType !== 'W') {
                bookingData.appointmentDate = null;
                bookingData.appointmentTime = null;
                if (bookingData.encounterTypeId) {
                    bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, bookingData.encounterTypeId);
                }
                this.props.updateState({ pageStatus: pageStatusEnum.VIEW });
            }
        }

        // if (objKeys.includes('sessId')) {
        //     if (obj.sessId === '*All') {
        //         bookingData.sessId = '';
        //     }
        // }

        if (objKeys.includes('siteId')) {
            bookingData[objKeys] = obj.siteId;
            bookingData.rmId = '';
            bookingData.rmCd = '';
            bookingData.subEncounterTypeCd = '';
            bookingData.encounterTypeId = '';
            bookingData.encounterTypeCd = '';
            bookingData.appointmentDate = moment();
            bookingData.appointmentTime = moment();
            bookingData.elapsedPeriod = '';
            bookingData.elapsedPeriodUnit = '';
            this.props.updateState({ bookingData });
            this.props.getEncounterTypeListBySite(serviceCd, obj.siteId);
            return;
        }


        // :. Refactoring User encounterTypeId
        if (objKeys.includes('encounterTypeId')) {
            let siteId = bookingData.siteId;
            let encounterTypeId = obj.encounterTypeId;
            const _encntrList = _.cloneDeep(bookingData.encounterTypeList);
            const _rooms = _.cloneDeep((bookingData.encounterTypeList.find(x => x.encntrTypeId === encounterTypeId) || {}).subEncounterTypeList || null);
            const defaultRoom = AppointmentUtil.getDefaultRoom({
                encntrId: encounterTypeId,
                rooms: _rooms,
                siteId: siteId
            });
            if (defaultRoom) {
                bookingData.rmId = defaultRoom.rmId;
                bookingData.rmCd = defaultRoom.subEncounterTypeCd;
                bookingData.subEncounterTypeCd = defaultRoom.subEncounterTypeCd;
            } else {
                bookingData.rmId = '';
                bookingData.subEncounterTypeCd = '';
                bookingData.rmCd = '';
            }
            if (this.props.bookingData.qtType !== 'W') {
                bookingData = AppointmentUtil.getElapsedPeriodByEncounterTypeSetting(bookingData, encounterTypeId, _encntrList);
            }
        }

        // if (objKeys.includes('rmId')) {
        //     let enctSelected = bookingData.encounterTypeList.find(item => item.encntrTypeId === bookingData.encounterTypeId);
        //     let rmSelected = enctSelected.subEncounterTypeList.find(item => item.rmId === obj.rmId);
        //     bookingData.subEncounterTypeCd = rmSelected.subEncounterTypeCd;
        //     bookingData.rmCd = rmSelected.rmCd;
        // }

        if (objKeys.includes('appointmentDate') && obj.appointmentDate) {
            bookingData['elapsedPeriod'] = '';
            bookingData['elapsedPeriodUnit'] = '';
            if (!bookingData['appointmentTime'] && moment(obj.appointmentDate).isValid()) {
                bookingData['appointmentTime'] = moment(obj.appointmentDate).set({ hours: 0, minute: 0, second: 0 });
            }
        }

        // if (objKeys.includes('appointmentTime') && obj.appointmentTime) {
        //     bookingData['elapsedPeriod'] = '';
        //     bookingData['elapsedPeriodUnit'] = '';
        // }

        // if (objKeys.includes('elapsedPeriod') && obj.elapsedPeriod) {
        //     bookingData['appointmentDate'] = null;
        //     bookingData['appointmentTime'] = null;
        // }

        // if (objKeys.includes('elapsedPeriodUnit') && obj.elapsedPeriodUnit && !bookingData['elapsedPeriod']) {
        //     bookingData['elapsedPeriodUnit'] = '';
        // }
        // if (objKeys.includes('isNep')) {
        //     if (!obj.isNep) {
        //         bookingData['nepRemark'] = '';
        //     }
        // }

        this.props.updateState({ bookingData });
    }

    getRemark = () => {
        // let tempRemarkResult = this.state.remarkResult;
        let tempRemarkResult = this.state.tempMemoValue;
        // for (let i = 0; i < tempRemarkResult.length; i++) {
        //     if (tempRemarkResult[i] === "") {
        //         tempRemarkResult.splice(i, 1);
        //     }
        // }
        // let remark = tempRemarkResult.toString();
        // remark = remark.split(',').join('\n');
        return tempRemarkResult;
    }
    copyTextToClipboard = () => {
        let text = this.props.bookingData;
        this.setState({ copiedText: text.memo, tempMemoValue: text.memo });
    }
    pasteTextFromClipboard =(event, rowData) => {
        let index = rowData.tableData.id;
        let newData = this.state.appointmentList;
        rowData.remark = this.state.copiedText;
        newData[index] = rowData;
        if (rowData.tableData.checked === true){
            this.setState({selectedAppointments: newData});
        }
        this.setState({appointmentList: newData});
    }
    clearTextOnClipboard=()=>{
        this.setState({ copiedText: '' });
        this.handleChange({ 'memo': '', 'remarkId': '' });
        this.props.remarkTypeList.map(remarkType => {
            this.setState({ ["Remark" + remarkType.remarkTypeId]: false });
        });
    }

    generatePatientAppointmentSlip = (classes, clinic, address, patientInfo, action, appointmentId) => {
        // const { classes } = this.props;
        const { columnDefs, remarkType } = this.state;
        const { bookingData, remarkCodeList, remarkTypeList } = this.props;
        let data = this.state.appointmentList;
        return (
            <>
                <Grid container
                    className={classes.root}
                    spacing={0}
                    direction="row"
                    justify="center"
                    alignItems="center"
                >
                    <Grid item xs={4}><Paper className={classes.paper}></Paper></Grid>
                    <Grid item xs={4}>
                        <Paper className={classes.paper}>
                            <h3 style={{ marginBottom: '0px' }}>RESTRICTED</h3>
                            <img src={logo} alt="Logo" style={{ height: '90px' }} />
                            <p style={{ margin: '0px' }}><u>Dental Service - 牙科服務</u></p>
                            <p style={{ margin: '5px', fontSize: '18px' }}><b><u>Dental Appointment(s) 牙科約期</u></b></p>
                        </Paper>
                    </Grid>
                    <Grid item xs={4}><Paper className={classes.paper}>
                        {/* <RadioGroup
                            row aria-label="position"
                            name="normalPrint"
                            onChange={e => this.handlePrintModeChange(e)}
                            defaultValue="normal"
                            value={this.state.printMode}
                        >
                            <FormControlLabel value="normal"
                                control={
                                    <Radio
                                        color="primary"
                                        style={{ padding: '2px' }}
                                    />
                                }
                                label="Normal Print"
                                classes={{ label: classes.radioLabel }}
                            />
                            <FormControlLabel value="letter"
                                control={
                                    <Radio
                                        color="primary"
                                        style={{ padding: '2px' }}
                                    />
                                }
                                label="Print with Patient Address"
                                classes={{ label: classes.radioLabel }}
                            />
                        </RadioGroup> */}
                    </Paper></Grid>
                    <Grid item xs={12}><Paper className={classes.paper}>{address}</Paper></Grid>
                    <Grid item xs={1}><Paper className={classes.textPaper}><p>Name:</p></Paper></Grid>
                    <Grid item xs={7}>
                        <Paper className={classes.paper}>
                            <Input className={classes.input} value={patientInfo.engSurname + " " + patientInfo.engGivename || " "} />
                        </Paper>
                    </Grid>
                    <Grid item xs={1}><Paper className={classes.textPaper}><p>姓名:</p></Paper></Grid>
                    <Grid item xs={3}>
                        <Paper className={classes.paper}>
                            <Input className={classes.input} value={patientInfo.nameChi || " "} />
                        </Paper>
                    </Grid>
                    <Grid item xs={1}><Paper className={classes.textPaper}><p>診所名稱:<br />Clinic Name:</p></Paper></Grid>
                    <Grid item xs={11}>
                        <Paper className={classes.paper}>
                            <Input
                                className={classes.input}
                                value={(patientInfo && patientInfo.commLangCd == "T") ? clinic.clinicNameChi : clinic.clinicName}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={1}><Paper className={classes.textPaper}><p>診所地址:<br />Clinic Address:</p></Paper></Grid>
                    <Grid item xs={11}>
                        <Paper className={classes.paper}>
                            <Input
                                className={classes.input}
                                value={(patientInfo && patientInfo.commLangCd == "T") ? clinic.addrChi : clinic.addrEng}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={1}><Paper className={classes.textPaper}><p>電話:<br />Tel:</p></Paper></Grid>
                    <Grid item xs={3}>
                        <Paper className={classes.paper}>
                            <Input className={classes.input} value={clinic && clinic.phoneNo ? clinic.phoneNo : " "} />
                        </Paper>
                    </Grid>
                    <Grid item xs={1}><Paper className={classes.textPaper}><p>傳真:<br />Fax:</p></Paper></Grid>
                    <Grid item xs={3}>
                        <Paper className={classes.paper}>
                            <Input className={classes.input} value={clinic && clinic.fax ? clinic.fax : " "} />
                        </Paper>
                    </Grid>
                    <Grid item xs={1}><Paper className={classes.textPaper}><p>電郵:<br />Email:</p></Paper></Grid>
                    <Grid item xs={3}>
                        <Paper className={classes.paper}>
                            <Input className={classes.input} value={clinic && clinic.emailAddr ? clinic.emailAddr : " "} />
                        </Paper>
                    </Grid>
                    <Grid item xs={1}>
                        <Paper className={classes.textPaper}>
                            <p>Remarks:</p>
                            <DtsButton className={classes.searchBoxBtn} onClick={this.copyTextToClipboard}>Copy</DtsButton>
                        </Paper>
                    </Grid>
                    {/* <Grid item xs={11}> */}
                    {/* <SelectFieldValidator
                            id={'booking_select_appointment_booking_remarkCode'}
                            value={bookingData.remarkId}
                            options={remarkTypeList && remarkTypeList.map(item => (
                                { value: item.remarkTypeId, label: item.remarkDesc }
                            ))}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: 'Remark Template'
                            }}
                            addNullOption
                            onChange={e => {
                                console.log("========onchange value======");
                                console.log(e.value);
                                if (e.value) {
                                    let remarkDto = remarkTypeList.find(item => item.remarkTypeId === e.value);
                                    console.log(remarkDto);
                                    console.log(bookingData);
                                    let _memo = bookingData.memo;
                                    if ((bookingData.memo || '').split('\n').length < 4) {
                                        _memo = `${bookingData.memo ? bookingData.memo + '\n' : ''}${remarkDto && remarkDto.remarkDesc}`;
                                    }
                                    this.handleChange({ 'memo': _memo, 'remarkId': e.value });
                                } else {
                                    this.handleChange({ 'remarkId': e.value });
                                }
                            }}
                        />
                        </Grid>*/}
                    {/* <Grid item xs={1}><Paper className={classes.textPaper}><p>&nbsp;</p></Paper></Grid> */}
                    <Grid item xs={11}>
                        <CIMSMultiTextField
                            id={'booking_select_appointment_booking_memo'}
                            fullWidth
                            value={this.state.tempMemoValue}
                            inputProps={{
                                maxLength: 1000
                            }}
                            label="Memo"
                            // calActualLength
                            rows="7"
                            wordMaxWidth="1000"
                            onChange={e => this.setState({ tempMemoValue: e.target.value })}
                        />
                        {/* <Paper className={classes.paper}>
                                <TextField
                                    id="filled-multiline-static"
                                    className={classes.textarea}
                                    multiline
                                    rows={4}
                                    value={this.getRemark()}
                                    variant="filled"
                                />
                            </Paper> */}
                    </Grid>
                    <Grid item xs={1}>
                        <Paper className={classes.textPaper}>
                            <DtsButton className={classes.searchBoxBtn} onClick={this.clearTextOnClipboard}>Clear All</DtsButton>
                        </Paper>
                    </Grid>
                    <Grid item xs={11}>
                        <Paper className={classes.paper}>
                            <FormControl component="fieldset" className={classes.formControl}>
                                <FormGroup>
                                    
                                    {remarkTypeList.map(remarkType => (
                                        
                                        <FormControlLabel
                                            key={remarkType.remarkTypeId}
                                            value={remarkType.remarkTypeId}
                                            control={<Checkbox checked={this.state["Remark" + remarkType.remarkTypeId]}
                                                value={remarkType.remarkTypeId}
                                                // onChange={e => this.handleRemarkChange(e, remarkType.remarkTypeId)} 
                                                onChange={e => {
                                                    // console.log("========onchange value======");
                                                    // console.log(this.state["Remark" + remarkType.remarkTypeId]);
                                                    if (this.state["Remark" + remarkType.remarkTypeId] == false) {
                                                        let remarkDto = remarkTypeList.find(item => item.remarkTypeId === remarkType.remarkTypeId);
                                                        let _memo = bookingData.memo;
                                                        if ((bookingData.memo || '').split('\n').length < remarkTypeList.length) {
                                                            _memo = `${bookingData.memo ? bookingData.memo + '\n' : ''}${remarkDto && remarkDto.remarkDesc}`;
                                                        }
                                                        this.handleChange({ 'memo': _memo, 'remarkId': remarkDto.remarkTypeId });
                                                        this.setState({ ["Remark" + remarkType.remarkTypeId]: true , copiedText: _memo});
                                                    } else {
                                                        this.handleChange({ 'remarkId': remarkType.remarkTypeId });
                                                        this.setState({ ["Remark" + remarkType.remarkTypeId]: false });
                                                    }
                                                }}
                                                name={"Remark" + remarkType.remarkTypeId} />}
                                            label={remarkType.remarkDesc}
                                        />
                                    ))}
                                    
                                    {/* <FormControlLabel
                                        control={<Checkbox checked={this.state.firstRemark} onChange={e => this.handleRemarkChange(e, 0)} name="firstRemark" />}
                                        label="閣下／貴子女於本診所的牙齒矯正治療排期將至，請依照以下約期前來本診所覆診。"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={this.state.secondRemark} onChange={e => this.handleRemarkChange(e, 1)} name="secondRemark" />}
                                        label="下次覆診時，病人需由父或母陪同。"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={this.state.thirdRemark} onChange={e => this.handleRemarkChange(e, 2)} name="thirdRemark" />}
                                        label="覆診時請攜回固定器以作檢查。"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={this.state.forthRemark} onChange={e => this.handleRemarkChange(e, 3)} name="forthRemark" />}
                                        label="覆診時請攜回所有矯齒裝置以作檢查。"
                                    /> */}
                                </FormGroup>
                            </FormControl>
                        </Paper>
                    </Grid>
                    {/* <Grid item container xs={12} id={'DtsDurationIconAgCell'}>
                            <CIMSDataGrid
                                ref={this.refGrid}
                                disableAutoSize
                                suppressGoToRow
                                suppressDisplayTotal
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    width: '100%',
                                    height: '35vh',
                                    display: 'block'
                                }}
                                gridOptions={{
                                    columnDefs: columnDefs,
                                    rowData: this.state.rowData,
                                    suppressRowClickSelection: true,
                                    rowSelection: 'multiple',
                                    //rowSelection: 'single',
                                    onGridReady: this.onGridReady,
                                    getRowHeight: () => 32,
                                    getRowNodeId: item => item.rmCd + item.dateAndTime + item.encType,
                                    onRowClicked: params => {
                                    },
                                    onRowDoubleClicked: params => {
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
                                    paginationPageSize: 28
                                }}
                            />
                        </Grid> */}
                    <Paper className={classes.paper}>
                        <MaterialTable
                            // tableRef={tableRef}
                            title="Table test"
                            columns={[
                                { width: 120, field: 'rmCd', title: 'Room No.' + '\n' + '診室編號', headerStyle: { fontSize: 18, whiteSpace:'break-spaces' }, cellStyle: { fontSize:16,whiteSpace:'break-spaces'} },
                                { width: 280, field: 'dateAndTime', title: 'Appointment Date & Time\n預約日期及時間', headerStyle: { fontSize: 18, whiteSpace:'break-spaces' }, cellStyle: { fontSize:16,whiteSpace:'nowrap'} },
                                { width: 280, field: 'encType', title: 'Encounter Type\n約期類別', headerStyle: { fontSize: 18, whiteSpace:'break-spaces' }, cellStyle: { fontSize:16,whiteSpace:'nowrap'} },
                                { width: 300, field: 'remark', title: 'Remark', headerStyle: { fontSize: 18, whiteSpace:'break-spaces' }, cellStyle: { fontSize:16,whiteSpace:'break-spaces'}},
                                { width: 60, field: 'Action', title: 'Action', headerStyle: { fontSize: 18, whiteSpace:'break-spaces' }, cellStyle: { fontSize:16,whiteSpace:'break-spaces'},
                                render: rowData=>{
                                    return(<div>
                                        <DtsButton onClick={(event) => this.pasteTextFromClipboard(event, rowData)} className={classes.searchBoxBtn}>
                                        Paste
                                        </DtsButton>
                                    </div>);
                            } }
                            ]}
                            // actions={[
                            //     {
                            //         icon: 'save',
                            //         tooltip: 'Save Remarks',
                            //         onClick: (event, rowData) => console.log("copied remarks: " + this.state.copiedText, "rowData: "+ rowData)
                            //     }
                            // ]}
                            // components={{
                            //     Action: props => (
                            //         <DtsButton onClick={(event) => props.action.onClick(event, props.data)} className={classes.searchBoxBtn}>
                            //             Paste
                            //         </DtsButton>
                            //     )
                            // }}
                            data={data}
                            // onRowClick={(event, rowData) => {
                            //     this.setState({
                            //         selected: [...this.state.selected, rowData.tableData.id]
                            //     });
                            // }}
                            onSelectionChange={data => {
                                this.setState({ selectedAppointments: data });
                            }}
                            options={{
                                selection: true,
                                toolbar: false,
                                pageSize: 10,
                                pagination: false,
                                paging: false,
                                // paginationType:'stepped',
                                headerStyle: {
                                    backgroundColor: '#ffffff',
                                    color: '#000000'
                                }
                            }}
                        />
                    </Paper>
                </Grid>
                {/* </Grid> */}
            </>
        );
    };

    render() {
        const id = 'PmiAppointmentSlip';
        const clinic = this.getClinic();
        const { classes, className, address, openConfirmDialog, patientInfo, action, appointmentId, appointmentSlipData, openDtsPrintAppointmentSlipDialog } = this.props;
        // console.log(this.state.firstRemark, this.state.secondRemark, this.state.thirdRemark, this.state.forthRemark);
        // console.log('render');
        // console.log(this.state);
        return (
            <>
                <CIMSPromptDialog
                    open={openConfirmDialog}
                    // dialogContentProps={{ style: { width: 400 } }}
                    dialogTitle={'Print Appointment Slip'}
                    classes={{
                        paper: classes.dialogPaper
                    }}
                    dialogContentText={
                        <div style={{ maxHeight: '900px' }}>
                            <Paper className={classes.root + ' ' + className}>
                                <ValidatorForm ref="PmiAppointmentSlip" >
                                    {this.generatePatientAppointmentSlip(classes, clinic, address, patientInfo, action, appointmentId)}
                                </ValidatorForm>
                            </Paper>
                        </div>
                    }
                    buttonConfig={[
                        {
                            id: `${id}_previewButton`,
                            name: 'Print',
                            disabled: this.state.selectedAppointments == null || this.state.selectedAppointments == [],
                            onClick: () => {
                                this.handlePreivewDtsAppointmentSlipClick();
                            }
                        },
                        {
                            id: `${id}_closeButton`,
                            name: 'Cancel',
                            onClick: () => {
                                this.handleClose();
                            }
                        }
                    ]}
                />
                {this.state.dtsPrintAppointmentSlipDialogOpen && <DtsPrintAppointmentSlipDialog
                    openConfirmDialog={this.state.dtsPrintAppointmentSlipDialogOpen}
                    closeConfirmDialog={this.handleCloseDtsPrintAppointmentSlipDialog}
                    closeParentDialog={this.handleClose}
                    appointmentSlipData={appointmentSlipData}
                />}
            </>
        );
    }
}
function mapStateToProps(state) {
    return {
        patientInfo: state.patient.patientInfo,
        action: state.dtsPatientSummary.redirect.action,
        appointmentId: state.dtsPatientSummary.redirect.appointmentId,
        selectedAppointmentTask: state.dtsAppointmentAttendance.selectedAppointmentTask,
        selectedRoom: state.dtsAppointmentAttendance.selectedRoom,
        clinicList: state.common.clinicList,
        appointmentSlipData: state.dtsPatientSummary.appointmentSlipData,
        remarkTypeList: state.dtsPreloadData.remarkType,
        bookingData: state.bookingInformation.bookingData,
        remarkCodeList: state.bookingInformation.remarkCodeList,
        serviceCd: state.login.service.serviceCd,
        encounterTypes: state.common.encounterTypes,
        patientAppointmentList: state.dtsAppointmentBooking.pageLevelState.patientAppointmentList
    };
}

const mapDispatchToProps = {
    dtsOpenPreviewWindow,
    dtsUpdateState,
    setSelectedAppointmntTask,
    dtsGetAppointmentSlip,
    updateState
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsAppointmentSlipFormDialog));
