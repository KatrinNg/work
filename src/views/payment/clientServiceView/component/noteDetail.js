import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Grid, Box, Avatar, Typography, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CIMSTextField from '../../../../components/TextField/CIMSTextField';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import ClientServiceViewEnum from '../../../../enums/payment/clientServiceView/clientServiceViewEnum';
import WaiveParts from './waiveParts';
import AddRemoveButtons from '../../../../components/Buttons/AddRemoveButtons';
import Enum from '../../../../enums/enum';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import onResize from 'resize-event';
import { updateField } from '../../../../store/actions/payment/clientServiceView/clientServiceViewAction';
import * as ClientServiceViewUtil from '../../../../utilities/clientServiceViewUtilities';

const styles = makeStyles(() => ({
    itemFrontPadding: {
        padding: '8px 0px 8px 8px',
        width: '8vw'
    },
    itemPadding: {
        padding: 8
        // alignItems: 'center'
    },
    encntrDate: {
        // padding: 8,
        marginTop: 10
    },
    detailType: {
        fontSize: '1rem',
        fontWeight: 'bold',
        // marginLeft: 200,
        padding: '0px 8px'
        // paddingLeft:205
    },
    delAvatar: {
        float: 'left',
        fontSize: 14,
        width: 30,
        height: 30,
        // marginRight: 5,
        backgroundColor: '#80a7d5'
    },
    colorSecondary: {
        '&:hover': {
            backgroundColor: 'unset'
        }
    }
}));

