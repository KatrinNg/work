import React from 'react'
import {Typography} from '@material-ui/core'
import {useSelector} from 'react-redux'
import { useHistory } from 'react-router-dom';
import pathIcon from 'resource/Icon/landing/path-copy-18.png'
import {mockDate} from './mockDate'
import useStyles from './styles'

const AdminMode = ()=> {

    const classes = useStyles()
    
    const {patientDetailsType} = useSelector(state=>state.patientDetail)

    const TabsFuc = (props) => {
        const {src,text,alt,others,path='/adminMode/detail',cName,name} = props
        const history = useHistory();
        return <div className={classes.item} {...others} onClick={()=>{
            let date = {cName,name}
            history.param = date
            history.push(path)
        }}>
            <span>{text}</span>
            <img src={pathIcon} alt={'pathIcon'}/>
        </div>
    }

    return (

        <div className={classes.container}>
            <div className={classes.landingAppbar}>
                <Typography>Admin Manage module</Typography>
            </div>
            <div className={classes.content}>
                {
                    mockDate.map((item)=>{
                        if(item.type === patientDetailsType){
                            return item.response.map((list,listIndex)=>{
                                return(
                                    <div key={`list-${listIndex}`} className={classes.common}>
                                        <div className={classes.top}>
                                            <div className={classes.title}>{list.title}</div>
                                        </div>
                                        <div className={classes.commonList}>
                                        {
                                            list.content.date.map((date,index)=>{
                                                return(
                                                    <TabsFuc key={index} text={date.text} cName={list.content.cName} name={date.name}/>
                                                )
                                            })
                                        }
                                        </div>
                                    </div>
                                )                            
                            })
                        }
                    })
                }
            </div>
        </div>
    )
}

export default AdminMode
