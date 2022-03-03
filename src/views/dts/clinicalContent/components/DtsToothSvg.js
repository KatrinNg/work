import React from 'react';

export const positionST = 'st';
export const positionSL = 'sl';
export const positionSR = 'sr';
export const positionSB = 'sb';
export const positionSC = 'sc';
export const tooth13 = 't13';
export const tooth48 = 't48';

export const permUpperArray = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
export const primUpperArray = ['55', '54', '53', '52', '51', '61', '62', '63', '64', '65'];
export const primLowerArray = ['85', '84', '83', '82', '81', '71', '72', '73', '74', '75'];
export const permLowerArray = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];

export const fillColor = 'grey';

// const topArea = 'M'+0*scale+' '+0*scale+' l '+25*scale+' '+ 40*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ -40*scale+' Z';
// const leftArea = 'M'+0*scale+' '+0*scale+' l '+25*scale+' '+ 40*scale+' l '+0*scale+' '+ 20*scale+' l '+-25*scale+' '+ 40*scale+' Z';
// const bottomArea = 'M'+0*scale+' '+100*scale+' l '+25*scale+' '+ -40*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ 40*scale+' Z';
// const rightArea = 'M'+100*scale+' '+0*scale+' l '+-25*scale+' '+ 40*scale+' l '+0*scale+' '+ 20*scale+' l '+25*scale+' '+ 40*scale+' Z';
// const centerArea = 'M'+25*scale+' '+40*scale+' l '+50*scale+' '+ 0*scale+' l '+0*scale+' '+ 20*scale+' l '+-50*scale+' '+ 0*scale+' l '+0*scale+' '+ -20*scale+' Z';

// const line1 = 'M'+0*scale+' '+0*scale+'  l '+100*scale+' '+ 0*scale+' l '+0*scale+' '+ 100*scale+' l '+-100*scale+' '+ 0*scale+' l '+0*scale+' '+ -100*scale;
// const line2 = 'M'+0*scale+' '+0*scale+'  l '+25*scale+' '+ 40*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ -40*scale;
// const line3 = 'M'+0*scale+' '+100*scale+'  l '+25*scale+' '+ -40*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ 40*scale;
// const line4 = 'M'+25*scale+' '+40*scale+'  l '+0*scale+' '+ 20*scale;
// const line5 = 'M'+75*scale+' '+40*scale+'  l '+0*scale+' '+ 20*scale;
 
// SVG for tooth13
export function getT13TopAreaSvg(scale){
    return 'M'+0*scale+' '+0*scale+' l '+25*scale+' '+ 40*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ -40*scale+' Z';
}

export function getT13LeftAreaSvg(scale){
    return 'M'+0*scale+' '+0*scale+' l '+25*scale+' '+ 40*scale+' l '+0*scale+' '+ 20*scale+' l '+-25*scale+' '+ 40*scale+' Z';
}

export function getT13BottomAreaSvg(scale){
    return 'M'+0*scale+' '+100*scale+' l '+25*scale+' '+ -40*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ 40*scale+' Z';
}

export function getT13RightAreaSvg(scale){
    return 'M'+100*scale+' '+0*scale+' l '+-25*scale+' '+ 40*scale+' l '+0*scale+' '+ 20*scale+' l '+25*scale+' '+ 40*scale+' Z';
}

export function getT13CenterAreaSvg(scale){
    return 'M'+25*scale+' '+40*scale+' l '+50*scale+' '+ 0*scale+' l '+0*scale+' '+ 20*scale+' l '+-50*scale+' '+ 0*scale+' l '+0*scale+' '+ -20*scale+' Z';
}

export function getT13Line1(scale){
    return 'M'+0*scale+' '+0*scale+'  l '+100*scale+' '+ 0*scale+' l '+0*scale+' '+ 100*scale+' l '+-100*scale+' '+ 0*scale+' l '+0*scale+' '+ -100*scale;
}

export function getT13Line2(scale){
    return 'M'+0*scale+' '+0*scale+'  l '+25*scale+' '+ 40*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ -40*scale;
}

export function getT13Line3(scale){
    return 'M'+0*scale+' '+100*scale+'  l '+25*scale+' '+ -40*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ 40*scale;
}

export function getT13Line4(scale){
    return 'M'+25*scale+' '+40*scale+'  l '+0*scale+' '+ 20*scale;
}

