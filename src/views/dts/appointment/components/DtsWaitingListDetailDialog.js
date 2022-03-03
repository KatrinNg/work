import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
import {
    Grid,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Paper,
    Box,
    Card,
    IconButton,
    FormControlLabel,
    DialogContent,
    DialogActions
} from '@material-ui/core';
import {
    ExpandMore,
    Add,
    Remove
} from '@material-ui/icons';
import {
    CREATE_MODE,
    VIEW_MODE,
    UPDATE_MODE,
    DISCONTINUE_MODE
} from '../../../../constants/dts/appointment/DtsWaitingListConstant';
import {
    insertWaitingList,
    getRoomList,
    updateWaitingList,
    getWaitingList,
    resetAll
} from '../../../../store/actions/dts/appointment/waitingListAction';
import _ from 'lodash';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
// import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import DtsSelectFieldValidator from '../../components/DtsSelectFieldValidator';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import CIMSCheckBox from '../../../../components/CheckBox/CIMSCheckBox';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import DtsButton from '../../components/DtsButton';
import { DTS_DATE_DISPLAY_FORMAT } from '../../../../constants/dts/DtsConstant';

const styles = {
    root: {
        //width: '1400px'
        '& .MuiOutlinedInput-root .Mui-disabled, .MuiInputBase-root .Mui-disabled':{
            backgroundColor: '#ccc'
        }
    },

    paperColumn:{
        maxWidth: '80%',
        minWidth: '400px',
        overflowY: 'unset',
        borderRadius: '16px'
    },
    colTitle:{
        textAlign: 'right',
        borderStyle: 'none',
        fontWeight: 'bold',
        padding:'10px',
        fontSize:'14px'
        // display: 'flex',
        // alignItems: 'center',
        // justifyContent: 'center'
    },
    colDetailLabel: {
        textAlign: 'left',
        padding: '10px 10px 10px 0px',
        '& .Mui-disabled':{
            backgroundColor: 'rgb(216 216 216)'
        }
    },
    divRoot:{
        flexGrow: 1,
        overflow: 'auto',
        height: '750px'
    },
    gridContainer:{
        display: 'flex',
        width:'95%',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    funcButton:{
        color:'#7b7bff',
        cursor:'pointer',
        transform: 'scale(1.3)'
    },
    funcButtonDim:{
        color:'#ccc!important'
    },
    funcIcon:{
        display:'inline'
        //marginRight: '5px'
    },
    // funcIcon:{
    //     display:'inline-block',
    //     marginRight: '15px'
    // },
    buttonSave:{
        float: 'right'
    },
    dateField:{
        '& .MuiInputBase-root .Mui-disabled':{
            backgroundColor: 'rgb(216 216 216)'
        }
    }
};

class DtsWaitingListDetailDialog extends Component {
    constructor(props){
        super(props);
        const { classes } = props;
        let columnDefs = [
            {
                headerName: 'Treatment Type',
                valueGetter: (params) => (params.data.treatmentTypeId),
                //valueGetter: 1,
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 260
            },
            {
                headerName: 'Reference Date',
                valueGetter: (params) => (params.data.referenceDate != null ? moment(params.data.referenceDate).format(DTS_DATE_DISPLAY_FORMAT) : ''),
                //valueGetter: 1,
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 200
            },
            {
                headerName: 'Remark',
                valueGetter: (params) => (params.data.remark),
                //valueGetter: 1,
                cellClass: classes.basicCell,
                headerClass: classes.basicHeader,
                width: 600
            }
        ];

        // Component state
        this.state = {
            columnDefs: columnDefs,
            //waitingListDetailList:[],
            rowData: [],
            waitingListLoaded:true,
            //selectedTreatment:null,
            editMode: null,
            editTreatment:false,
            selectedDiscipline:null,
            selectedClinic:null,
            selectedRoom:null,
            pmiNo:'',
            wlNo:'',
            boxNo:'',
            xRayNo:'',
            onWaitingListDate:null,
            transferDate:null,
            caseStartingDate:null,
            caseStartedDate:null,
            discontinuedDate:null,
            discontinuedReason:'',
            completionDate:null,
            onlySurgicalCase:false,
            //details
            waitingListDetailList: null,
            selectedTreatmentType:null,
            referenceDate:null,
            remark:'',
            callbackFunc: null

        };

        this.refGrid = React.createRef();

    }

    componentDidMount() {
        let curClinic = this.props.clinicList.find(clinic => clinic.siteId == this.props.defaultClinic.siteId);
        this.setState({selectedClinic:curClinic.siteId});
        const self = this;
        let getServeRoom = function (){
            return function (){
                self.props.getServeRoom({userId: self.props.loginInfo.userDto.userId, date: moment()}, self.setDefaultRoom);
            };
        }();
        this.props.getRoomList({siteId:curClinic.siteId},
                getServeRoom
            );

        this.setState({ rowData: this.props.waitingListDetailList ? this.props.waitingListDetailList : []});
        this.setState({editMode:this.props.editMode});
        this.props.editMode != CREATE_MODE && this.fillSelectedWaitingListToField();

        if(this.props.editMode == CREATE_MODE && this.props.pmi) {
            this.setState({pmiNo:this.props.pmi});
        }

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.waitingListDetailList !== this.state.waitingListDetailList) {
            if (this.refGrid.current) {
                //console.log('componentDidUpdate-pass:',this.gridApi);
                this.setState({ rowData: this.state.waitingListDetailList ? this.state.waitingListDetailList : []});
                //this.refGrid.current.grid.api
                //this.gridApi.redrawRows();
            }
        }
        if(this.props.clinicList != prevProps.clinicList && typeof this.props.clinicList[0] != 'undefined') {
            //set default to clinicList[0]
            this.setState({selectedClinic:this.props.clinicList[0].siteId});
            this.props.getRoomList({siteId:this.props.clinicList[0].siteId});
        }
    }

    componentWillUnmount(){
        this.props.resetAll();
        this.props.getWaitingList();
        if (this.refGrid.current) {
            this.refGrid.current.grid.api.destroy();
        }
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };

    fillSelectedWaitingListToField = () => {
        let selectedWaitingList = this.props.selectedWaitingList;

        //add sequence for agGrid key
        let formattedWaitingListDetails = selectedWaitingList.waitingListDetails;
        for(let i=0;i<formattedWaitingListDetails.length;i++){
            formattedWaitingListDetails[i].sequence = i+1;
            if (!('referenceDate' in formattedWaitingListDetails[i])) {
                formattedWaitingListDetails[i].referenceDate = null;
            }
        }

        //console.log('fillSelectedWaitingListToField-selectedWaitingList:', JSON.stringify(selectedWaitingList));
        if (selectedWaitingList) {
            this.setState({
                selectedDiscipline: selectedWaitingList.disciplineId,
                selectedClinic: selectedWaitingList.clinicId,
                selectedRoom: selectedWaitingList.roomId,
                pmiNo: selectedWaitingList.patientKey,
                wlNo: selectedWaitingList.waitingListNo,
                boxNo: selectedWaitingList.boxNo,
                xRayNo: selectedWaitingList.xrayNo,
                onWaitingListDate: selectedWaitingList.onWaitingListDate || null,
                transferDate: selectedWaitingList.transferDate || null,
                caseStartingDate: selectedWaitingList.caseStartingDate || null,
                caseStartedDate: selectedWaitingList.caseStartedDate || null,
                discontinuedDate: selectedWaitingList.discontinuedDate || null,
                discontinuedReason: selectedWaitingList.discontinuedReason,
                completionDate: selectedWaitingList.completionDate || null,
                onlySurgicalCase: selectedWaitingList.surgicalCase,
                //details
                waitingListDetailList: formattedWaitingListDetails
            });
        }
    }
    handleClose = () => {
        this.props.closeWaitingDialog();
    }

    handleRowClick = (param) => {
        let item = param.api.getSelectedRows()[0];
        if (!item) { //deselect
            this.resetTreatmentInput(false);
            return;
        }

        this.setState({
                editTreatment:true,
                selectedTreatmentType:param.data.treatmentTypeId,
                referenceDate:param.data.referenceDate || null,
                remark:param.data.remark
            });
    }

    resetTreatmentInput = (edit) => {
        this.setState({
            editTreatment:edit,
            selectedTreatmentType:null,
            referenceDate:null,
            remark:null
        });
    }

    handleStateChange = (stateName, obj) => {
        //console.log('handleStateChange:' + stateName, obj);
        this.setState({[stateName]:obj});
    }

    handleDateStateChange = (stateName, obj) => {
        if (obj) {
            this.setState({[stateName]:moment(obj)});
        }
        else {
            this.setState({[stateName]:null});
        }
    }

    handleAddTreatmentIcon = () => {
        this.gridApi.deselectAll();
        this.resetTreatmentInput(true);
    }

    handleEditModeChange = (mode) => {
        this.setState({editMode:mode});
        this.fillSelectedWaitingListToField();
    }


    handleTreatmentFormOnSubmit = () => {
        let tempArray = _.isArray(this.state.waitingListDetailList) && this.state.waitingListDetailList.length > 0 ? _.clone(this.state.waitingListDetailList) : [];
        tempArray.push({
            treatmentTypeId: this.state.selectedTreatmentType,
            referenceDate: dtsUtilities.formatDateParameter(this.state.referenceDate),
            remark: this.state.remark,
            sequence: _.isArray(this.state.waitingListDetailList) && this.state.waitingListDetailList.length > 0 ? Math.max.apply(Math, this.state.waitingListDetailList.map((item) => item.sequence))+1 : 1
        });
        // console.log('handleTreatmentFormOnSubmit:', tempArray);
        this.setState({waitingListDetailList:tempArray});
        //clear
        this.resetTreatmentInput(false);
    }

    handleDeleteTreatmentIcon = () => {
        // if(_.isArray(this.state.waitingListDetailList) && this.state.waitingListDetailList.length > 0 && this.gridApi.getSelectedRows().length > 0){
        let tempArray = _.clone(this.state.waitingListDetailList);
        tempArray.splice(tempArray.findIndex(item => item.sequence== this.gridApi.getSelectedRows()[0].sequence),1);
        this.setState({waitingListDetailList:tempArray});
        this.gridApi.deselectAll();
    }
    handleonlySurgicalCaseChange = event => {
        this.setState({onlySurgicalCase: event.target.checked});
    }

    handleUpdateTreatment = () => {
        let tempArray = _.clone(this.state.waitingListDetailList);
        let selectedTreatment = _.clone(this.gridApi.getSelectedRows()[0]);
        selectedTreatment.referenceDate = this.state.referenceDate;
        selectedTreatment.treatmentTypeId = this.state.selectedTreatmentType;
        selectedTreatment.remark = this.state.remark;

        tempArray.splice(tempArray.findIndex(item => item.sequence== selectedTreatment.sequence),1,selectedTreatment);
        //console.log('tempArray:',tempArray);
        this.setState({waitingListDetailList:tempArray});

        this.gridApi.deselectAll();
        this.resetTreatmentInput(false);

    }

    isRowSelected = () => {
        //console.log('isRowSelected:',(this.gridApi && this.gridApi.getSelectedRows()));
        return this.gridApi ? this.gridApi.getSelectedRows().length > 0 : false;
    }

    getValidator = (name) => {
        let validators = [];
        if (name === 'disciplineSelector') {
            validators.push('required');
            return validators;
        }
        else if (name === 'pmiSelector') {
            validators.push('required');
            return validators;
        }
        else if (name === 'wlNoSelector') {
            validators.push('required');
            return validators;
        }
        else if (name === 'treatmentTypeSelector') {
            validators.push('required');
            return validators;
        }
    }

    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'disciplineSelector') {
            errorMessages.push('Discipline is required');
            return errorMessages;
        }
        else if (name === 'pmiSelector') {
            errorMessages.push('PMI is required');
            return errorMessages;
        }
        else if (name === 'wlNoSelector') {
            errorMessages.push('WL no./ special Need WL no. is required');
            return errorMessages;
        }
        else if (name === 'treatmentTypeSelector') {
            errorMessages.push('Treatment type is required');
            return errorMessages;
        }
    }

    handleSubmitError = () => {
        // console.log('handleSubmitError call');
        let { callbackFunc } = this.state;
        callbackFunc(false);
    }

    handleWaitingListFormOnSubmit = () => {
        //console.log('handleWaitingListFormOnSubmit call');
        let waitingListDetails;
        if (_.isArray(this.state.waitingListDetailList) && this.state.waitingListDetailList.length > 0) {
            waitingListDetails = _.clone(this.state.waitingListDetailList);
            waitingListDetails.map(item => delete item['sequence']);
            //console.log('handleWaitingListFormOnSubmit:', waitingListDetails);
        }

        if (this.state.editMode ==CREATE_MODE) {
            this.props.insertWaitingList({
                disciplineId: this.state.selectedDiscipline,
                clinicId: this.state.selectedClinic,
                roomId: this.state.selectedRoom,
                patientKey: this.state.pmiNo,
                waitingListNo: this.state.wlNo,
                boxNo: this.state.boxNo,
                xrayNo: this.state.xRayNo,
                onWaitingListDate: this.state.onWaitingListDate && dtsUtilities.formatDateParameter(this.state.onWaitingListDate),
                transferDate: dtsUtilities.formatDateParameter(this.state.transferDate),
                caseStartedDate: dtsUtilities.formatDateParameter(this.state.caseStartedDate),
                caseStartingDate: dtsUtilities.formatDateParameter(this.state.caseStartingDate),
                discontinuedDate: dtsUtilities.formatDateParameter(this.state.discontinuedDate),
                discontinuedReason: this.state.discontinuedReason,
                completionDate: dtsUtilities.formatDateParameter(this.state.completionDate),
                surgicalCase: this.state.onlySurgicalCase,
                waitingListDetails: _.isArray(waitingListDetails) && waitingListDetails.length > 0 ? waitingListDetails : []
            },this.handleClose);
        } else if (this.state.editMode == UPDATE_MODE || this.state.editMode == DISCONTINUE_MODE) {
            this.props.updateWaitingList(this.props.selectedWaitingList.waitingListId, {
                waitingListId: this.props.selectedWaitingList && this.props.selectedWaitingList.waitingListId,
                disciplineId: this.state.selectedDiscipline,
                clinicId: this.state.selectedClinic,
                roomId: this.state.selectedRoom,
                patientKey: this.state.pmiNo,
                waitingListNo: this.state.wlNo,
                boxNo: this.state.boxNo,
                xrayNo: this.state.xRayNo,
                onWaitingListDate: dtsUtilities.formatDateParameter(this.state.onWaitingListDate),
                transferDate: dtsUtilities.formatDateParameter(this.state.transferDate),
                caseStartedDate: dtsUtilities.formatDateParameter(this.state.caseStartedDate),
                caseStartingDate: dtsUtilities.formatDateParameter(this.state.caseStartingDate),
                discontinuedDate: dtsUtilities.formatDateParameter(this.state.discontinuedDate),
                discontinuedReason: this.state.discontinuedReason,
                completionDate: dtsUtilities.formatDateParameter(this.state.completionDate),
                surgicalCase: this.state.onlySurgicalCase,
                waitingListDetails: _.isArray(waitingListDetails) && waitingListDetails.length > 0 ? waitingListDetails : [],
                version: this.props.selectedWaitingList && this.props.selectedWaitingList.version
            },this.handleClose);
        }
    }

    render () {
        const { classes, openWaitingListDialog,disciplineList, clinicList, roomList, treatmentTypeList, ...rest } = this.props;
        return (
            <div className={classes.root}>
                <CIMSDialog
                    dialogContentProps={{ style: { width: 'auto' } }}
                    id="dtsWaitingListDetailDialog"
                    dialogTitle="Waiting List Details"
                    open={openWaitingListDialog}
                    //formControlStyle={}
                >

                <ValidatorForm ref="WaitingListForm" onSubmit={this.handleWaitingListFormOnSubmit} onError={this.handleSubmitError} >
                    <DialogContent id={'dtsWaitingListDetailDialogContent'}>
                        <div className={classes.divRoot}>
                            {/* editMode */}
                            {this.state.editMode != CREATE_MODE && <Grid container spacing={0} className={classes.gridContainer}>
                                {/* <CIMSButton onClick={e => this.handleStateChange('editMode',CREATE_MODE)} color="primary">Create</CIMSButton> */}
                                <CIMSButton onClick={e => this.handleEditModeChange(UPDATE_MODE)} color="primary">Update</CIMSButton>
                                <CIMSButton onClick={e => this.handleEditModeChange(DISCONTINUE_MODE)}>Discontinue</CIMSButton>
                                <CIMSButton onClick={e => this.handleEditModeChange(VIEW_MODE)}color="primary">View</CIMSButton>
                            </Grid>}


                            {/* details */}
                            <Grid container spacing={0} className={classes.gridContainer}>


                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}><RequiredIcon />Discipline:</Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    {/* <Paper elevation={0} className={classes.colDetailLabel}></Paper> */}
                                    <DtsSelectFieldValidator
                                        id={'disciplineSelect'}
                                        className={classes.colDetailLabel}
                                        isDisabled={this.state.editMode != CREATE_MODE}
                                        options={disciplineList.map((item) => (
                                            { value: item.id, label: item.label }))}
                                        value={this.state.selectedDiscipline}
                                        msgPosition="bottom"
                                        isRequired
                                        //onBlur={this.handleClinicChange}
                                        validators={this.getValidator('disciplineSelector')}
                                        errorMessages={this.getErrorMessage('disciplineSelector')}
                                        onChange={e => this.handleStateChange('selectedDiscipline',e.value)}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}>Clinic / Unit:</Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <DtsSelectFieldValidator
                                        id={'clinicSelect'}
                                        className={classes.colDetailLabel}
                                        isDisabled={this.state.editMode != CREATE_MODE}
                                        options={clinicList.map((item) => (
                                            { value: item.siteId, label: item.clinicCd }))}
                                        value={this.state.selectedClinic}
                                        msgPosition="bottom"
                                        //onBlur={this.handleClinicChange}
                                        onChange={e => this.handleStateChange('selectedClinic',e.value)}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}>Surgery</Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <DtsSelectFieldValidator
                                        id={'surgerySelect'}
                                        className={classes.colDetailLabel}
                                        isDisabled={this.state.editMode != CREATE_MODE && this.state.editMode != UPDATE_MODE}
                                        options={roomList.map((item) => (
                                            { value: item.rmId, label: item.rmCd }))}
                                        value={this.state.selectedRoom}
                                        msgPosition="bottom"
                                        //onBlur={this.handleClinicChange}
                                        onChange={e => this.handleStateChange('selectedRoom',e.value)}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}><RequiredIcon />PMI</Paper>
                                </Grid>
                                <Grid item xs={4} className={classes.colDetailLabel}>
                                    <TextFieldValidator
                                        id="pmiTextField"
                                        type="number"
                                        disabled={this.state.editMode != CREATE_MODE && this.state.editMode != UPDATE_MODE}
                                        isRequired
                                        //label={'Subject'}
                                        variant="outlined"
                                        value={this.state.pmiNo}
                                        onChange={e => this.handleStateChange('pmiNo',e.target.value)}
                                        validators={this.getValidator('pmiSelector')}
                                        errorMessages={this.getErrorMessage('pmiSelector')}
                                        //onBlur={e => this.onSubjectBlur(e)}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}><RequiredIcon />WL no./ special Need WL no.</Paper>
                                </Grid>
                                <Grid item xs={4} className={classes.colDetailLabel}>
                                    <TextFieldValidator
                                        id="wlNoTextField"
                                        isRequired
                                        disabled={this.state.editMode != CREATE_MODE && this.state.editMode != UPDATE_MODE}
                                        variant="outlined"
                                        value={this.state.wlNo}
                                        onChange={e => this.handleStateChange('wlNo',e.target.value)}
                                        validators={this.getValidator('wlNoSelector')}
                                        errorMessages={this.getErrorMessage('wlNoSelector')}
                                        //onBlur={e => this.onSubjectBlur(e)}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}>Box No.</Paper>
                                </Grid>
                                <Grid item xs={4} className={classes.colDetailLabel}>
                                    <TextFieldValidator
                                        id="boxNoTextField"
                                        disabled={this.state.editMode != CREATE_MODE && this.state.editMode != UPDATE_MODE}
                                        variant="outlined"
                                        value={this.state.boxNo}
                                        onChange={e => this.handleStateChange('boxNo',e.target.value)}
                                        //onBlur={e => this.onSubjectBlur(e)}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}>X-Ray Number</Paper>
                                </Grid>
                                <Grid item xs={4} className={classes.colDetailLabel}>
                                    <TextFieldValidator
                                        id="xRayNoTextField"
                                        disabled={this.state.editMode != CREATE_MODE && this.state.editMode != UPDATE_MODE}
                                        variant="outlined"
                                        value={this.state.xRayNo}
                                        onChange={e => this.handleStateChange('xRayNo',e.target.value)}
                                        //onBlur={e => this.onSubjectBlur(e)}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}><RequiredIcon />On Waiting List Date</Paper>
                                </Grid>
                                <Grid item xs={4} className={classes.colDetailLabel}>
                                    <DateFieldValidator
                                        //ref={ref => this.dateOfBirthRef = ref}
                                        id={'onWaitingListDate'}
                                        label={DTS_DATE_DISPLAY_FORMAT}
                                        format={DTS_DATE_DISPLAY_FORMAT}
                                        isRequired
                                        inputVariant="outlined"
                                        disabled={this.state.editMode != CREATE_MODE && this.state.editMode != UPDATE_MODE}
                                        value={this.state.onWaitingListDate}
                                        //onChange={e => this.handleStateChange('onWaitingListDate',e)}
                                        onChange={e => this.handleDateStateChange('onWaitingListDate',e)}
                                        validByBlur
                                        errorMessages={['Date is required']}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}>Transfer Date</Paper>
                                </Grid>
                                <Grid item xs={4} className={classes.colDetailLabel}>
                                <DateFieldValidator
                                    //ref={ref => this.dateOfBirthRef = ref}
                                    id={'transferDate'}
                                    label={DTS_DATE_DISPLAY_FORMAT}
                                    format={DTS_DATE_DISPLAY_FORMAT}
                                    inputVariant="outlined"
                                    disabled={this.state.editMode != CREATE_MODE && this.state.editMode != UPDATE_MODE}
                                    value={this.state.transferDate}
                                    onChange={e => this.handleDateStateChange('transferDate',e)}
                                    validByBlur
                                    errorMessages={['Date is required']}
                                />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}>Case Starting</Paper>
                                </Grid>
                                <Grid item xs={4} className={classes.colDetailLabel}>
                                    <DateFieldValidator
                                        //ref={ref => this.dateOfBirthRef = ref}
                                        id={'caseStarting'}
                                        label={DTS_DATE_DISPLAY_FORMAT}
                                        format={DTS_DATE_DISPLAY_FORMAT}
                                        inputVariant="outlined"
                                        disabled={this.state.editMode != CREATE_MODE && this.state.editMode != UPDATE_MODE}
                                        value={this.state.caseStartingDate}
                                        onChange={e => this.handleDateStateChange('caseStartingDate',e)}
                                        validByBlur
                                        errorMessages={['Date is required']}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}>Case Started</Paper>
                                </Grid>
                                <Grid item xs={4} className={classes.colDetailLabel}>
                                    <DateFieldValidator
                                        //ref={ref => this.dateOfBirthRef = ref}
                                        id={'caseStarted'}
                                        label={DTS_DATE_DISPLAY_FORMAT}
                                        format={DTS_DATE_DISPLAY_FORMAT}
                                        inputVariant="outlined"
                                        disabled={this.state.editMode != CREATE_MODE && this.state.editMode != UPDATE_MODE}
                                        value={this.state.caseStartedDate}
                                        onChange={e => this.handleDateStateChange('caseStartedDate',e)}
                                        validByBlur
                                        errorMessages={['Date is required']}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}>Discontinued Date</Paper>
                                </Grid>
                                <Grid item xs={4} className={classes.colDetailLabel}>
                                    <DateFieldValidator
                                        //ref={ref => this.dateOfBirthRef = ref}
                                        id={'discontinuedDate'}
                                        label={DTS_DATE_DISPLAY_FORMAT}
                                        format={DTS_DATE_DISPLAY_FORMAT}
                                        inputVariant="outlined"
                                        disabled={this.state.editMode == VIEW_MODE}
                                        value={this.state.discontinuedDate}
                                        onChange={e => this.handleDateStateChange('discontinuedDate',e)}
                                        validByBlur
                                        errorMessages={['Date is required']}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}>Discontinued Reason</Paper>
                                </Grid>
                                <Grid item xs={10} className={classes.colDetailLabel}>
                                <CIMSMultiTextField
                                    className={classes.discontinuedReasonTextField}
                                    id={'discontinuedReasonTextField'}
                                    disabled={this.state.editMode == VIEW_MODE}
                                    rows={2}
                                    value={this.state.discontinuedReason}
                                    onChange={e => this.handleStateChange('discontinuedReason',e.target.value)}
                                >
                                </CIMSMultiTextField>
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}>Completion Date</Paper>
                                </Grid>
                                <Grid item xs={4} className={classes.colDetailLabel}>
                                    <DateFieldValidator
                                        //ref={ref => this.dateOfBirthRef = ref}
                                        id={'completionDate'}
                                        label={DTS_DATE_DISPLAY_FORMAT}
                                        format={DTS_DATE_DISPLAY_FORMAT}
                                        inputVariant="outlined"
                                        disabled={this.state.editMode != CREATE_MODE && this.state.editMode != UPDATE_MODE}
                                        value={this.state.completionDate}
                                        onChange={e => this.handleDateStateChange('completionDate',e)}
                                        validByBlur
                                        errorMessages={['Date is required']}
                                    />
                                </Grid>

                                <Grid item xs={2}>
                                    <Paper elevation={0} className={classes.colTitle}>Surgical Case</Paper>
                                </Grid>
                                <Grid item xs={4}>
                                <FormControlLabel
                                    control={<CIMSCheckBox
                                        id={'onlySurgicalCase'}
                                        disabled={this.state.editMode != CREATE_MODE && this.state.editMode != UPDATE_MODE}
                                        className={classes.checkPadding}
                                        onChange={this.handleonlySurgicalCaseChange}
                                        checked={this.state.onlySurgicalCase}
                                             />
                                    }
                                    className={classes.checkLabelMagin}
                                />
                                </Grid>
                            </Grid>

                            {/* +/- button */}
                            <Grid>
                                <Grid className={classes.funcIcon}>
                                    <IconButton onClick={this.handleAddTreatmentIcon} disabled={this.state.editMode == VIEW_MODE || this.state.editMode == DISCONTINUE_MODE}>
                                        <Add className={classes.funcButton + ' ' + (this.state.editMode == VIEW_MODE || this.state.editMode == DISCONTINUE_MODE ? classes.funcButtonDim : '')} />
                                    </IconButton>
                                </Grid>
                                <Grid className={classes.funcIcon}>
                                    <IconButton onClick={this.handleDeleteTreatmentIcon} disabled={this.state.editMode == VIEW_MODE || this.state.editMode == DISCONTINUE_MODE || !this.isRowSelected()}>
                                        <Remove className={classes.funcButton + ' ' + (this.state.editMode == VIEW_MODE || this.state.editMode == DISCONTINUE_MODE || !this.isRowSelected() ? classes.funcButtonDim : '')}  />
                                    </IconButton>
                                </Grid>
                            </Grid>

                            {/* table */}
                            <Grid container spacing={0}>
                                {this.state.waitingListLoaded && <CIMSDataGrid style={{boxShadow:'none'}} ref={this.refGrid}
                                    disableAutoSize
                                    suppressGoToRow
                                    suppressDisplayTotal
                                    gridTheme="ag-theme-balham"
                                    divStyle={{
                                        width: '100%',
                                        height: '160px',
                                        display: 'block'
                                                }}
                                    gridOptions={{
                                        defaultColDef:{
                                            filter: true,
                                            lockVisible: true,
                                            sortable: true,
                                            resizable: true
                                        },
                                        columnDefs: this.state.columnDefs,
                                        rowData: this.state.rowData,
                                        suppressRowClickSelection: false,
                                        rowSelection: 'single',
                                        onGridReady: this.onGridReady,
                                        getRowHeight: () => 32,
                                        getRowNodeId: item => item.sequence,
                                         frameworkComponents: {
                                         },
                                        onRowClicked: params => {
                                            this.handleRowClick(params);
                                        },
                                        onRowDoubleClicked: params => {
                                        },
                                        postSort: rowNodes => {
                                            let rowNode = rowNodes[0];
                                            if (rowNode) {
                                                setTimeout(
                                                    rowNode => {
                                                        rowNode.gridApi.refreshCells({
                                                            columns: ['index'],
                                                            force: true});

                                                    },
                                                    100,
                                                    rowNode
                                                );
                                            }
                                        }
                                                }}
                                                                 />
                                }
                            </Grid>
                            {/* inputField */}
                            {this.state.editMode != VIEW_MODE && this.state.editMode != DISCONTINUE_MODE &&
                            <ValidatorForm ref="TreatmentForm" onSubmit={this.handleTreatmentFormOnSubmit} onError={this.handleSubmitError}>

                                <Grid container spacing={0} className={classes.gridContainer} style={{marginTop:'10px'}}>
                                    <Grid item xs={2}>
                                        <Paper elevation={0} className={classes.colTitle}><RequiredIcon />Treatment Type</Paper>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <DtsSelectFieldValidator
                                            id={'treatmentTypeSelect'}
                                            className={classes.colDetailLabel}
                                            isDisabled={!this.state.editTreatment}
                                            options={treatmentTypeList.map((item) => (
                                                { value: item.id, label: item.code }))}
                                            value={this.state.selectedTreatmentType}
                                            isRequired
                                            msgPosition="bottom"
                                            onChange={e => this.handleStateChange('selectedTreatmentType',e.value)}
                                            //onBlur={this.handleClinicChange}
                                            validators={this.getValidator('treatmentTypeSelector')}
                                            errorMessages={this.getErrorMessage('treatmentTypeSelector')}
                                        />
                                    </Grid>

                                    <Grid item xs={2}>
                                        <Paper elevation={0} className={classes.colTitle}>Reference Date</Paper>
                                    </Grid>
                                    <Grid item xs={4} className={classes.colDetailLabel}>
                                        <DateFieldValidator
                                            //ref={ref => this.dateOfBirthRef = ref}
                                            id={'referenceDate'}
                                            label={DTS_DATE_DISPLAY_FORMAT}
                                            format={DTS_DATE_DISPLAY_FORMAT}
                                            inputVariant="outlined"
                                            disabled={!this.state.editTreatment}
                                            value={this.state.referenceDate}
                                            onChange={e => this.handleDateStateChange('referenceDate',e)}
                                            //validByBlur={!this.state.referenceDate===null}
                                            validByBlur
                                            //isRequired={false}
                                            //errorMessages={['Date is required']}
                                        />
                                    </Grid>

                                    <Grid item xs={2}>
                                        <Paper elevation={0} className={classes.colTitle}>Remark</Paper>
                                    </Grid>
                                    <Grid item xs={10} className={classes.dateField}>
                                        <TextFieldValidator
                                            id={'remark'}
                                            className={classes.colDetailLabel}
                                            isDisabled={!this.state.editTreatment}
                                            value={this.state.remark}
                                            onChange={e => this.handleStateChange('remark',e.target.value)}
                                            //={index}
                                            //label={confirmAttendance.disNumber}
                                            variant="outlined"
                                        />
                                    </Grid>

                                    <Grid item xs={4}>
                                        {!this.isRowSelected() && this.state.editTreatment && <CIMSButton onClick={() => this.refs.TreatmentForm.submit()} color="primary" className={classes.buttonSave}>Add Treatment</CIMSButton>}
                                        {this.isRowSelected() && <CIMSButton onClick={this.handleUpdateTreatment} color="primary" className={classes.buttonSave}>Update Treatment</CIMSButton>}
                                    </Grid>

                                </Grid>
                            </ValidatorForm>
                            }

                        </div>

                    </DialogContent>

                    <DialogActions className={classes.dialogAction}>
                            <CIMSButton
                                onClick={() => this.refs.WaitingListForm.submit()}
                                id={'waiting_list_confirm'}
                                color="primary"
                                //disabled={this.state.contactHistoryAction == contactHistoryAction.VIEW}
                            >OK</CIMSButton>
                            <CIMSButton
                                onClick={this.handleClose}
                                color="primary"
                                id={'waiting_list_cancel'}
                            >Cancel</CIMSButton>
                    </DialogActions>

                </ValidatorForm>

            </CIMSDialog>
            </div>

        );
    }
}

const mapStateToProps = (state) => {
    return {
        disciplineList:state.dtsWaitingList.disciplineList,
        treatmentTypeList:state.dtsWaitingList.treatmentTypeList,
        roomList: state.dtsWaitingList.roomList,
        defaultClinic: state.login.clinic,
        clinicList: state.common.clinicList
    };
};

const mapDispatchToProps = {
    insertWaitingList,
    getRoomList,
    updateWaitingList,
    getWaitingList,
    resetAll
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsWaitingListDetailDialog));
