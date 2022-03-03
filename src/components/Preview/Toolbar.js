import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './assets/css/Toolbar.css';

class Toolbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scale: 0,
            currentPageNum: 1,
            pagesCount: 0
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.scale !== nextState.scale ||
            this.state.currentPageNum !== nextState.currentPageNum) {
            return true;
        }
        return false;
    }
    zoomIn(e) {
        if (this.props.onZoomIn) {
            this.props.onZoomIn(e);
        }
    }
    zoomOut(e) {
        if (this.props.onZoomOut) {
            this.props.onZoomOut(e);
        }
    }
    print(e) {
        if (this.props.onPrint) {
            this.props.onPrint();
        }
    }
    prevPage(e) {
        if (this.props.onPrevPage) {
            this.props.onPrevPage(e);
        }
    }
    nextPage(e) {
        if (this.props.onNextPage) {
            this.props.onNextPage(e);
        }
    }
    firstPage(e){
        if (this.props.onFirstPage) {
            this.props.onFirstPage(e);
        }
    }
    lastPage(e){
        if (this.props.onLastPage) {
            this.props.onLastPage(e);
        }
    }
    render() {
        return (
        <div className="Toolbar" dir="ltr">
            <div className="LeftFunction">

            </div>
            <div className="ZoomFunction">
                <button className="ZoomOut toolbarBtn" onClick={(e) => this.zoomOut(e)}></button>
                <div className="splitBtnSeparator"></div>
                <button className="ZoomIn toolbarBtn" onClick={(e) => this.zoomIn(e)}></button>
                <div className="ZoomPercent">{(this.state.scale * 100).toFixed(1)}%</div>
            </div>
            <div className="RightFunction">
                {//If disablePrint is true, hide the print button
                    !this.props.disablePrint &&
                    <button className="Print toolbarBtn" onClick={(e) => this.print()}></button>
                }
                <button className="toolbarBtn firstPage" onClick={(e) => this.firstPage(e)} disabled={this.state.currentPageNum === 1}></button>
                <div className="splitBtnSeparator"></div>
                <button className="toolbarBtn prevPage" onClick={(e) => this.prevPage(e)} disabled={this.state.currentPageNum === 1}></button>
                <div className="splitBtnSeparator"></div>
                <button className="toolbarBtn nextPage" onClick={(e) => this.nextPage(e)} disabled={this.state.currentPageNum === this.state.pagesCount}></button>
                <div className="splitBtnSeparator"></div>
                <button className="toolbarBtn lastPage" onClick={(e) => this.lastPage(e)} disabled={this.state.currentPageNum === this.state.pagesCount}></button>
                <div className="ZoomPercent">{'P.'+(this.state.currentPageNum)+'/'+(this.state.pagesCount)}</div>
            </div>
        </div>);
    }
}

Toolbar.propTypes = {
  onZoomIn: PropTypes.func,
  onZoomOut: PropTypes.func
};

export default Toolbar;