export function getT13Line5(scale){
    return 'M'+75*scale+' '+40*scale+'  l '+0*scale+' '+ 20*scale;
}


// const topArea = 'M'+0*scale+' '+0*scale+' l '+25*scale+' '+ 25*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ -25*scale+' Z';
// const leftArea = 'M'+0*scale+' '+0*scale+' l '+25*scale+' '+ 25*scale+' l '+0*scale+' '+ 50*scale+' l '+-25*scale+' '+ 25*scale+' Z';
// const bottomArea = 'M'+0*scale+' '+100*scale+' l '+25*scale+' '+ -25*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ 25*scale+' Z';
// const rightArea = 'M'+100*scale+' '+0*scale+' l '+-25*scale+' '+ 25*scale+' l '+0*scale+' '+ 50*scale+' l '+25*scale+' '+ 25*scale+' Z';
// const centerArea = 'M'+25*scale+' '+25*scale+' l '+50*scale+' '+ 0*scale+' l '+0*scale+' '+ 50*scale+' l '+-50*scale+' '+ 0*scale+' l '+0*scale+' '+ -50*scale+' Z';

// const line1 = 'M'+0*scale+' '+0*scale+'  l '+100*scale+' '+ 0*scale+' l '+0*scale+' '+ 100*scale+' l '+-100*scale+' '+ 0*scale+' l '+0*scale+' '+ -100*scale;
// const line2 = 'M'+0*scale+' '+0*scale+'  l '+25*scale+' '+ 25*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ -25*scale;
// const line3 = 'M'+0*scale+' '+100*scale+'  l '+25*scale+' '+ -25*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ 25*scale;
// const line4 = 'M'+25*scale+' '+25*scale+'  l '+0*scale+' '+ 50*scale;
// const line5 = 'M'+75*scale+' '+25*scale+'  l '+0*scale+' '+ 50*scale;

// SVG for tooth48
export function getT48TopAreaSvg(scale){
    return 'M'+0*scale+' '+0*scale+' l '+25*scale+' '+ 25*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ -25*scale+' Z';
}

export function getT48LeftAreaSvg(scale){
    return 'M'+0*scale+' '+0*scale+' l '+25*scale+' '+ 25*scale+' l '+0*scale+' '+ 50*scale+' l '+-25*scale+' '+ 25*scale+' Z';
}

export function getT48BottomAreaSvg(scale){
    return 'M'+0*scale+' '+100*scale+' l '+25*scale+' '+ -25*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ 25*scale+' Z';
}

export function getT48RightAreaSvg(scale){
    return 'M'+100*scale+' '+0*scale+' l '+-25*scale+' '+ 25*scale+' l '+0*scale+' '+ 50*scale+' l '+25*scale+' '+ 25*scale+' Z';
}

export function getT48CenterAreaSvg(scale){
    return 'M'+25*scale+' '+25*scale+' l '+50*scale+' '+ 0*scale+' l '+0*scale+' '+ 50*scale+' l '+-50*scale+' '+ 0*scale+' l '+0*scale+' '+ -50*scale+' Z';
}

export function getT48Line1(scale){
    return 'M'+0*scale+' '+0*scale+'  l '+100*scale+' '+ 0*scale+' l '+0*scale+' '+ 100*scale+' l '+-100*scale+' '+ 0*scale+' l '+0*scale+' '+ -100*scale;
}

export function getT48Line2(scale){
    return 'M'+0*scale+' '+0*scale+'  l '+25*scale+' '+ 25*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ -25*scale;
}

export function getT48Line3(scale){
    return 'M'+0*scale+' '+100*scale+'  l '+25*scale+' '+ -25*scale+' l '+50*scale+' '+ 0*scale+' l '+25*scale+' '+ 25*scale;
}

export function getT48Line4(scale){
    return 'M'+25*scale+' '+25*scale+'  l '+0*scale+' '+ 50*scale;
}

export function getT48Line5(scale){
    return 'M'+75*scale+' '+25*scale+'  l '+0*scale+' '+ 50*scale;
}

// export function getTeethBridge(scale){
//     //console.log('getTeethBridge ' +scale);
//     //return 'M'+ 15 * scale+' '+ 20 * scale+ + ' H '+ 120*scale + '  V ' + 20*scale;
//     return 'M'+ 0 * scale+' '+ 20 * scale + ' V ' + 20*scale + ' H '+ 120*scale;
// }

