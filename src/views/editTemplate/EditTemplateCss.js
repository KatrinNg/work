
import { COMMON_STYLE }from '../../constants/commonStyleConstant';
export const style = {
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        height: 25,
        borderRadius: 0
      },
      favorite_category:
      {
        color: 'rgba(0, 0, 0, 0.7)',
        width: 'calc(100%-20px)',
        padding: 5
      },
      left_Label:
      {
        fontSize:'1rem',
        fontFamily: 'Arial',
        padding: 6
      },
      font_color: {
        fontSize: '1rem',
        fontFamily: 'Arial',
        color: '#0579c8'
      },
      table_itself:{
      },
      table_head: {
        height: 50,
        paddingLeft: '10px' ,
        fontStyle: 'normal',
        fontSize: '13px',
        fontWeight: 'bold'
      },
      table_header: {
        fontSize: '1rem',
        fontWeight: 600,
        fontFamily: 'Arial',
        color: 'white',
        // paddingTop:18,
        paddingLeft:8,
        border: '1px solid rgba(224, 224, 224, 1)',
        backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR
      },
      button: {
        Float: 'center',
        backgroundColor: '#fff'
      },
      saveAndeClear: {
       right:0 ,
       Float:'right'
      },
      bigContainer: {
        backgroundColor: 'rgb(183,188,184)',
        padding: 5,
        boxShadow: '2px 2px 2px 2px lightgray',
        borderRadius: 5
      },
      topP: {
        marginBottom: -9,
        marginLeft: 5,
        marginTop: 0
      },
      table_row: {
        height: 63,
        cursor: 'pointer'
      },
      table_row_selected: {
        height: 63,
        cursor: 'pointer',
        backgroundColor: 'cornflowerblue'
      },
      table_cell:{
        paddingLeft: '10px',
         width: 5,
        whiteSpace:'pre-line',
        wordWrap: 'break-word',
        wordBreak: 'break-all',
        border: '1px solid rgba(224, 224, 224, 1)'
      },
      cell_text:{
        textAlign: 'left',
        paddingLeft: '10px',
        padding: '0px 0px 0px 0px',
        width: 20,
       whiteSpace:'pre-line',
       wordWrap: 'break-word',
       wordBreak: 'break-all',
       border: '1px solid rgba(224, 224, 224, 1)'
      },
      table_cell_1:{
        width: 5,
       whiteSpace:'pre-line',
       wordWrap: 'break-word',
       wordBreak: 'break-all',
       border: '1px solid rgba(224, 224, 224, 1)'
      },
      paper: {
        position: 'absolute',
        zIndex: 1,
        // marginTop: theme.spacing(1),
        left: 0,
        right: 0
      },
      chip: {
        // margin: theme.spacing(0.5, 0.25),
      },
      container: {
        flexGrow: 1,
        position: 'relative'
      },
      inputRoot: {
        flexWrap: 'wrap'
      },
      inputInput: {
        width: 'auto',
        flexGrow: 1
      },
      filterInout:{
        // position: 'relative'
      },
      paperTable:{
        width:'100%',
        marginTop:20,
        overflow:'auto',
        maxHeight:'300px'
      },
      validation : {
        color: '#fd0000',
        margin: '0',
        fontSize: '0.75rem',
        ali: 'left',
       // marginTop: '8px',
        minHeight: '1em',
        display: 'block'
    },
    validation_span : {
      color: '#fd0000',
      margin: '0',
      fontSize: '0.75rem',
      ali: 'left',
     // marginTop: '8px',
      minHeight: '1em',
      marginLeft: '12px',
      lineHeight:'3.2'
    },
    textField : {
      width :'75%'
    },
    btnDiv:{
      margin:'10px',
      borderBottomLeftRadius:'5px',
      borderBottomRightRadius:'5px'
    },
    fontLabel: {
      fontFamily:'Arial',
      fontStyle: 'normal',
      fontSize: '1rem'
    },
    label: {
      float: 'left',
      fontFamily: 'Arial',
      padding: '8px 0px 0px 0px'
    },
    floatLeft: {
      float: 'left'
    },
    localTermCheckbox:{
      padding:5,
      margin:0
    }
};