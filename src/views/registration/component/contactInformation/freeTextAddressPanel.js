import React from 'react';
import {
    Grid
} from '@material-ui/core';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import memoize from 'memoize-one';
import Enum from '../../../../enums/enum';

const addressSet = memoize((list, type) => {
    if (type === Enum.PATIENT_CONTACT_PERSON_ADDRESS_TYPE) {
        return list;
    }
    else {
        return list && list.find(item => item.addressTypeCd === type);
    }
});

class FreeTextAddressPanel extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            value: '',
            oldValue: ''
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const addSet = addressSet(nextProps.addressList, nextProps.addressType);
        if (addSet.addrTxt !== prevState.oldValue) {
            return {
                value: addSet.addrTxt,
                oldValue: addSet.addrTxt
            };
        }
    }

    handleOnChange = (e) => {
        this.setState({
            value: e.target.value
        });
    }

    handleOnBlur = (type, name) => {
        if (type === Enum.PATIENT_CONTACT_PERSON_ADDRESS_TYPE) {
            this.props.handleChangeAddress(this.state.value, name);
        } else {
            this.props.handleChangeAddress(this.state.value, type, name);
        }
    }

    render() {
        const {
            id,
            isDisabled,
            addressType
        } = this.props;
        return (
            <Grid container item xs={12} spacing={1}>
                <CIMSMultiTextField
                    id={`${id}_free_text_address_input`}
                    fullWidth
                    inputProps={{
                        maxLength: 500
                    }}
                    disabled={isDisabled}
                    calActualLength
                    rows="4"
                    onChange={this.handleOnChange}
                    onBlur={() => this.handleOnBlur(addressType, 'addrTxt')}
                    value={this.state.value}
                    variant={'outlined'}
                />
            </Grid>
        );
    }
}
export default FreeTextAddressPanel;