import React, { Component } from 'react';
// import ReactDOM from "react-dom";

import './assets/css/PrintViewer.css';

const PRINT_RESOLUTION = 150;
// const PRINT_UNITS = PRINT_RESOLUTION / 72.0;

// Print Resolution
const PRINT_UNITS = 3;

const bodyRoot = document.body;

export default class PrintViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doc: null,
      pages: [],
      canvases: [],
      sorted: false,
      print: false
    };
    this.canvas = React.createRef();
    this.canvasRefs = {};
    this.canvases = [];
    this.pages = [];
    this.el = document.createElement('div');
    this.el.className = 'printContent';
  }

  componentDidMount() {
    // bodyRoot.appendChild(this.el);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.print !== nextState.print ||
      this.state.pages !== nextState.pages ||
      this.state.canvases !== nextState.canvases
    ) {
      return true;
    }
    return false;
  }


  componentDidUpdate(prevProps, prevState) {
    if (this.state.doc && this.state.print && !prevState.print) {
      for (let num = 1; num <= this.state.doc.numPages; num++) {
        this.canvasRefs[`canvas${num}`] = React.createRef();
        const newCanvas = (
          <div key={num}>
            <canvas ref={this.canvasRefs[`canvas${num}`]}></canvas>
          </div>
        );
        this.setState((state) => {
          return {
            canvases: [...state.canvases, newCanvas]
          };
        });
        this.renderPage(this.state.doc, num);
      }
    }
    if (
      this.state.doc !== null &&
      this.state.pages.length === this.state.doc.numPages &&
      this.state.canvases !== null
    ) {
      console.log('done');
      this.setState(
        (prevState) => {
          return {
            pages: prevState.pages.sort((a, b) =>
              parseInt(a.key) > parseInt(b.key) ? 1 : -1
            ),
            canvases: null
          };
        },
        () => {
          window.print();
          // this.setState({print: false})
        }
      );
    }
  }

  componentWillUnmount() {
    bodyRoot.removeChild(this.el);
  }


  renderPage(doc, pageNum) {
    doc.getPage(pageNum).then((page) => {
      let scale = 1;
      let viewport = page.getViewport({ scale: scale });
      let canvas = this.canvasRefs[`canvas${pageNum}`].current;
      const width = viewport.width;
      canvas.width = Math.floor(width * PRINT_UNITS);
      canvas.height = Math.floor(viewport.height * PRINT_UNITS);
      let context = canvas.getContext('2d');
      context.clearRect(0, 0, width, viewport.height);
      page
        .render({
          canvasContext: context,
          transform: [PRINT_UNITS, 0, 0, PRINT_UNITS, 0, 0],
          viewport: viewport
          // intent: 'print'
        })
        .promise.then(() => {
          this.setState((state) => {
            return {
              pages: [
                ...state.pages,
                <img
                    className="printImg"
                    alt="Print"
                    key={pageNum}
                    src={canvas.toDataURL()}
                />
              ]
            };
          });
        });
    });
  }
  render() {
    // return ReactDOM.createPortal(
    //     <div id="printContainer" >
    //         {this.state.canvases}
    //         {
    //             this.state.pages.map( page =>
    //                 <div className="imgPrint">{page}</div>
    //             )
    //         }
    //     </div>,
    //     this.el
    // )
    return (
      <div id="printContainer">
        {this.state.canvases}
        {this.state.pages.map((page,index) => (
          <div key={index} className="imgPrint">{page}</div>
        ))}
      </div>
    );
  }
}
