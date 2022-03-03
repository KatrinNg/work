import React from 'react';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import FastTextField from '../../../../components/TextField/FastTextField';

class ClientServiceViewRemark extends React.Component {
    state = {
        remark: null
    }

    shouldComponentUpdate(nextP){
        if(nextP.openRemarkFlag!==this.props.openRemarkFlag&&nextP.openRemarkFlag===true){
            if(nextP.remarkValue){
                this.setState({
                    remark:nextP.remarkValue
                });
            }
        }
        return true;
    }

    handleRemarkChange = (e) => {
        this.setState({
            remark: e.target.value
        });
    }

    handleAddRemark = () => {
        this.props.handleAddRemark(this.state.remark);
        this.setState({
            remark:null
        });
    }

    handleCloseRemarkDialog=()=>{
        this.setState({
            remark:null
        });
        this.props.handleCloseRemarkDialog();
    }

    render() {
        const { id, openRemarkFlag, dialogTitle, inputRow, isCurrentCaseNo } = this.props;
        return (
            <CIMSPromptDialog
                open={openRemarkFlag}
                id={id + '_remark'}
                dialogTitle={dialogTitle}
                dialogContentText={
                    <FastTextField
                        fullWidth
                        id={id + '_remark_input'}
                        inputProps={{
                            spellCheck: false,
                            maxLength: 1000
                        }}
                        value={this.state.remark}
                        onBlur={this.handleRemarkChange}
                        autoComplete="off"
                        multiline
                        rows={inputRow}
                        InputProps={{
                            style: {
                                height: 'calc(24*' + inputRow + 'px)',
                                width: '650px',
                                lineHeight: 'inherit'
                            }
                        }}
                        trim={'all'}
                        placeholder={'Remark'}
                        disabled={!isCurrentCaseNo}
                    />
                }
                buttonConfig={
                    !isCurrentCaseNo ?
                        [
                            {
                                id: 'remark_close',
                                name: 'Cancel',
                                onClick: this.handleCloseRemarkDialog
                            }
                        ] :
                        [
                            {
                                id: 'remark_add',
                                name: 'Add',
                                onClick: this.handleAddRemark
                            },
                            {
                                id: 'remark_close',
                                name: 'Cancel',
                                onClick: this.handleCloseRemarkDialog
                            }
                        ]
                }
            />
        );
    }
}
export default ClientServiceViewRemark;