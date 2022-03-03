import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    DialogContent,
    DialogActions,
    Grid
} from '@material-ui/core';
import CIMSDialog from '../../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import { pdfjs } from 'react-pdf';
import { printLog } from '../../../../../store/actions/moe/moeAction';
import PdfJsViewer from '../../../report/components/index';
pdfjs.GlobalWorkerOptions = null;
import {getState} from '../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const styles = {
    whiteBackground: {
        backgroundColor: color.cimsBackgroundColor
    },
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
        width: '80%',
        maxHeight: 'inherit'
    }
};
const inital_state = {
    numPages: 0,
    pageNumber: 1,
    scale: 1.0,
    isPrinted: false,

    dataType: 'D',
    justifyContent: 'center',
    minScale: 1.0,
    maxScale: 3,
    padding: '5px'
};
class PreviewPdfDialog extends React.Component {
    state = {
        ...inital_state,
        previewShow: this.props.previewShow,
        dispalyState: this.props.dispalyState == undefined ? true : false
    }

    b64toBlob = (b64Data, contentType, sliceSize) => {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        let byteCharacters = atob(b64Data);
        let byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);

            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            let byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        let blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    onDocumentLoadSuccess = ({ numPages }) => {
        if (this.state.numPages !== numPages) {
            this.setState({ numPages });
        }
    }

    setJustifyContent = (scale) => {
        let result = 'center';
        if (this.state.dataType === 'D') {
            if (scale > 1.0) {
                result = 'center';
            }
        }
        else if (this.state.dataType === 'P') {
            if (scale > 1.5) {
                result = 'center';
            }
        }
        return result;
    }

    onZoonOutHandler = () => {
        let scale = this.state.scale;
        if (scale > this.state.minScale) {
            let _scale = scale - 0.25;
            let _justifyContent = this.setJustifyContent(_scale);
            let _padding = _justifyContent === 'center' ? '5px' : '0px';
            this.setState({
                scale: _scale,
                justifyContent: _justifyContent,
                padding: _padding
            });
        }
    }

    onZoonInHandler = () => {
        let scale = this.state.scale;
        if (scale < this.state.maxScale) {
            let _scale = scale + 0.25;
            let _justifyContent = this.setJustifyContent(_scale);
            let _padding = _justifyContent === 'center' ? '5px' : '0px';
            this.setState({
                scale: _scale,
                justifyContent: _justifyContent,
                padding: _padding
            });
        }
    }

    previewDischarge = () => {
        this.setState({ pageNumber: 1, dataType: 'D', scale: 1.0, minScale: 1.0, justifyContent: 'center', padding: '5px' });
    }

    previewPurchase = () => {
        this.setState({ pageNumber: 1, dataType: 'P', scale: 0.75, minScale: 0.75, justifyContent: 'center', padding: '5px' });
    }

    print = () => {
        if (this.props.previewData) {
            this.props.print();
        }
    }

    close = () => {
        this.setState({
            ...inital_state
        });
        this.props.closePreviewDialog();
    }


    goToFirstPage = () => {
        let currentPage = this.state.pageNumber;
        if (currentPage > 1) {
            this.setState({ pageNumber: 1 });
        }
    }

    goToPrevPage = () => {
        let currentPage = this.state.pageNumber;
        if (currentPage > 1) {
            this.setState({ pageNumber: currentPage - 1 });
        }
    }

    goToNextPage = () => {
        let currentPage = this.state.pageNumber;
        if (currentPage < this.state.numPages) {
            this.setState({ pageNumber: currentPage + 1 });
        }
    }

    goToLastPage = () => {
        let currentPage = this.state.pageNumber;
        if (currentPage < this.state.numPages) {
            this.setState({ pageNumber: this.state.numPages });
        }
    }

    render() {
        const { id, previewData, previewShow, classes,previewTitle,dispalyState } = this.props;
        let documentData64 = null;
        if (previewData) {
            if (this.state.dataType === 'D') {
                documentData64 = previewData;
            }
        }

        if (previewData) {
            return (
                <CIMSDialog
                    id={id}
                    open={previewShow}
                    dialogTitle={`Preview >> ${previewTitle} `}
                    classes={{
                        paper: classes.fullWidth
                    }}
                    onEscapeKeyDown={this.close}
                >
                    <DialogActions style={{padding:'unset',paddingRight:15}} className={classes.whiteBackground}>
                        {previewData.purchaseBase64 ?
                            <div>
                                <CIMSButton onClick={this.previewDischarge} id={id + '_PreviewDischargeCIMSButton'}
                                    display={previewData.purchaseBase64 !== null && this.state.dataType !== 'D'} style={{ width: '120px' }}
                                >&gt;&gt;Discharge</CIMSButton>
                                <CIMSButton onClick={this.previewPurchase} id={id + '_PreviewPurchaseCIMSButton'}
                                    display={previewData.purchaseBase64 !== null && this.state.dataType !== 'P'} style={{ width: '120px' }}
                                >&gt;&gt;Purchase</CIMSButton>
                            </div>
                            : null}
                        <CIMSButton classes={{root:classes.whiteBackground}} onClick={this.print} id={id + '_PrintCIMSButton'} display={dispalyState}>Print</CIMSButton>
                        <CIMSButton classes={{root:classes.whiteBackground}} onClick={this.close} id={id + '_CloseCIMSButton'}>Close</CIMSButton>
                    </DialogActions>
                    <DialogContent className={classes.whiteBackground}>
                        <div style={{ height: `calc(${window.screen.height - 310}px)`, width: '100%' }} >
                            <Grid container style={{ dispaly: 'flex', justifyContent: this.state.justifyContent, backgroundColor: '#535353', padding: this.state.padding }}>
                                   <PdfJsViewer
                                       height={760}
                                       url={{url: documentData64 ? window.URL.createObjectURL(this.b64toBlob(documentData64, 'application/pdf')) : 'absolute'}}
                                       disablePrint
                                   />
                            </Grid>
                        </div>
                    </DialogContent>

                </CIMSDialog>
            );
        } else {
            return null;
        }
    }
}
const mapStateToProps = () => {
    return {

    };
};
const mapDispatchToProps = {
    printLog
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PreviewPdfDialog));