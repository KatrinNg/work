import React from 'react';

export default ({isLoading, error}) => {
    // Handle the loading state
    if (isLoading) {
        return <div>Loading...</div>;
    }
    // Handle the error state
    else if (error) {
        return <div>A problem has occurred on page loading. Please restart the workstation.</div>;
    }
    else {
        return null;
    }
};