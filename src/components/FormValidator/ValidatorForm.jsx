/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import Promise from 'promise-polyfill';
/* eslint-enable */
import Rules from './ValidationRules';

class ValidatorForm extends React.Component {
    static getValidator = (validator, value, includeRequired) => {
        let result = true;
        let name = validator;
        if (name !== 'required' || includeRequired) {
            if (typeof name === 'function') {
                result = name(value);
            } else {
                let extra;
                const splitIdx = validator.indexOf(':');
                if (splitIdx !== -1) {
                    name = validator.substring(0, splitIdx);
                    extra = validator.substring(splitIdx + 1);
                }
                result = Rules[name](value, extra);
            }
        }
        return result;
    }

    static getWarning = (warn, value) => {
        let result = false;
        if (value) {
            let name = warn;
            let extra;
            const splitIdx = warn.indexOf(':');
            if (splitIdx !== -1) {
                name = warn.substring(0, splitIdx);
                extra = warn.substring(splitIdx + 1);
            }
            result = Rules[name](value, extra);
        }
        return result;
    }

    getChildContext = () => ({
        form: {
            attachToForm: this.attachToForm,
            detachFromForm: this.detachFromForm,
            instantValidate: this.instantValidate,
            debounceTime: this.debounceTime,
            /**add by justin 20200120
             * Mainly to determine whether it is in verification
             */
            getValidating: this.getValidating
        }
    })

    instantValidate = this.props.instantValidate !== undefined ? this.props.instantValidate : true;
    debounceTime = this.props.debounceTime;
    childs = [];
    errors = [];
    isValidating = false;

    attachToForm = (component) => {
        if (this.childs.indexOf(component) === -1) {
            this.childs.push(component);
        }
    }

    detachFromForm = (component) => {
        const componentPos = this.childs.indexOf(component);
        if (componentPos !== -1) {
            this.childs = this.childs.slice(0, componentPos)
                .concat(this.childs.slice(componentPos + 1));
        }
    }

    getValidating = () => { return this.isValidating; }

    focusFail = () => {
        if (this.childs && this.childs.length > 0) {
            let firstChild = this.childs.find(x => x.state && !x.state.isValid);
            if (firstChild) {
                firstChild.focus && firstChild.focus();
            }
        }
    }

    submit = (event, params) => {
        if (event) {
            event.preventDefault();
            event.persist();
        }
        if (!this.isValidating) {
            this.walk(this.childs).then((result) => {
                if (this.errors.length) {
                    if (this.props.focusFail) {
                        this.focusFail();
                    }
                    this.props.onError(this.errors);
                }
                if (result) {
                    this.props.onSubmit(event, params);
                }
                return result;
            });
        }
    }

    walk = (children, dryRun, includeRequired = true) => {
        this.errors = [];//add by Demi on 20200116
        this.isValidating = true;
        const self = this;
        return new Promise((resolve) => {
            let result = true;
            if (Array.isArray(children)) {
                Promise.all(children.map(input => self.checkInput(input, dryRun, includeRequired))).then((data) => {
                    data.forEach((item) => {
                        if (!item) {
                            result = false;
                        }
                    });
                    resolve(result);
                    this.isValidating = false;
                });
            } else {
                self.walk([children], dryRun, includeRequired).then(res => resolve(res));
            }
        });
    }

    checkInput = (input, dryRun, includeRequired) => (
        new Promise((resolve) => {
            let result = true;
            const validators = input.props.validators;
            if (validators) {
                this.validate(input, includeRequired, dryRun).then((data) => {
                    if (!data) {
                        result = false;
                    }
                    resolve(result);
                });
            } else {
                resolve(result);
            }
        })
    )

    validate = (input, includeRequired, dryRun) => (
        new Promise((resolve) => {
            const { value, validators } = input.props;
            const result = [];
            let valid = true;
            const validations = Promise.all(
                validators.map(validator => (
                    Promise.all([
                        this.constructor.getValidator(validator, value, includeRequired)
                    ]).then((data) => {
                        result.push({ input, result: data && data[0] });
                        input.validate(input.props.value, includeRequired, dryRun);
                    })
                ))
            );
            validations.then(() => {
                result.forEach((item) => {
                    if (!item.result) {
                        valid = false;
                        this.errors.push(item.input);
                    }
                });
                resolve(valid);
            });
        })
    )

    find = (collection, fn) => {
        for (let i = 0, l = collection.length; i < l; i++) {
            const item = collection[i];
            if (fn(item)) {
                return item;
            }
        }
        return null;
    }

    resetValidations = () => {
        this.childs.forEach((child) => {
            child.validateDebounced.cancel();
            child.setState({ isValid: true, isWarn: false }, () => {
                child.props.validatorListener(child.state.isValid, child.getErrorMessage() || '');
            });
        });
    }

    isFormValid = (dryRun = true, includeRequired = true) => {
        if (!this.isValidating)
            return this.walk(this.childs, dryRun, includeRequired);
        else
            return new Promise((resolve, reject) => {
                reject(true);
            });
    }

    render() {
        // eslint-disable-next-line
        const { onSubmit, instantValidate, onError, debounceTime, children, focusFail, ...rest } = this.props;//NOSONAR
        return (
            <form {...rest} onSubmit={this.submit}>
                {children}
            </form>
        );
    }
}

ValidatorForm.addValidationRule = (name, callback) => {
    Rules[name] = callback;
};

ValidatorForm.childContextTypes = {
    form: PropTypes.object
};

ValidatorForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    instantValidate: PropTypes.bool,
    children: PropTypes.node,
    onError: PropTypes.func,
    debounceTime: PropTypes.number
};

ValidatorForm.defaultProps = {
    onSubmit: () => { },
    onError: () => { },
    debounceTime: 0
};

export default ValidatorForm;
