import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import {
    Grid,
    Popper,
    Paper
} from '@material-ui/core';
import moment from 'moment';
import * as appointmentUtilities from '../../../../utilities/appointmentUtilities';
import * as CommonUtilities from '../../../../utilities/commonUtilities';
import Enum from '../../../../enums/enum';
import * as patientUtilities from '../../../../utilities/patientUtilities';

const styles = () => ({
    root: {
        zIndex: 1360
    },
    paper: {
        maxWidth: '30%',
        minWidth: 480,
        padding: 10
    },
    remarkTitle: {
        // background: 'rgb(208, 240, 251)',
        borderLeft: '6px solid #a6d1f5',
        padding: '10px 8px',
        marginBottom: 10,
        fontWeight: 'bolder',
        wordBreak: 'break-word'
    },
    maleRoot: {
        backgroundColor: '#d1eefc'
    },
    femaleRoot: {
        backgroundColor: '#fedeed'
    },
    unknownSexRoot: {
        backgroundColor: '#f8d186'
    },
    deadRoot: {
        backgroundColor: '#404040',
        color: '#fff'
    },
    anonymousRoot: {
        backgroundColor: '#fff',
        border: '1px solid #000',
        borderLeft: '6px solid #a6d1f5'
    },
    remarkContent: {
        color: '#666',
        fontWeight: 'bold',
        '& .remarkTime': {
            marginBottom: 10
        },
        '& .remarkTimeValue': {
            marginLeft: 10,
            fontWeight: 'normal',
            wordBreak: 'break-word',
            position: 'absolute',
            left: '3rem'
        },
        '& .remarkValue': {
            marginLeft: 10,
            fontWeight: 'normal',
            wordBreak: 'break-word'
        }
    }
});
class RemarkPopper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openPopper: false,
            anchorEl: null
        };
    }
    render() {
        const { id, remarkData, classes, patientRemark, countryList, ...rest } = this.props;
        let documentPair, phoneNo, genderClass = null;
        if (remarkData.docNo && remarkData.docTypeCd) {
            documentPair = {
                docTypeCd: remarkData.docTypeCd,
                docNo: remarkData.docNo
            };
        }
        phoneNo = CommonUtilities.getFormatPhone(countryList, remarkData);
        if (remarkData.dod && remarkData.dod !== null) {
            genderClass = 'deadRoot';
        } else if (remarkData.genderCd) {
            switch (remarkData.genderCd) {
                case Enum.GENDER_MALE_VALUE:
                    genderClass = 'maleRoot';
                    break;
                case Enum.GENDER_FEMALE_VALUE:
                    genderClass = 'femaleRoot';
                    break;
                case Enum.GENDER_UNKNOWN_VALUE:
                    genderClass = 'unknownSexRoot';
                    break;
                default:
                    genderClass = 'anonymousRoot';
                    break;
            }
        } else {
            genderClass = 'anonymousRoot';
        }
        return (
            <Popper
                id={id}
                className={classes.root}
                {...rest}
            >
                {!remarkData ? <div></div> :
                    <Paper className={classes.paper}>
                        {/* <Grid id={id + 'RemarkTitle'} className={classes.remarkTitle}>{(docNo ? docNo + ', ' : '') + appointmentUtilities.slotRemark(remarkData)}</Grid> */}
                        <Grid id={id + 'RemarkTitle'} className={classes.remarkTitle + ' ' + classes[genderClass]}>{patientRemark}</Grid>
                        <Grid id={id + 'RemarkContent'} className={classes.remarkContent}>
                            <Grid className={'remarkTime'}>
                                {/**update by Irving Wu for DHCIMS-4637*/}
                                {/* <Grid id={id + 'StartTime'}>Start:<span className={'remarkTimeValue'}>{`${remarkData.stime}`}</span></Grid>
                                <Grid id={id + 'EndTime'}>End:<span className={'remarkTimeValue'}>{`${remarkData.etime}`}</span></Grid> */}
                                <Grid id={id + 'StartTime'}>Start:<span className={'remarkTimeValue'}>{`${moment(remarkData.stime).format(Enum.DATE_FORMAT_24_HOUR)}`}</span></Grid>
                                <Grid id={id + 'EndTime'}>End:<span className={'remarkTimeValue'}>{remarkData.tmsltId&&remarkData.tmsltId!==-1?`${moment(remarkData.etime).format(Enum.DATE_FORMAT_24_HOUR)}`:''}</span></Grid>
                            </Grid>

                            <Grid>
                                {
                                    remarkData.docNo && remarkData.docTypeCd ?
                                        <Grid id={id + 'DocNo'}>Doc. No.:<span className={'remarkValue'}>{patientUtilities.getFormatDocNoByDocumentPair(documentPair)}</span></Grid>
                                        :
                                        null
                                }
                                {
                                    !remarkData.engGivenName && !remarkData.engSurname ? null :
                                        <Grid id={id + 'Name'}>Name:<span className={'remarkValue'}>{CommonUtilities.getFullName(remarkData.engSurname, remarkData.engGivenName)}</span></Grid>
                                }
                                {
                                    !remarkData.phoneNo ? null :
                                        <Grid id={id + 'Phone'}>Phone:<span className={'remarkValue'}>{phoneNo}</span></Grid>
                                }
                                {
                                    !remarkData.userEngGivenName && !remarkData.userEngSurname ? null :
                                        <Grid id={id + 'RecordedBy'}>Recorded by:<span className={'remarkValue'}>{CommonUtilities.getFullName(remarkData.userEngSurname, remarkData.userEngGivenName)}</span></Grid>
                                }
                            </Grid>
                        </Grid>
                    </Paper>
                }
            </Popper>
        );
    }
}

export default (withStyles(styles)(RemarkPopper));
