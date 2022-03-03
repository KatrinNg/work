import React, { useEffect, useState } from 'react';
import Select, { components, createFilter } from 'react-select';
import * as Colors from '@material-ui/core/colors';
import {
    Checkbox, makeStyles
} from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import _ from 'lodash';
import {
    ArrowDropDown as ArrowDropDownIcon
} from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    checked: {
        color: '#0579c8 !important'
    }
}));

const ReactSelect = (props) => {
    const classes = useStyles();

    const [isSelectAll, setSelectAll] = useState(false);

    let { options } = props;

    useEffect(() => {
        if (props.isMulti && props.selectAll) {
            if (props.value?.filter(x => !x.all).length == options.length) {
                if (!isSelectAll)
                    setSelectAll(true);
            }
            else {
                if (isSelectAll)
                    setSelectAll(false);
            }
        }
    }, [props.value]);

    const styles = {
        clearIndicator: (provided, state) => _.merge({
            ...provided
        }, props.styles?.clearIndicator?.(provided, state)),
        container: (provided, state) => _.merge({
            ...provided,
            width: '100%',
            height: '100%',
            margin: '1px'
        }, props.styles?.container?.(provided, state)),
        control: (provided, state) => _.merge({
            ...provided,
            width: '100%',
            height: '100%',
            background: state.isDisabled ? Colors.grey[300] : fade(Colors.common.white, 0),// provided.backgroundColor,
            border: 0,
            boxShadow: 'none'
        }, props.styles?.control?.(provided, state)),
        dropdownIndicator: (provided, state) => _.merge({
            ...provided
        }, props.styles?.dropdownIndicator?.(provided, state)),
        group: (provided, state) => _.merge({
            ...provided
        }, props.styles?.group?.(provided, state)),
        groupHeading: (provided, state) => _.merge({
            ...provided
        }, props.styles?.groupHeading?.(provided, state)),
        indicatorsContainer: (provided, state) => _.merge({
            ...provided
        }, props.styles?.indicatorsContainer?.(provided, state)),
        indicatorSeparator: (provided, state) => _.merge({
            ...provided
        }, props.styles?.indicatorSeparator?.(provided, state)),
        input: (provided, state) => _.merge({
            ...provided
        }, props.styles?.input?.(provided, state)),
        loadingIndicator: (provided, state) => _.merge({
            ...provided
        }, props.styles?.loadingIndicator?.(provided, state)),
        loadingMessage: (provided, state) => _.merge({
            ...provided
        }, props.styles?.loadingMessage?.(provided, state)),
        menu: (provided, state) => _.merge({
            ...provided,
            zIndex: 9999,
            minWidth: '100%',
            width: 'max-content',
            maxWidth: window.innerWidth * 0.5
        }, props.styles?.menu?.(provided, state)),
        menuList: (provided, state) => _.merge({
            ...provided
        }, props.styles?.menuList?.(provided, state)),
        menuPortal: (provided, state) => _.merge({
            ...provided,
            zIndex: 9999
        }, props.styles?.menuPortal?.(provided, state)),
        multiValue: (provided, state) => _.merge({
            ...provided,
            paddingRight: state.isDisabled ? '6px' : provided.paddingRight
        }, props.styles?.multiValue?.(provided, state)),
        multiValueLabel: (provided, state) => _.merge({
            ...provided
        }, props.styles?.multiValueLabel?.(provided, state)),
        multiValueRemove: (provided, state) => _.merge({
             ...provided,
             display: state.isDisabled ? 'none' : provided.display
        }, props.styles?.multiValueRemove?.(provided, state)),
        noOptionsMessage: (provided, state) => _.merge({
            ...provided
        }, props.styles?.noOptionsMessage?.(provided, state)),
        option: (provided, state) => _.merge({
            ...provided,
            backgroundColor: state.isSelected || (state.data.all && isSelectAll) ? Colors.grey[300] : Colors.common.white,
            color: fade(Colors.common.black, 0.87),
            ':hover': {
                backgroundColor: Colors.grey[200]
            },
            ':active': {
                backgroundColor: Colors.grey[500]
            },
            padding: state.isMulti ? '0px' : provided.padding
        }, props.styles?.option?.(provided, state)),
        placeholder: (provided, state) => _.merge({
            ...provided
        }, props.styles?.placeholder?.(provided, state)),
        singleValue: (provided, state) => _.merge({
            ...provided,
            color: fade(Colors.common.black, 0.87)
        }, props.styles?.singleValue?.(provided, state)),
        valueContainer: (provided, state) => _.merge({
            ...provided
        }, props.styles?.valueContainer?.(provided, state))
    };

    const sortFunc = props.sortFunc ? props.sortFunc : (a, b) => a.label > b.label ? 1 : b.label > a.label ? -1 : 0;

    const deselectAll = () =>{
        setSelectAll(false);
    };

    return (
        <Select
            ref={props.innerRef}
            deselectAll={deselectAll}
            styles={styles}
            openMenuOnFocus={props.openMenuOnFocus}
            isClearable={props.isClearable}
            isDisabled={props.isDisabled}
            isLoading={props.isLoading}
            isRtl={props.isRtl}
            isSearchable={props.isSearchable}
            filterOption={createFilter(props.filterOption)}
            placeholder={props.placeholder}
            menuPlacement={props.menuPlacement}
            maxMenuHeight={props.maxMenuHeight}
            menuPortalTarget={props.menuPortalTarget}
            isMulti={props.isMulti}
            hideSelectedOptions={props.hideSelectedOptions}
            closeMenuOnSelect={props.closeMenuOnSelect}
            components={props.components ? props.components : {
                Option: props => {
                    return props.isMulti ?
                    (
                        <React.Fragment>
                            <components.Option {...props}>{
                                props.data.all ?
                                <Checkbox classes={{ checked: classes.checked }} color="primary" checked={isSelectAll} />
                                :
                                <Checkbox classes={{ checked: classes.checked }} color="primary" checked={props.isSelected} />
                            }<span>{props.label}</span>
                            </components.Option>
                        </React.Fragment>
                    )
                    :
                    (
                        <components.Option {...props} />
                    );
                },
                DropdownIndicator: () => <ArrowDropDownIcon style={{color: 'rgba(0, 0, 0, 0.54)'}} />,
                IndicatorSeparator: () => null
            }}
            options={props.isMulti && props.selectAll && options?.length > 0 ? [{value: '__select_all', label: props.selectAll, all: true}, ...options] : options}
            value={props.value}
            inputValue={props.inputValue}
            onMenuOpen={() => {
                if (props.onMenuOpen)
                    props.onMenuOpen();
            }}
            onMenuClose={() => {
                if (props.onMenuClose)
                    props.onMenuClose();
            }}
            onChange={(value, params) => {
                if (props.isMulti && props.selectAll) {
                    if (params.option) {
                        if (params.option.all) {
                            if (isSelectAll) {
                                value = [];
                                setSelectAll(false);
                            }
                            else {
                                value = [...props.options];
                                setSelectAll(true);
                            }
                        }
                        else {
                            if (value?.filter(x => !x.all).length == options.length) {
                                if (!isSelectAll)
                                    setSelectAll(true);
                            }
                            else {
                                if (isSelectAll)
                                    setSelectAll(false);
                            }
                        }
                    }
                    else {
                        setSelectAll(false);
                    }
                }

                if (Array.isArray(value))
                    value = value.sort(sortFunc);
                if (props.onChange)
                    props.onChange(value, params);
            }}
            onInputChange={(value, params) => {
                if (props.onInputChange)
                    props.onInputChange(value, params);
            }}
            onBlur={event => {
                if (props.onBlur)
                    props.onBlur(event);
            }}
        />
    );
};

export default ReactSelect;
