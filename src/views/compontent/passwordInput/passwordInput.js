import React, { useState } from 'react';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';

const PasswordInput = React.forwardRef((props, ref) => {

    const { id, ...rest } = props;

    const [showPassword, setShowPassword] = useState(false);

    const handleMouseDownPassword = () => {
        setShowPassword(true);
    };

    const handleMouseUpPassword = () => {
        setShowPassword(false);
    };

    const handleMouseLeavePassword = () => {
        setShowPassword(false);
    };

    return (
        <TextFieldValidator
            fullWidth
            onPaste={() => { window.event.returnValue = false; }}
            onContextMenu={() => { window.event.returnValue = false; }}
            onCopy={() => { window.event.returnValue = false; }}
            onCut={() => { window.event.returnValue = false; }}
            type={showPassword ? 'text' : 'password'}
            id={`${id}_password`}
            label="Password"
            InputProps={{
                endAdornment:
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            id={`${id}_passwordVisibility`}
                            onMouseDown={handleMouseDownPassword}
                            onMouseUp={handleMouseUpPassword}
                            onMouseLeave={handleMouseLeavePassword}
                            tabIndex={-1}
                        >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
            }}
            {...rest}
        />
    );
});

export default PasswordInput;