import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './ClinicalDocumentDialogStyle';
import { Dialog, DialogTitle,FormControl } from '@material-ui/core';
import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';
import ClinicalDocument from './component/ClinicalDocument';

function PaperComponent(props) {
    return (
        <Draggable
            handle="#draggable-dialog-title"
        >
            <Paper {...props} />
        </Draggable>
    );
}

class ClinicalDocumentDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chtBtnArr: [
                { label: 'Normal', value: 1 },
                { label: 'Suspected CHT', value: 2 },
                { label: 'Confirmed CHT', value: 3 }
            ],
            g6pdBtnArr: [
                { label: 'Normal', value: 1 },
                { label: 'G6PD Deficiency', value: 3 },
                { label: 'G6PD Borderline', value: 2 }
            ],
            open: true,
            isEdit: false
        };
    }

    handleClose = () => {
        let { updateState, onRefreshPage, clinicalDocumentType, openCommonMessage, handleClose } = this.props;
        let { isEdit } = this.state;
        if (isEdit) {
            let payload = {
                msgCode: '102636',
                btnActions: {
                    btn1Click: () => {
                        this.setState({ isEdit: false });
                        onRefreshPage && onRefreshPage();
                        (typeof handleClose === 'function') ? handleClose() : updateState && updateState({ isDocShow: false });
                    }
                },
                params: [
                    { name: 'title', value: clinicalDocumentType }
                ]
            };
            openCommonMessage && openCommonMessage(payload);
        } else {
            this.setState({ isEdit: false });
            onRefreshPage && onRefreshPage();
            (typeof handleClose === 'function') ? handleClose() : updateState && updateState({ isDocShow: false });
        }
    }

    changeEditFlag = (falg = true) => {
        this.setState({
            isEdit: falg
        });
    }

    render() {
        //clinicalDocumentType equals CHT OR G6PD
        const { classes, dialogTitle, clinicalDocumentType = 'CHT', open, neonatalDocId, ...rests } = this.props;
        let { chtBtnArr, g6pdBtnArr } = this.state;
        let clinicalDocumentProps = {
            btnArr: clinicalDocumentType === 'CHT' ? chtBtnArr : g6pdBtnArr,
            closeDialog: this.handleClose,
            changeEditFlag: this.changeEditFlag,
            clinicalDocumentType,
            neonatalDocId,
            ...rests
        };
        return (
            <div>
                <Dialog
                    aria-describedby="alert-dialog-description"
                    aria-labelledby="alert-dialog-title"
                    classes={{
                        paper: classes.paper
                    }}
                    open={open}
                    // onClose={this.handleClose}
                    PaperComponent={PaperComponent}
                >
                    <DialogTitle
                        className={classes.dialogTitle}
                        disableTypography
                        customdrag="allowed"
                        id="draggable-dialog-title"
                    >
                        {dialogTitle}
                    </DialogTitle>
                    <FormControl>
                        <div className={classes.divContent}>
                            <ClinicalDocument {...clinicalDocumentProps} />
                        </div>
                    </FormControl>
                </Dialog>
            </div>
        );
    }
}
export default withStyles(styles)(ClinicalDocumentDialog);