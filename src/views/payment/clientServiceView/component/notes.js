import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Grid, Tooltip, Typography, SvgIcon } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Info } from '@material-ui/icons';
import NoteDetail from './noteDetail';
import {
    updateField,
    listThsCharges
} from '../../../../store/actions/payment/clientServiceView/clientServiceViewAction';
import {
    openCommonMessage
} from '../../../../store/actions/message/messageAction';
import { checkPaidAll } from '../../../../utilities/clientServiceViewUtilities';
import { auditAction } from '../../../../store/actions/als/logAction';

const styles = makeStyles((theme) => ({
    label: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    detailType: {
        fontSize: '1rem',
        fontWeight: 'bold',
        marginLeft: 205
    },
    noteTitle: {
        position: 'absolute',
        height: 40,
        backgroundColor: theme.palette.cimsBackgroundColor,
        zIndex: 2,
        fontWeight: 600
    },
    noteDetails: {
        maxHeight: 575,
        overflow: 'overlay'
    }
}));

const TreatmentDTMInfo = () => {
    return (
        <Grid item xs={2}>
            <Tooltip
                title={
                    <Typography>
                        Treatment date may not be the same as the actual treatment given date
                    </Typography>
                }
                placement={'bottom'}
            >
                <SvgIcon
                    component={Info}
                    color={'primary'}
                />
            </Tooltip>

        </Grid>
    );
};

const NotesHeader = (props) => {
    const { open } = props;
    const classes = styles();
    return (
        <Grid item container className={classes.noteTitle}>
            <Grid item container style={{ padding: 8, alignItems: 'center', width: open ? '24vw' : '46vw' }}>Encounter Date</Grid>
            <Grid item container style={{ width: '47vw' }}>
                <Grid item container className={classes.label} style={{ width: '6vw' }}>Course</Grid>
                <Grid item container className={classes.label} style={{ width: '6vw' }}>Item Price</Grid>
                <Grid item container className={classes.label} style={{ width: '9vw' }}>
                    <Grid container item>
                        <Grid item xs={9} style={{ margin: 'auto' }}>
                            {'Treatment Date'}
                        </Grid>
                        <TreatmentDTMInfo />
                    </Grid>
                </Grid>
                <Grid item container className={classes.label} style={{ width: '7vw' }}>Waive Type</Grid>
                <Grid item container className={classes.label} style={{ width: '6.5vw' }}>Paid</Grid>
                <Grid item container className={classes.label} style={{ width: '6.5vw' }}>Completed</Grid>
                <Grid item container className={classes.label} style={{ width: '6vw' }}>Amount</Grid>
            </Grid>
        </Grid>
    );
};

const NotesDetails = (props) => {
    const { id, noteData, thsCharges, isCurrentCaseNo, notesBk, open, isClinicalUser } = props;
    const removeReissueItem = (reissueItemIdx) => {
        props.auditAction('Remove Re-issue Certificate item');
        let _noteData = _.cloneDeep(noteData);
        if (!_noteData[reissueItemIdx].csnId && !_noteData[reissueItemIdx].csnItemId) {
            _noteData.splice(reissueItemIdx, 1);
        } else {
            _noteData[reissueItemIdx].status = 'D';
        }
        let isPaidAll = checkPaidAll(_noteData);
        props.updateField({ noteData: _noteData, isPaidAll });
    };

    return (
        <Grid item container style={{ minHeight: 500, display: 'block', marginTop: 40 }}>
            {noteData.map((note, idx) => {
                if ((!note.csnId && !note.csnItemId && note.status !== 'D') || note.status === 'A' || note.status === 'R') {
                    return (
                        <NoteDetail
                            id={id}
                            key={idx}
                            note={note}
                            noteIdx={idx}
                            thsCharges={thsCharges}
                            notesBk={notesBk}
                            isClinicalUser={isClinicalUser}
                            isCurrentCaseNo={isCurrentCaseNo}
                            noteData={noteData}
                            historyIsOpen={open}
                            removeReissueItem={removeReissueItem}
                        />
                    );
                }
            })}
        </Grid>
    );
};

const Notes = (props) => {
    const classes = styles();
    React.useEffect(() => {
        props.listThsCharges();
    }, []);

    return (
        props.noteData ?
            <Grid container className={classes.noteDetails}>
                <NotesHeader
                    open={props.open}
                />
                <NotesDetails {...props} />
            </Grid>
            : null
    );
};

const mapState = (state) => {
    return {
        thsCharges: state.clientSvcView.thsCharges,
        noteData: state.clientSvcView.noteData,
        open: state.clientSvcView.open
    };
};

const dispatch = {
    updateField,
    listThsCharges,
    openCommonMessage,
    auditAction
};


export default connect(mapState, dispatch)(Notes);