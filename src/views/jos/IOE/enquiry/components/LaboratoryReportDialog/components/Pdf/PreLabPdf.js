import React, { Component } from 'react';
import {Grid,Typography,IconButton} from '@material-ui/core';
import {styles} from '../../LaboratoryReportDialogStyle';
import { withStyles } from '@material-ui/core/styles';
import { ChevronRight, ChevronLeft, FirstPage, LastPage, ZoomIn, ZoomOut } from '@material-ui/icons';
import { Document, Page } from 'react-pdf';
import CIMSButton from '../../../../../../../../components/Buttons/CIMSButton';

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

class PreLabPdf extends Component{
    constructor(props) {
        super(props);
        this.state={
            ...inital_state
        };
      }
      onDocumentLoadSuccess = ({ numPages }) => {
        if (this.state.numPages !== numPages) {
            this.setState({ numPages });
        }
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

    previewDischarge = () => {
        this.setState({ pageNumber: 1, dataType: 'D', scale: 1.0, minScale: 1.0, justifyContent: 'center', padding: '5px' });
    }

    previewPurchase = () => {
        this.setState({ pageNumber: 1, dataType: 'P', scale: 0.75, minScale: 0.75, justifyContent: 'center', padding: '5px' });
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

    onHandlePrint = () => {
        const { onHandlePrint } = this.props;
        onHandlePrint && onHandlePrint();
    }

      render(){
        const {blob} = this.props;
        let id='LaboratoryReport';
        return (
            <div style={{width: '100%' }} >
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
                <CIMSButton style={{left:'48%',fontSize:'1rem'}} color="primary" onClick={this.onHandlePrint} id={id + '_PrintCIMSButton'}>Print</CIMSButton>
            </Grid>
            <Grid container style={{height:672, overflowY:'auto',dispaly: 'flex', justifyContent: 'center', backgroundColor: '#535353', padding: this.state.padding }}>
                <Document
                    className="TestPrintPdf"
                    file={blob? blob: null}
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
                        width={685}
                    />
                </Document>
            </Grid>
        </div>

        );
      }
}

export default withStyles(styles)(PreLabPdf);