// Matrix calculate
function getRotateCoordinate(x, y, maxX, maxY, position){
    let refx = x - (maxX/2);
    let refy = (maxY/2) - y;

    if(position == positionST){
        return {x_pos:x, y_pos:y};
    }
    else if(position == positionSL){
        // x_pos = refx * 0 + refy * -1;
        // y_pos = refx * 1 + refy * 0;
        return {x_pos: (refx * 0 + refy * -1) + (maxX/2), y_pos: (maxY/2) - (refx * 1 + refy * 0)};
    }
    else if(position == positionSB){
        // x_pos = refx * -1 + refy * 0;
        // y_pos = refx * 0 + refy * -1;
        return {x_pos: (refx * -1 + refy * 0) + (maxX/2), y_pos: (maxY/2) - (refx * 0 + refy * -1)};
    }
    else if(position == positionSR){
        // x_pos = refx * 0 + refy * 1;
        // y_pos = refx * -1 + refy * 0;
        return {x_pos: (refx * 0 + refy * 1) + (maxX/2), y_pos: (maxY/2) - (refx * -1 + refy * 0)};
    }
    else if(position == positionSC){
        return {x_pos: refx + (maxX/2), y_pos: (maxY/2)};
    }
    else
        return {x_pos:x, y_pos:y};
}

// SVG for symptoms
export function getCariesSvg(scale, toothType, position){
    const orgX = 50;
    let orgY = 12;
    let orgR = 8;

    if(toothType == tooth13 && (position == positionST || position == positionSB))
    //if (position == positionST || position == positionSB)
        orgY = 18;
    if (position == positionSC){
        if(toothType == tooth13){
            orgR = 7;
        } else{
            orgR = 10;
        }
    }
    let rotatePosition = getRotateCoordinate(orgX, orgY, 100, 100, position);

    const cx = rotatePosition.x_pos * scale;
    const cy = rotatePosition.y_pos * scale;
    const r = orgR*scale;

    return (
        <circle cx={cx} cy={cy} r={r} stroke="black" strokeWidth={3*scale} fill="transparent"/>
    );
}

//SVG for drawing line
export function drawLine(){
    return (
        <path strokeWidth="6" stroke="black" d="M 50 50 L 300 50" />
    );
}
export function getAbrasionSvg(scale, position){
    const orgX = 15;
    const orgY = 0;
    const orgQ1 = 50;
    const orgQ2 = 40;
    const orgX2 = 85;
    const orgY2 = 0;

    let rotateP = getRotateCoordinate(orgX, orgY, 100, 100, position);
    let rotateQ12 = getRotateCoordinate(orgQ1, orgQ2, 100, 100, position);
    let rotateQ34 = getRotateCoordinate(orgX2, orgY2, 100, 100, position);

    const d = 'M'+rotateP.x_pos*scale+' '+ rotateP.y_pos*scale+' Q '+rotateQ12.x_pos*scale+' '+ rotateQ12.y_pos*scale+' '+ rotateQ34.x_pos*scale+' '+ rotateQ34.y_pos*scale;
    return (
        <path d={d} stroke="black" strokeWidth={3*scale} fill="none"/>
    );
}

export function getAbutmentSvg(scale){
    const orgX = 10;
    const orgY = 74;
    const styleVal = {fontSize: (50*scale)+'pt'};

    return (<text x={orgX*scale} y={orgY*scale} fill="green" style={styleVal}>Ab</text>);
}

export function getCrownSvg(scale){
    const orgX = 25;
    const orgY = 74;
    const styleVal = {fontSize: (50*scale)+'pt'};

    return (<text x={orgX*scale} y={orgY*scale} fill="green" style={styleVal}>C</text>);
}

export function getMissingSvg(scale){
    const orgX = 0;
    const orgY = 40;
    const width = 100;
    const height = 20;
    const styleVal = {fill:'black'};

    return (<rect x={orgX*scale} y={orgY*scale} width={width*scale} height={height*scale} style={styleVal} />);
}

//Get bridge rect line
export function getBridgeSvg(scale){
    
    //const redBar = getMissingBridgeSvg(scale);
    const redBar = getMissingBridgeSvg(scale);
    return (
        <>
        {redBar}
        </>
    );  
}

