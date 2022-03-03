import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import CIMSButton from '../Buttons/CIMSButton';
import cover_eHR from '../../images/eHR/cover_ehe.gif';

class CIMSeHRIdentityButton extends Component {
    constructor(props) {
        super(props);
    }

    handleOnClick = (data) => {
        this.props.onClick(data, null);
    }

    render() {
        const { name, inputParams, isEHRAccessRight} = this.props;
            return (
                <CIMSButton
                    id={'eHRButton' + name + 'button'}
                    onClick={() => { this.handleOnClick(inputParams); }}
                    disabled={!isEHRAccessRight}
                >
                    {
                        cover_eHR
                            ? <img src={cover_eHR} height="37" />
                            : 'eHR View Identity'
                    }
                </CIMSButton>
            );
        }
}

export default withRouter((CIMSeHRIdentityButton));