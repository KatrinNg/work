import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import memoize from 'memoize-one';
import Select from 'react-select';
import Creatable_Select from 'react-select/creatable';
import { emphasize, makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
// import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
// import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
// import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import MaterialMenuList from '@material-ui/core/MenuList';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import _ from 'lodash';
import Tooltip from '@material-ui/core/Tooltip';
import * as CommonUtil from '../../utilities/commonUtilities.js';

const useStyles = makeStyles(theme => ({
    input: {
        display: 'flex',
        fontSize: props => props.isSmallSize ? '10pt' : '12pt'//update by Demi on 20200312
    },
    multiBaseInput: {
        height: 'auto',
        minHeight: 26
    },
    multiBaseInput_input: {
        height: 'auto'
    },
    valueContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
        overflow: 'hidden'
    },
    chip: {
        margin: theme.spacing(1, 0.5),
        height: 'auto',
        lineHeight: '2rem'
    },
    chipLabel: {
        fontSize: 'unset'
    },
    chipDeleteIcon: {
        fontSize: 'unset'
    },
    chipFocused: {
        backgroundColor: emphasize(
            theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
            0.08
        )
    },
    noOptionsMessage: {
        padding: theme.spacing(1, 2)
    },
    singleValue: {
        paddingLeft: 8,
        fontSize: props => props.isSmallSize ? '10pt' : '12pt',//update by Demi on 20200312
        fontStyle: 'Arial',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 'calc(100% - 28px)'
    },
    placeholder: {
        // position: 'absolute',
        // top: 2,
        fontSize: props => props.isSmallSize ? '10pt' : '12pt',//update by Demi on 20200312
        fontStyle: 'Arial',
        paddingLeft: 8
    },
    menuList: {
        maxHeight: 300,
        maxWidth: '80vw',
        overflowY: 'auto',
        paddingBottom: 4,
        paddingTop: 4,
        position: 'relative',
        '-webkit-overflow-scrolling': 'touch',
        boxSizing: 'border-box'
    },
    menuItem: {
        overflowX: 'auto',
        paddingTop: 10,
        paddingBottom: 10,
        //whiteSpace: 'normal',
        whiteSpace: 'nowrap',
        height: 'auto',
        lineHeight: 1,
        minHeight: 'unset',
        fontWeight: 400
    },
    paper: {
        position: 'absolute',
        zIndex: 2,
        marginTop: 0,
        left: 0,
        right: 0,
        background: '#fff'
        //fontSize: props.isSmallSize ? '10pt' : '',
        //width: menuWidth
    },
    smallSize: {
        fontSize: '10pt'
    },
    menuItemSelected: {
        fontWeight: 500,
        backgroundColor: theme.palette.action.hover
    }
}));

let scrollOptionTop = 0;

