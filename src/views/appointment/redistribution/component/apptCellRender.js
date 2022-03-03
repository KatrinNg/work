import React from 'react';
import classNames from 'classnames';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import * as PatientUtil from '../../../../utilities/patientUtilities';
import * as CommonUtil from '../../../../utilities/commonUtilities';

const useStyles = makeStyles({
    remarkContainer: {
        cursor: 'pointer',
        '& .maleRoot': {
            backgroundColor: '#d1eefc',
            '&.remarkSelected': {
                backgroundColor: 'grey',
                color: 'white'
            }
        },
        '& .femaleRoot': {
            backgroundColor: '#fedeed',
            '&.remarkSelected': {
                backgroundColor: 'grey',
                color: 'white'
            }
        },
        '& .unknownSexRoot': {
            backgroundColor: '#f8d186',
            '&.remarkSelected': {
                backgroundColor: 'grey',
                color: 'white'
            }
        },
        '& .deadRoot': {
            backgroundColor: '#404040',
            color: '#fff'
        },
        '& .anonymousPatientRoot': {
            border: '1px solid grey',
            borderLeft: 'unset',
            '&.remarkSelected': {
                backgroundColor: 'grey',
                color: 'white'
            }
        },
        '&.nonecursor': {
            cursor: 'no-drop'
        }
    },
    remarkFront: {
        borderTopLeftRadius: '1rem',
        borderBottomLeftRadius: '1rem',
        width: 30,
        backgroundColor: '#a6d1f5'
    },
    remarkRoot: {
        paddingLeft: 6,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        height: '1.6rem',
        lineHeight: '1.6rem',
        fontWeight: 'bold',
        borderBottomRightRadius: '1rem',
        borderTopRightRadius: '1rem',
        transition: 'filter 0.3s ease-in-out',
        '&:hover': {
            filter: 'brightness(0.8)'
        }
    },
    noSlot: {
        display: 'block',
        background: 'rgb(255, 255, 204)',
        textAlign: 'center'
    },
    holiday: {
        border: '1px solid black',
        backgroundColor: 'grey',
        color: 'white',
        justifyContent: 'center',
        borderRadius: '1rem'
    }
});

const ApptCellRender = props => {
    const {
        data,
        selectedData
    } = props;
    const classes = useStyles();

    return (
        <Grid container>
            {
                data.isWhlDay ?
                    <Grid item container>
                        <Grid
                            item
                            container
                            wrap="nowrap"
                            className={classes.holiday}
                        >{data.rsnDesc}</Grid>
                    </Grid> :
                    data.isNoSlot ?
                        <Grid item container className={classes.noSlot}>No Slot</Grid> :
                        <Grid item container spacing={1}>
                            {
                                data && data.appts && data.appts.map((item, index) => {
                                    //remark
                                    let pmiNo = PatientUtil.getFormatDHPMINO(item.patientKey, item.idSts);
                                    let engName = CommonUtil.getFullName(item.engSurname, item.engGivenName, ' ');
                                    let chiName = item.nameChi || '';
                                    let patientRemark = `${pmiNo} - ${engName} ${chiName}`;
                                    if(parseInt(item.patientKey) < 0){
                                        patientRemark = `${engName} ${chiName}`;
                                    }
                                    //style
                                    let itemClass = CommonUtil.getGenderStyle(item.genderCd, item.dod).className;
                                    if (item.patientKey < 0) {
                                        itemClass = 'anonymousPatientRoot';
                                    }
                                    //selected
                                    let selected = selectedData.findIndex(x => x === item.apptId) !== -1;
                                    return (
                                        <Grid
                                            key={index}
                                            item
                                            container
                                            wrap="nowrap"
                                            className={classNames({
                                                [classes.remarkContainer]: true,
                                                'nonecursor': item.dod || item.noMove || item.isAtnd
                                            })}
                                            onClick={() => {
                                                if (item.dod || item.noMove || item.isAtnd) return;
                                                props.onClick(item, data.tmsltId);
                                            }}
                                        >
                                            <Grid
                                                className={classes.remarkFront}
                                            ></Grid>
                                            <Grid
                                                item
                                                container
                                                className={classNames({
                                                    'remarkSelected': selected,
                                                    [itemClass]: true,
                                                    [classes.remarkRoot]: true
                                                })}
                                            >
                                                {patientRemark}
                                            </Grid>
                                        </Grid>
                                    );
                                })
                            }
                        </Grid>
            }
        </Grid>
    );
};

export default ApptCellRender;