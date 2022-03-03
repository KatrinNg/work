import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    Card,
    CardContent,
    Grid,
    Fade,
    Paper,
    Popper,
    Typography
} from '@material-ui/core';
import Enum from '../../../enums/enum';

const styles = theme => ({
    root: {
        width: '100%'
    },
    cardContentRoot: {
        padding: '12px 16px'
    },
    maleRoot: {
        backgroundColor: theme.palette.genderMaleColor.color,
        color: theme.palette.text.primary
    },
    femaleRoot: {
        backgroundColor: theme.palette.genderFeMaleColor.color,
        color: theme.palette.text.primary
    },
    unknownSexRoot: {
        backgroundColor: theme.palette.genderUnknownColor.color,
        color: theme.palette.text.primary
    },
    deadRoot: {
        backgroundColor: theme.palette.deadPersonColor.color,
        color: '#fff'
    },
    content: {
        color: 'inherit',
        fontSize: '14pt'
    },
    contentPadding: {
        color: 'inherit',
        fontSize: '14pt',
        paddingRight: 10
    },
    popperRoot: {
        padding: '6px 8px',
        maxWidth: 500
    },
    popperTitle: {
        fontWeight: 'bold',
        minWidth: 110
    },
    popperContent: {
        wordBreak: 'break-all'
    }
});

class MoePatientPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            anchorEl: null
        };
    }

    handleMouseEnter = (e) => {
        this.setState({ anchorEl: e.currentTarget, open: true });
    }

    handleMouseLeave = () => {
        this.setState({ anchorEl: null, open: false });
    }

    render() {
        const { classes } = this.props;
        if (!this.props.hidden && this.props.patient) {
            let patientData = this.props.patient.user;
            if (patientData) {
                const hkid = patientData.hkid && patientData.hkid.substring(0, patientData.hkid.length - 1);
                const hkidNum = patientData.hkid && patientData.hkid.substring(patientData.hkid.length - 1);
                let colorClasses = '';
                if (patientData.dod !== null && patientData.dod !== '' && patientData.dod !== '0') {
                    colorClasses = classes.deadRoot;
                } else {
                    switch (patientData.genderCd) {
                        case Enum.GENDER_MALE_VALUE:
                            colorClasses = classes.maleRoot;
                            break;
                        case Enum.GENDER_FEMALE_VALUE:
                            colorClasses = classes.femaleRoot;
                            break;
                        case Enum.GENDER_UNKNOWN_VALUE:
                            colorClasses = classes.unknownSexRoot;
                            break;
                        default: break;
                    }
                }
                return (
                    <Card className={`${classes.root} ${colorClasses}`}>
                        <Grid container justify="space-between">
                            <Grid item container xs={8} className={classes.cardContentRoot}>
                                <Grid container direction="row">
                                    <Grid item container xs={6} wrap="nowrap" direction="row" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                                        <Typography id={this.props.id+'_engName0'} className={classes.content} noWrap>{`${patientData.engSurName}, ${patientData.engGivenName}`}</Typography>
                                        <Typography id={this.props.id+'_chiName0'} className={classes.content} noWrap>{`(${patientData.chiName})`}</Typography>
                                    </Grid>
                                    <Grid item container xs={6} justify="center">
                                        <Typography className={classes.content}></Typography>
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <Typography id={this.props.id+'_hkid'} className={classes.contentPadding}>{patientData.hkid ? `HKIC: ${hkid}(${hkidNum})` : `Doc No: ${patientData.docNum}(${patientData.docTypeCd})`}</Typography>
                                    <Typography id={this.props.id+'_dob'} className={classes.contentPadding}>DOB: {patientData.dob}</Typography>
                                    <Typography id={this.props.id+'_age'} className={classes.contentPadding}>Age: {`${patientData.age}`}</Typography>
                                    <Typography id={this.props.id+'_sex'} className={classes.contentPadding}>Sex: {patientData.genderCd}</Typography>
                                    <Typography id={this.props.id+'_ward'} className={classes.contentPadding} >Ward: {`${patientData.ward}-${patientData.bedNum}`}</Typography>
                                    <Typography id={this.props.id+'_adm'} className={classes.contentPadding} >Adm: {patientData.admDtm}</Typography>
                                    <Typography id={this.props.id+'_hospitalNo'} className={classes.contentPadding} >Hospital No: {patientData.hospitalCd}</Typography>
                                </Grid>
                            </Grid>
                            <Grid item container alignItems="center" justify="flex-end" xs={4}>
                                {this.props.children}
                            </Grid>
                        </Grid>
                        <Popper
                            open={this.state.open}
                            placement="bottom-start"
                            anchorEl={this.state.anchorEl}
                            transition
                        >
                            {({ TransitionProps }) => (
                                <Fade {...TransitionProps} timeout={350}>
                                    <Paper className={classes.popperRoot}>
                                        <Grid container direction="row" wrap="nowrap" style={{ marginBottom: 15 }}>
                                            <Typography className={classes.popperTitle}>English Name:</Typography>
                                            <Typography id={this.props.id+'_engName1'} className={classes.popperContent}>{`${patientData.engSurName}, ${patientData.engGivenName}`}</Typography>
                                        </Grid>
                                        <Grid container direction="row" wrap="nowrap">
                                            <Typography className={classes.popperTitle}>Chinese Name:</Typography>
                                            <Typography id={this.props.id+'_chiName1'} className={classes.popperContent}>{patientData.chiName}</Typography>
                                        </Grid>
                                    </Paper>
                                </Fade>
                            )}
                        </Popper>
                    </Card>
                );
            }
            return (
                <Card className={classes.root}>
                    <CardContent>
                        <Typography variant="h5">No Patient Message</Typography>
                    </CardContent>
                </Card>
            );
        }
        else {
            return null;
        }
    }
}

export default withStyles(styles)(MoePatientPanel);