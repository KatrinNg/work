import React from 'react';
import {
    Grid,
    DialogContent,
    DialogActions
} from '@material-ui/core';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';


class FrequencyDialog extends React.Component {
    handleChange = (value, name) => {
        this.setState({ freq1: value });
        let fields = { value: value, name: name };
        this.props.handleChange(fields);
    }
    closeFrequencyDialog = () => {
        this.props.okClick();
    }
    render() {
        const { id, dialogTitle, frequency, name, codeList, freqValue } = this.props;
        if (frequency) {
            const array = frequency.label.split('_');
            // const codeList = getCodeList(frequency.label);
            let strLeft, strRight;
            if (array.length >= 2) {
                strLeft = array[0];
                strRight = array[2];
            } else {
                strRight = array[1];
            }

            return (
                <CIMSDialog
                    open={frequency.open}
                    id={id}
                    dialogTitle={dialogTitle}
                >
                    <DialogContent style={{ display: 'flex', overflowY: 'unset' }}>
                        <ValidatorForm ref={'form'} id={id + '_formValidatorForm'} onSubmit={() => { }} style={{ width: '100%' }}>
                            <Grid container direction={'row'} alignItems={'flex-end'}>
                                {strLeft ?
                                    <Grid id={id + '_leftValGrid'}>{array[0]}</Grid>
                                    : null}
                                <Grid style={{ width: '120px', padding: '0 5px' }}>
                                    <SelectFieldValidator
                                        key={id + '_' + name + 'SelectFieldValidator' + freqValue}
                                        id={id + '_' + name + 'SelectFieldValidator'}
                                        options={codeList && codeList.map((item) => ({
                                            value: item.code, label: item.code
                                        }))}
                                        value={freqValue}
                                        name={name}
                                        onChange={e => this.handleChange(e.value, name)}
                                        notShowMsg
                                    />
                                </Grid>
                                {strRight ?
                                    <Grid id={id + '_RightValGrid'}>{array[2]}</Grid> :
                                    null}
                            </Grid>
                        </ValidatorForm>
                    </DialogContent>
                    <DialogActions>
                        <CIMSButton onClick={this.closeFrequencyDialog} id={id + '_OkCIMSButton'}>OK</CIMSButton>
                    </DialogActions>
                </CIMSDialog>
            );
        } else {
            return null;
        }
    }
}
export default FrequencyDialog;