export function getMissingMiddleBridgeSvg(scale){
    
    const redBar = getMissingBridgeSvg(scale);
    const whiteBar = getMiddleBridgeSvg(scale);
    return (
        <>
        {redBar}
        {whiteBar}
        </>
    );  
}
//Get bridge rect line half
export function getConditionBridgeSvg(bridgeCondition, scale){
    
    const  redBar = 0;

    console.log('getConditionBridgeSvg ' + bridgeCondition);
    
    if(bridgeCondition == '100'){
        const  redBar = getLeftBridgeSvg(scale);
    }else if (bridgeCondition == '010'){
        const redBar = getMissingMiddleBridgeSvg(scale);
    }else {//100
        const redBar = getRightBridgeSvg(scale);
    }
    return (
        <>
        {redBar}
        </>
    );
}

export function getDrawBridgeSvg(scale, toothNo, dentalChartData){
    if (dentalChartData == null || dentalChartData.length == 0) {
        return '';
    }
    let data = returnToothData(toothNo, dentalChartData);
    let index = -1;
    index = returnToothArrIndex(toothNo);

    if (index == -1){
        return ('');
    }
    let [line1, line2, line3, line4, line5, line6, line7] = '';
    if (data[index].bridgeA == 'bridgeA_on'){
        line1 = getRedBridgeSvg(scale, 0);
    } else {
        line1 = getWhiteBridgeSvg(scale, 0);
    }
    if (data[index].bridgeB == 'bridgeB_on'){
        line2 = getRedBridgeSvg(scale, 15);
    } else {
        line2 = getWhiteBridgeSvg(scale, 15);
    }
    if (data[index].bridgeC == 'bridgeC_on'){
        line3 = getRedBridgeSvg(scale, 28);
    } else {
        line3 = getWhiteBridgeSvg(scale, 28);
    }
    if (data[index].bridgeD == 'bridgeD_on'){
        line4 = getRedBridgeSvg(scale, 50);
    } else {
        line4 = getWhiteBridgeSvg(scale, 50);
    }
    if (data[index].bridgeE == 'bridgeE_on'){
        line5 = getRedBridgeSvg(scale, 59);
    } else {
        line5 = getWhiteBridgeSvg(scale, 59);
    }
    if (data[index].bridgeF == 'bridgeF_on'){
        line6 = getRedBridgeSvg(scale, 73);
    } else {
        line6 = getWhiteBridgeSvg(scale, 73);
    }
    if (data[index].bridgeG == 'bridgeG_on'){
        line7 = getRedBridgeSvg(scale, 87);
    } else {
        line7 = getWhiteBridgeSvg(scale, 87);
    }
    /*
    const line1 = getRedBridgeSvg(scale, 0);
    const line2 = getWhiteBridgeSvg(scale, 15);
    const line3 = getRedBridgeSvg(scale, 29);
    const line4 = getRedBridgeSvg(scale, 43);
    const line5 = getRedBridgeSvg(scale, 57);
    const line6 = getWhiteBridgeSvg(scale, 71);
    const line7 = getRedBridgeSvg(scale, 85);
    */
    return (
        <>
        {line1}
        {line2}
        {line3}
        {line4}
        {line5}
        {line6}
        {line7}
        </>
    );  

}

export function getRedBridgeSvg(scale, xPosition){
    const orgX = xPosition;
    const orgY = 10;
    const width = '10';
    const height = 12;
    const styleVal = {fill:'Red'};

    return (<rect x={orgX*scale} y={orgY*scale} width={width} height={height*scale} style={styleVal} />);
}

export function getWhiteBridgeSvg(scale, xPosition){
    const orgX = xPosition;
    const orgY = 10;
    const width = '10';
    const height = 12;
    const styleVal = {fill:'White'};

    return (<rect x={orgX*scale} y={orgY*scale} width={width} height={height*scale} style={styleVal} />);
}

export function getLeftBridgeSvg(scale){
    const orgX = 0;
    const orgY = 30;
    const width = '50%';
    const height = 12;
    const styleVal = {fill:'Red'};

    return (<rect x={orgX*scale} y={orgY*scale} width={width} height={height*scale} style={styleVal} />);
}

