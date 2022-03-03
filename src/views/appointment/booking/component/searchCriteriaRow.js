import React from 'react';
import { Grid, Typography } from '@material-ui/core';

const SearchCriteriaRow = (props) => {
    const { criteria } = props;
    return (
        <Grid item container>
            {
                criteria.map((c, idx) => {
                    return (
                        <Grid item key={`criteria_${idx}`}>
                            <Grid container>
                                <Typography style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                    {c.label}&nbsp;
                            </Typography>
                                <Typography style={{ whiteSpace: 'nowrap' }}>
                                    {c.value}
                                </Typography>
                                {idx !== criteria.length - 1 ?
                                    <Typography style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>;&nbsp;&nbsp;</Typography>
                                    : null}
                            </Grid>
                        </Grid>
                    );
                })
            }
        </Grid>
    );
};


export default SearchCriteriaRow;