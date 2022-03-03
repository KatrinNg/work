import React,{ Component } from 'react';
import { withStyles, Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import { styles } from './StrengthenCheboxStyles';


class StrengthenChebox extends Component {
    constructor(props){
        super(props);
        this.state={

        };
    }
    handleChange=(event) => {
        let { updateState, cheboxList, itemId } =this.props;
        if(cheboxList[itemId]){
            cheboxList[itemId][event.target.name]=event.target.checked;
            updateState &&  updateState({ cheboxList });
        }
      };

    render(){
        const { classes, name, checkedFlag, label, FormCtlLabelAttribute, rest, wrapperStyle }  =this.props;
        return (<Grid className={classes.wrapper} style={wrapperStyle}>
                <FormControlLabel
                    {...FormCtlLabelAttribute}
                    control={
                        <Checkbox
                            checked={checkedFlag}
                            onChange={this.handleChange}
                            name={name}
                            {...rest}
                        />
                    }
                    label={label}
                />
        </Grid>);
    }
}

export default withStyles(styles)(StrengthenChebox);