export function getRightBridgeSvg(scale){
    const orgX = 44;
    const orgY = 30;
    const width = '40';
    const height = 12;
    const styleVal = {fill:'Red'};

    return (<rect x={orgX*scale} y={orgY*scale} width={width} height={height*scale} style={styleVal} />);
}
export function getMiddleBridgeSvg(scale){
    const orgX = 44;
    const orgY = 28;
    const width = 10;
    const height = 15;
    const styleVal = {fill:'White', border: '1px solid white'};

    //const midX ="50%";
    //const midY ="50%";

    

    return (<rect x={orgX*scale} y={orgY*scale} width={width} height={height*scale} style={styleVal} /> );
}


export function getMissingBridgeSvg(scale){
    const orgX = 0;
    const orgY = 30;
    const width = '100%';
    const height = 12;
    const styleVal = {fill:'Red'};

    return (<rect x={orgX*scale} y={orgY*scale} width={width} height={height*scale} style={styleVal} />);
}

export function getDrawingLine(scale){
    const orgX = 10;
    const orgY = 10;
    const styleVal = {fontSize: (50*scale)+'pt'};

    const blackBar = getMissingSvg(scale);
    const text = <text x={orgX*scale} y={orgY*scale} fill="Red" style={styleVal}>S</text>;

    return (
        <>
        {blackBar}
        {text}
        </>
    );
}

export function getPonticSvg(scale){
    const orgX = 25;
    const orgY = 58;
    const styleVal = {fontSize: (50*scale)+'pt'};

    const blackBar = getMissingSvg(scale);
    const text = <text x={orgX*scale} y={orgY*scale} transform="scale(1, 1.5)" fill="green" style={styleVal}>P</text>;

    return (
        <>
        {blackBar}
        {text}
        </>
    );
}

export function getFillingSvg(scale, toothType, position, selectedColor){
    let displaycolor = fillColor;
    if (selectedColor == 'yellow'){
        displaycolor = 'yellow';
    }
    if(position == positionST){
        if(toothType == tooth13){
            return <path d={getT13TopAreaSvg(scale)} fill={displaycolor}/>;
        } else{
            return <path d={getT48TopAreaSvg(scale)} fill={displaycolor}/>;
        }
    }
    else if(position == positionSL){
        if(toothType == tooth13){
            return <path d={getT13LeftAreaSvg(scale)} fill={displaycolor}/>;
        } else{
            return <path d={getT48LeftAreaSvg(scale)} fill={displaycolor}/>;
        }
    }
    else if(position == positionSB){
        if(toothType == tooth13){
            return <path d={getT13BottomAreaSvg(scale)} fill={displaycolor}/>;
        } else{
            return <path d={getT48BottomAreaSvg(scale)} fill={displaycolor}/>;
        }
    }
    else if(position == positionSR){
        if(toothType == tooth13){
            return <path d={getT13RightAreaSvg(scale)} fill={displaycolor}/>;
        } else{
            return <path d={getT48RightAreaSvg(scale)} fill={displaycolor}/>;
        }
    }
    else if(position == positionSC){
        if(toothType == tooth13){
            return <path d={getT13CenterAreaSvg(scale)} fill={displaycolor}/>;
        } else{
            return <path d={getT48CenterAreaSvg(scale)} fill={displaycolor}/>;
        }
    }
    else
        return '';
}


export function returnToothArrIndex(toothNo){
    let index = -1;
    index = permUpperArray.indexOf(toothNo);
    if (index == -1){
        index = permLowerArray.indexOf(toothNo);
    }
    if (index == -1){
        index = primUpperArray.indexOf(toothNo);
    }
    if (index == -1){
        index = primLowerArray.indexOf(toothNo);
    }
    return index;
}

export function returnToothData(toothNo, dentalChartData){
    let index = -1;
    index = permUpperArray.indexOf(toothNo);
    if (index != -1){
        return dentalChartData.permUpperList;
    } 
    index = permLowerArray.indexOf(toothNo);
    if (index != -1){
        return dentalChartData.permLowerList;
    }
    index = primUpperArray.indexOf(toothNo);
    if (index != -1){
        return dentalChartData.primUpperList;
    }
    index = primLowerArray.indexOf(toothNo);
    if (index != -1){
        return dentalChartData.primLowerList;
    }
    return null;
}

