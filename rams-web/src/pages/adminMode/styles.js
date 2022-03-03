import {makeStyles} from "@material-ui/styles";

export default makeStyles(theme => ({
    container:{
        width:"100%",
        height:'calc(100% - 30px)',
    },
    containerDetail:{
        width:"100%",
        height:'100%',
    },
    landingAppbar: {
        backgroundColor: '#39ad90',
        height: 30,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '12px',
        '& .MuiTypography-body1': {
            fontSize: 12,
        }
    },
    content:{
        width:"100%",
        height:'100%',
        padding:'18px 26px 58.2px 26px',
        backgroundColor:'#ecf0f7',
        display:'flex',
        justifyContent:'space-between',
        fontFamily: 'PingFangTC',
        fontSize: 14,
        fontWeight: 600,
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        color: '#3f3d56',
    },
    common:{
        width:'24%',
        display:'flex',
        flexDirection:'column',
    },
    top:{
        width:'100%',
        height:35,
        borderRadius:'5px 5px 0 0',
        padding:'9px 23px',
        backgroundColor:'#e0e0e0',
    },
    title:{
        fontSize:12,
        color:'#000'
    },
    commonList:{
        height:'100%',
        display:'flex',
        flexDirection:'column',
        backgroundColor:'#fff',
        paddingLeft:23,
        borderRadius:'0 0 5px 5px',
    },
    item:{
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        height:50,
        paddingRight:15,
        borderBottom:'1px solid #e2e2e2',
        '& img':{
            width:7.3,
            height:12,
            objectFit: 'contain',
        },
        '&:hover':{
            cursor:'pointer',
        }
    },

    // detailPT
    mainContent:{
        width:'100%',
        height:'calc(100% - 30px)',
        display:'flex',
        flexDirection:'row',
    },
    leftNavs:{
        width:260,
        height:'100%',
        display:'flex',
        flexDirection:'column',
        overflowY:'auto',
    },
    navItem:{
        width:'100%',
        height:35,
        backgroundColor:'#e0e0e0',
        paddingLeft:21,
    },
    navItemtitle:{
        fontSize:12,
        fontWeight:500,
        color:'#000',
        padding:'9px 0',
    },
    tabs:{
        '& .MuiTab-root':{
            textTransform:'none',
            opacity:1,
            textAlign:'unset',
            paddingLeft:0
        },
        '& .MuiButtonBase-root':{
            fontWeight:600,
            fontSize:14,
            color:'#3f3d56',
            paddingLeft:23,
        },
        '& .PrivateTabIndicator-vertical-31':{
            backgroundColor:'#fff'
        },
        '& .MuiTab-wrapper':{
            alignItems:'unset'
        },
        '& .MuiTabs-indicator':{
            width:'100%',
            color: '#39ad90',
            backgroundColor:'#e6fcf6',
            zIndex:-1,
        }
    },
    tab:{
        height:48,
        padding:'0 12px',
        '&:focus': {
            color: '#39ad90',
            backgroundColor:'#e6fcf6',
        },
        
    },
    rightContent:{
        width:'100%',
        height:'100%',
        backgroundColor:'#e0e6f1',
        overflow:'auto',
    },
}));
