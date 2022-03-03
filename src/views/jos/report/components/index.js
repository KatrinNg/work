import React from 'react';
import PdfJsViewer from '../../../../components/Preview/PdfJsViewer';
import './index.css';

const PdfViewer = ({ width, height, url, page, scale, disablePrint }) => {
  console.log('loaded PDF Viewer');
  return (
    <div className="viewerWrapper" style={{ width: width, height: height }}>
      <PdfJsViewer
          url={url} // Document location , accept absolute, relative and blob
          page={Number(page)} //initial page number, default value is 1
          scale={Number(scale)} // initial page scale, default value is 1.0
          disablePrint={disablePrint} // default false (i.e. enable print function)
      />
    </div>
  );
};

export default PdfViewer;