export function getRootAbbrev(scale, toothNo, dentalChartData){
    if (dentalChartData == null || dentalChartData.length == 0) {
        return '';
    }
    let data = returnToothData(toothNo, dentalChartData);
    let index = -1;
    index = returnToothArrIndex(toothNo);

    if (index == -1){
        return ('');
    }
    //console.log('BBB' + data[index].toothNo + toothNo + data[index].imageType);
    if (data[index].rootProb != ''){
        return data[index].rootProb;
    } else {
        return '';
    }
}

export function getAbbrev(scale, toothNo, dentalChartData){
    if (dentalChartData == null || dentalChartData.length == 0) {
        return '';
    }
    let data = returnToothData(toothNo, dentalChartData);
    let index = -1;
    index = returnToothArrIndex(toothNo);

    if (index == -1){
        return ('');
    }
    //console.log('BBB' + data[index].toothNo + toothNo + data[index].imageType);
    if (data[index].toothProb != ''){
        return data[index].toothProb;
    } else {
        return '';
    }
}

export function getSupernumerary(scale, toothNo, dentalChartData){
    if (dentalChartData == null || dentalChartData.length == 0) {
        return '';
    }
    let data = returnToothData(toothNo, dentalChartData);
    let index = -1;
    index = returnToothArrIndex(toothNo);

    if (index == -1){
        return ('');
    }
    //console.log('BBB' + data[index].toothNo + toothNo + data[index].imageType);
    if (data[index].supernumerary != ''){
        return data[index].supernumerary;
    } else {
        return '';
    }
}

export function getToothSvg(scale, toothType, toothNo, dentalChartData){
    //console.log('dentalchartdata ', dentalChartData.length); 
    if (dentalChartData == null || dentalChartData.length == 0) {
        return '';
    }
    let data = returnToothData(toothNo, dentalChartData);
    //console.log('dentalchartdataA ', dentalChartData);
    //console.log('dentalchartdataB ', data); 

    let index = -1;
    index = returnToothArrIndex(toothNo);
    //console.log('index '+ toothNo + ' ' + index); 

    //if (toothNo == 13){
    //    index = 0;
    //} else if (toothNo == 12){
    //    index = 1 ;
    //}

    if (index == -1){
        return ('');
    }
    //console.log('BBB' + data[index].toothNo + toothNo + data[index].imageType);
    return getDrawFunction(data[index].toothImg, scale, toothType);

}

export function getPositionSTSvg(scale, position, toothType, toothNo, dentalChartData, topColor){
    //console.log('dentalchartdata ', dentalChartData.length); 
    if (dentalChartData == null || dentalChartData.length == 0) {
        return '';
    }
    let data = returnToothData(toothNo, dentalChartData);
    //console.log('dentalchartdataA ', data); 

    let index = -1;
    index = returnToothArrIndex(toothNo);

    //console.log('index '+ toothNo + ' ' + index); 

    if (index == -1){
        return ('');
    }
    return getDrawFunction(data[index].surfaceT, scale, toothType, topColor);

}

export function getPositionSBSvg(scale, position, toothType, toothNo, dentalChartData, bottomColor){
    //console.log('dentalchartdata ', dentalChartData.length); 
    if (dentalChartData == null || dentalChartData.length == 0) {
        return '';
    }
    let data = returnToothData(toothNo, dentalChartData);
    //console.log('dentalchartdataA ', data); 

    let index = -1;
    index = returnToothArrIndex(toothNo);

    //console.log('index '+ toothNo + ' ' + index); 

    //if (toothNo == 13){
    //    index = 0;
    //} else if (toothNo == 12){
    //    index = 1 ;
    //}

    if (index == -1){
        return ('');
    }
    //console.log('BBB' + data[index].toothNo + toothNo + data[index].imageType);
    return getDrawFunction(data[index].surfaceB, scale, toothType, bottomColor);
    /*if (data[index].imageType == 'Caries'){
        return getCariesSvg(scale, positionSB, toothType);
    } else if (data[index].imageType == 'Extraction'){
        return getMissingSvg(scale);
    }*/
}

export function getPositionSCSvg(scale, position, toothType, toothNo, dentalChartData, centerColor){
    //console.log('dentalchartdata ', dentalChartData.length); 
    if (dentalChartData == null || dentalChartData.length == 0) {
        return '';
    }
    let data = returnToothData(toothNo, dentalChartData);
    //console.log('dentalchartdataA ', data); 

    let index = -1;
    index = returnToothArrIndex(toothNo);

    //console.log('index '+ toothNo + ' ' + index); 

    if (index == -1){
        return ('');
    }
    return getDrawFunction(data[index].surfaceC, scale, toothType, centerColor);

}

