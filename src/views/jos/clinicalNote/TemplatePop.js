import React,{Component} from 'react';
import { Popper,ClickAwayListener,Paper,Tooltip,Collapse,List,ListItem,ListItemText} from '@material-ui/core';
import {ExpandLess,ExpandMore} from '@material-ui/icons';

class TemplatePop extends Component {
  state={
    nOpen:true,
    snOpen:true,
    cnOpen:true
  }

  toggleList=(type)=>{
    this.setState({[type]:!this.state[type]});
  }

  gendelMenuSelectData=()=>{
    const { templates,onClick }=this.props;
    let htmlStr=[];
    for (const key in templates) {
      let menuOpenName = '';
      if (key === 'Clinic Favourite') { menuOpenName = 'cnOpen'; }
      else if (key === 'My Favourite') { menuOpenName = 'nOpen'; }
      else if (key === 'Service Favourite') { menuOpenName = 'snOpen'; }
      else { menuOpenName = 'cnOpen'; }
      htmlStr.push(
        <>
		  <ListItem style={{ backgroundColor: 'lightgrey', paddingTop:0, paddingBottom:0}} button onClick={() => { this.toggleList(menuOpenName); }}>
            <ListItemText primary={key} primaryTypographyProps={{ noWrap: true, style: { display: 'inline-block', width: '100%' } }}/> {this.state[menuOpenName] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state[menuOpenName]} timeout="auto" unmountOnExit>
            <List id={key === 'Clinic Favourite' ? 'clinicFavouriteList' : (key === 'My Favourite' ? 'myFavouriteList' : (key === 'Service Favourite' ? 'serviceFavouriteList' : ''))} component="div" disablePadding>
              {
                templates[key].map((item,index)=>{
                  return (
                    <ListItem id={key === 'Clinic Favourite' ? `clinicFavouriteListItem${index}` : (key === 'My Favourite' ? `myFavouriteListItem${index}` : (key === 'Service Favourite' ? `serviceFavouriteListItem${index}` : ''))} button style={{paddingLeft:'2em' , paddingTop:0, paddingBottom:0}} onClick={() => { onClick(item.templateText, item.templateName); }} eventvalue={item.templateText} key={index}>
                      <Tooltip title={item.templateName} enterDelay={700}>
                        <ListItemText primary={item.templateName} primaryTypographyProps={{ noWrap: true, style: { display: 'inline-block', width: '100%' } }} />
                      </Tooltip>
                    </ListItem>
                  );
                })
              }
            </List>
          </Collapse>
        </>
      );
    }
    return htmlStr;
  }

  render(){
    const {toggleTemplate,targetEl,open}=this.props;
    return (
      <Popper open={open} anchorEl={targetEl.current} placement={'bottom-end'} style={{ zIndex: 1000, width: '260px' }}>
        <Paper>
          <ClickAwayListener onClickAway={toggleTemplate}>
            <List style={{ maxHeight: '42vh', overflow: 'auto' }}>
              {this.gendelMenuSelectData()}
            </List>
          </ClickAwayListener>
        </Paper>
      </Popper>
    );
  }
}

export default TemplatePop;
