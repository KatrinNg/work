import React from 'react';
import { withStyles } from '@material-ui/core/styles';
//import PdfViewer from '@ha/pdf-viewer';
import CIMSDialog from '../Dialog/CIMSDialog';
import { DialogActions, DialogContent } from '@material-ui/core';
import CIMSButton from '../Buttons/CIMSButton';
import { print } from '../../utilities/printUtilities';
import {
    closeCommonCircular,
    openCommonCircular
} from '../../store/actions/common/commonAction';
import CIMSPdfViewer from '../PDF/CIMSPdfViewer';

const styles = {
    dialog: {
        maxWidth: '100%',
        overflowY: 'unset',
        width: '80%'
    },
    pdfContent: {
        maxHeight: '80vh',
        overflowY: 'hidden'
    },
    imageContent: {
        maxHeight: '80vh',
        backgroundColor: '#444444',
        textAlign: 'center'
    },
    imageViewer: {
        maxWidth: '100%',
        height: 'auto'
    }
};

const CIMSCompatViewerDialog = (props) => {
    const {
        classes,
        isDialogOpen,
        title,
        base64,
        fileType,
        closeDialog
    } = props;
    const isPdf = fileType === 'pdf';
    const blobUrl = URL.createObjectURL(b64toBlob(base64, `${isPdf ? 'application' : 'image'}/${fileType}`));

    return (
        <CIMSDialog
            open={isDialogOpen}
            dialogTitle={title || 'Preview'}
            classes={{
                paper: classes.dialog
            }}
        >
            <DialogContent className={isPdf ? classes.pdfContent : classes.imageContent}>
                {fileType === 'pdf' ?
                    // <PdfViewer url={blobUrl} disablePrint/>
                    <CIMSPdfViewer
                        id={'CIMSCompatViewerDialog'}
                        previewData={base64}
                    />
                    :
                    <img className={classes.imageViewer} src={blobUrl}/>
                }
            </DialogContent>

            <DialogActions>
                <CIMSButton onClick={() => printCCP(base64)}>Print</CIMSButton>

                <CIMSButton onClick={closeDialog}>Close</CIMSButton>
            </DialogActions>
        </CIMSDialog>
    );
};

const printCCP = (base64) => {
    openCommonCircular();

    print({base64: base64, callback: () => {closeCommonCircular();}, copies: 1, isCenter: true});
};

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

    return new Blob(byteArrays, {type: contentType});
};

export default (withStyles(styles)(CIMSCompatViewerDialog));
