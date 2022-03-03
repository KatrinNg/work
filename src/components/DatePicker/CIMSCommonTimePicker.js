import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import * as Colors from '@material-ui/core/colors';
import { fade } from '@material-ui/core/styles/colorManipulator';
import {
    KeyboardTimePicker
} from '@material-ui/pickers';
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
        color: fade(Colors.common.black, 0.87),
        zIndex: 1
    },
    disabled: {},
    notchedOutline: {}
});

class CIMSCommonTimePicker extends Component {
    constructor(props) {
        super(props);

        this._defaultProps = {
            id: null,
            label: '',
            margin: 'dense',
            inputVariant: 'outlined',
            fullWidth: true,
            format: 'HH:mm',
            ampm: false,
            autoOk: true,
            helperText: '',
            disabled: false,
            value: null,
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
            },
            KeyboardButtonProps: {
                'aria-label': ''
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
            <KeyboardTimePicker
                {...props}
                onBlur={() => onBlur && onBlur()}
                onChange={value => onChange && onChange(value)}
                onClose={() => onClose && onClose()}
            />
        );
    }
}

export default withStyles(styles)(CIMSCommonTimePicker);