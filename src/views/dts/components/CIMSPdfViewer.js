import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { Grid, IconButton, Typography } from '@material-ui/core';
import { ChevronRight, ChevronLeft, FirstPage, LastPage, ZoomIn, ZoomOut } from '@material-ui/icons';

const CIMSPdfViewer = props => {
    const { id, previewData, isShowControlBar, defaultScale, height } = props;
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    //defaultScale = 1.25
    const [scale, setScale] = useState(defaultScale);

    const b64toBlob = (b64Data, contentType, sliceSize) => {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        let byteCharacters = atob(b64Data);
        let byteArrays = [];

        for (let offSet = 0; offSet < byteCharacters.length; offSet += sliceSize) {
            let slice = byteCharacters.slice(offSet, offSet + sliceSize);

            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            let byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }
        let blob = new Blob(byteArrays, { type: contentType });
        return blob;
    };

    const goToFirstPage = () => {
        if (pageNumber > 1) {
            setPageNumber(1);
        }
    };

    const goToPrevPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const goToNextPage = () => {
        setPageNumber(pageNumber + 1);
    };

    const goToLastPage = () => {
        let curPage = pageNumber;
        if (curPage < totalPage) {
            setPageNumber(curPage + 1);
        }
    };

    const onZoonInHandler = () => {
        if (scale < 3.0) {
            setScale(scale + 0.25);
        }
    };

    const onZoonOutHandler = () => {
        if (scale > 1.0) {
            setScale(scale - 0.25);
        }
    };

    const onDocumentLoadSuccess = e => {
        let numPages = e._pdfInfo.numPages;
        if (totalPage !== numPages) {
            setTotalPage(numPages);
        }
    };

    return (
        <Grid container>
            {isShowControlBar ? (
                <Grid container style={{ dispaly: 'flex' }} direction={'row'} alignItems="center">
                    <IconButton id={id + 'FirstPageIconButton'} disabled={pageNumber <= 1} onClick={goToFirstPage}>
                        <FirstPage>First page</FirstPage>
                    </IconButton>
                    <IconButton id={id + 'PrevPageIconButton'} disabled={pageNumber <= 1} onClick={goToPrevPage}>
                        <ChevronLeft>Prev page</ChevronLeft>
                    </IconButton>
                    <Typography>{`Page ${pageNumber} / ${totalPage}`}</Typography>
                    <IconButton id={id + 'NextPageIconButton'} disabled={pageNumber >= totalPage} onClick={goToNextPage}>
                        <ChevronRight>Next page</ChevronRight>
                    </IconButton>
                    <IconButton id={id + 'LastPageIconButton'} disabled={pageNumber >= totalPage} onClick={goToLastPage}>
                        <LastPage>Last page</LastPage>
                    </IconButton>
                    <IconButton id={id + 'ZoomInIconButton'} disabled={scale <= 1.0} onClick={onZoonOutHandler}>
                        <ZoomOut>Zoom in</ZoomOut>
                    </IconButton>
                    <IconButton id={id + 'ZoomOutIconButton'} disabled={scale >= 3.0} onClick={onZoonInHandler}>
                        <ZoomIn>Zoom out</ZoomIn>
                    </IconButton>
                </Grid>
            ) : null}
            {/* <div style={{ height: `calc(${window.screen.height - 310}px)`, width: '100%' }}> */}
            <div style={{ height: height, width: '100%' }}>
                <Grid
                    container
                    style={{
                        dispaly: 'flex',
                        justifyContent: scale > 1.5 ? 'left' : 'center',
                        // backgroundColor: '#535353', //DH Miki 03-09-2020 Sprint 8
                        padding: 5,
                        width: scale > 1.5 ? 'max-content' : '100%',
                        // height: scale >= 1.5 ? 'max-content' : '76vh',
                        height: scale > 1.5 ? 'max-content' : '100%',
                        alignItems: 'center'
                    }}>
                    <Document
                        className="TestPrintPdf"
                        file={previewData ? b64toBlob(previewData, 'application/pdf') : null}
                        // file={previewData}

                        onLoadSuccess={onDocumentLoadSuccess}
                        loading=""
                        options={{
                            cMapUrl: 'cmaps/',
                            cMapPacked: true
                        }}>
                        <Page
                            loading=""
                            pageNumber={pageNumber}
                            scale={scale}
                            // width={this.state.width}
                        />
                    </Document>
                </Grid>
            </div>
        </Grid>
    );
};

export default CIMSPdfViewer;
