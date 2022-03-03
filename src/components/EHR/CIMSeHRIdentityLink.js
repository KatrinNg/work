import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import CIMSLink from '../Links/CIMSLink';
import cover_eHR from '../../images/eHR/cover_ehe.gif';

class CIMSeHRIdentityLink extends Component {
    constructor(props) {
        super(props);
    }

    handleOnClick = (data) => {
        this.props.onClick(data, this.props.eHREhrisUrl, null);
    }

    render() {
        const { name, inputParams, isEHRAccessRight} = this.props;
            return (
                <CIMSLink
                    id={'eHRLink' + name + 'link'}
                    onClick={(event) => { event.preventDefault(); this.handleOnClick( inputParams); }}
                    disabled={!isEHRAccessRight}
                >
                    {
                        cover_eHR
                            ? <img src={cover_eHR} height="37" />
                            : 'eHR View Identity'
                    }
                </CIMSLink>
            );
        }
}

export default withRouter((CIMSeHRIdentityLink));
