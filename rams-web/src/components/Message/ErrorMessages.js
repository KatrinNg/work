import React from 'react';
import { useStyles } from './styles';


const ErrorMessages = ({
    errorMessage = [],
    isOnBlurTriggered
}) => {
    const classes = useStyles();
    return (
        isOnBlurTriggered &&
            errorMessage.map((item) => {
                return <div className={classes.SErrorLayout} key={item}>{item}</div>;
            })
    );
};

export default ErrorMessages;
