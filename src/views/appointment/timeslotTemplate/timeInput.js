import React from 'react';
import MaskedInput from 'react-text-mask';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';

function TextMaskCustom(props) {
    const { inputRef, ...other } = props;

    return (
        <MaskedInput
            {...other}
            ref={ref => {
                inputRef(ref ? ref.inputElement : null);
            }}
            mask={[/[0-2]/, /\d/, ':', /[0-6]/, /\d/]}
            placeholderChar={'\u2000'}
            showMask
        />
    );
}

TextMaskCustom.propTypes = {
    inputRef: PropTypes.func.isRequired
};

class TimeInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            textmask: '  :  '
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = (event, name) => {
        let valArr = event.target.value.split(':');
        let hour = valArr[0];
        let min = valArr[1];
        if (parseInt(hour) && parseInt(hour) > 23) {
            hour = 23;
        }
        if (parseInt(min) && parseInt(min) > 59) {
            min = 59;
        }
        this.setState({ [name]: `${hour}:${min}` });
    };

    render() {
        return (
            <TextField
                fullWidth
                variant="outlined"
                value={this.state.textmask}
                onChange={e => this.handleChange(e, 'textmask')}
                id="formatted-text-mask-input"
                InputProps={{
                    inputComponent: TextMaskCustom
                }}
            />
        );
    }
}

export default TimeInput;