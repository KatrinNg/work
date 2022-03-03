import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    DialogContent,
    DialogActions,
    IconButton,
    Grid,
    Typography
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import { ChevronRight, ChevronLeft, FirstPage, LastPage, ZoomIn, ZoomOut } from '@material-ui/icons';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { printLog } from '../../../../store/actions/moe/moeAction';
import * as moeUtilities from '../../../../utilities/moe/moeUtilities';

pdfjs.GlobalWorkerOptions = null;

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
class PdfPreviewDialog extends React.Component {
    state = {
        ...inital_state,
        previewShow: this.props.previewShow
    }

    // b64toBlob = (b64Data, contentType, sliceSize) => {
    //     contentType = contentType || '';
    //     sliceSize = sliceSize || 512;
    //     let byteCharacters = atob(b64Data);
    //     let byteArrays = [];

    //     for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    //         let slice = byteCharacters.slice(offset, offset + sliceSize);

    //         let byteNumbers = new Array(slice.length);
    //         for (let i = 0; i < slice.length; i++) {
    //             byteNumbers[i] = slice.charCodeAt(i);
    //         }

    //         let byteArray = new Uint8Array(byteNumbers);

    //         byteArrays.push(byteArray);
    //     }

    //     let blob = new Blob(byteArrays, { type: contentType });
    //     return blob;
    // }

    onDocumentLoadSuccess = ({ numPages }) => {
        if (this.state.numPages !== numPages) {
            this.setState({ numPages });
        }
    }

    setJustifyContent = (scale) => {
        let result = 'center';
        if (this.state.dataType === 'D') {
            if (scale > 1.0) {
                result = 'left';
            } else {
                result = 'center';
            }
        }
        else if (this.state.dataType === 'P') {
            if (scale > 1.5) {
                result = 'left';
            } else {
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

            let callback = () => {
                let printCallback = () => {
                    this.props.refreshPrintFlag();
                    this.close();
                };
                this.props.printLog({ previewData: this.props.previewData, callback: printCallback });
            };
            // this.props.print(this.props.previewData, callback);
            if (moeUtilities.getHospSetting().enableCcp) {
                this.props.print(this.props.previewData, callback);
            } else {
                try {
                    const blob = moeUtilities.b64toBlob(this.props.previewData.reportBase64, 'application/pdf');
                    const blobUrl = URL.createObjectURL(blob);
                    const iframe = document.createElement('iframe');
                    iframe.src = blobUrl;
                    iframe.setAttribute('style', 'position: fixed; left: -9999px;');
                    document.body.appendChild(iframe);
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    callback();
                } catch (error) {
                    console.log(error);
                }
            }
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
        const { id, previewData, previewShow, classes } = this.props;
        let documentData64 = null;
        if (previewData) {
            if (this.state.dataType === 'D') {
                documentData64 = previewData.dischargeBase64;
            }
            else if (this.state.dataType === 'P') {
                documentData64 = previewData.purchaseBase64;
            }
        }

        if (previewData) {
            return (
                <CIMSDialog
                    id={id}
                    open={previewShow}
                    dialogTitle={this.state.dataType === 'D' ? 'Preview >> Discharge' : 'Preview >> Purchase'}
                    classes={{
                        paper: classes.fullWidth
                    }}
                >
                    <DialogActions>
                        <Grid container style={{ dispaly: 'flex' }} direction={'row'} alignItems="center">
                            <IconButton id={id + 'FirstPageIconButton'} disabled={this.state.pageNumber <= 1} onClick={this.goToFirstPage}>
                                <FirstPage>First page</FirstPage>
                            </IconButton>
                            <IconButton id={id + 'PrevPageIconButton'} disabled={this.state.pageNumber <= 1} onClick={this.goToPrevPage}>
                                <ChevronLeft>Prev page</ChevronLeft>
                            </IconButton>
                            <Typography>
                                {`Page ${this.state.pageNumber} / ${this.state.numPages}`}
                            </Typography>
                            <IconButton id={id + 'NextPageIconButton'} disabled={this.state.pageNumber >= this.state.numPages} onClick={this.goToNextPage}>
                                <ChevronRight>Next page</ChevronRight>
                            </IconButton>
                            <IconButton id={id + 'LastPageIconButton'} disabled={this.state.pageNumber >= this.state.numPages} onClick={this.goToLastPage}>
                                <LastPage>Last page</LastPage>
                            </IconButton>
                            <IconButton id={id + 'ZoomInIconButton'} disabled={this.state.scale <= this.state.minScale} onClick={this.onZoonOutHandler}>
                                <ZoomOut>Zoom in</ZoomOut>
                            </IconButton>
                            <IconButton id={id + 'ZoomOutIconButton'} disabled={this.state.scale >= this.state.maxScale} onClick={this.onZoonInHandler}>
                                <ZoomIn >Zoom out</ZoomIn>
                            </IconButton>
                        </Grid>
                        {previewData.purchaseBase64 ?
                            <div>
                                <CIMSButton onClick={this.previewDischarge} id={id + '_PreviewDischargeCIMSButton'}
                                    display={previewData.purchaseBase64 !== null && this.state.dataType !== 'D'} style={{ width: '120px' }}
                                >>> Discharge</CIMSButton>
                                <CIMSButton onClick={this.previewPurchase} id={id + '_PreviewPurchaseCIMSButton'}
                                    display={previewData.purchaseBase64 !== null && this.state.dataType !== 'P'} style={{ width: '120px' }}
                                >>> Purchase</CIMSButton>
                            </div>
                            : null}
                        <CIMSButton onClick={this.print} id={id + '_PrintCIMSButton'}>Print</CIMSButton>
                        <CIMSButton onClick={this.close} id={id + '_CloseCIMSButton'}>Close</CIMSButton>
                    </DialogActions>
                    <DialogContent>
                        <div style={{ height: `calc(${window.screen.height - 310}px)`, width: '100%' }} >
                            <Grid container style={{ dispaly: 'flex', justifyContent: this.state.justifyContent, backgroundColor: '#535353', padding: this.state.padding }}>
                                <Document
                                    className="TestPrintPdf"
                                    file={documentData64 ? moeUtilities.b64toBlob(documentData64, 'application/pdf') : null}

                                    onLoadSuccess={this.onDocumentLoadSuccess}
                                    loading=""
                                    options={{
                                        cMapUrl: 'cmaps/',
                                        cMapPacked: true
                                    }}
                                >
                                    <Page
                                        loading=""
                                        pageNumber={this.state.pageNumber}
                                        scale={this.state.scale}
                                        width={this.state.width}
                                    />
                                </Document>
                            </Grid>
                        </div></DialogContent>

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
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PdfPreviewDialog));