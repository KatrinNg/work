import React from 'react';
import { connect } from 'react-redux';
import './DWTController.css';
import ValuePicker from './ValuePicker';
import RangePicker from './RangePicker';
import {
    uploadDocument
} from '../../../store/actions/clinicalDoc/clinicalDocAction';
import CIMSMultiTextField from '../../../components/TextField/CIMSMultiTextField';
import { openCommonMessage } from '../../../store/actions/message/messageAction';

/**
 * @props
 * @prop {object} Dynamsoft a namespace
 * @prop {number} startTime the time when initializing started
 * @prop {number} features the features that are enabled
 * @prop {WebTwain} dwt the object to perform the magic of Dynamic Web TWAIN
 * @prop {object} buffer the buffer status of data in memory (current & count)
 * @prop {number[]} selected the indices of the selected images
 * @prop {object[]} zones the zones on the current image that are selected by the user
 * @prop {object} runtimeInfo contains runtime information like the width & height of the current image
 * @prop {object[]} barcodeRects a number of rects to indicate where barcodes are found
 * @prop {function} handleOutPutMessage a function to call a message needs to be printed out
 * @prop {function} handleBarcodeResults a function to handle barcode rects
 * @prop {function} handleNavigating a function to handle whether navigation is allowed
 * @prop {function} handleException a function to handle exceptions
 */
