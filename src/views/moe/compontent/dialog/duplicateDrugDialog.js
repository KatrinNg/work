import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    DialogContent,
    DialogActions,
    Grid,
    Typography,
    Divider
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import * as prescriptionUtilities from '../../../../utilities/prescriptionUtilities';
import warningIcon from '../../../../images/moe/icon-warning.gif';
import newIcon from '../../../../images/moe/new_icon.gif';
import SaveDrugErrorMessage from '../saveDrugErrorMessage/saveDrugErrorMessage';
import CIMSCheckbox from '../../../../components/CheckBox/CIMSCheckBox';

const styles = {
    checkboxBtn: {
        height: 26,
        paddingTop: 0,
        paddingBottom: 0,
        '&$checkboxBtnChecked': {
            height: 26,
            paddingTop: 0,
            paddingBottom: 0
        }
    },
    checkboxBtnChecked: {},
    root: {
        width: '100%',
        margin: 0,
        padding: '5px 10px',
        position: 'relative'
    },
    buttonPosition: {
        position: 'absolute',
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItem: 'center'
    },
    newIcon: {
        width: 28,
        height: 17
    },
    titleFont: {
        wordWrap: 'break-word',
        wordBreak: 'normal',
        width: 'calc(100% - 80px)'
    },
    fullWidth: {
        maxWidth: '100%',
        overflowY: 'unset',
        width: '80%'
    }
};
class DuplicateDrugDialog extends React.Component {
    handleChangeCb = (e, checked, item, index) => {
        this.props.handleChangeCb(e, checked, item, index);
    }
    confirlDeleteDrug = () => {
        this.props.confirmDeleteDuplicateDrug();
    }
    render() {
        const { id, open, duplicateList, codeList, classes, isHideDose } = this.props;
        const newDuplicateList = prescriptionUtilities.getGroupForArray(duplicateList, 'type');
        if (newDuplicateList) {
            return (
                <CIMSDialog
                    id={id}
                    open={open}
                    dialogTitle={'Same Route / Site Same Drug'}
                    classes={{
                        paper: classes.fullWidth
                    }}
                >
                    <DialogContent>
                        <Grid container direction={'column'} spacing={1}
                            style={{
                                display: 'flex',
                                flexWrap: 'nowrap',
                                maxHeight: `calc(${window.screen.availHeight - 320}px)`,
                                overflowY: 'auto',
                                overflowX: 'hidden'
                            }}
                        >
                            <Grid item container alignItems={'center'}>
                                <img src={warningIcon} id={id + '_warningIconAvatar'} alt={''} />The following duplication is detected in the prescription:
                            </Grid>
                            <Grid item container justify={'flex-end'}>
                                <Grid>Delete?</Grid>
                            </Grid>
                            <Grid >
                                {newDuplicateList.map((item, index) =>
                                    <Typography component={'div'} key={index}>
                                        {item.data.map((subItem, subIndex) =>
                                            <Grid item container direction={'row'} className={classes.root} key={subIndex}>
                                                <Grid className={classes.newIcon}>
                                                    {subItem.isNewForDelete ? <img src={newIcon} id={id + '_newIconAvatar'} alt={''} /> : null}
                                                </Grid>
                                                <Grid className={classes.titleFont} id={id + '_duplicateTitleGrid'}>
                                                    {prescriptionUtilities.generatePanelTitle(subItem, codeList, isHideDose)}
                                                    <Typography style={{ whiteSpace: 'pre-wrap' }}><i>{subItem.remarkText ? 'Note: ' + subItem.remarkText : null}</i></Typography>
                                                </Grid>
                                                <Grid className={classes.buttonPosition}>
                                                    <CIMSCheckbox
                                                        classes={{
                                                            root: classes.checkboxBtn,
                                                            checked: classes.checkboxBtnChecked
                                                        }}
                                                        id={id + '_deleteCheckbox'}
                                                        onChange={(...arg) => this.handleChangeCb(...arg, subItem, index)}
                                                    />
                                                </Grid>
                                            </Grid>
                                        )}
                                        {index !== newDuplicateList.length - 1 && <Divider style={{ margin: '20px 0' }} />}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Grid item container justify="flex-start">
                            <SaveDrugErrorMessage />
                        </Grid>
                        <CIMSButton onClick={this.confirlDeleteDrug} id={id + '_ConfirmCIMSButton'}>Confirm</CIMSButton>
                        <CIMSButton onClick={this.props.closeDuplicateDialog} id={id + '_BackCIMSButton'}>Back</CIMSButton>
                    </DialogActions>
                </CIMSDialog>
            );
        } else {
            return null;
        }
    }
}
const mapStateToProps = (state) => {
    return {
        codeList: state.moe.codeList,
        selectedDeletedList: state.moe.selectedDeletedList
    };
};
const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DuplicateDrugDialog));