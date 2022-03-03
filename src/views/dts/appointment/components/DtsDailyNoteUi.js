import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import DtsButton from '../../components/DtsButton';
import DtsSplitButton from '../../components/DtsSplitButton';


const styles = {
    root:{
        width:'100%',
        alignItems: 'center'
    },
    grid:{
        alignItems:'center'
    },
    dailyNoteTextField:{
        width:'70%'
        //margin:'auto',
        //marginTop:'10px'
    },
    row:{
        left:'50%',
        margin:'auto',
        display:'flex',
        flexDirection:'column'
    },
    dailyNoteSaveBtn:{
        // left:'50%',
        // width:'100%',
        // margin:'auto'
    },
    h4Title:{
        paddingTop:'10px',
        margin:'auto',
        width:'100%',
        textAlign:'center',
        color:'#4e4e4e'
    },
    groupSplitBtn:{
        // width: '60%',
        display: 'inline-flex',
        margin: '8px'
    }
};


class DtsDailyNoteUi extends Component {

    constructor(props){
        super(props);
        this.state = {
            saveLogOpenFlag:false
        };
    }

    handleSaveLogOpen = () => {
        this.setState({saveLogOpenFlag:true});
    }

    render(){
        const { classes, className,noteLabel,noOfRows, noteValue, noteSave, noteOnChange,saveBtn,splitList,splitMenu,noteOnFocus,noteOnBlur,noteIsDisable, ...rest } = this.props;
        return (

            <Paper elevation={0} className="root" variant="outlined" square>
                <Grid container className={classes.grid}>
                    <CIMSMultiTextField
                        className={classes.dailyNoteTextField}
                        id={'dailyNoteTextField'}
                        //label="Daily Notes"
                        label={noteLabel}
                        rows={noOfRows}
                        value={noteValue}
                        onChange={noteOnChange}
                        onFocus={noteOnFocus}
                        onBlur={noteOnBlur}
                        disabled={noteIsDisable()}
                    >
                    </CIMSMultiTextField>
                    {saveBtn &&
                        <div className={classes.row}>
                            {splitMenu && <DtsSplitButton
                                className={classes.groupSplitBtn}
                                iconType={splitList}
                                iconOnly
                                itemListEl={splitList}
                                btnOnClick={(item)=>this.props.splitBtnOnClick(item)}
                                          />}
                            <DtsButton onClick={noteSave} iconType={'RECEIPT'} className={classes.dailyNoteSaveBtn} disabled={noteIsDisable()}>Save Note</DtsButton>
                        </div>
                    }

                    <CIMSPromptDialog
                        open={this.state.saveLogOpenFlag}
                        id={'saveLog'}
                        dialogTitle={'Saved'}
                        paperStyl={this.props.classes.paper}
                        dialogContentText={'Saved'}
                        buttonConfig={
                        [
                            {
                                id: 'saveLog_close',
                                name: 'ok',
                                onClick: () => {
                                    this.setState({ saveLogOpenFlag: false });
                                }
                            }
                        ]
                    }
                    />
                </Grid>
            </Paper>

        );

    }

}

export default (withStyles(styles)(DtsDailyNoteUi));