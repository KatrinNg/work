import React from 'react';
import { Grid, Typography, InputBase } from '@material-ui/core';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';

class UploadFile extends React.Component {
    state = {
        file: null,
        fileName: null
    }
    fileOnChange = (el) => {
        let file = el.target.files[0];
        if (!file) {
            //do something.
        } else {
            this.setState({ file, fileName: file.name });
        }
    }

    onFileUpload = () => {
        const { file } = this.state;
        const callback = () => {
            this.props.handleCloseUploadDialog();
        };
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = () => {
            this.props.uploadFile(file, callback);
            this.setState({ file: null });
        };
    }

    render() {
        const { openUploadFileFlag, handleCloseUploadDialog } = this.props;
        const { file } = this.state;
        return (
            <CIMSPromptDialog
                open={openUploadFileFlag}
                dialogTitle="Upload File"
                dialogContentText={
                    <Typography component="div">
                        <Grid>
                            <input
                                style={{ display: 'none' }}
                                id="uploadNoticeInput"
                                type="file"
                                accept=".xlsx, .xls, .doc, .docx, .txt, .pdf, .jpg, .jpeg"
                                label="Browse"
                                onChange={this.fileOnChange}
                                ref="uploadFileRef"
                            />
                            <label htmlFor="uploadNoticeInput">
                                <InputBase
                                    id="uploadNoticeNameInput"
                                    style={{ border: '1px solid #B8BCB9', height: '26px', borderRadius: 6, marginRight: 5, width: 300 }}
                                    inputProps={{ style: { padding: 4 } }}
                                    value={!file ? '' : file.name}
                                    readOnly
                                />
                                <CIMSButton
                                    id="uploadNoticeButton"
                                    variant="contained"
                                    component="span"
                                    style={{ height: '28px', marginRight: 5 }}
                                >
                                    Browse...
                                </CIMSButton>
                            </label>
                        </Grid>
                    </Typography>
                }
                buttonConfig={
                    [
                        {
                            id: 'uploadFile_save',
                            name: 'Upload',
                            disabled: !file,
                            onClick: ()=>{
                                this.props.auditAction('Upload File',null,null,false,'cmn');
                                this.onFileUpload();
                            }
                        },
                        {
                            id: 'uploadFile_close',
                            name: 'Close',
                            onClick: ()=>{
                                this.props.auditAction('Close Upload Dialog',null,null,false,'cmn');
                                handleCloseUploadDialog();
                            }
                        }
                    ]
                }
            />
        );
    }
}

export default UploadFile;


