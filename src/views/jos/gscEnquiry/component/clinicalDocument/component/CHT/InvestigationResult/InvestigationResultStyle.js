import {getState} from '../../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

export const styles = {
    container:{
        padding:10,
        height:585,
        overflow:'auto',
        boxSizing: 'border-box'
    },
    antiTM:{
        display:'flex'
    },
    boneAgeContainer:{
        width:'100%',
        marginTop:15
    },
    boneAge:{
        display:'flex',
        justifyContent: 'space-between',
        alignItems: 'end',
        marginBottom:5,
        height:60
    },
    boneAgeTitle:{

    },
    boneAgeDate:{

    }
};