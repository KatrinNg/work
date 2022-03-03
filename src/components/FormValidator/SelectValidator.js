import React from 'react';
import memoize from 'memoize-one';
import _ from 'lodash';
import withStyles from '@material-ui/styles/withStyles';
import PropTypes from 'prop-types';
import CIMSSelect from '../Select/CIMSSelect';
import ArrowPopper from '../Popper/ArrowPopper';
import Grid from '@material-ui/core/Grid';
import Zoom from '@material-ui/core/Zoom';
import Typography from '@material-ui/core/Typography';
import ValidatorComponent from './ValidatorComponent';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';

const styles = theme => ({
    errorMessage: {
        color: theme.palette.errorColor,
        fontSize: '0.75rem'
    },
    warnMessage: {
        color: theme.palette.grey[700],
        fontSize: '0.75rem'
    }
});

class SelectComponent extends ValidatorComponent {
    focus = () => {
        this.selectRef.select.focus();
    }

    getErrOrWarnMsg = () => {
        const { classes } = this.props;
        const { isValid, isWarn } = this.state;
        if (!isValid) {
            return <Typography className={classes.errorMessage}>{this.getErrorMessage && this.getErrorMessage()}</Typography>;
        }
        if (isWarn) {
            return <Typography className={classes.warnMessage}>{this.getWarningMessage && this.getWarningMessage()}</Typography>;
        }
        return null;
    }

    render() {
        /* eslint-disable */
        const {
            classes,//NOSONAR
            errorMessages,//NOSONAR
            validators,//NOSONAR
            validatorListener,//NOSONAR
            withRequiredValidator,//NOSONAR
            notShowMsg,//NOSONAR
            warning,//NOSONAR
            warningMessages, //NOSONAR
            portalContainer = this.gridRef,//NOSONAR
            PopperProps,//NOSONAR
            ...rest //NOSONAR
        } = this.props;
        /* eslint-enable */

        const { isValid, isWarn } = this.state;

        return (
            <Grid container ref={ref => this.gridRef = ref}>
                <CIMSSelect
                    ref={ref => this.selectRef = ref}
                    isValid={isValid}
                    {...rest}
                />
                {
                    !notShowMsg && portalContainer ?
                        <ArrowPopper
                            {...PopperProps}
                            id={this.props.id + '_arrowPopper'}
                            open={(!isValid || isWarn) && this.gridRef ? true : false}
                            anchorEl={this.gridRef}
                            container={portalContainer}
                            TransitionComponent={Zoom}
                        >
                            {this.getErrOrWarnMsg()}
                        </ArrowPopper> : null
                }
            </Grid>
        );
    }
}

const SelectComponentRender = withStyles(styles)(SelectComponent);

const SelectValidator = React.forwardRef((props, ref) => {
    const filterValidator = memoize((
        validators,
        errorMessages,
        isRequired
    ) => {
        let _validators = _.cloneDeep(validators);
        let _errorMessages = _.cloneDeep(errorMessages);
        if (isRequired) {
            _validators.push(ValidatorEnum.required);
            _errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
        }
        return { _validators, _errorMessages };
    });

    const { validators = [], errorMessages = [], isRequired, ...rest } = props;
    const { isDisabled } = props;
    let _validator = filterValidator(
        validators,
        errorMessages,
        isRequired
    );
    const addNullOption = !isDisabled && _validator._validators && _validator._validators.findIndex(x => x === ValidatorEnum.required) > -1 ? false : true;
    return (
        <SelectComponentRender
            validators={isDisabled ? [] : _validator._validators}
            errorMessages={isDisabled ? [] : _validator._errorMessages}
            addNullOption={addNullOption}
            ref={ref}
            {...rest}
        />
    );
});

SelectValidator.propTypes = {
    errorMessages: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.string
    ]),
    validators: PropTypes.array,
    value: PropTypes.any,
    validatorListener: PropTypes.func,
    withRequiredValidator: PropTypes.bool
};

SelectValidator.defaultProps = {
    withRequiredValidator: false,
    errorMessages: [],
    validators: [],
    validatorListener: () => { },
    isRequired: false,
    notShowMsg: false,
    warning: [],
    warningMessages: ''
};

export default withStyles(styles)(SelectValidator);