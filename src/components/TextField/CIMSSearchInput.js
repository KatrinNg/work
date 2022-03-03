import React from 'react';
import withStyles from '@material-ui/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Search from '@material-ui/icons/Search';

const styles = theme => ({
    root: {
        padding: '2px 0px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: theme.spacing(4),
        border: '1px solid rgba(0,0,0,0.42)',
        width: '100%'
    },
    input: {
        marginLeft: 8,
        flex: 1,
        fontSize: '12pt',
        borderRadius: theme.spacing(4)
    },
    button: {
        padding: theme.spacing(1),
        marginRight: theme.spacing(2)
    }
});

const SearchInput = React.forwardRef((props, ref) => {
    const {
        classes,
        id='cimsSearch',
        //eslint-disable-next-line
        value,
        InputBaseProps,
        IconButtonProps,
        searching = false,
        ...rest
    } = props;

    const [val, setVal] = React.useState('');

    React.useEffect(() => {
        setVal(props.value);
    }, [props.value]);

    const handleOnChange = (e) => {
        setVal(e.target.value);
        props.onChange && props.onChange(e);
    };

    //eslint-disable-next-line
    const { onChange, ...other } = InputBaseProps;

    return (
        <Paper
            className={classes.root}
            elevation={1}
            {...rest}
        >
            <InputBase
                id={`${id}_searchInput`}
                className={classes.input}
                value={val}
                autoComplete={false}
                onChange={handleOnChange}
                {...other}
            />
            <IconButton
                id={`${id}_searchBtn`}
                className={classes.button}
                color="primary"
                {...IconButtonProps}
            >
                {searching ? <CircularProgress size={20} /> : <Search />}
            </IconButton>
        </Paper>
    );
});

export default withStyles(styles)(SearchInput);