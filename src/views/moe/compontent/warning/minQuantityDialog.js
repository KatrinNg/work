import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    DialogContent,
    DialogActions,
    Typography
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
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


class MinQuantityDialog extends React.Component {
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

        if (index === itemLines.length - 1) {
            if (typeof (data.onProceed) === 'function') {
                data.onProceed(data.saveData);
            }
        }
    }


    onReturnEdit = (data) => {
        if (this.props.isFromTabs) {
            if (this.props.tabsCallback && typeof (this.props.tabsCallback) === 'function') {
                const itemLines = this.getAllItemLines(data);
                const curDrugItem = itemLines[this.state.index].drug;
                this.props.tabsCallback(curDrugItem, CHECKING_TYPE.MIN_DOSAGE);
                return;
            }
        }
        if (typeof (data.onReturnEdit) === 'function') {
            data.onReturnEdit();
        }
    }

    getAllItemLines = (data) => {
        let dataLines = [];
        for (let i = 0; i < data.minQuantityData.length; i++) {
            let drugItem = data.minQuantityData[i];
            for (let j = 0; j < drugItem.rowNums.length; j++) {
                let item = {};
                item.minDosagesMessage = drugItem.minDosagesMessage;
                item.drugName = drugItem.drugName;
                item.itemIndex = i;
                item.lineMessage = (drugItem.showMultiLine) ? drugItem.rowNums[j] : '';
                item.drug = drugItem.drug;
                dataLines.push(item);
            }
        }
        return dataLines;
    }

    render() {
        const { classes, id, data, open } = this.props;
        let allItems = this.getAllItemLines(data);
        let curItem = (allItems && allItems[this.state.index]) || {};
        return (
            <CIMSDialog
                id={id + '_CIMSDialog'}
                open={open}
                dialogTitle={'Notice to Prescriber'}
                classes={{
                    paper: classes.fullWidth
                }}
            >
                <DialogContent>
                    <Typography component="div">
                        This drug is available in increments of {curItem.minDosagesMessage}.<br />
                        The dosage of <font color={'red'}> {curItem.drugName} </font> prescribed
                        {curItem.lineMessage ? <span> in line<font color={'red'}> {curItem.lineMessage} </font></span> : ''} may not be dispensable.<br />
                        You may Edit the prescription or Proceed.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <CIMSButton id={id + '_ConfirmCIMSButton'} onClick={() => { this.onProceed(data); }}>Advice noted and proceed</CIMSButton>
                    <CIMSButton id={id + '_BackCIMSButton'} onClick={() => { this.onReturnEdit(data); }}>Go editing dosage or dosage form</CIMSButton>
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
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MinQuantityDialog));