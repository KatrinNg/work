import React from 'react';
import { Grid } from '@material-ui/core';
import { useStyles } from './style';
import SearchSelectList from 'components/SearchSelectList/SearchSelectList';

const GridItem = ({ value='', label, items, children, placeholder='', valueFiled='value', labelFiled='name', onChange, ...rest }) => {
    const classes = useStyles();
    return <Grid container >
        <Grid container className={classes.gridItemLabel}>{label}</Grid>
        <Grid container alignItems="center">
            {children ? children : 
            <SearchSelectList 
                handleSelect={onChange} 
                value={value} 
                placeholder={placeholder} 
                fullWidth={true} 
                options={items} 
                valueFiled={valueFiled} 
                labelFiled={labelFiled} 
                width={380} 
                {...rest}/>}
            {/* {children ? children : <CommonSelect onChange={onChange} value={value} width='100%' placeholder={placeholder} fullWidth={true} id={label} items={items} valueFiled={valueFiled} labelFiled={labelFiled}/>} */}
        </Grid>
    </Grid>
}

export default GridItem;