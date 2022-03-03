import React from "react";
import useStyles from './styles' 
export default function DashBoardButtomTable(props){
    const {data=[],others} = props
    const classes = useStyles()
    return <div className={classes.leftTable} {...others}>
        {data&&data.map((item,index)=>{
            return item.display ? <div key={`buttomdata${index}`} className={classes.tableColumn}>
                <span>{item.title}</span>
                <span>{item.value}</span>
            </div> : ''
        })}
        
    </div> 
} 