export function getPositionSRSvg(scale, position, toothType, toothNo, dentalChartData, rightColor){
    //console.log('dentalchartdata ', dentalChartData.length); 
    if (dentalChartData == null || dentalChartData.length == 0) {
        return '';
    }
    let data = returnToothData(toothNo, dentalChartData);
    //console.log('dentalchartdataA ', data); 

    let index = -1;
    index = returnToothArrIndex(toothNo);

    //console.log('index '+ toothNo + ' ' + index); 

    if (index == -1){
        return ('');
    }
    return getDrawFunction(data[index].surfaceR, scale, toothType, rightColor);

}

export function getPositionSLSvg(scale, position, toothType, toothNo, dentalChartData, leftColor){
    //console.log('dentalchartdata ', dentalChartData.length); 
    if (dentalChartData == null || dentalChartData.length == 0) {
        return '';
    }
    let data = returnToothData(toothNo, dentalChartData);
    //console.log('dentalchartdataA ', data); 

    let index = -1;
    index = returnToothArrIndex(toothNo);

    //console.log('index '+ toothNo + ' ' + index); 

    if (index == -1){
        return ('');
    }
    return getDrawFunction(data[index].surfaceL, scale, toothType, leftColor);

}

export function getDrawFunction(imageType, scale, toothType, selectedColor){
    if (imageType == 'Caries'){
        return getCariesSvg(scale, positionSB, toothType);
    } else if (imageType == 'm_missing' || imageType == 'i_missing' ){
        return getMissingSvg(scale);
    } else if (imageType == 'm_pontic' || imageType == 'i_pontic' ){
        return getPonticSvg(scale);
    } else if (imageType == 'm_crown' || imageType == 'i_crown' ){
        return getCrownSvg(scale);
    } else if (imageType == 'm_abutment' || imageType == 'i_abutment' ){
        return getAbutmentSvg(scale);
    } else if (imageType == 'i_st_fill' || imageType == 'm_st_fill'){
        return  getFillingSvg(scale, toothType, positionST, selectedColor);
    } else if (imageType == 'i_sb_fill' || imageType == 'm_sb_fill'){
        return  getFillingSvg(scale, toothType, positionSB, selectedColor);
    } else if (imageType == 'i_sr_fill' || imageType == 'm_sr_fill'){
        return  getFillingSvg(scale, toothType, positionSR, selectedColor);
    } else if (imageType == 'i_sl_fill' || imageType == 'm_sl_fill'){
        return  getFillingSvg(scale, toothType, positionSL, selectedColor);
    } else if (imageType == 'i_sc_fill' || imageType == 'm_sc_fill'){
        return  getFillingSvg(scale, toothType, positionSC, selectedColor);
    } else if (imageType == 'i_st_caries' || imageType == 'm_st_caries'){
        return  getCariesSvg(scale, toothType, positionST);
    } else if (imageType == 'i_sb_caries' || imageType == 'm_sb_caries'){
        return  getCariesSvg(scale, toothType, positionSB);
    } else if (imageType == 'i_sr_caries' || imageType == 'm_sr_caries'){
        return  getCariesSvg(scale, toothType, positionSR);
    } else if (imageType == 'i_sl_caries' || imageType == 'm_sl_caries'){
        return  getCariesSvg(scale, toothType, positionSL);
    } else if (imageType == 'i_sc_caries' || imageType == 'm_sc_caries'){
        return  getCariesSvg(scale, toothType, positionSC);
    } else if (imageType == 'i_st_abrasion' || imageType == 'm_st_abrasion'){
        return  getAbrasionSvg(scale, positionST);
    } else if (imageType == 'i_sb_abrasion' || imageType == 'm_sb_abrasion'){
        return  getAbrasionSvg(scale, positionSB);
    } else if (imageType == 'i_sr_abrasion' || imageType == 'm_sr_abrasion'){
        return  getAbrasionSvg(scale, positionSR);
    } else if (imageType == 'i_sl_abrasion' || imageType == 'm_sl_abrasion'){
        return  getAbrasionSvg(scale, positionSL);
    } else if (imageType == 'i_sc_abrasion' || imageType == 'm_sc_abrasion'){
        return  getAbrasionSvg(scale, positionSC);
    }

}