import React from 'react';
import './DWTView.css';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';

/**
 * @props
 * @prop {WebTwain} dwt the object to perform the magic of Dynamic Web TWAIN
 * @prop {object} buffer the buffer status of data in memory (current & count)
 * @prop {object[]} zones the zones on the current image that are selected by the user
 * @prop {string} containerId the id of a DIV in which the view of Dynamic Web TWAIN will be built
 * @prop {object} runtimeInfo contains runtime information like the width & height of the current image
 * @prop {boolean} bNoNavigating whether navigation buttons will function (no if a time consuming operation like barcode reading is underway)
 * @prop {object[]} barcodeRects the rects that indicate where barcodes are found
 * @prop {function} handleBufferChange a function to call when the buffer may requires updating
 * @prop {function} handleOutPutMessage a function to call a message needs to be printed out
 */
class DWTView extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.blocks !== undefined) {
            switch (this.props.blocks) {
                default: break;
                case 0: /** No navigate, no quick edit */
                    this.width = '100%'; this.height = '100%'; break;
                case 1: /** No quick edit */
                    this.width = '100%'; this.navigatorWidth = '100%'; this.navigatorRight = '0px'; break;
                case 2: /** No navigate */
                    this.height = '100%'; break;
            }
        }
        this.state = {
            viewReady: false,
            bShowChangeSizeUI: false,
            newHeight: this.props.runtimeInfo.ImageHeight,
            newWidth: this.props.runtimeInfo.ImageWidth,
            InterpolationMethod: '1', // 1> NearestNeighbor, 2> Bilinear, 3> Bicubic
            previewMode: '1'
        };
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.dwt !== prevProps.dwt) {
            this.DWObject = this.props.dwt;
            this.setState({ viewReady: true });
        }
        if (this.DWObject !== null && this.state.viewReady && !prevState.viewReady) {
            this.DWObject.Width = this.width;
            this.DWObject.Height = this.height;
        }
        if (this.props.barcodeRects.length !== 0) {
            !this.props.bNoNavigating && this.handlePreviewModeChange('1');
        }
        if (this.props.runtimeInfo.ImageHeight !== prevProps.runtimeInfo.ImageHeight) this.setState({ newHeight: this.props.runtimeInfo.ImageHeight });
        if (this.props.runtimeInfo.ImageWidth !== prevProps.runtimeInfo.ImageWidth) this.setState({ newWidth: this.props.runtimeInfo.ImageWidth });
        if (document.getElementById(this.props.containerId).offsetWidth !== 0) {
            this.props.handleViewerSizeChange({
                width: document.getElementById(this.props.containerId).offsetWidth,
                height: document.getElementById(this.props.containerId).offsetHeight
            });
        }
    }

    re = /^\d+$/;
    DWObject = null;
    // width = '1500px'
    // height = '980px';
    width = '100%'
    height = '90%';

    // navigatorRight = '120px';
    // navigatorWidth = '1170px';
    navigatorRight = '15%';
    navigatorWidth = '15%';

    // Quick Edit
    handleQuickEdit(event) {
        if (event.keyCode && event.keyCode !== 32) return;
        if (this.props.buffer.count === 0) {
            this.props.handleOutPutMessage('There is no image in Buffer!', 'error');
            return;
        }
        if (this.props.bNoNavigating) {
            this.props.handleOutPutMessage('Navigation not allowed', 'error');
            return;
        }
        switch (event.target.getAttribute('value')) {
            case 'editor': this.DWObject.ShowImageEditor();  break;
            case 'rotateL': this.DWObject.RotateLeft(this.props.buffer.current); break;
            case 'rotateR': this.DWObject.RotateRight(this.props.buffer.current); break;
            case 'rotate180': this.DWObject.Rotate(this.props.buffer.current, 180, true); break;
            case 'mirror': this.DWObject.Mirror(this.props.buffer.current); break;
            case 'flip': this.DWObject.Flip(this.props.buffer.current); break;
            case 'removeS': this.DWObject.RemoveAllSelectedImages(); break;
            case 'removeA': this.DWObject.RemoveAllImages(); this.handleNavigation('removeAll'); break;
            case 'changeSize': this.setState({ bShowChangeSizeUI: !this.state.bShowChangeSizeUI }); break;
            case 'crop': this.crop(); break;
            case 'changeImageSizeOK': this.changeImageSizeOK(); break;
            default: break;
        }
    }
    handleNewSize(event, bHeight) {
        if (!this.re.test(event.target.value)) {
            return;
        } else {
            if (bHeight)
                this.setState({ newHeight: event.target.value });
            else
                this.setState({ newWidth: event.target.value });
        }
    }
    handleInterpolationMethodChange(event) {
        this.setState({
            InterpolationMethod: event.target.value
        });
    }
    changeImageSizeOK() {
        this.DWObject.ChangeImageSize(this.props.buffer.current, this.state.newWidth, this.state.newHeight, parseInt(this.state.InterpolationMethod));
        this.setState({ bShowChangeSizeUI: !this.state.bShowChangeSizeUI });
    }
    crop() {
        if (this.props.zones.length === 0) {
            this.props.handleOutPutMessage('Please select where you want to crop first!', 'error');
        } else if (this.props.zones.length > 1) {
            this.props.handleOutPutMessage('Please select only one rectangle to crop!', 'error');
        } else {
            let _zone = this.props.zones[0];
            this.DWObject.Crop(
                this.props.buffer.current,
                _zone.x, _zone.y, _zone.x + _zone.width, _zone.y + _zone.height
            );
        }
    }
    handleNavigation(action) {
        switch (action) {
            default://viewModeChange, removeAll
                break;
            case 'first':
                this.DWObject.CurrentImageIndexInBuffer = 0; break;
            case 'last':
                this.DWObject.CurrentImageIndexInBuffer = this.props.buffer.count - 1; break;
            case 'previous':
                this.DWObject.CurrentImageIndexInBuffer = (this.props.buffer.current > 0) && (this.props.buffer.current - 1); break;
            case 'next':
                this.DWObject.CurrentImageIndexInBuffer = (this.props.buffer.current < this.props.buffer.count - 1) && (this.props.buffer.current + 1); break;
        }
        this.props.handleBufferChange();
    }
    handlePreviewModeChange(event) {
        let _newMode = '';
        if (event && event.target) {
            _newMode = event.target.value;
        }
        else {
            if (parseInt(event) > 0 && (parseInt(event) < 6)) _newMode = parseInt(event).toString();
        }
        if (_newMode !== this.state.previewMode) {
            if (this.props.bNoNavigating) {
                console.log(this.props.barcodeRects.length);
                this.props.handleOutPutMessage('Navigation not allowed!', 'error');
                return;
            }
            if (this.state.previewMode === '1' && this.props.barcodeRects.length > 0) {
                this.props.handleOutPutMessage('Can\'t change view mode when barcode rects are on display!', 'error');
                return;
            }
            this.setState({ previewMode: _newMode });
            this.DWObject.SetViewMode(parseInt(_newMode), parseInt(_newMode));
            this.DWObject.MouseShape = (parseInt(_newMode) > 1);
            this.handleNavigation('viewModeChange');
        }
    }
    render() {
        const {
            scannerParams
        } = this.props;

        return (
            <>
                {/* <div style={{ display: this.state.viewReady ? 'none' : 'block' }} className="DWTcontainerTop"></div> */}
                {/* <Grid item xs={scannerParams.open ? 8 : 12} style={scannerParams.open ? {maxWidth: '81%'} : {maxWidth: '81%'}}> */}
                <Grid item xs={scannerParams.open ? 8 : 12} style={{maxWidth: '81%'}}>
                <div style={{ display: this.state.viewReady ? 'block' : 'none' }, {width: scannerParams.open ? '125%' : '103%' }} className="DWTcontainerTop">
                <ul text-align="center" className="operateGrp" onKeyUp={(event) => this.handleQuickEdit(event)} onClick={(event) => this.handleQuickEdit(event)}>
                    <li>
                        <img width="75px" height="75px" tabIndex="6" value="rotateL" src="Images/RotateLeft.png" title="Rotate Left" alt="Rotate Left" />
                        <img width="75px" height="75px" tabIndex="6" value="rotateR" src="Images/RotateRight.png" title="Rotate Right" alt="Rotate Right" />
                        <img width="75px" height="75px" tabIndex="6" value="rotate180" src="Images/Rotate180.png" title="Rotate 180" alt="Rotate 180" />
                        <img width="75px" height="75px" tabIndex="6" value="removeS" src="Images/RemoveSelectedImages.png" title="Remove Selected Images" alt="Remove Selected Images" />
                        <img width="75px" height="75px" tabIndex="6" value="removeA" src="Images/RemoveAllImages.png" title="Remove All Images" alt="Remove All" />
                        </li>
                </ul>
                    <div style={(this.props.blocks & 2 && this.state.viewReady) ? { display: 'block' } : { display: 'none' }} className="divEdit">
                        <div className="ImgSizeEditor" style={this.state.bShowChangeSizeUI ? { visisbility: 'show' } : { visibility: 'hidden' }}>
                            <ul>
                                <li>
                                    <label>New Height (pixel): <input tabIndex="6" type="text" value={this.state.newHeight} className="width_48p floatR" onChange={(event) => this.handleNewSize(event, true)} /></label>
                                </li>
                                <li>
                                    <label>New Width (pixel): <input tabIndex="6" type="text" value={this.state.newWidth} className="width_48p floatR" onChange={(event) => this.handleNewSize(event)} /></label>
                                </li>
                                <li>Interpolation method:
                            <select tabIndex="6" value={this.state.InterpolationMethod} className="width_48p floatR" onChange={(event) => this.handleInterpolationMethodChange(event)}>
                                        <option value="1">NearestNeighbor</option><option value="2">Bilinear</option><option value="3">Bicubic</option></select>
                                </li>
                                <li style={{ textAlign: 'center' }}>
                                    <button tabIndex="6" className="width_48p floatL" value="changeImageSizeOK" onClick={(event) => this.handleQuickEdit(event)} >OK</button>
                                    <button tabIndex="6" className="width_48p floatR" value="changeSize" onClick={(event) => this.handleQuickEdit(event)} >Cancel</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/* <div style={{ position: 'relative', float: 'left', width: scannerParams.open ? this.width : this.width, height: this.height }} id={this.props.containerId}> */}
                    <div style={{ position: 'relative', float: 'left', width: this.width, height: this.height }} id={this.props.containerId}>
                        {this.props.barcodeRects.map((_rect, _index) => (
                            <div key={_index} className="barcodeInfoRect" style={{ left: _rect.x + 'px', top: _rect.y + 'px', width: _rect.w + 'px', height: _rect.h + 'px' }} >
                                <div className="spanContainer"><span>[{_index + 1}]</span>
                                <h1>{_index + 1}</h1>

                                </div>
                            </div>
                        ))}
                    </div>
                    {/* navigatePanel for Set the display How many Scan View , left: this.navigatorRight */}
                    <div style={(this.props.blocks & 1 && this.state.viewReady) ? { display: 'block', width: '100%' } : { display: 'none' }} className="navigatePanel clearfix">
                        <div className="ct-lt fullWidth tc floatL">
                            <CIMSButton tabIndex="7" value="first" onClick={(event) => this.handleNavigation('first'/*event.target.value*/)}> |&lt; </CIMSButton>
                        &nbsp;
                        <CIMSButton tabIndex="7" value="previous" onClick={(event) => this.handleNavigation('previous'/*event.target.value*/)}> &lt; </CIMSButton>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <input type="text" value={this.props.buffer.current > -1 ? this.props.buffer.current + 1 : ''} readOnly="readonly" />
                         /
                        <input type="text" value={this.props.buffer.count > 0 ? this.props.buffer.count : ''} readOnly="readonly" />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <CIMSButton tabIndex="7" value="next" onClick={(event) => this.handleNavigation('next'/*event.target.value*/)}> &gt; </CIMSButton>
                        &nbsp;
                        <CIMSButton tabIndex="7" value="last" onClick={(event) => this.handleNavigation('last'/*event.target.value*/)}> &gt;| </CIMSButton>
                            <select tabIndex="7" className="previewMode" value={this.state.previewMode} onChange={(event) => this.handlePreviewModeChange(event)}>
                                <option value="1">1X1</option>
                                <option value="2">2X2</option>
                                <option value="3">3X3</option>
                                <option value="4">4X4</option>
                                <option value="5">5X5</option>
                            </select>
                        </div>
                    </div>
                </div >
                </Grid>

            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patient: state.patient.patientInfo,
        serviceCd: state.login.service.serviceCd,
        loginName: state.login.loginInfo.loginName,
        loginId: state.login.loginInfo.loginId,
        correlationId: state.login.loginInfo.correlationId,
        pcName: state.login.loginForm.ipInfo.pcName,
        ipAddr: state.login.loginForm.ipInfo.ipAddr,
        clinicConfig: state.common.clinicConfig,
        scannerParams: state.scannerCertificate.scannerParams

    };
};
export default connect(mapStateToProps)(DWTView);

