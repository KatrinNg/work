/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import Promise from 'promise-polyfill';
/* eslint-enable */
import { polyfill } from 'react-lifecycles-compat';
import ValidatorForm from './ValidatorForm';
import { debounce } from './utils';

class ValidatorComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        isValid: true,
        isWarn: false,
        isFocus: false
    }

    componentDidMount() {
        this.configure();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    // eslint-disable-next-line
    componentDidUpdate(prevProps, prevState) {
        if (this.instantValidate) {
            const { validByBlur, value, validators, withRequiredValidator } = this.props;
            const prevValue = prevProps.value;
            const prevValidators = prevProps.validators;
            const { isFocus } = this.state;
            if ((!validByBlur && value !== prevValue) ||
                (validByBlur && !isFocus && value !== prevValue) ||
                (JSON.stringify(validators || '') !== JSON.stringify(prevValidators || ''))) {
                this.validateDebounced(value, withRequiredValidator);
            }
        }
    }

    componentWillUnmount() {
        this.context.form.detachFromForm(this);
        this.validateDebounced.cancel();
    }

    getErrorMessage = () => {
        const { errorMessages } = this.props;
        const type = typeof errorMessages;

        if (type === 'string') {
            return errorMessages;
        } else if (type === 'object') {
            if (this.invalid.length > 0) {
                return errorMessages[this.invalid[0]];
            }
        }
        // eslint-disable-next-line

        return true;
    }

    getWarningMessage = () => {
        const { warningMessages } = this.props;
        const type = typeof warningMessages;
        if (type === 'string') {
            return warningMessages;
        } else if (type === 'object') {
            if (this.instantWarn.length > 0) {
                return warningMessages[this.instantWarn[0]];
            }
        }
        return true;
    }

    instantValidate = true
    invalid = []
    instantWarn = []

    configure = () => {
        this.context.form.attachToForm(this);
        this.instantValidate = this.context.form.instantValidate;
        this.debounceTime = this.context.form.debounceTime;
        this.validateDebounced = debounce(this.validate, this.debounceTime);
    }

    validateCurrent = (callback) => this.validateDebounced(this.props.value, this.props.withRequiredValidator, false, callback);

    validate = (value, includeRequired = false, dryRun = false, callback = null) => {
        const validations = Promise.all(
            (this.props.validators || []).map(validator => ValidatorForm.getValidator(validator, value, includeRequired))
        );
        let valid = true;
        validations.then((results) => {
            this.invalid = [];
            results.forEach((result, key) => {
                if (!result) {
                    valid = false;
                    this.invalid.push(key);
                }
            });
            if (!dryRun) {
                this.setState({ isValid: valid }, () => {
                    this.props.validatorListener(this.state.isValid, this.getErrorMessage() || '');
                });
            }
        }).then(() => {
            callback && callback(valid);
        });
    }

    checkWarning = () => {
        if (this.props.warning) {
            const checks = Promise.all(
                this.props.warning.map(warn => ValidatorForm.getWarning(warn, this.props.value))
            );

            checks.then((results) => {
                this.instantWarn = [];
                let warn = false;
                results.forEach((result, key) => {
                    if (result) {
                        warn = true;
                        this.instantWarn.push(key);
                    }
                });
                this.setState({ isWarn: warn });
            });
        }
    }

    isValid = () => this.state.isValid;

    isValidCurr = (includeRequired = false) => {
        let valid = true;
        (this.props.validators || []).forEach(validator => {
            const _isValid = ValidatorForm.getValidator(validator, this.props.value, includeRequired);
            if(!_isValid){
                valid = false;
            }
        });
        return valid;
    }

    isWarning = () => this.state.isWarn;

    makeInvalid = () => {
        this.setState({ isValid: false });
    }

    makeValid = () => {
        this.setState({ isValid: true });
    }

    validateImmd = (value, includeRequired = false) => {
        return new Promise.all(
            (this.props.validators || []).map(validator => ValidatorForm.getValidator(validator, value, includeRequired))
        );
    }
}

ValidatorComponent.contextTypes = {
    form: PropTypes.object
};

ValidatorComponent.propTypes = {
    errorMessages: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.string
    ]),
    validators: PropTypes.array,
    value: PropTypes.any,
    validatorListener: PropTypes.func,
    withRequiredValidator: PropTypes.bool,
    validByBlur: PropTypes.bool
};

ValidatorComponent.defaultProps = {
    errorMessages: 'error',
    validators: [],
    validatorListener: () => { }
};

polyfill(ValidatorComponent);

export default ValidatorComponent;
