import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import TimeslotPlanWeekdayForm from './timeslotPlanWeekdayForm';

import _ from 'lodash';

const styles = theme => ({
    gridRow: {
        minHeight: '60px'
    },
    gridInputRow: {
        minHeight: '75px'
    },
    paddingRow: {
        height: '30px'
    },
    dialogActions: {
        justifyContent: 'flex-start'
    },
    disabledTextFieldRoot: {
        backgroundColor: Colors.grey[200]
    },
    disabledTextFieldInput: {
        color: 'rgba(0, 0, 0, 0.54)',
        readOnly: true
    },
    quotaTextFieldRoot: {
        minWidth: '90px',
        maxWidth: '120px'
    },
    actionButtonRoot: {
        color: '#0579c8',
        border: 'solid 1px #0579C8',
        boxShadow: '2px 2px 2px #6e6e6e',
        backgroundColor: '#ffffff',
        minWidth: '90px',
        marginTop: '10px',
        '&:disabled': {
            border: 'solid 1px #aaaaaa',
            boxShadow: '1px 1px 1px #6e6e6e'
        },
        '&:hover': {
            color: '#ffffff',
            backgroundColor: '#0579c8'
        }
    },
    selectRoot: {
        minWidth: '250px'
    },
    fontBold: {
        fontWeight: 'bold'
    },
    error: {
        color: "red",
        fontSize: "0.75rem"
    }
});

class TimeslotPlanWeekdayDialog extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        
    }
    
    componentDidUpdate(prevProps) {
        
    }

    render() {
        const idConstant = this.props.id + '_weekday';
        const { classes, open, tmsltPlanHdrId, tmsltPlanHdr, tmsltPlanWeekday, readOnly } = this.props;
        return (
            <Dialog
                id={idConstant} 
                open={open}
                fullWidth
                maxWidth="xl"
            >
                <DialogTitle>Timeslot Management</DialogTitle>
                <DialogContent dividers>
                    <TimeslotPlanWeekdayForm
                        id={idConstant + '_form'}
                        tmsltPlanHdrId={tmsltPlanHdrId}
                        tmsltPlanHdr={tmsltPlanHdr}
                        tmsltPlanWeekday={tmsltPlanWeekday}
                        readOnly={readOnly}
                    />
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                </DialogActions>
            </Dialog>
        );
    }
}

function mapStateToProps(state) {
    return {
        timeslotPlanHdrs: state.timeslotPlan.timeslotPlanHdrs,
        tmsltPlanHdrId: state.timeslotPlan.tmsltPlanHdrId,
        tmsltPlanHdr: state.timeslotPlan.tmsltPlanHdr,
        tmsltPlanWeekday: state.timeslotPlan.tmsltPlanWeekday,
        timeslotPlans: state.timeslotPlan.timeslotPlans,
        otherTimeslotPlans: state.timeslotPlan.otherTimeslotPlans,
        sessionsConfig: state.common.sessionsConfig,
        quotaConfig: state.common.quotaConfig,
        siteId: state.login.clinic.siteId
    };
}

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TimeslotPlanWeekdayDialog));
