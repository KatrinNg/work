import React, { Component } from 'react';
// import withStyles from '@material-ui/core/styles/withStyles';
// import TextField from '@material-ui/core/TextField';
// import PropTypes from 'prop-types';
import CheckBox from '@material-ui/core/Checkbox';


class CIMSCheckBox extends Component {
    render() {
        const {
            color,
            ...rest
        } = this.props;

        return (
            <CheckBox
                color={color ? color : 'primary'}
                {...rest}
            />
        );
    }
}

export default CIMSCheckBox;