class DWTController extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.features & 7 === 0) {
            //no input tab
            this.initialShownTabs = this.props.features;
        } else {
            //120: hide all inputs 127&~7
            this.initialShownTabs = this.props.features & 1 || this.props.features & 2 || this.props.features & 4;
            if (this.props.features & 24) {
                this.initialShownTabs += 8;
            } else if (this.props.features & 96) {
                this.initialShownTabs += 16;
            }
        }
        this.state = {
            shownTabs: this.initialShownTabs,
            scanners: [],
            deviceSetup: {
                currentScanner: 'Looking for devices..',
                currentCamera: 'Looking for devices..',
                bShowUI: false,
                bADF: false,
                bDuplex: false,
                nPixelType: '2',
                nResolution: '200',
                isVideoOn: false
            },
            cameras: [],
            cameraSettings: [],
            bShowRangePicker: false,
            rangePicker: {
                bCamera: false,
                value: 0,
                min: 0,
                max: 0,
                defaultvalue: 0,
                step: 0,
                title: ''
            },
            saveFileName: (new Date()).getTime().toString(),
            scannerRemark: '',
            saveFileFormat: 'pdf',
            bUseFileUploader: false,
            bMulti: true,
            readingBarcode: false,
            ocring: false,
            // Testing Code
            uploadBlob: '',
            uploadBase64: '',
            // CIMS 2 TYPE
            uploadType: this.props.mySvcInDocumentTypeList && this.props.mySvcInDocumentTypeList[0] ? this.props.mySvcInDocumentTypeList[0].inDocTypeId : []
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.dwt !== prevProps.dwt) {
            this.DWObject = this.props.dwt;
            if (this.DWObject) {
                if (this.props.features & 0b1) {
                    let vCount = this.DWObject.SourceCount;
                    let sourceNames = [];
                    for (let i = 0; i < vCount; i++)
                        sourceNames.push(this.DWObject.GetSourceNameItems(i));
                    this.setState({ scanners: sourceNames });
                    if (sourceNames.length > 0) {
                        this.onSourceChange(sourceNames[0]);
                    }
                }
                if (this.props.features & 0b10000000) {
                    this.Dynamsoft.FileUploader.Init('', (objFileUploader) => {
                        this.fileUploaderManager = objFileUploader;
                        if (!this.fileUploaderReady) {
                            this.fileUploaderReady = true;
                            this.props.handleStatusChange(128);
                        }
                    }, (errorCode, errorString) => {
                        this.handleException({ code: errorCode, message: errorString });
                        if (!this.fileUploaderReady) {
                            this.fileUploaderReady = true;
                            this.props.handleStatusChange(128);
                        }
                    });
                }
            }
        }
    }

    componentWillUnmount() {
        if (this.DWObject != null) {
            this.DWObject.RemoveAllImages();
        }
    }

    initialShownTabs = 127;
    scannerReady = false;
    cameraReady = false;
    barcodeReady = false;
    ocrReady = false;
    fileUploaderReady = false;
    Dynamsoft = this.props.Dynamsoft;
    DWObject = null;
    dbrObject = null;
    fileUploaderManager = null;
    dbrResults = [];

    handleSelectDocUploaderType(value) {
        this.setState({
            uploadType: value
        });
    }

    handleTabs(event) {
        if (event.keyCode && event.keyCode !== 32) return;
        event.target.blur();
        let nControlIndex = parseInt(event.target.getAttribute('controlindex'));
        // (nControlIndex & 5);
        if (this.state.shownTabs & nControlIndex) { //close a Tab
            this.setState({ shownTabs: this.state.shownTabs - nControlIndex });
        } else { //Open a tab
            let _tabToShown = this.state.shownTabs;
            if (nControlIndex & 7) _tabToShown &= ~7;
            if (nControlIndex & 24) _tabToShown &= ~24;
            this.setState({ shownTabs: _tabToShown + nControlIndex });
        }
    }
    // Tab 1: Scanner
    onSourceChange(value) {
        let oldDeviceSetup = this.state.deviceSetup;
        oldDeviceSetup.currentScanner = value;
        this.setState({
            deviceSetup: oldDeviceSetup
        });
        this.scannerReady = true;
        if (value === 'noscanner') return;
        if (this.Dynamsoft.Lib.env.bMac) {
            if (value.indexOf('ICA') === 0) {
                let oldDeviceSetup = this.state.deviceSetup;
                oldDeviceSetup.noUI = true;
                this.setState({
                    deviceSetup: oldDeviceSetup
                });
            } else {
                let oldDeviceSetup = this.state.deviceSetup;
                oldDeviceSetup.noUI = false;
                this.setState({
                    deviceSetup: oldDeviceSetup
                });
            }
        }
    }
    handleScannerSetupChange(e, option) {
        switch (option.substr(0, 1)) {
            default: break;
            case 'b':
                this.onScannerSetupChange(option, e.target.checked);
                break;
            case 'n':
                this.onScannerSetupChange(option, e.target.value);
                break;
        }
    }
    onScannerSetupChange(option, value) {
        let oldDeviceSetup = this.state.deviceSetup;
        switch (option) {
            case 'bShowUI':
                oldDeviceSetup.bShowUI = value;
                break;
            case 'bADF':
                oldDeviceSetup.bADF = value;
                break;
            case 'bDuplex':
                oldDeviceSetup.bDuplex = value;
                break;
            case 'nPixelType':
                oldDeviceSetup.nPixelType = value;
                break;
            case 'nResolution':
                oldDeviceSetup.nResolution = value;
                break;
            default: break;
        }
        this.setState({
            deviceSetup: oldDeviceSetup
        });
    }
    acquireImage() {
        this.DWObject.CloseSource();
        for (let i = 0; i < this.DWObject.SourceCount; i++) {
            if (this.DWObject.GetSourceNameItems(i) === this.state.deviceSetup.currentScanner) {
                this.DWObject.SelectSourceByIndex(i);
                break;
            }
        }
        this.DWObject.OpenSource();

        this.DWObject.AcquireImage(
            {
                IfShowUI: this.state.deviceSetup.bShowUI,
                PixelType: this.state.deviceSetup.nPixelType,
                Resolution: this.state.deviceSetup.nResolution,
                IfFeederEnabled: this.state.deviceSetup.bADF,
                IfDuplexEnabled: this.state.deviceSetup.bDuplex,
                IfDisableSourceAfterAcquire: true,
                IfGetImageInfo: true,
                IfGetExtImageInfo: true,
                extendedImageInfoQueryLevel: 0
                /**
                 * NOTE: No errors are being logged!!
                 */
            },
            () => this.props.handleOutPutMessage('Acquire success!', 'important'),
            () => this.props.handleOutPutMessage('Acquire failure!', 'error')
        );
    }
    // Tab 3: Load
    loadImagesOrPDFs() {
        this.DWObject.IfShowFileDialog = true;
        this.DWObject.Addon.PDF.SetResolution(200);
        this.DWObject.Addon.PDF.SetConvertMode(1/*this.Dynamsoft.EnumDWT_ConvertMode.CM_RENDERALL*/);
        this.DWObject.LoadImageEx('', 5 /*this.Dynamsoft.EnumDWT_ImageType.IT_ALL*/, () => {
            this.props.handleOutPutMessage('Loaded an image successfully.');
        }, (errorCode, errorString) => this.props.handleException({ code: errorCode, message: errorString }));
    }
    // Tab 4: Save & Upload
    handleFileNameChange(event) {
        this.setState({ saveFileName: event.target.value });
    }
    handleSaveConfigChange(event) {
        let format = event.target.value;
        switch (format) {
            default: break;
            case 'multiPage':
                this.setState({ bMulti: event.target.checked }); break;
            case 'tif':
            case 'pdf':
                this.setState({ saveFileFormat: event.target.value, bMulti: true }); break;
            case 'bmp':
            case 'jpg':
            case 'png':
                this.setState({ saveFileFormat: event.target.value, bMulti: false }); break;
        }
    }
    toggleUseUploade(event) {
        this.setState({ bUseFileUploader: event.target.checked });
    }

    saveOrUploadImage(_type) {
        if (_type !== 'local' && _type !== 'server') return;
        let imagesToUpload = [];
        let fileType = 0;
        // check this is a Multiple Pages
        if (this.state.bMulti) {
            if (this.props.selected.length === 1 || this.props.buffer.count > 0) {
                    for (let i = 0; i < this.props.buffer.count; i++) {
                        imagesToUpload.push(i);
                    }
            } else {
                    imagesToUpload = this.props.selected;
            }
        } else {
                imagesToUpload.push(this.props.buffer.current);
        }
        for (let o in this.Dynamsoft.EnumDWT_ImageType) {
            if (o.toLowerCase().indexOf(this.state.saveFileFormat) !== -1 && this.Dynamsoft.EnumDWT_ImageType[o] < 7) {
                fileType = this.Dynamsoft.EnumDWT_ImageType[o];
                break;
            }
        }
        if (_type === 'server') {
                // *****************************************************
                // EnumDWT_ImageType
                // IT_BMP 0
                // IT_JPG 1
                // IT_TIF 2
                // IT_PNG 3
                // IT_PDF 4
                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                // EnumDWT_UploadDataFormat
                // BINARY 0
                // BASE64 1
                // ******************************************************
                // Set the D
                // Def PDF
                let enumDWT_ImageType = this.Dynamsoft.EnumDWT_ImageType.IT_PDF;
                switch (this.state.saveFileFormat) {
                    default: break;
                    case 'jpg': enumDWT_ImageType = this.Dynamsoft.EnumDWT_ImageType.IT_JPG;
                    break;
                    case 'pdf': enumDWT_ImageType = this.Dynamsoft.EnumDWT_ImageType.IT_PDF;
                    break;
                }
                const callback = () => {
                };

                this.DWObject.ConvertToBlob(imagesToUpload, enumDWT_ImageType,
                    (_blob, newIndices, enumImageType, _arguments) => {
                        // Set the state for Will Did Update.
                        this.setState({ uploadBlob: _blob});
                        if ((this.props.isEncounter && this.props.encounterInfo.encounterId)
                                || (!this.props.isEncounter && this.props.patientKey)) {
                            let sbmtOcsnId;
                            let sbmtOcsnIndt;

                            if (this.props.isEncounter) {
                                sbmtOcsnIndt = 'E';
                                sbmtOcsnId = this.props.encounterInfo.encounterId;
                            } else {
                                sbmtOcsnIndt = 'P';
                                sbmtOcsnId = this.props.patientKey;
                            }

                            let params = {
                                patientKey: this.props.patientKey,
                                siteId: this.props.siteId,
                                svcCd: this.props.serviceCd,
                                sbmtOcsnIndt: sbmtOcsnIndt,
                                sbmtOcsnId: sbmtOcsnId,
                                inDocTypeId: this.state.uploadType,
                                docRemark: this.state.scannerRemark ? this.state.scannerRemark : '',
                                file: this.state.uploadBlob,
                                isScanDoc: 1
                            };
                            if (sbmtOcsnIndt === 'E') {
                                params = {
                                    ...params,
                                    encntrId: sbmtOcsnId
                                };
                            }
                            this.props.uploadDocument(
                                params,
                                callback
                            );
                        } else {
                            const encounterError = {
                                msgCode: '115011',
                                params: [
                                    {name: 'MESSAGE', value: 'Please select encounter before upload'}
                                ]
                            };
                            openCommonMessage(encounterError);
                        }

                    },
                    (errorCode, errorString, newIndices, enumImageType ,_arguments) => {
                        console.log(errorString);
                    }
                );

        }
    }
    readBarcode() {
        this.Dynamsoft.Lib.showMask();
        this.setState({ readingBarcode: true });
        this.props.handleNavigating(false);
        this.DWObject.Addon.BarcodeReader.getRuntimeSettings()
            .then(settings => {
                if (this.DWObject.GetImageBitDepth(this.props.buffer.current) === 1)
                    settings.scaleDownThreshold = 214748347;
                else
                    settings.scaleDownThreshold = 2300;
                settings.barcodeFormatIds = this.Dynamsoft.EnumBarcodeFormat.BF_ALL;
                settings.region.measuredByPercentage = 0;
                if (this.props.zones.length > 0) {
                    let i = 0;
                    let readBarcodeFromRect = () => {
                        i++;
                        settings.region.left = this.props.zones[i].x;
                        settings.region.top = this.props.zones[i].y;
                        settings.region.right = this.props.zones[i].x + this.props.zones[i].width;
                        settings.region.bottom = this.props.zones[i].y + this.props.zones[i].height;
                        if (i === this.props.zones.length - 1) {
                            this.doReadBarode(settings);
                        } else {
                            this.doReadBarode(settings, readBarcodeFromRect);
                        }
                    };
                    settings.region.left = this.props.zones[0].x;
                    settings.region.top = this.props.zones[0].y;
                    settings.region.right = this.props.zones[0].x + this.props.zones[0].width;
                    settings.region.bottom = this.props.zones[0].y + this.props.zones[0].height;
                    if (this.props.zones.length === 1) {
                        this.doReadBarode(settings);
                    } else {
                        this.doReadBarode(settings, readBarcodeFromRect);
                    }
                } else {
                    settings.region.left = 0;
                    settings.region.top = 0;
                    settings.region.right = 0;
                    settings.region.bottom = 0;
                    this.doReadBarode(settings);
                }
            });
    }
    doReadBarode(settings, callback) {
        let bHasCallback = this.Dynamsoft.Lib.isFunction(callback);
        this.DWObject.Addon.BarcodeReader.updateRuntimeSettings(settings)
            .then(settings => {
                // Make sure the same image is on display
                let userData = this.props.runtimeInfo.curImageTimeStamp;
                let outputResults = () => {
                    if (this.dbrResults.length === 0) {
                        this.props.handleOutPutMessage('--------------------------', 'seperator');
                        this.props.handleOutPutMessage('Nothing found on the image!', 'important', false, false);
                        this.doneReadingBarcode();
                    } else {
                        this.props.handleOutPutMessage('--------------------------', 'seperator');
                        this.props.handleOutPutMessage('Total barcode(s) found: ' + this.dbrResults.length, 'important');
                        for (let i = 0; i < this.dbrResults.length; ++i) {
                            let result = this.dbrResults[i];
                            this.props.handleOutPutMessage('------------------', 'seperator');
                            this.props.handleOutPutMessage('Barcode ' + (i + 1).toString());
                            this.props.handleOutPutMessage('Type: ' + result.BarcodeFormatString);
                            this.props.handleOutPutMessage('Value: ' + result.BarcodeText, 'important');
                        }
                        if (this.props.runtimeInfo.curImageTimeStamp === userData) {
                            this.props.handleBarcodeResults('clear');
                            this.props.handleBarcodeResults(this.dbrResults);
                        }
                        this.doneReadingBarcode();
                    }
                };
                let onDbrReadSuccess = (results) => {
                    this.dbrResults = this.dbrResults.concat(results);
                    bHasCallback ? callback() : outputResults();
                };
                let onDbrReadFail = (_code, _msg) => {
                    this.props.handleException({
                        code: _code,
                        message: _msg
                    });
                    bHasCallback ? callback() : outputResults();
                };
                this.DWObject.Addon.BarcodeReader.decode(this.props.buffer.current).then(onDbrReadSuccess, onDbrReadFail);
            });
    }
    doneReadingBarcode() {
        this.props.handleNavigating(true);
        this.setState({ readingBarcode: false });
        this.dbrResults = [];
        this.Dynamsoft.Lib.hideMask();
    }
    downloadOCRBasic(bDownloadDLL, _features) {
        let strOCRPath = this.Dynamsoft.WebTwainEnv.ResourcesPath + '/addon/OCRx64.zip';
        let strOCRLangPath = this.Dynamsoft.WebTwainEnv.ResourcesPath + '/addon/OCRBasicLanguages/English.zip';
        if (bDownloadDLL) {
            if (this.DWObject.Addon.OCR.IsModuleInstalled()) { /*console.log('OCR dll is installed');*/
                this.downloadOCRBasic(false, _features);
            } else {
                this.DWObject.Addon.OCR.Download(
                    strOCRPath,
                    () => { /*console.log('OCR dll is installed');*/
                        this.downloadOCRBasic(false);
                    },
                    (errorCode, errorString) => this.props.handleException({ code: errorCode, message: errorString })
                );
            }
        } else {
            this.DWObject.Addon.OCR.DownloadLangData(
                strOCRLangPath,
                () => {
                    if (!this.ocrReady) {
                        this.ocrReady = true;
                        this.props.handleStatusChange(64);
                    }
                },
                (errorCode, errorString) => {
                    this.props.handleException({ code: errorCode, message: errorString });
                });
        }
    }
    ocr() {
        this.DWObject.Addon.OCR.SetLanguage('eng');
        this.DWObject.Addon.OCR.SetOutputFormat(this.Dynamsoft.EnumDWT_OCROutputFormat.OCROF_TEXT);
        if (this.props.zones.length > 0) {
            this.ocrRect(this.props.zones);
        }
        else {
            this.DWObject.Addon.OCR.Recognize(
                this.props.buffer.current,
                (imageId, result) => {
                    if (result === null) {
                        this.props.handleOutPutMessage('Nothing found!', 'important');
                        return;
                    }
                    this.props.handleOutPutMessage('', '', true);
                    this.props.handleOutPutMessage('OCR result:', 'important');
                    this.props.handleOutPutMessage(this.Dynamsoft.Lib.base64.decode(result.Get()), 'info', false, true);
                },
                (errorCode, errorString) => {
                    this.props.handleException({ code: errorCode, message: errorString });
                }
            );
        }
    }
    ocrRect(_zones) {
        let doRectOCR = (_zone, _zoneId) => {
            this.DWObject.Addon.OCR.RecognizeRect(
                this.props.buffer.current,
                _zone.x, _zone.y, _zone.x + _zone.width, _zone.y + _zone.height,
                (imageId, left, top, right, bottom, result) => {
                    if (result === null) {
                        this.props.handleOutPutMessage('Nothing found in the rect [' + left + ', ' + top + ', ' + right + ', ' + bottom + ']', 'important');
                        return;
                    }
                    if (_zoneId === 0)
                        this.props.handleOutPutMessage('', '', true);
                    this.props.handleOutPutMessage('OCR result in the rect [' + left + ', ' + top + ', ' + right + ', ' + bottom + ']', 'important');
                    this.props.handleOutPutMessage(this.Dynamsoft.Lib.base64.decode(result.Get()), 'info', false, true);
                    (++_zoneId < _zones.length) && doRectOCR(_zones[_zoneId], _zoneId);
                },
                (errorCode, errorString) => {
                    this.props.handleException({ code: errorCode, message: errorString });
                    (++_zoneId < _zones.length) && doRectOCR(_zones[_zoneId], _zoneId);
                }
            );
        };
        doRectOCR(_zones[0], 0);
    }
    handleRangeChange(event) {
        let value = event.target.value ? event.target.value : event.target.getAttribute('value');
        if (value === 'reset-range') {
            let prop = event.target.getAttribute('prop');
            let _type = event.target.getAttribute('_type');
            let _default = event.target.getAttribute('_default');
            this.setState(state => {
                state.rangePicker.value = _default;
                return state;
            });
            _type === 'camera'
                ? this.DWObject.Addon.Webcam.SetCameraControlPropertySetting(this.Dynamsoft.EnumDWT_CameraControlProperty['CCP_' + prop], _default, true)
                : this.DWObject.Addon.Webcam.SetVideoPropertySetting(this.Dynamsoft.EnumDWT_VideoProperty['VP_' + prop], _default, true);
            this.setState({ bShowRangePicker: false });
        } else if (value === 'close-picker') {
            this.setState({ bShowRangePicker: false });
        } else {
            let _type = event.target.getAttribute('_type');
            let prop = event.target.getAttribute('prop');
            this.setState(state => {
                state.rangePicker.value = value;
                return state;
            });
            _type === 'camera'
                ? this.DWObject.Addon.Webcam.SetCameraControlPropertySetting(this.Dynamsoft.EnumDWT_CameraControlProperty['CCP_' + prop], value, false)
                : this.DWObject.Addon.Webcam.SetVideoPropertySetting(this.Dynamsoft.EnumDWT_VideoProperty['VP_' + prop], value, false);
        }
    }

    handleStateChange = (key, value) => {
        this.setState({
            ...this.state,
            [key]: value
        });
    }

    render() {
        return (
            <div className="DWTController">
                <div className="divinput">
                    <ul className="PCollapse">
                        {this.props.features & 0b1 ? (
                            <li>
                                <div className="divType" tabIndex="1" controlindex="1" onKeyUp={(event) => this.handleTabs(event)} onClick={(event) => this.handleTabs(event)}>
                                    <div className={this.state.shownTabs & 1 ? 'mark_arrow expanded' : 'mark_arrow collapsed'} ></div>
                                    Custom Scan</div>
                                <div className="divTableStyle" style={this.state.shownTabs & 1 ? { display: 'block' } : { display: 'none' }}>
                                    <ul>
                                        <li>
                                            <select tabIndex="1" value={this.state.deviceSetup.currentScanner} className="fullWidth" onChange={(e) => this.onSourceChange(e.target.value)}>
                                                {
                                                    this.state.scanners.length > 0 ?
                                                        this.state.scanners.map((_name, _index) =>
                                                            <option value={_name} key={_index}>{_name}</option>
                                                        )
                                                        :
                                                        <option value="noscanner">Looking for devices..</option>
                                                }
                                            </select>
                                        </li>
                                        <li>
                                            <ul>
                                                <li>
                                                    <label style={{ width: '32%', marginRight: '2%' }} >
                                                        <input tabIndex="1" type="checkbox" checked={this.state.deviceSetup.bADF} onChange={(e) => this.handleScannerSetupChange(e, 'bADF')}/>Page Feeder&nbsp;</label>
                                                </li>
                                                <li>
                                                    <select tabIndex="1" style={{ width: '48%', marginRight: '4%' }}
                                                        value={this.state.deviceSetup.nPixelType}
                                                        onChange={(e) => this.handleScannerSetupChange(e, 'nPixelType')}
                                                    >
                                                        <option value="2">Color</option>
                                                        {/* <option value="0">Black &amp; White</option> */}
                                                        <option value="1">Gray</option>
                                                    </select>
                                                    <select tabIndex="1" style={{ width: '48%' }}
                                                        value={this.state.deviceSetup.nResolution}
                                                        onChange={(e) => this.handleScannerSetupChange(e, 'nResolution')}
                                                    >
                                                        <option value="100">100 DPI</option>
                                                        <option value="200">200 DPI</option>
                                                        <option value="300">300 DPI</option>
                                                        <option value="600">600 DPI</option>
                                                    </select>
                                                </li>
                                            </ul>
                                        </li>
                                        <li className="tc">
                                            <button id="scanner_scan" tabIndex="1" className={this.state.scanners.length > 0 ? 'majorButton enabled fullWidth' : 'majorButton disabled fullWidth'} onClick={() => this.acquireImage()} disabled={this.state.scanners.length > 0 ? '' : 'disabled'}>Scan</button>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        ) : ''}
                        {(this.props.features & 0b1000) || (this.props.features & 0b10000) ? (
                            <li>
                                <div className="divType" tabIndex="4" controlindex="8" onClick={(event) => this.handleTabs(event)} onKeyUp={(event) => this.handleTabs(event)}>
                                    <div className={this.state.shownTabs & 8 ? 'mark_arrow expanded' : 'mark_arrow collapsed'} ></div>
                                    Save Documents</div>
                                <div className="divTableStyle div_SaveImages" style={this.state.shownTabs & 8 ? { display: 'block' } : { display: 'none' }}>
                                    <ul>
                                        <li>
                                            <label className="fullWidth"><span style={{ width: '25%' }}> Documents Uploader Type :</span>
                                                <select tabIndex="1" style={{ width: '100%' }}
                                                    value={this.state.uploadType}
                                                    onChange={(e) => this.handleSelectDocUploaderType(e.target.value)}
                                                    options={this.props.uploadType ? this.props.uploadType[0].inDocTypeId : ''}
                                                >
                                                {
                                                    this.props.mySvcInDocumentTypeList != null ?
                                                    this.props.mySvcInDocumentTypeList.map((inOutDocTypes) =>
                                                        <option value={inOutDocTypes.inDocTypeId} key={inOutDocTypes.inDocTypeId}>{inOutDocTypes.inDocTypeDesc}</option>
                                                    )
                                                    :
                                                    <option value="noscanner">Null</option>
                                                }

                                                </select>
                                            </label>
                                        </li>
                                        <li>
                                            <CIMSMultiTextField
                                                id="scanning_remarks"
                                                label="Remarks"
                                                TextFieldProps={{
                                                    variant: 'outlined',
                                                    label: 'Remarks'
                                                }}
                                                inputProps={{ maxLength: 500 }}
                                                type="text"
                                                rows="8"
                                                value={this.state.scannerRemark ? this.state.scannerRemark : null}
                                                onChange={(e) => this.handleStateChange('scannerRemark', e.target.value)}
                                            />
                                            <input type="hidden" tabIndex="4" style={{ width: '73%', marginLeft: '2%' }} size="20" value={this.state.saveFileName} onChange={(e) => this.handleFileNameChange(e)} disabled/>
                                        </li>
                                        {/* <li>
                                            <label><input tabIndex="4" type="radio" value="pdf" name="ImageType" defaultChecked />PDF</label>
                                        </li> */}
                                        {/* <li>
                                            <label><input tabIndex="4" type="checkbox" checked={(this.state.bMulti ? 'checked' : '')} value="multiPage" onChange={(e) => this.handleSaveConfigChange(e)}/>Upload Multiple Pages</label>
                                        </li> */}
                                        <li className="tc">
                                            {(this.props.features & 0b10000)
                                                ? <button id="scanning_upload_documents" tabIndex="4" className={this.props.buffer.count === 0 ? 'majorButton disabled width_48p marginL_2p' : 'majorButton enabled width_48p marginL_2p'}
                                                    disabled={this.props.buffer.count === 0 ? 'disabled' : ''}
                                                    onClick={() => this.saveOrUploadImage('server')}
                                                  >Upload Documents</button>
                                                : ''
                                            }
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        ) : ''}
                    </ul>
                </div>
                {this.state.bShowRangePicker ? (
                    <RangePicker tabIndex="2"
                        rangePicker={this.state.rangePicker}
                        handleRangeChange={(event) => this.handleRangeChange(event)}
                    />
                ) : ''
                }
            </div >
        );
    }
}

const mapStateToProps = (state) => {
    return {
        clinic: state.login.clinic,
        patientInfo: state.patient.patientInfo,
        clinicalDocList: state.clinicalDoc.clinicalDocList,
        mySvcInDocumentTypeList: state.common.inDocumentTypes.mySvcList,
        currentPDFViewerDoc: state.clinicalDoc.currentPDFViewerDoc,
        //TODO :. Get clinicalDoc
        inOutDocTypeList: state.common.inOutDocTypeList,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        encounterInfo: state.patient.encounterInfo,
        patientKey: state.patient.patientInfo.patientKey

    };
};

const mapDispatchToProps = {
    openCommonMessage,
    uploadDocument
};
export default connect(mapStateToProps, mapDispatchToProps)(DWTController);

