import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    DialogContent,
    DialogActions,
    Typography,
    Grid
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import questionIcon from '../../../../images/moe/icon-question.gif';
import {
    getDrugName
} from '../../../../utilities/moe/moeUtilities';
import {
    CHECKING_TYPE
} from '../../../../enums/moe/moeEnums';

const styles = {
    fullWidth: {
        maxWidth: '100%',
        overflowY: 'unset',
        width: '80%'
    }
};


class MandatoryFieldsDialog extends React.Component {
    state = {
        index: 0
    }
    componentDidMount() {
        if (this.props.onRef && typeof (this.props.onRef) === 'function')
            this.props.onRef(this);
    }
    onProceed = (data) => {
        let itemLines = this.getAllItemLines(data);
        let index = this.state.index;
        this.setState({ index: index + 1 });

        if (index === itemLines.length - 1 || itemLines.length === 0) {
            if (typeof (data.onProceed) === 'function') {
                data.onProceed(data.saveData);
            }
        }
    }

    onEditing = (data) => {
        if (this.props.isFromTabs) {
            if (this.props.tabsCallback && typeof (this.props.tabsCallback) === 'function') {
                const itemLines = this.getAllItemLines(data);
                const curDrugItem = itemLines[this.state.index].drug;
                this.props.tabsCallback(curDrugItem, CHECKING_TYPE.MANDATORY_FIELD);
                return;
            }
        }
        if (typeof (data.onEditing) === 'function') {
            data.onEditing();
        }
    }

    getAllItemLines = (data) => {
        let dataLines = [];
        for (let i = 0; i < data.mandatoryFieldsData.length; i++) {
            let drugItem = data.mandatoryFieldsData[i];
            dataLines.push(drugItem);
        }
        return dataLines;
    }

    render() {
        const { id, data, open } = this.props;
        let allItems = this.getAllItemLines(data);
        let curItem = (allItems && allItems[this.state.index]) || {};
        return (
            <CIMSDialog
                id={id + '_CIMSDialog'}
                open={open}
                dialogTitle={'Information/Attention'}
            >
                <DialogContent>
                    <Grid container direction={'row'}>
                        <Grid item>
                            <img src={questionIcon} alt={''} />
                        </Grid>
                        <Grid item
                            style={{ paddingLeft: 8 , maxWidth: '90%'}}
                        >
                            <Typography component="div">
                                Please complete the following information for -{' '}
                                <font>
                                    {curItem.drug && getDrugName(curItem.drug)}
                                </font>
                                {curItem.fieldsList &&
                                    <ul style={{
                                        margin: 0,
                                        padding: '0 0 0 16px'
                                    }}
                                    >
                                        {curItem.fieldsList.map(item =>
                                            <li key={item}>{item}</li>
                                        )}
                                    </ul>
                                }

                            </Typography>
                        </Grid>
                    </Grid>

                </DialogContent>
                <DialogActions>
                    <CIMSButton id={id + '_goToEdtingCIMSButton'} onClick={() => { this.onEditing(data); }}>Go to edit</CIMSButton>
                    {curItem.drug && curItem.drug.dangerDrug !== 'Y' &&
                        <CIMSButton id={id + '_proceeddCIMSButton'} onClick={() => { this.onProceed(data); }}>Proceed</CIMSButton>}
                </DialogActions>
            </CIMSDialog >
        );
    }
}
const mapStateToProps = () => {
    return {

    };
};
const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MandatoryFieldsDialog));