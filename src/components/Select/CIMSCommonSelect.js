import React, { Component } from 'react';
import { createMuiTheme, MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import {
    FormControl,
    InputLabel,
    OutlinedInput
} from '@material-ui/core';
import _ from 'lodash';
import ReactSelect from './ReactSelect';

const theme = createMuiTheme({

});

const styles = theme => ({
    
});

class CIMSCommonSelect extends Component {
    constructor(props) {
        super(props);

        this._defaultProps = {
            id: null,
            label: '',
            options: [],
            value: null,
            placeholder: '',
            controlProps: {
                variant: 'outlined',
                margin: 'dense',
                fullWidth: true
            },
            labelProps: {
                margin: 'dense'
            },
            outlinedProps: {
                margin: 'dense',
                inputComponent: ReactSelect
            },
            inputProps: {
                styles: {},
                openMenuOnFocus: false,
                isClearable: true,
                isDisabled: false,
                isLoading: false,
                isRtl: false,
                isSearchable: true,
                filterOption: {
                    matchFrom: 'any'
                },
                menuPlacement: 'auto',
                maxMenuHeight: 500,
                menuPortalTarget: document.body,
                isMulti: false
            },
            error: false,
            disabled: false
        };

        this.state = {
            props: _.merge({}, this._defaultProps, props),
            fontsLoaded: false,
            menuOpen: false,
            searchInput: '',
            labelWidth: 0
        };

        this.refLabel = React.createRef();
    }

    componentDidMount() {
        if (document.fonts) {
            document.fonts.ready
            .then(() => {
                let labelWidth = this.refLabel.current?.offsetWidth;
                this.setState({ fontsLoaded: true, labelWidth });
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({ props: _.merge({}, this._defaultProps, this.props) });
        }
    }

    render() {
        const props = this.state.props;
        const {
            id, label, options, value, placeholder, onChange, onBlur,
            controlProps, labelProps, outlinedProps, inputProps, error, disabled
        } = props;
        let shrink = (Array.isArray(value) ? value.length > 0 : value != null) || this.state.menuOpen;
        return (
            <MuiThemeProvider theme={theme}>
                <FormControl
                    {...controlProps}
                    error={error}
                >
                    <InputLabel
                        {...labelProps}
                        ref={this.refLabel}
                        shrink={shrink}
                        id={id + '_label'}
                    >
                        {label}
                    </InputLabel>
                    <OutlinedInput
                        {...outlinedProps}
                        labelWidth={this.state.labelWidth}
                        id={id + '_select'}
                        notched={shrink}
                        inputProps={{
                            ...inputProps,
                            options,
                            value,
                            placeholder,
                            onChange,
                            onBlur,
                            onMenuOpen: () => this.setState({ menuOpen: true }),
                            onMenuClose: () => this.setState({ menuOpen: false }),
                            inputValue: this.state.searchInput,
                            onInputChange: (value, params) => this.setState({ searchInput: value }),
                            isDisabled: disabled
                        }}
                    />
                </FormControl>
            </MuiThemeProvider>
        );
    }
}

export default withStyles(styles)(CIMSCommonSelect);