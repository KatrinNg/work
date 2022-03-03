import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import CIMSLink from '../Links/CIMSLink';
import cover_eHR from '../../images/eHR/cover_ehe.gif';
import { Tooltip, Typography } from '@material-ui/core';

class CIMSeHRLink extends Component {
    constructor(props) {
        super(props);
    }

    handleOnClick = (data) => {
        // Open Tab
        if (data && data.isPatRequired === 'Y'){
            this.props.onClick(data);
        }
    }

    render() {
        const { name, eHRTabInfo, isEHRSSRegistered, isEHRAccessRight} = this.props;

        if (isEHRSSRegistered) {
            return (
                <Tooltip
                    title={
                        <Typography variant="h5">
                            {
                                isEHRAccessRight
                                    ? 'eHRIS - Viewer'
                                    : 'Your user account is not authorized for eHR connection !'
                            }
                        </Typography>
                    }
                    disableTouchListener={isEHRAccessRight}
                    disableHoverListener={isEHRAccessRight}
                    disableFocusListener={isEHRAccessRight}
                >
                    <span>
                        <CIMSLink
                            href="#"
                            id={'eHRLink' + name + 'Link'}
                            onClick={(event) => { event.preventDefault();this.handleOnClick(eHRTabInfo); }}
                            disabled={!isEHRAccessRight}
                        >
                            {
                                cover_eHR
                                    ? <img src={cover_eHR} height="36" />
                                    : 'eHR View'
                            }
                        </CIMSLink>
                    </span>
                </Tooltip>
            );
        } else {
            return (
                <Tooltip
                    title={
                        <Typography variant="h5">
                            {
                                isEHRAccessRight
                                    ? 'PPI-ePR - Viewer'
                                    : 'Your user account is not authorized for eHR connection !'
                            }
                        </Typography>
                    }
                    disableTouchListener={isEHRAccessRight}
                    disableHoverListener={isEHRAccessRight}
                    disableFocusListener={isEHRAccessRight}
                >
                    <span>
                        <CIMSLink
                            id={'eHRLink' + name + 'Link'}
                            onClick={(event) => { event.preventDefault();this.handleOnClick(eHRTabInfo); }}
                            disabled={!isEHRAccessRight}
                        >
                            eHRSS Unmatched
                        </CIMSLink>
                    </span>
                </Tooltip>
            );
        }
    }
}

export default withRouter((CIMSeHRLink));
