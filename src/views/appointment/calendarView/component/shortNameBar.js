import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';

const styles = {
    legend: {
        "backgroundColor": "white",
        "display": "flex",
        "lineHeight": "2rem"
    },
    title: {
        top: "2px",
        position: "relative",
        float: "left",
        fontWeight:"bold",
        marginRight: "1rem",
        fontSize: "large"
    },
    bar: {
        "backgroundColor": "white",
        "display": "flex",
        "width": "max-content",
        "borderRadius": "2rem",
        "border": "0.1rem solid black",
        "overflow": "hidden"
    },
    barEl: {
         "borderRight": "0.1rem solid black",
        "&:last-child":{
            "borderRight": "None"
        },
         "paddingLeft": "1rem",
         "paddingRight": "1rem",
         "textAlign": "center",
         "verticalAlign": "middle"
    }
};

class ShortNameBar extends Component {
    constructor(props) {
        super(props);
    }

    colorMap = ( styleObj, idx ) =>{
        if(idx === 0){
            styleObj.backgroundColor = "violent";
        }
        else if(idx === 1){
            styleObj.backgroundColor = "yellow";
        }
        else if(idx === 2){
            styleObj.backgroundColor = "tomato";
        }
        else if(idx === 3){
            styleObj.backgroundColor = "violet";
        }
        else if(idx === 4){
            styleObj.backgroundColor = "grey";
            styleObj.borderRight= "none";
        }
        return styleObj;
    }

    mapQuotaName = (qt ) =>{
        if (this.props.quotaName){
            let data = this.props.quotaName;
            return data[qt + "Name"];
        }else
            return qt;
    }

    render() {
        const {classes, quotaName } = this.props;
        let shortNames = [];
        for (let k in quotaName ){

            //let desc = 'Name';
            let desc = 'Shortname';
            if (k.indexOf(desc) >= 0 ){
                shortNames.push({
                    key: k.split(desc)[0],
                    value: quotaName[k]
                });
            }
        }
        return (
            <>
            {
                !(shortNames && shortNames.length > 0) ? null:
                <div className={classes.legend}>
                    <span className={classes.title}>Short Name</span>
                    <div className={classes.bar}>
                        {
                            shortNames.map((item)=> (
                                //<div key={item.key} className={classes.barEl}>{item.value[0]}: {this.mapQuotaName(item.key)}</div>
                                <div key={item.key} className={classes.barEl}>{item.value}: {this.mapQuotaName(item.key)}</div>
                            ))
                        }
                    </div>
                </div>
            }
            </>
        );
    }
}

export default (withStyles(styles)(ShortNameBar));
//export default ShortNameBar;
