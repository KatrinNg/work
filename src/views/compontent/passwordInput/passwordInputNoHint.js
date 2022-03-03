import React from 'react';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import _ from 'lodash';


class PasswordInputNoHint extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPassword: false,
            innerValue: this.props.value || ''
        };
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if (prevProps.value !== this.props.value) {
            this.setState({
                innerValue: this.props.value || ''
            });
        }
        return '';
    }

    handleMouseDownPassword = () => {
        this.setState({ showPassword: true });
    };

    handleMouseUpPassword = () => {
        this.setState({ showPassword: false });
    };

    handleMouseLeavePassword = () => {
        this.setState({ showPassword: false });
    };

    handleOnChange = e => {
        let targetVal = e.target.value || '';
        if(!this.state.showPassword) {
            this.setState({
                innerValue: targetVal
            });
        }
    };

    handleOnBlur = () => {
        this.props.onBlur && this.props.onBlur(this.state.innerValue);
    }

    render() {
        //eslint-disable-next-line
        const { id, value, onChange, onFocus, onClick, onBlur, onKeyUp, ...rest } = this.props;
        const { showPassword, innerValue } = this.state;
        return (
            <TextFieldValidator
                fullWidth
                onPaste={() => { window.event.returnValue = false; }}
                onContextMenu={() => { window.event.returnValue = false; }}
                onCopy={() => { window.event.returnValue = false; }}
                onCut={() => { window.event.returnValue = false; }}
                onChange={this.handleOnChange}
                onBlur={this.handleOnBlur}
                id={`${id}_password`}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={innerValue}
                InputProps={{
                    endAdornment:
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                id={`${id}_passwordVisibility`}
                                onMouseDown={this.handleMouseDownPassword}
                                onMouseUp={this.handleMouseUpPassword}
                                onMouseLeave={this.handleMouseLeavePassword}
                                tabIndex={-1}
                            >
                                {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                }}
                {...rest}
            />
        );
    }
}

export default PasswordInputNoHint;
