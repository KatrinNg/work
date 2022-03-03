import React, { Component } from 'react';
import { Grid, Tooltip, colors } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as Colors from '@material-ui/core/colors';
import { Field, FastField, getIn } from 'formik';
import _ from 'lodash';

class GridTextFieldRenderer extends Component {
    constructor(props) {
        super(props);

        const rowId = this.props.data?.rowId;
        const colId = this.props.colDef?.colId ?? this.props.colDef?.field;
        const fieldName = `rowData[${rowId}].${colId}`;

        this.params = {
            rowId,
            colId
        };

        this.state = {
            rowId,
            colId,
            fieldName,
            value: props.value
            // refresh: 0
        };

        this.refInput = React.createRef();
    }

    componentDidMount() {
        this.props.api && this.props.api.addEventListener('cellFocus', this.onCellFocus);
        this.refInput.current.addEventListener('keydown', this.onKeyDown);
        // console.log(this.state.fieldName + ' mount');
    }

    componentWillUnmount() {
        this.props.api && this.props.api.removeEventListener('cellFocus', this.onCellFocus);
        this.refInput.current.removeEventListener('keydown', this.onKeyDown);
        // console.log(this.state.fieldName + ' unmount');
    }

    refresh() {
        // console.log(this.state.fieldName + " refresh");
        // this.setState({ refresh: !this.state.refresh });
        return true;
    }

    onCellFocus = event => {
        const { rowId, colId } = this.state;
        if (event.params.rowId === rowId && event.params.colId === colId) {
            this.refInput.current.focus();
        }
    }

    getCharCodeFromEvent(event) {
        event = event || window.event;
        return typeof event.which === 'undefined' ? event.keyCode : event.which;
    }

    onKeyDown = event => {
        let charCode = this.getCharCodeFromEvent(event);
        // console.log(charCode);
        switch (charCode) {
        case 9:
        case 35:
        case 36:
        case 37:
        case 38:
        case 39:
        case 40:
            event.stopPropagation();
            break;
        case 13:
            console.log(this.props);
            event.preventDefault();
            break;
        default:
            break;
        }
    };

    onChange = (event, field, form) => {
        const value = event.target.value;
        this.setState({ value }, () => {
            let params = { ...this.params, field, form, value: this.state.value };
            this.props.changeField(params);
            // this.changeParent(params);
        });
    };

    changeParent = _.debounce(params => {
        this.props.changeField(params);
    }, 200);

    onBlur = (field, form) => {
        let params = { ...this.params, field, form, value: this.state.value };
        // this.changeParent.cancel();
        // this.props.changeField(params);
        this.props.blurField(params);
        // _.delay(this.props.blurField, 100, params);
    }

    render() {
        const { fieldName, rowId, colId } = this.state;
        const { inputType, readOnly } = this.props;
        return (
            <FastField
                name={fieldName}
            >
                {({ field, form }) => {
                    let fieldError = getIn(form.errors, fieldName);
                    let fieldTouched = getIn(form.touched, fieldName);
                    let error = !!fieldError && !!fieldTouched;
                    return (
                        <CustomTooltip
                            title={error ? fieldError : ''}
                        >
                            <div>
                                <input
                                    ref={this.refInput}
                                    type={inputType}
                                    name="textField"
                                    autoComplete="off"
                                    id={`gird_text_field_renderer_${colId}_${rowId}`}
                                    style={{
                                        fontFamily: 'inherit',
                                        fontSize: 'inherit',
                                        width: '100%',
                                        borderColor: error ? '#ff0000' : 'initial',
                                        borderStyle: readOnly ? 'unset' : (error ? 'solid' : 'inset')
                                    }}
                                    value={this.state.value}
                                    onChange={event => this.onChange(event, field, form)}
                                    onBlur={event => this.onBlur(field, form)}
                                    readOnly={readOnly}
                                />
                            </div>
                        </CustomTooltip>
                    );
                }}
            </FastField>
        );
    }
}

export default GridTextFieldRenderer;

const CustomTooltip = withStyles(theme => ({
    tooltip: {
        backgroundColor: Colors.red[400],
        color: Colors.common.white,
        boxShadow: '1px 1px 1px 1px rgba(0, 0, 0, 0.2)',
        fontSize: 14
    }
}))(Tooltip);