const ConsultationDetail = (props) => {
    const classes = styles();
    const { id, catgryCd, note, isClinicalUser, isCurrentCaseNo, noteIdx, historyIsOpen, notesBk } = props;
    const type = ClientServiceViewEnum.NOTE_TYPE[catgryCd];
    const displayDelIcon = note.isDelete === 'Y' ?
        (note.isPaid === 1 || note.isComplete === 1)
        : false;

    return (
        <Grid item container>
            <Grid item container style={{ width: historyIsOpen ? '24vw' : '46vw' }}>
                <Grid item container>
                    <Grid item container className={classes.itemFrontPadding}>
                        {/* <Grid item container xs={9} className={classes.encntrDate}>{moment(note.encounterDate).format(Enum.DATE_FORMAT_EDMY_VALUE)}</Grid>
                        <Grid item container xs={3}></Grid> */}
                        <Grid item container className={classes.encntrDate} style={{ width: '5vw' }}>
                            {
                                note.encounterDate ? moment(note.encounterDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : null
                            }
                        </Grid>
                        <Grid item container xs={4} justify={'center'}>
                            {
                                // note.isDelete === 'Y' ?
                                displayDelIcon ?
                                    <Tooltip
                                        title={<Typography>Deleted</Typography>}
                                    >
                                        <Avatar className={classes.delAvatar}>Del.</Avatar>
                                    </Tooltip>
                                    : null
                            }
                        </Grid>
                    </Grid>
                    <Grid item container xs={3} className={classes.itemPadding}>
                        <Box
                            style={{
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                marginTop: 10
                            }}
                        >{type}</Box>
                    </Grid>
                </Grid>
            </Grid>
            <WaiveParts
                id={`${id}_${type}_${noteIdx}`}
                note={note}
                noteIdx={noteIdx}
                notesBk={notesBk}
                isClinicalUser={isClinicalUser}
                isCurrentCaseNo={isCurrentCaseNo}
            />
        </Grid>
    );

};

const CommonDetail = (props) => {
    const classes = styles();
    const { id, catgryCd, note, noteIdx, isClinicalUser, isCurrentCaseNo, noteData, historyIsOpen, notesBk, removeReissueItem, autoFocusIdx } = props;

    const type = ClientServiceViewEnum.NOTE_TYPE[catgryCd];
    const showCatgryDesc = noteIdx === 0 ? true : (noteData && note.catgryCd !== noteData[noteIdx - 1].catgryCd);
    const requireInstruction = note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate
        && note.chargeCd === 'RIOTHER';

    let compRef = React.useRef(null);
    let descRef = React.useRef(null);
    const [compResizeTime, setCompResizeTime] = React.useState(moment().format());
    // const autoFocus = autoFocusIdx === noteIdx && note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate && note.chargeCd === 'RIOTHER';

    React.useEffect(() => {
        if (compRef && compRef.current) {
            const comp = compRef.current;
            onResize(comp, () => {
                setCompResizeTime(moment().format());
            });
        }
    }, []);

    React.useEffect(() => {
        if (autoFocusIdx === noteIdx && note.catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate && note.chargeCd === 'RIOTHER') {
            if (descRef && descRef.current) {
                descRef.current.focus();
            }
        }
    }, []);


    const changeItemDetials = (name, value) => {
        let _noteData = _.cloneDeep(noteData);
        let _note = _.cloneDeep(note);
        _note[name] = value;
        _noteData[noteIdx] = _note;
        props.updateField({ noteData: _noteData, autoFocusIdx: -1 });
    };
    const bk = notesBk ? notesBk[noteIdx] : null;
    let isDirty = false;
    // let newComplete = false;
    if (bk) {
        isDirty = ClientServiceViewUtil.checkItemIsDirty(note.paidDtm, bk.paidDtm);
    } else {
        isDirty = true;
    }
    const newComplete = !bk ? true : note.isComplete === 1 && note.completeDtm !== bk.completeDtm;
    const noteStatus = ClientServiceViewUtil.getNoteStatus(note, isDirty, bk);
    const isPaid = ClientServiceViewUtil.itemIsPaid(note, isDirty);
    const hideRemoveIcon = isPaid ? true : noteStatus !== '' && !newComplete;

    const displayDelIcon = note.isDelete === 'Y' ?
        (note.isPaid === 1 || note.isComplete === 1)
        : false;


    return (
        <Grid item container>
            {
                showCatgryDesc ?
                    <Grid item container xs={12}>
                        <Grid item container style={{ width: historyIsOpen ? '24vw' : '46vw' }}>
                            <Grid item container style={{ width: '8vw' }}></Grid>
                            <Grid item container xs={5}><Box className={classes.detailType}>{type}</Box></Grid>
                        </Grid>
                    </Grid>
                    : null
            }
            <Grid item container>
                <Grid item container style={{ width: historyIsOpen ? '24vw' : '46vw' }}>
                    <Grid item container className={classes.itemFrontPadding}>
                        <Grid item container className={classes.encntrDate} style={{ width: '5vw' }}>
                            {
                                note.encounterDate ? moment(note.encounterDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : null
                            }
                        </Grid>
                        <Grid item container xs={4} justify={'center'}>
                            {catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.ReissueCertificate ?
                                isCurrentCaseNo ?
                                    // note.isPaid !== 1 ?
                                    // noteStatus === '' || newComplete ?
                                    hideRemoveIcon ? null :
                                        <AddRemoveButtons
                                            id={`client_service_view_${type}_${noteIdx}`}
                                            hideAdd
                                            RemoveButtonProps={{
                                                onClick: () => removeReissueItem(noteIdx),
                                                style: { alignItems: 'flex-start', padding: 6 },
                                                classes: {
                                                    colorSecondary: classes.colorSecondary
                                                }
                                            }}
                                        />
                                    : null

                                :
                                // note.isDelete === 'Y' ?
                                displayDelIcon ?
                                    <Tooltip
                                        title={<Typography>Deleted</Typography>}
                                    >
                                        <Avatar className={classes.delAvatar}>Del.</Avatar>
                                    </Tooltip>
                                    : null
                            }
                        </Grid>
                    </Grid>

                    <Grid item className={classes.itemPadding} style={{ width: historyIsOpen ? '7vw' : '18vw' }}>
                        <Tooltip title={note.chargeDesc}>
                            <CIMSTextField
                                id={`${id}_${type}_${noteIdx}_charges_desc_text_field`}
                                disabled
                                variant={'outlined'}
                                value={note.chargeDesc}
                            />
                        </Tooltip>
                    </Grid>
                    <Grid item className={classes.itemPadding} style={{ width: historyIsOpen ? '9vw' : '20vw' }}>
                        <Tooltip title={note.itemInstruction || ''}>
                            {
                                type === ClientServiceViewEnum.NOTE_TYPE.IOE || type === ClientServiceViewEnum.NOTE_TYPE.REISSUE
                                    ?
                                    <FastTextFieldValidator
                                        id={`${id}_${type}_${noteIdx}_item_desc_text_field`}
                                        disabled={isCurrentCaseNo ? note.chargeCd !== 'RIOTHER' ? true : hideRemoveIcon : true}
                                        variant={'outlined'}
                                        ref={descRef}
                                        value={note.itemInstruction}
                                        onBlur={(e) => { changeItemDetials('itemInstruction', e.target.value); }}
                                        inputProps={{ maxLength: 1000 }}
                                        calActualLength
                                        validators={requireInstruction ? [ValidatorEnum.required] : []}
                                        errorMessages={requireInstruction ? [CommonMessage.VALIDATION_NOTE_REQUIRED()] : []}
                                        style={{ textOverflow: 'ellipsis' }}
                                    />
                                    :
                                    <CIMSMultiTextField
                                        id={`${id}_${type}_${noteIdx}_item_desc_text_field`}
                                        key={note.itemInstruction || compResizeTime}
                                        disabled
                                        rows={1}
                                        rowsMax={3}
                                        inputProps={{
                                            ref: compRef
                                        }}
                                        variant={'outlined'}
                                        value={note.itemInstruction}
                                    />
                            }
                        </Tooltip>
                    </Grid>
                </Grid>
                <WaiveParts
                    id={`${id}_${type}_${noteIdx}`}
                    note={note}
                    noteIdx={noteIdx}
                    notesBk={notesBk}
                    isClinicalUser={isClinicalUser}
                    isCurrentCaseNo={isCurrentCaseNo}
                />
            </Grid>
        </Grid>
    );
};

const NoteDetail = (props) => {
    const { note, noteIdx, ...rest } = props;
    const catgryCd = note.catgryCd;
    if (catgryCd === ClientServiceViewEnum.NOTES_CATEGORY_CD.Consultation) {
        return (
            <ConsultationDetail
                catgryCd={catgryCd}
                note={note}
                noteIdx={noteIdx}
                {...rest}
            />
        );
    } else {
        return (
            <CommonDetail
                catgryCd={catgryCd}
                note={note}
                noteIdx={noteIdx}
                {...rest}
            />
        );
    }
};

const mapState = (state) => {
    return {
        noteData: state.clientSvcView.noteData,
        autoFocusIdx: state.clientSvcView.autoFocusIdx
    };
};

const dispatch = {
    updateField
};


export default connect(mapState, dispatch)(NoteDetail);