function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            className={
                classNames({
                    [props.selectProps.classes.noOptionsMessage]: true,
                    [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                })
            }
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function inputComponent({ inputRef, ...props }) {
    return <div ref={inputRef} {...props} />;
}

function Control(props) {
    const {
        children,
        innerProps,
        innerRef,
        selectProps: { classes, TextFieldProps }
    } = props;
    let txtVal = '';
    if (props.isMulti && props.selectProps.value) {
        const valArr = props.selectProps.value.map(item => item.value);
        txtVal = valArr.join(';');
    } else if (!props.isMulti && props.selectProps.value) {
        txtVal = props.selectProps.value.value;
    }

    const handleKeyDown = (e) => {
        if (props.selectProps.isClearable) {
            if (e.keyCode === 8 || e.keyCode === 46) {
                props.clearValue();
            }
        }
    };

    return (
        <TextField
            error={!props.selectProps.isValid}
            value={txtVal}
            fullWidth
            disabled={props.selectProps.isDisabled}
            variant="outlined"
            InputProps={{
                inputComponent,
                inputProps: {
                    className: classes.input,
                    ref: innerRef,
                    children,
                    ...props.selectProps.innerProps,
                    ...innerProps
                },
                classes: {
                    root: classNames({
                        [props.selectProps.classes.multiBaseInput]: props.selectProps.isMulti,
                        [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                    }),
                    input: classNames({
                        [props.selectProps.classes.multiBaseInput_input]: props.selectProps.isMulti
                    })
                }
            }}
            onKeyDown={handleKeyDown}
            {...TextFieldProps}
            id={props.selectProps.id + '_control'}
        />
    );
}

function Option(props) {
    const menuItemRef = React.useRef();
    React.useEffect(() => {
        if (props.isSelected) {
            scrollOptionTop = menuItemRef.current.offsetTop;
        }
    }, []);
    //add by Demi on 20200312
    const { moeFilter, filtedList, filterVal } = props.selectProps;

    return (
        <MenuItem
            ref={menuItemRef}
            // ref={props.innerRef}
            selected={props.isSelected}
            component="div"
            className={
                classNames({
                    [props.selectProps.classes.menuItem]: true,
                    [props.selectProps.classes.menuItemSelected]: props.isFocused,
                    [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                })
            }
            {...props.innerProps}
        >
            {/* add by Demi on 20200312 start */}
            {
                moeFilter && moeFilter.filterField
                    && (
                        (filterVal && filterVal == props.data[moeFilter.filterField])//first search
                        || (moeFilter.displayFiledName && props.data[moeFilter.displayFiledName]//Selected once and then search again
                            && (filterVal == props.data.label
                                || props.isSelected)
                        )
                        || (filtedList.indexOf(props.data[moeFilter.filterField]) > -1//After no selected, then search again
                            && filterVal == props.data.label)
                    )
                    && props.data[moeFilter.filterField] ?
                    `(${props.data[moeFilter.filterField]}) ${props.children}`
                    :
                    props.children
            }
            {/* add by Demi on 20200312 end */}
            {/* {props.children} */}
        </MenuItem>
    );
}

function Placeholder(props) {
    const { selectProps, innerProps = {}, children } = props;
    return (
        <Typography
            color="textSecondary"
            className={
                classNames({
                    [selectProps.classes.placeholder]: true,
                    [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                })
            }
            {...innerProps}
        >
            {children}
        </Typography>
    );
}

function SingleValue(props) {
    //add by Demi on 20200312
    const { moeFilter, filterVal, isSearchingVal, isTooltip } = props.selectProps;
    {/* add by Demi on 20200312 start */ }
    let content = moeFilter && moeFilter.filterField
        && props.data[moeFilter.filterField]
        // && (filterVal || isSearchingVal)
        && (moeFilter.displayFiledName
            && props.data[moeFilter.displayFiledName]
            && (props.data.label == filterVal
                || props.data[moeFilter.filterField] == filterVal
                || isSearchingVal)//select by search
        )
        ?
        `(${props.data[moeFilter.filterField]}) ${props.children}`
        :
        props.children;
    {/* add by Demi on 20200312 end */ }
    if (isTooltip) {
        return (
            <Tooltip title={content}>
                <Typography
                    className={
                        classNames({
                            [props.selectProps.classes.singleValue]: true,
                            [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                        })
                    }
                    {...props.innerProps}
                >{content}</Typography>
            </Tooltip>
        );
    } else {
        return (
            <Typography
                className={
                    classNames({
                        [props.selectProps.classes.singleValue]: true,
                        [props.selectProps.classes.smallSize]: props.selectProps.isSmallSize
                    })
                }
                {...props.innerProps}
            >{content}</Typography>
        );
    }
}

function ValueContainer(props) {
    return (
        <div
            // style={{ backgroundColor: !props.isMulti && props.selectProps.value ? 'white' : '' }}
            className={props.selectProps.classes.valueContainer}
        >{props.children}</div>
    );
}

function MultiValue(props) {
    return (
        <Chip
            tabIndex={-1}
            label={props.children}
            className={clsx(props.selectProps.classes.chip, {
                [props.selectProps.classes.chipFocused]: props.isFocused
            })}
            classes={{
                label: props.selectProps.classes.chipLabel,
                deleteIcon: props.selectProps.classes.chipDeleteIcon
            }}
            onDelete={props.removeProps.onClick}
            deleteIcon={<CancelIcon {...props.removeProps} />}
        />
    );
}

function Menu(props) {
    const textFieldControl = document.getElementById(props.selectProps.id + '_control');
    const minWidth = textFieldControl.getBoundingClientRect().width;
    return (
        <Popper
            id={props.selectProps.id + '_menu_container'}
            open
            anchorEl={textFieldControl}
            placement="bottom"
            modifiers={{
                flip: {
                    enabled: true
                },
                preventOverflow: {
                    enabled: true,
                    boundariesElement: 'window'
                }
            }}
            popperOptions={{
                positionFixed: true
            }}
            style={{ minWidth: minWidth, zIndex: 1301 }}
            {...props.innerProps}
        >
            <Paper>
                <MaterialMenuList>
                    {props.children}
                </MaterialMenuList>
            </Paper>
        </Popper>
    );
}

function MenuList(props) {

    const menuListRef = React.useRef();

    React.useEffect(() => {
        menuListRef.current.scrollTop = scrollOptionTop;
    }, []);

    return (
        <Grid className={props.selectProps.classes.menuList} ref={menuListRef}>
            {props.children}
        </Grid>
    );
}

const myComponents = {
    Control,
    Menu,
    MenuList,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer
};

const getSelectStyles = theme => ({
    input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
            font: 'inherit'
        }
    }),
    container: base => ({
        ...base,
        width: '100%'
    }),
    clearIndicator: base => ({
        ...base,
        cursor: 'pointer'
    }),
    dropdownIndicator: base => ({
        ...base,
        cursor: 'pointer'
    }),
    indicatorSeparator: base => ({
        ...base,
        width: 0
    }),
    indicatorContainer: base => ({
        ...base,
        padding: 0
    })
});

const createOption = (label) => ({
    label,
    value: label
});

const initOptions = memoize(({
    options,
    sortBy,
    addNullOption,
    addAllOption,
    addNewOption,
    newOptionPosition,
    creatableOption,
    isMulti
}) => {
    let _options = _.cloneDeep(options || []);
    if(sortBy && typeof sortBy === 'string'){
        _options.sort((a, b) => _.toString(a[sortBy]).localeCompare(_.toString(b[sortBy])));
    } else if(sortBy && typeof sortBy === 'function') {
        _options.sort(sortBy);
    }
    if (addNullOption && !isMulti && !addAllOption && _options.findIndex(item => item.value === '') < 0) {
        _options.unshift({
            label: <>&nbsp;</>,
            value: ''
        });
    }
    if (addAllOption && _options.findIndex(item => item.value === '*All') < 0) {
        _options.unshift({
            label: 'ALL',
            value: '*All'
        });
    }
    if(addNewOption) {
        let pos = parseInt(newOptionPosition || 0);
        if(Number.isInteger(pos)) {
            _options.splice(pos, 0, addNewOption);
        }
    }
    if(creatableOption) {
        _options = _.concat(_options, creatableOption || []);
    }
    return _options;
});

const multiValFilter = memoize((opts, vals) => {
    let filters = [];
    for (let i = 0; i < vals.length; i++) {
        let opt = opts.find(item => item.value === vals[i]);
        if(opt) {
            filters.push(opt);
        } else {
            filters.push(createOption(vals[i]));
        }
    }
    return filters;
});

const initDefaultValue = memoize((isMulti, defaultValue, options) => {
    let _defaultValue = '';
    if (isMulti) {
        _defaultValue = defaultValue ? multiValFilter(options, defaultValue) : null;
    } else {
        _defaultValue = defaultValue ? options.find(item => item.value === defaultValue) : null;
    }
    return _defaultValue;
});

const initValue = memoize((isMulti, value, defaultValue, options, isCreatableSelect = false) => {
    let _value = '';
    if (isMulti) {
        _value = value ? multiValFilter(options, value) : defaultValue;
    } else {
        if(value) {
            _value = options.find(item => item.value === value) || null;
            if (isCreatableSelect && !_value) {
                _value = createOption(value);
                options.push(_value);
            }
        } else {
            _value = defaultValue;
        }
    }
    return _value;
});

const CIMSSelect = React.forwardRef((props, ref) => {
    const classes = useStyles(props);//update by Demi on 20200312
    const theme = useTheme();
    const {
        options,
        defaultValue,
        value,
        onChange,
        addNullOption = true,
        addAllOption,
        addNewOption,
        newOptionPosition,
        sortBy,
        ...rest
    } = props;

    //add by Demi on 20200312
    const [filterVal, setFilterVal] = useState();
    const [filtedList, setFiltedList] = useState([]);
    const [isSearchingVal, setIsSearchingVal] = useState(false);
    const selectStyles = getSelectStyles(theme);

    let _options = initOptions({
        options,
        sortBy,
        addNullOption,
        addAllOption,
        addNewOption,
        newOptionPosition,
        isMulti: props.isMulti
    });
    let _defaultValue = initDefaultValue(props.isMulti, defaultValue, _options);
    let _value = initValue(props.isMulti, value, _defaultValue, _options);

    const filterOptions = (candidate, input) => {
        if (input && candidate.label && typeof candidate.label === 'string') {
            input = input.toUpperCase();
            //add by Demi on 20200312 start
            let filterCondition = candidate.label.toUpperCase().indexOf(input) > -1;
            //search other fields
            if (props.moeFilter) {
                //mark search status
                setFilterVal(input);
                let fieldValue = _.cloneDeep(candidate.data[props.moeFilter.filterField]);
                if (fieldValue) {
                    if (typeof fieldValue !== 'string')
                        fieldValue = fieldValue.toString();
                    if (fieldValue == input && filtedList.indexOf(fieldValue) == -1)
                        filtedList.push(fieldValue);
                    filterCondition = filterCondition || fieldValue == input;
                }
            }
            return filterCondition;
            //add by Demi on 20200312 end
            // return candidate.label.indexOf(input) > -1;
        }
        //add by Demi on 20200312
        if (filterVal && props.moeFilter) {
            setFilterVal();
        }
        if(input&&candidate.value===''){
            return false;
        }
        return true;
    };

    const handleOnChange = (e) => {
        if (!props.isMulti && !e) {
            onChange && onChange({ label: '', value: null });
        } else {
            if (props.moeFilter) {
                onChange && onChange(e, filtedList);
                // mark the value is from the search
                if (filterVal) {
                    setFilterVal(filterVal);
                    setIsSearchingVal(true);
                    return;
                }
                if (e.value != props.value) {
                    setFilterVal();
                    setFiltedList([]);
                    setIsSearchingVal(false);
                }
            } else
                onChange && onChange(e);
        }
    };

    return (
        <Select
            options={_options}
            value={_value}
            defaultValue={_defaultValue}
            classes={classes}
            components={myComponents}
            placeholder={''}
            ref={ref}
            isValid
            onChange={handleOnChange}
            filterOption={filterOptions}
            filterVal={filterVal}//add by Demi on 20200312
            isSearchingVal={isSearchingVal}//add by Demi on 20200312
            filtedList={filtedList}//add by Demi on 20200316
            {...rest}
            styles={selectStyles}
        />
    );
});

CIMSSelect.propTypes = {
    id: PropTypes.string.isRequired,
    sortBy: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string
    ])
};

