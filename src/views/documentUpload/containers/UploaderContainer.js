import { connect } from 'react-redux';
import Uploader from '../components/UploaderV2';

const mapStateToProps = state => ({
  clinicalDocList: state.pdfNImageUIReducer.clinicalDocList
});

export default connect(mapStateToProps)(Uploader);
