import React, { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { Grid, IconButton, Typography } from '@material-ui/core';
import { ChevronRight, ChevronLeft, FirstPage, LastPage, ZoomIn, ZoomOut } from '@material-ui/icons';

// const styles=makeStyles(()=>({
//     pdfContainer:{
//         scale
//     }
// }));

const CIMSPdfViewer = React.forwardRef((props, ref) => {
    const { id, position } = props;
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [scale, setScale] = useState(1.25);
    const [previewBlobData, setPreviewBlobData] = useState(null);
    const [boolScaleValue, setBoolScaleValue] = useState(false);
    const [renderSuccess, setRenderSuccess] = useState(false);

    const [pdfStyle, setPdfStyle] = useState({
        backgroundColor: '#535353',
        height: 'inherit',
        width: 'inherit',
        justifyContent: 'center',
        alignItems: 'center'
    });

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

    useEffect(() => {
        setPreviewBlobData(b64toBlob(props.previewData, 'application/pdf'));
    }, [props.previewData]);

    useEffect(() => {
        setBoolScaleValue(true);
        if (boolScaleValue) {
            let pdfStyle = null;
            if (position === 'vertical') {
                pdfStyle = {
                    dispaly: 'flex',
                    justifyContent: scale > 2.25 ? 'left' : 'center',
                    backgroundColor: '#535353',
                    padding: 5,
                    width: scale > 2.25 ? 'max-content' : 'initial',
                    height: scale > 2.25 ? 'max-content' : 'initial',
                    alignItems: 'center'
                };

            } else {
                pdfStyle = {
                    dispaly: 'flex',
                    justifyContent: scale > 1.5 ? 'left' : 'center',
                    backgroundColor: '#535353',
                    padding: 5,
                    width: scale > 1.5 ? 'max-content' : '100%',
                    height: scale >= 1.5 ? 'max-content' : '110vh',
                    alignItems: 'center'
                };
            }
            setPdfStyle(pdfStyle);
        }
    }, [scale]);

    React.useImperativeHandle(ref, () => ({
        goToPage: (pageNum) => {
            setPageNumber(pageNum);
        }
    }));

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
            setPageNumber(totalPage);
        }
    };

    const onZoonInHandler = () => {
        if (scale < 3.0) {
            setScale(scale + 0.25);
        }
    };

    const onZoonOutHandler = () => {
        if (scale > 0.5) {
            setScale(scale - 0.25);
        }
    };

    const onDocumentLoadSuccess = (e) => {
        let numPages = e._pdfInfo.numPages;
        if (totalPage !== numPages) {
            setTotalPage(numPages);
        }
    };

    const onRenderSuccess = (e) => {
        let pdfStyle = null;
        if (position === 'vertical') {
            pdfStyle = {
                dispaly: 'flex',
                justifyContent: scale > 2.25 ? 'left' : 'center',
                backgroundColor: '#535353',
                padding: 5,
                width: scale > 2.25 ? 'max-content' : 'initial',
                height: scale > 2.25 ? 'max-content' : 'initial',
                alignItems: 'center'
            };

        } else {
            pdfStyle = {
                dispaly: 'flex',
                justifyContent: scale > 1.5 ? 'left' : 'center',
                backgroundColor: '#535353',
                padding: 5,
                width: scale > 1.5 ? 'max-content' : '100%',
                height: scale >= 1.5 ? 'max-content' : '110vh',
                alignItems: 'center'
            };
        }
        setPdfStyle(pdfStyle);
        setRenderSuccess(true);
    };

    const pdfPosition = position ? position : 'horizontal';

    return (
        <Grid container>
            <Grid container style={{ dispaly: 'flex' }} direction={'row'} alignItems="center">
                <IconButton id={id + 'FirstPageIconButton'} disabled={pageNumber <= 1} onClick={goToFirstPage}>
                    <FirstPage>First page</FirstPage>
                </IconButton>
                <IconButton id={id + 'PrevPageIconButton'} disabled={pageNumber <= 1} onClick={goToPrevPage}>
                    <ChevronLeft>Prev page</ChevronLeft>
                </IconButton>
                <Typography>
                    {`Page ${pageNumber} / ${totalPage}`}
                </Typography>
                <IconButton id={id + 'NextPageIconButton'} disabled={pageNumber >= totalPage} onClick={goToNextPage}>
                    <ChevronRight>Next page</ChevronRight>
                </IconButton>
                <IconButton id={id + 'LastPageIconButton'} disabled={pageNumber >= totalPage} onClick={goToLastPage}>
                    <LastPage>Last page</LastPage>
                </IconButton>
                <IconButton id={id + 'ZoomInIconButton'} disabled={scale <= 0.5} onClick={onZoonOutHandler}>
                    <ZoomOut>Zoom in</ZoomOut>
                </IconButton>
                <IconButton id={id + 'ZoomOutIconButton'} disabled={scale >= 3.0} onClick={onZoonInHandler}>
                    <ZoomIn >Zoom out</ZoomIn>
                </IconButton>
            </Grid>
            <div style={{ height: `calc(${window.screen.height - 420}px)`, width: '100%', overflowY: 'auto' }} >
                <Grid container
                    style={pdfStyle}
                >
                    <span style={{ visibility: renderSuccess ? 'visible' : 'hidden' }}>
                        <Document
                            className="TestPrintPdf"
                            file={previewBlobData}

                            onLoadSuccess={onDocumentLoadSuccess}
                            loading=""
                            options={{
                                cMapUrl: 'cmaps/',
                                cMapPacked: true
                            }}
                        >
                            <Page
                                loading=""
                                pageNumber={pageNumber}
                                onRenderSuccess={onRenderSuccess}
                                scale={scale}
                            />
                        </Document>
                    </span>
                </Grid>
            </div>
        </Grid>
    );
});

export default CIMSPdfViewer;