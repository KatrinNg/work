import { connect } from 'react-redux';
import PDFnImageUI from '../components/PDFnImageUI';
import {startup} from '../../../store/actions/documentUpload/documentAction';

const mapStateToProps = state => ({
  PMI: state.pdfNImageUIReducer.PMI,
  EncounteredID: state.pdfNImageUIReducer.encounteredID,
  CreatedBy: state.pdfNImageUIReducer.createdBy
});

const mapDispatchToProps = dispatch=> ({
  startup: ()=> { dispatch(startup);}
});

export default connect(mapStateToProps)(PDFnImageUI);
