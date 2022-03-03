import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import * as PDFJSViewer from 'pdfjs-dist/web/pdf_viewer';

import './assets/css/Viewer.css';
import 'pdfjs-dist/web/pdf_viewer.css';

class Viewer extends Component {
  constructor(props) {
    super(props);
    this.initEventBus();
    this.state = {
      doc: null,
      scale: undefined,
      currentPageNum: null,
      moveToPage: null,
      pagesCount: null
    };
  }

  componentDidMount() {
    let viewerContainer = ReactDOM.findDOMNode(this);
    this._pdfViewer = new PDFJSViewer.PDFViewer({
      container: viewerContainer,
      eventBus: this._eventBus
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    // console.log(this._pdfViewer.currentPageNumber);
    if (this.state.doc !== nextState.doc ||
        this.state.scale !== nextState.scale ||
        this.state.moveToPage !== nextState.moveToPage
        ) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.doc !== prevState.doc) {
      this._pdfViewer.setDocument(this.state.doc);
    }
    if (this.state.scale !== prevState.scale) {
      this._pdfViewer.currentScale = this.state.scale;
    }
    if (this.state.moveToPage !== prevState.moveToPage && this.state.moveToPage !== null) {
      if (this.state.moveToPage <= this.state.pagesCount ||
        this.state.moveToPage > 0)
        this._pdfViewer.currentPageNumber = this.state.moveToPage;
      this.setState({moveToPage:null});
    }
  }

  initEventBus() {
    let eventBus = new PDFJSViewer.EventBus();
    eventBus.on('pagesinit', (e) => {
      // console.log(this._pdfViewer);
      this._pdfViewer.currentPageNumber = this.props.page > 0 ? this.props.page : 1;
      this._pdfViewer.currentScale = this.props.scale > 0 ? this.props.scale : 1;
      this.setState({
        scale: this._pdfViewer.currentScale,
        currentPageNum: this._pdfViewer.currentPageNumber,
        moveToPage: this._pdfViewer.currentPageNumber,
        pagesCount: this._pdfViewer.pagesCount
      });
      if (this.props.onInit) {
        this.props.onInit({});
      }
      if (this.props.onScaleChanged) {
        this.props.onScaleChanged({scale: this.state.scale});
      }
    });
    eventBus.on('scalechanging', (e) => {
      if (this.props.onScaleChanged) {
        this.props.onScaleChanged({scale: e.scale});
      }
    });
    eventBus.on('pagechanging', (e)=> {
      this.setState({currentPageNum: e.pageNumber});
      if (this.props.onPageChanged) {
        this.props.onPageChanged({currentPageNum: e.pageNumber});
      }
    });
    this._eventBus = eventBus;
  }
  render() {
    // console.log(this.state.currentPageNum);
    return (<div className="Viewer">
      <div className="pdfViewer"></div>
    </div>);
  }
}

Viewer.propTypes = {
  onInit: PropTypes.func,
  onScaleChanged: PropTypes.func
};

export default Viewer;