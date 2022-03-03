import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './assets/css/App.css';
import Viewer from './Viewer.js';
import Toolbar from './Toolbar.js';
// import * as pdfWorker from "pdfjs-dist/build/pdf.worker";
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';
// import pdfjsLib from "pdfjs-dist/webpack";
import pdfjsLib from 'pdfjs-dist';
import { normalizeWheelEventDelta, convertToBlob } from './utils/pdfjsUtils';
// import PrintViewer from './PrintViewer';
import printJS from 'print-js';

const DEFAULT_SCALE_DELTA = 1.1;
const MAX_SCALE = 10.0;
const MIN_SCALE = 0.1;

class PdfJsViewer extends Component {

  componentDidMount() {
    pdfjsLib.GlobalWorkerOptions = {};
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    this.updateUrl(this.props.url);
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.url.url!==this.props.url.url){
        this.updateUrl(nextProps.url);
    }
  }

  updateUrl(url) {
    this.setState({ url });
    let loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(
      (doc) => {
        // console.log(`Document ${this.props.url} loaded ${doc.numPages} page(s)`);
        this.viewer && this.viewer.setState({ doc });

        // Print with Manual setup (not yet done)
        // this.printViewer.setState({doc});

        this.toolbar && this.toolbar.setState({ pagesCount: doc.numPages });
      },
      (reason) => {
        console.error(`Error during ${url} loading: ${reason}`);
      }
    );
  }
  zoomIn(e) {
    let ticks = normalizeWheelEventDelta(e);
    let newScale = this.viewer.state.scale;
    do {
      newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
      newScale = Math.ceil(newScale * 10) / 10;
      newScale = Math.min(MAX_SCALE, newScale);
    } while (--ticks > 0 && newScale < MAX_SCALE);
    this.viewer.setState({
      scale: newScale
    });
  }
  zoomOut(e) {
    let ticks = normalizeWheelEventDelta(e);
    let newScale = this.viewer.state.scale;
    do {
      newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
      newScale = Math.floor(newScale * 10) / 10;
      newScale = Math.max(MIN_SCALE, newScale);
    } while (--ticks > 0 && newScale > MIN_SCALE);
    this.viewer.setState({
      scale: newScale
    });
  }
  prevPage(e) {
    this.viewer.setState((state) => {
      return { moveToPage: state.currentPageNum - 1 };
    });
  }
  nextPage(e) {
    this.viewer.setState((state) => {
      return { moveToPage: state.currentPageNum + 1 };
    });
  }
  firstPage(e) {
    this.viewer.setState({ moveToPage: 1 });
  }
  lastPage(e) {
    this.viewer.setState({ moveToPage: this.viewer.state.pagesCount });
  }
  print(e) {
    // Print with Library
    printJS(this.state.url);

    // Print with Manual setup (not yet done)
    // this.printViewer.setState({print:true})
  }
  displayScaleChanged(e) {
    this.toolbar.setState({
      scale: e.scale
    });
  }
  displayPageChanged(e) {
    this.toolbar.setState({
      currentPageNum: e.currentPageNum
    });
  }
  render() {
    return (
      <div className="App">
        {/* <div className="App-header"> */}
        {/* <h2>Welcome to PDF.js</h2> */}
        {/* </div> */}
        <Toolbar
            ref={(ref) => (this.toolbar = ref)}
            onZoomIn={(e) => this.zoomIn(e)}
            onZoomOut={(e) => this.zoomOut(e)}
            onPrint={(e) => this.print(e)}
            onNextPage={(e) => this.nextPage(e)}
            onPrevPage={(e) => this.prevPage(e)}
            onFirstPage={(e) => this.firstPage(e)}
            onLastPage={(e) => this.lastPage(e)}
            disablePrint={this.props.disablePrint}
        ></Toolbar>
        <div className="App-body">
          <Viewer
              ref={(ref) => (this.viewer = ref)}
              onScaleChanged={(e) => this.displayScaleChanged(e)}
              onPageChanged={(e) => this.displayPageChanged(e)}
              page={this.props.page}
              scale={this.props.scale}
          ></Viewer>
        </div>

        {/* Print with Manual setup (not yet done) */}
        {/* <PrintViewer ref={(ref) => this.printViewer = ref}></PrintViewer> */}
      </div>
    );
  }
}

PdfJsViewer.propTypes = {
  url: PropTypes.string
};

export default PdfJsViewer;