const CreatableSelect = React.forwardRef((props, ref) => {
    const classes = useStyles();
    const theme = useTheme();
    const selectStyles = getSelectStyles(theme);
    const [inputVal, setInputVal] = useState('');
    const [creatableOptions, setCreatableOptions] = useState([]);
    const {
        options,
        defaultValue,
        value,
        onChange,
        onInputChange,
        addNullOption = true,
        addAllOption,
        addNewOption,
        newOptionPosition,
        sortBy,
        maxLength,
        calActualLength,
        filterOption,
        onBlur,
        ...rest
    } = props;

    let _options = initOptions({
        options,
        sortBy,
        addNullOption,
        addAllOption,
        addNewOption,
        newOptionPosition,
        creatableOptions,
        isMulti: props.isMulti
    });
    let _defaultValue = initDefaultValue(props.isMulti, defaultValue, _options);
    let _value = initValue(props.isMulti, value, _defaultValue, _options, true);

    const filterOptions = (candidate, input) => {
        const customCondition = filterOption ? filterOption(candidate, input) : true;
        const newOptionsCondition = creatableOptions.findIndex(x => x.label === candidate.label && x.value === candidate.value) > -1;
        const nullOptionsCondition = input ? !!candidate.value : true;
        if (input && candidate.label && typeof candidate.label === 'string') {
            const filterCondition = candidate.label.toUpperCase().indexOf(input.toUpperCase()) > -1;
            return nullOptionsCondition && filterCondition && !newOptionsCondition && customCondition;
        }
        return nullOptionsCondition && !newOptionsCondition && customCondition;
    };

    const handleOnChange = (e) => {
        if (!props.isMulti && !e) {
            onChange && onChange({ label: '', value: null });
        } else {
            onChange && onChange(e);
        }
    };

    const handleInputChange = (inputValue, actionMeta) => {
        if (maxLength){
            if (calActualLength) {
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const byteSize = CommonUtil.getUTF8StringLength(inputValue);
                    if (byteSize <= maxLength) {
                        break;
                    }
                    inputValue = inputValue.substr(0, inputValue.length - 1);
                }
            } else {
                if (inputValue.length > maxLength) {
                    return;
                }
            }
        }
        setInputVal(inputValue);
        onInputChange && onInputChange(inputValue, actionMeta);
    };

    const isValidNewOption = (inputValue, selectValue, selectOptions) => {
        return inputValue ? true : false;
    };

    const handleCreate = (inputValue) => {
        let newOption = createOption(inputValue);
        if(props.isMulti){
            setCreatableOptions([...creatableOptions, newOption]);
            handleOnChange([..._value, newOption]);
        } else {
            setCreatableOptions([newOption]);
            handleOnChange(newOption);
        }
    };

    const handleOnBlur = (e) => {
        if (e.target.value) {
            handleCreate(e.target.value);
        }
        onBlur && onBlur(e);
    };

    return (
        <Creatable_Select
            options={_options}
            value={_value}
            inputValue={inputVal}
            defaultValue={_defaultValue}
            classes={classes}
            components={myComponents}
            placeholder={''}
            ref={ref}
            isValid
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            onInputChange={handleInputChange}
            filterOption={filterOptions}
            isValidNewOption={isValidNewOption}
            onCreateOption={handleCreate}
            {...rest}
            styles={selectStyles}
        />
    );
});

CreatableSelect.propTypes = {
    id: PropTypes.string.isRequired,
    sortBy: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string
    ])
};

export default CIMSSelect;
export { CreatableSelect };