
/*
 For Test Display the Patient Info bar.
 by Clinical Note , General Assessment, DxPx Historical Record

*/
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    Card,
    Grid,
    Fade,
    Paper,
    Popper,
    Typography
} from '@material-ui/core';
import moment from 'moment';
import CIMSButton from '../../../components/Buttons/CIMSButton';

const styles = theme => ({
    root: {
        width: '100%',
        overflow: 'unset'
    },
    cardContentRoot: {
        padding: '2px 16px'
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

class PatientPanel extends Component {
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

            //const hkid =patient.hkid && patient.hkid.substring(0, patient.hkid.length - 1);
           // const hkidNum =patient.hkid && patient.hkid.substring(patient.hkid.length - 1);
            let colorClasses = classes.femaleRoot;

            return (
                <Card className={`${classes.root} ${colorClasses}`}>
                    <Grid container justify="space-between">
                        <Grid item container xs={8} className={classes.cardContentRoot}>
                            <Grid container direction="row">
                                <Grid item container xs={6} wrap="nowrap" direction="row" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                                    <Typography className={classes.content} noWrap>{'CHUK, ON HONG'}</Typography>
                                    <Typography className={classes.content} noWrap>{'(祝安康)'}</Typography>
                                </Grid>
                                <Grid item container xs={6} justify="center">
                                    <Typography className={classes.content}></Typography>
                                </Grid>
                            </Grid>
                            <Grid container>
                                <Typography className={classes.contentPadding}>HKIC: {'X254578(6)'}</Typography>
                                <Typography className={classes.contentPadding}>DOB: {'17-Sep-1973'}</Typography>
                                <Typography className={classes.contentPadding}>Age: {'46Y'}</Typography>
                                <Typography className={classes.contentPadding}>Sex: {'F'}</Typography>
                            </Grid>
                        </Grid>
                        <Grid item container alignItems="center" justify="flex-end" xs={4}>
                            <CIMSButton
                                className={classes.button}
                                color="primary"
                                onClick={() => {}}
                            >Medical Summary</CIMSButton>
                            <CIMSButton
                                className={classes.button}
                                color="primary"
                                id="indexPatient_patientPanel_nextPatient"
                                onClick={()=>{}}
                            >Next Patient</CIMSButton>
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
                                        <Typography className={classes.popperContent}>{'CHUK, ON HONG'}</Typography>
                                    </Grid>
                                    <Grid container direction="row" wrap="nowrap">
                                        <Typography className={classes.popperTitle}>Chinese Name:</Typography>
                                        <Typography className={classes.popperContent}>{'(祝安康)'}</Typography>
                                    </Grid>
                                </Paper>
                            </Fade>
                        )}
                    </Popper>
                </Card>
            );
    }
}

export default withStyles(styles)(PatientPanel);