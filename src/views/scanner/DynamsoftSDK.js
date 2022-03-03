import React, { Suspense } from 'react';
import Dynamsoft from 'dwt';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';
import * as siteParamsUtilities from '../../utilities/siteParamsUtilities';
import * as scannerUtilities from '../../utilities/scannerUtilities';
import Enum from '../../enums/enum';

const DWTUserInterface = React.lazy(() => import('./dwt/DWTUserInterface'));

class DWT extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.features) {
            this.features = 0;
            this.props.features.map((value) => {
                if (this.featureSet[value]) this.features += this.featureSet[value];
                return this.features;
            });
            this.initialStatus = 255 - (this.features & 0b11100011);
        }
        this.state = {
            startTime: (new Date()).getTime(),
            unSupportedEnv: false,
            dwt: null,
            /** status
             * 0:  "Initializing..."
             * 1:  "Core Ready..." (scan)
             * 2:  "Camera Ready..."
             * 32: "BarcodeReader Ready..."
             * 64: "OCR engine Ready..."
             * 128:"Uploader Ready..."
             */
            status: this.initialStatus,
            selected: [],
            buffer: {
                updated: false,
                count: 0,
                current: -1
            },
            zones: [],
            runtimeInfo: {
                curImageTimeStamp: null,
                showAbleWidth: 0,
                showAbleHeight: 0,
                ImageWidth: 0,
                ImageHeight: 0
            },
            // width : this.props.scannerParams.open ? '100%' : '100%'
            width : '100%'
        };
    }

    componentDidMount() {
        if (Dynamsoft && (!Dynamsoft.Lib.env.bWin || !Dynamsoft.Lib.product.bChromeEdition)) {
            this.setState({ unSupportedEnv: true });
            return;
        } else {
            if (this.DWObject === null) {
                this.loadDWT(true);
            }
        }
    }

    componentWillUnmount() {
        Dynamsoft.WebTwainEnv.Unload();
    }

    featureSet = { scan: 0b1, camera: 0b10, load: 0b100, save: 0b1000, upload: 0b10000, barcode: 0b100000, ocr: 0b1000000, uploader: 0b10000000 };
    features = 0b11111111;
    initialStatus = 0;
    DWObject = null;
    containerId = 'dwtcontrolContainer';
    // width = this.props.scannerParams.open ? '100%' : '100%';
    height = 513;
    runningEnvironment = Dynamsoft.Lib.env;
    bWASM = false;
    bCameraAddonUsable = false;
    modulizeInstallJS() {
        let _DWT_Reconnect = window.DWT_Reconnect;
        window.DWT_Reconnect = (...args) => _DWT_Reconnect.call({ Dynamsoft: Dynamsoft }, ...args);
        let __show_install_dialog = window._show_install_dialog;
        window._show_install_dialog = (...args) => __show_install_dialog.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTwainOldPluginNotAllowedCallback = window.OnWebTwainOldPluginNotAllowedCallback;
        window.OnWebTwainOldPluginNotAllowedCallback = (...args) => _OnWebTwainOldPluginNotAllowedCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTwainNeedUpgradeCallback = window.OnWebTwainNeedUpgradeCallback;
        window.OnWebTwainNeedUpgradeCallback = (...args) => _OnWebTwainNeedUpgradeCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTwainPreExecuteCallback = window.OnWebTwainPreExecuteCallback;
        window.OnWebTwainPreExecuteCallback = (...args) => _OnWebTwainPreExecuteCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTwainPostExecuteCallback = window.OnWebTwainPostExecuteCallback;
        window.OnWebTwainPostExecuteCallback = (...args) => _OnWebTwainPostExecuteCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnRemoteWebTwainNotFoundCallback = window.OnRemoteWebTwainNotFoundCallback;
        window.OnRemoteWebTwainNotFoundCallback = (...args) => _OnRemoteWebTwainNotFoundCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnRemoteWebTwainNeedUpgradeCallback = window.OnRemoteWebTwainNeedUpgradeCallback;
        window.OnRemoteWebTwainNeedUpgradeCallback = (...args) => _OnRemoteWebTwainNeedUpgradeCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTWAINDllDownloadFailure = window.OnWebTWAINDllDownloadFailure;
        window.OnWebTWAINDllDownloadFailure = (...args) => _OnWebTWAINDllDownloadFailure.call({ Dynamsoft: Dynamsoft }, ...args);
    }
    loadDWT(UseService) {
        // Dynamsoft.WebTwainEnv.ProductKey = this.props.productKey;
        Dynamsoft.WebTwainEnv.ProductKey = scannerUtilities.getScannerLicenseKey();
        Dynamsoft.WebTwainEnv.IfAllowLocalCache = false;
        Dynamsoft.WebTwainEnv.ResourcesPath = 'dwt-resources';
        let innerLoad = (UseService) => {
            this.innerLoadDWT(UseService)
                .then(
                    _DWObject => {
                        this.DWObject = _DWObject;
                        this.basicView = {
                            // Height: this.height,
                            // Width: this.width,
                            Height: '100%',
                            // Width: {width: this.props.scannerParams.open ? 'auto' : 'auto'},
                            Width: { width: 'auto' },
                            // Basic
                            view: { bShow: false, Width: '100%' }
                        };
                        if (this.DWObject.BindViewer(this.containerId, this.basicView)) {
                            this.DWObject.Viewer.setViewMode(1, 1);
                            this.handleStatusChange(1);
                            this.setState({
                                dwt: this.DWObject
                            });
                            this.DWObject = this.state.dwt;
                            if (this.DWObject) {
                                /**
                                 * NOTE: RemoveAll doesn't trigger bitmapchanged nor OnTopImageInTheViewChanged!!
                                 */
                                this.DWObject.RegisterEvent('OnBitmapChanged', (changedIndex, changeType) => this.handleBufferChange(changedIndex, changeType));
                                this.DWObject.RegisterEvent('OnTopImageInTheViewChanged', (index) => this.go(index));
                                this.DWObject.RegisterEvent('OnPostTransfer', () => this.handleBufferChange());
                                this.DWObject.RegisterEvent('OnPostLoad', () => this.handleBufferChange());
                                this.DWObject.RegisterEvent('OnPostAllTransfers', () => this.DWObject.CloseSource());
                                this.DWObject.RegisterEvent('OnImageAreaSelected', (nImageIndex, left, top, right, bottom, sAreaIndex) => {
                                    let oldZones = this.state.zones;
                                    oldZones.push({ x: left, y: top, width: right - left, height: bottom - top });
                                    this.setState({ zones: oldZones });
                                });
                                this.DWObject.RegisterEvent('OnImageAreaDeSelected', () => this.setState({ zones: [] }));
                                if (Dynamsoft.Lib.env.bWin)
                                    this.DWObject.MouseShape = false;
                                this.handleBufferChange();
                            }
                        }
                    },
                    err => {
                        console.log(err);
                    }
                );
        };
        /**
        * ConnectToTheService is overwritten here for smoother install process.
        */
        Dynamsoft.WebTwainEnv.ConnectToTheService = () => {
            innerLoad(UseService);
        };
        innerLoad(UseService);
    }
    innerLoadDWT(UseService) {
        return new Promise((res, rej) => {
            let checkScriptLoaded = () => {
                if (Dynamsoft.Lib.detect.scriptLoaded) {
                    if (UseService !== undefined)
                        Dynamsoft.WebTwainEnv.UseLocalService = UseService;
                    this.bWASM = this.runningEnvironment.bMobile || !Dynamsoft.WebTwainEnv.UseLocalService;
                    this.bCameraAddonUsable = !this.bWASM && this.runningEnvironment.bWin;
                    this.modulizeInstallJS();
                    let dwtInitialConfig = {
                        WebTwainId: 'dwtObject'
                    };
                    Dynamsoft.WebTwainEnv.CreateDWTObjectEx(
                        dwtInitialConfig,
                        (_DWObject) => {
                            res(_DWObject);
                        },
                        (errorString) => {
                            rej(errorString);
                        }
                    );
                } else {
                    setTimeout(() => {
                        checkScriptLoaded();
                    }, 1000);
                }
            };
            checkScriptLoaded();
        });
    }
    go(index) {
        this.DWObject.CurrentImageIndexInBuffer = index;
        this.handleBufferChange();
    }
    handleBufferChange(changedIndex, changeType) {
        let _updated = false;
        if (changeType === 4) {// Modified
            _updated = true;
        }
        let selection = [];
        let count = this.DWObject.SelectedImagesCount;
        for (let i = 0; i < count; i++) {
            selection.push(this.DWObject.GetSelectedImageIndex(i));
        }
        this.setState({
            zones: [],
            selected: selection,
            buffer: {
                updated: _updated,
                current: this.DWObject.CurrentImageIndexInBuffer,
                count: this.DWObject.HowManyImagesInBuffer
            }
        }, () => {
            if (this.state.buffer.count > 0) {
                this.setState({
                    runtimeInfo: {
                        curImageTimeStamp: (new Date()).getTime(),
                        showAbleWidth: this.DWObject.HowManyImagesInBuffer > 1 ? this.state.width - 16 : this.state.width,
                        showAbleHeight: this.height,
                        ImageWidth: this.DWObject.GetImageWidth(this.state.buffer.current),
                        ImageHeight: this.DWObject.GetImageHeight(this.state.buffer.current)
                    }
                });
            }
        });
    }
    handleStatusChange(value) {
        this.setState((state) => { return { status: state.status + value }; });
    }
    handleViewerSizeChange(viewSize) {
        this.width = this.state.width;
        this.height = viewSize.height;
    }

    render() {
        const {
            scannerParams,
            isEncounter
        } = this.props;

        let isEnableScannerConfig = siteParamsUtilities.getIsEnableScanner(this.props.clinicConfig, this.props.serviceCd, this.props.siteId);

        return (
            this.state.unSupportedEnv || !isEnableScannerConfig ?
                <div>Scanner Function Not Ready.</div>
                : <Grid item xs={'auto'}>
                    <Suspense fallback={<div>Loading...</div>}>
                        <DWTUserInterface
                            Dynamsoft={Dynamsoft}
                            features={this.features}
                            containerId={this.containerId}
                            startTime={this.state.startTime}
                            dwt={this.state.dwt}
                            status={this.state.status}
                            buffer={this.state.buffer}
                            selected={this.state.selected}
                            zones={this.state.zones}
                            runtimeInfo={this.state.runtimeInfo}
                            handleViewerSizeChange={(viewSize) => this.handleViewerSizeChange(viewSize)}
                            handleStatusChange={(value) => this.handleStatusChange(value)}
                            handleBufferChange={() => this.handleBufferChange()}
                            isEncounter={isEncounter}
                        />
                    </Suspense>
                </Grid>
        );
    }

}
const mapStateToProps = (state) => {
    return {
        patient: state.patient.patientInfo,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        loginName: state.login.loginInfo.loginName,
        loginId: state.login.loginInfo.loginId,
        correlationId: state.login.loginInfo.correlationId,
        pcName: state.login.loginForm.ipInfo.pcName,
        ipAddr: state.login.loginForm.ipInfo.ipAddr,
        clinicConfig: state.common.clinicConfig,
        scannerParams: state.scannerCertificate.scannerParams

    };
};
export default connect(mapStateToProps)(DWT);
