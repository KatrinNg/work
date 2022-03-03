import React, { Component } from 'react';
import {
    Button
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as Colors from '@material-ui/core/colors';
import _ from 'lodash';

const styles = theme => ({
    actionButtonRoot: {
        color: '#0579c8',
        border: 'solid 1px #0579C8',
        boxShadow: '2px 2px 2px #6e6e6e',
        backgroundColor: '#ffffff',
        minWidth: '90px',
        '&:disabled': {
            border: 'solid 1px #aaaaaa',
            boxShadow: '1px 1px 1px #6e6e6e'
        },
        '&:hover': {
            color: '#ffffff',
            backgroundColor: '#0579c8'
        }
    }
});

class CIMSCommonButton extends Component {
    constructor(props) {
        super(props);

        this._defaultProps = {
            id: null,
            variant: 'contained',
            color: 'primary',
            className: props.classes.actionButtonRoot
        };

        this.state = {
            props: _.merge({}, this._defaultProps, props)
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({ props: _.merge({}, this._defaultProps, this.props) });
        }
    }

    render() {
        const props = this.state.props;
        const {
            children, onClick
        } = props;
        return (
            <Button
                {...props}
                onClick={() => onClick && onClick()}
            >
                {children}
            </Button>
        );
    }
}

export default withStyles(styles)(CIMSCommonButton);