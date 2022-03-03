import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import * as Colors from '@material-ui/core/colors';
import { fade } from '@material-ui/core/styles/colorManipulator';
import {
    TextField
} from '@material-ui/core';
import _ from 'lodash';

const styles = theme => ({
    root: {
        color: fade(Colors.common.black, 0.87) + ' !important',
        '&$disabled': {
            backgroundColor: Colors.grey[300],
            borderRadius: '4px'
        }
    },
    input: {
        zIndex: 1
    },
    disabled: {},
    notchedOutline: {}
});

class CIMSCommonTextField extends Component {
    constructor(props) {
        super(props);

        this._defaultProps = {
            id: null,
            label: '',
            margin: 'dense',
            type: 'string',
            variant: 'outlined',
            fullWidth: true,
            InputProps: {
                classes: {
                    root: props.classes.root,
                    disabled: props.classes.disabled,
                    notchedOutline: props.classes.notchedOutline,
                    input: props.classes.input
                }
            },
            inputProps: {
                autoComplete: 'off'
            }
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
            onBlur, onChange, onClose
        } = props;
        return (
            <TextField
                {...props}
                onBlur={() => onBlur && onBlur()}
                onChange={event => onChange && onChange(event.target.value)}
            />
        );
    }
}

export default withStyles(styles)(CIMSCommonTextField);