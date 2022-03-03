import React, { Component } from 'react';

class UtilisationBar extends Component {
    constructor(props) {
        super(props);
    }

    colorMap = (styleObj, idx) => {
        if (idx === 0) {
            styleObj.backgroundColor = 'violent';
        }
        else if (idx === 1) {
            styleObj.backgroundColor = 'yellow';
        }
        else if (idx === 2) {
            styleObj.backgroundColor = 'tomato';
        }
        else if (idx === 3) {
            styleObj.backgroundColor = 'violet';
        }
        else if (idx === 4) {
            styleObj.backgroundColor = 'grey';
            styleObj.borderRight = 'none';
        }
        return styleObj;
    }
    render() {
        let legend = {
            'backgroundColor': 'white',
            'display': 'flex',
            'lineHeight': '2rem'
        };
        let title = {
            top: '2px',
            position: 'relative',
            float: 'left',
            fontWeight: 'bold',
            marginRight: '1rem',
            fontSize: 'large'
        };
        let bar = {
            'backgroundColor': 'white',
            'display': 'flex',
            'width': 'max-content',
            'borderRadius': '2rem',
            'border': '0.1rem solid black',
            'overflow': 'hidden'
        };

        let barEl = {
            'borderRight': '0.1rem solid black',
            'paddingLeft': '1rem',
            'paddingRight': '1rem',
            'textAlign': 'center',
            'verticalAlign': 'middle'

        };

        return (
            <>
                <div style={legend}>
                    <span style={title}>Utilisation </span>
                    <div style={bar}>
                        <div style={this.colorMap({ ...barEl }, 0)}>{'0 - 30'}</div>
                        <div style={this.colorMap({ ...barEl }, 1)}>{'31 - 70'}</div>
                        <div style={this.colorMap({ ...barEl }, 2)}>{'71 - 99'}</div>
                        <div style={this.colorMap({ ...barEl }, 3)}>{'100'}</div>
                        <div style={this.colorMap({ ...barEl }, 4)}>Closed</div>
                    </div>
                </div>
            </>
        );
    }
}

export default UtilisationBar;