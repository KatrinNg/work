import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { DialogContent, DialogActions, InputAdornment, Grid, IconButton } from '@material-ui/core';
import { AccountBox, Lock, Visibility, VisibilityOff } from '@material-ui/icons';
import * as EHRUtilities from '../../utilities/eHRUtilities';
import moment from 'moment';
import Enum from '../../enums/enum';
import * as PatientUtil from '../../utilities/patientUtilities';
import CIMSRadioCombination from '../Radio/CIMSRadioCombination';
import Radio from '@material-ui/core/Radio';
import { getUpdateFromEHRDate } from '../../store/actions/EHR/eHRAction';
import { withRouter } from 'react-router-dom';

const styles = () => ({
    gridMargin20: {
        marginBottom: 20
    }
});

const useStyle = makeStyles(theme => ({
    informationBar: {
        minHeight: 40,
        maxHeight: 400
    },
    complexBar: {
        // backgroundColor: `${theme.palette.primary.main}55`
        backgroundColor: '#DAE3F3'
    },
    grid: {
        wordBreak: 'break-word',
        paddingLeft: 8,
        paddingRight: 8
    },
    headGrid: {
        textAlign: 'right',
        fontWeight: 'bold',
        paddingRight: 30
    },
    boldGrid: {
        fontWeight: 'bold'
    },
    differentGrid: {
        // color: theme.palette.secondary.main
        color: '#FD0000' // #000000 ?
    }
}));

function InformationBar(props) {
    const classes = useStyle();
    return (
        <Grid
            container
            className={classNames({
                [classes.informationBar]: true,
                [classes.complexBar]: props.complex
            })}
            alignContent="center"
        >
            <Grid item xs={3}
                className={classNames({
                    [classes.headGrid]: true,
                    [classes.grid]: true
                })}
            >{props.title}</Grid>
            <Grid item xs={4}
                className={classNames({
                    [classes.grid]: true,
                    [classes.boldGrid]: props.head
                })}
            >{props.content1}</Grid>
            <Grid item xs={4} wrap="nowrap"
                className={classNames({
                    [classes.grid]: true,
                    [classes.boldGrid]: props.head,
                    [classes.differentGrid]: props.head == true ? false : (props.content1 !== props.content2)
                })}
            >{props.content2}</Grid>
        </Grid>
    );
}

function Information(props) {
    const classes = useStyle();
    return (
        <Grid
            container
            className={classNames({
                [classes.informationBar]: true,
                [classes.complexBar]: true
            })}
            alignContent="center"
        >
            <Grid item xs={11}
                className={classNames({
                    [classes.grid]: true,
                    [classes.boldGrid]: true
                })}
            >{props.content}</Grid>
        </Grid>
    );
}

class CIMSeHRInforTable extends Component {
    constructor(props){
        super(props);
        this.state = {
            selectedValue: 'CIMS2',
            setSelectedValue: ''
        };
    }

    handleChange = (value) => {
        this.props.getUpdateFromEHRDate(value);
        // this.props.onChange(value);
        // this.state.setSelectedValue(value);
    }

    render() {
        // const [selectedValue, setSelectedValue] = React.useState("CIMS2");

        // const handleChange = event => {
        //     getUpdateFromEHRDate(event.target.value);
        //     setSelectedValue(event.target.value);
        // };

        const {
            classes,
            existingInfo,
            newInfo,
            updateFromEHRDate
        } = this.props;
        let documentNo ='';
        let documentType ='';
        existingInfo && existingInfo.documentPairList.forEach(
            documentPair => {
                if (!PatientUtil.isHKIDFormat(documentPair.docTypeCd)) {
                    documentNo = documentPair.docNo;
                    documentType = documentPair.docTypeCd;
                }
        });

        return (
            <DialogContent>
                {existingInfo && newInfo ? (
                    <Grid container className={classes.gridMargin20}>
                        {/* eHR-Information Text */}
                        <Information
                            complex
                            content={'Would you like to select the information in CIMS now?'}
                        />
                    {/* <Grid
                        container
                        alignContent="center"
                    >
                        <Grid item xs={4}>{''}</Grid>
                        <Grid item xs={4}>
                            <Radio
                                color={'primary'}
                                checked={!updateFromEHRDate}
                                onChange={e => {this.handleChange(false);}}
                                value="false"
                                name="cims-ehr-ehris-identity-radio-button"
                                inputProps={{ 'aria-label': 'CIMS2' }}
                            />
                            {'From CIMS'}
                        </Grid>
                        <Grid item xs={4}>
                            <Radio
                                color={'primary'}
                                checked={updateFromEHRDate}
                                onChange={e => {this.handleChange(true);}}
                                value="true"
                                name="cims-ehr-ehris-identity-radio-button"
                                inputProps={{ 'aria-label': 'eHR' }}
                            />
                            {'From eHR'}
                        </Grid>
                    </Grid> */}
                        <InformationBar
                            head
                            title=""
                            content1={'Existing Information'}
                            content2={'From eHR Information'}
                        />
                        <InformationBar
                            complex
                            title="eHR No"
                            content1={existingInfo.patientEhr.ehrNo}
                            content2={newInfo.ehrNo}
                        />
                        <InformationBar
                            // complex
                            title={newInfo.hkId ? 'HKIC' : 'Doc No / Type'}
                            content1={newInfo.hkId ? existingInfo.documentPairList.filter(item => item.docTypeCd === Enum.DOC_TYPE.HKID_ID)[0].docNo
                                    : EHRUtilities.getEHRDocumentPairSyntax(documentNo, documentType)}
                            content2={newInfo.hkId ? newInfo.hkId : EHRUtilities.getEHRDocumentPairSyntax(newInfo.identityDocumentNo, newInfo.typeOfIdentityDocument)}
                        />
                        <InformationBar
                            complex
                            title="English Name"
                            content1={
                                EHRUtilities.getEngPatientName(existingInfo.engSurname, existingInfo.engGivename)
                            }
                            content2={
                                EHRUtilities.getEngPatientName(newInfo.englishSurname, newInfo.englishGivenName)
                            }
                        />
                        <InformationBar
                            // complex
                            title="Sex"
                            content1={existingInfo.genderCd}
                            content2={newInfo.sex}
                        />
                        <InformationBar
                            complex
                            title="DOB / DOBType"
                            content1={
                                EHRUtilities.getDobDateByFormat(
                                        existingInfo.exactDobCd, existingInfo.dob, Enum.DATE_FORMAT_EDMY_VALUE)
                                    + ' / ' + existingInfo.exactDobCd
                            }
                            content2={
                                newInfo.dateOfBirth
                                        ? newInfo.dateOfBirth + ' / ' + newInfo.exactDobFlag
                                        : ''
                            }
                        />
                    </Grid>
                    ):null
                    }
            </DialogContent>
        );
    }
}

CIMSeHRInforTable.propTypes = {
};

function mapStateToProps(state) {
    return {
        updateFromEHRDate: state.ehr.updateFromEHRDate
    };
}

const dispatchProps = {
    getUpdateFromEHRDate
};

export default withRouter(connect(mapStateToProps, dispatchProps)(withStyles(styles)(CIMSeHRInforTable)));