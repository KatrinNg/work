import React,{Component} from 'react';
import { Popper,ClickAwayListener,Paper,Tooltip,Collapse,List,ListItem,ListItemText} from '@material-ui/core';
import {ExpandLess,ExpandMore} from '@material-ui/icons';

class TemplatePop extends Component {
  state = {
    nOpen: true,
    snOpen: true
  };
  toggleList = (type) => {
    this.setState({ [type]: !this.state[type] });
  }
  render(){
    const {templates={},toggleTemplate,targetEl,open,onClick,maxHeight,classes}=this.props;
    const {N=[],SN=[]}=templates;
    return (
      <Popper open={open} anchorEl={targetEl.current} placement={'bottom-end'} style={{zIndex:1000,width:'260px'}}>
        <Paper classes={{root:classes.paperBackColor}}>
          <ClickAwayListener onClickAway={toggleTemplate}>
            <List style={{ maxHeight: '40vh', overflow: 'auto', height: maxHeight ? 320 : 400 }}>
            <ListItem style={{backgroundColor:'lightgrey',paddingTop:0, paddingBottom:0}} button onClick={()=>{this.toggleList('nOpen');}}>
              <ListItemText primary="My Favourite" primaryTypographyProps={{noWrap:true,style:{display:'inline-block',width:'100%'}}}/>
              {this.state.nOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={this.state.nOpen} timeout="auto" unmountOnExit>
              <List id="myFavouriteList" component="div" disablePadding>
                {
                  N.map((item,index)=>{
                    return (
                      <ListItem id={`myFavouriteListItem${index}`} button style={{paddingLeft:'2em', paddingTop:0, paddingBottom:0}} onClick={()=>{onClick(item.templateText);}} eventvalue={item.templateText} key={index}>
                        <Tooltip title={item.templateName} enterDelay={700}>
                          <ListItemText primary={item.templateName} primaryTypographyProps={{noWrap:true,style:{display:'inline-block',width:'100%'}}} />
                        </Tooltip>
                      </ListItem>
                    );
                  })
                }
              </List>
            </Collapse>
            <ListItem style={{backgroundColor:'lightgrey',paddingTop:0, paddingBottom:0}} button onClick={()=>{this.toggleList('snOpen');}}>
              <ListItemText primary="Service Favourite" primaryTypographyProps={{noWrap:true,style:{display:'inline-block',width:'100%'}}} />
              {this.state.snOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={this.state.snOpen} timeout="auto" unmountOnExit>
              <List id="serviceFavouriteList" component="div" disablePadding>
                {
                  SN.map((item,index)=>{
                    return (
                      <ListItem id={`serviceFavouriteListItem${index}`} button style={{paddingLeft:'2em', paddingTop:0, paddingBottom:0}} onClick={()=>{onClick(item.templateText);}} eventvalue={item.templateText} key={index}>
                        <Tooltip title={item.templateName} enterDelay={700}>
                          <ListItemText primary={item.templateName} primaryTypographyProps={{noWrap:true,style:{display:'inline-block',width:'100%'}}} />
                        </Tooltip>
                      </ListItem>
                    );
                  })
                }
              </List>
            </Collapse>

          </List>
          </ClickAwayListener>
        </Paper>
      </Popper>
    );
  }
}

export default TemplatePop;
