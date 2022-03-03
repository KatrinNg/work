export const styles = () => ({
    fieldSetWrapper: {
      background: 'rgba(255,255,255,0.3)',
      border: '2px solid #b8bcb9',
      borderRadius: '5px',
      width: '100%',
      minWidth: '880px'
    },
    legend: {
      fontWeight: 'bold',
      fontSize:'1rem'
    },
    wrapper: {
      height: '307px',
      overflowY: 'hidden',
      paddingRight: '10px'
    },
    cardContainer: {
      columnCount: '3',
      height:300,
      columnGap: '10px'
    },
    card: {
      marginBottom: '10px',
      breakInside: 'avoid',
      boxSizing: 'border-box',
      boxShadow: 'none',
      border: '1px solid #0579C8'
    },
    cardContent: {
      padding: '5px 10px',
      '&:last-child':{
        paddingBottom: '5px'
      }
    },
    groupNameTitle: {
      cursor: 'default',
      fontSize: '1rem',
      fontWeight: 'bold'
    },
    templateDisplayTitle: {
      fontSize:'1rem',
      fontFamily: 'Arial',
      '&:hover':{
        cursor: 'pointer',
        color:'#0579C8'
      }
    },
    selectedTemplateDisplayTitle: {
      fontSize:'1rem',
      fontFamily: 'Arial',
      color:'#FFFFFF',
      '&:hover':{
        cursor: 'pointer'
      }
    },
    tooltip: {
      backgroundColor: '#6E6E6E',
      fontSize: '14px',
      fontFamily: 'Arial',
      maxWidth: 'none'
    },
    selectedTemplateWrapper: {
      backgroundColor: '#0579C8'
    },
    title: {
      fontFamily: 'Arial',
      fontSize: '1rem',
      fontStyle: 'normal'
    }
  });
