import React from 'react';

import ReactQuill from 'react-quill'; // ES6
import { cloneDeep } from 'lodash';
import 'react-quill/dist/quill.snow.css'; // ES6
import 'react-quill/dist/quill.bubble.css'; // ES6
import "./editor.css";

const EMPTY_DELTA = {ops: []};

class DtsEditor extends React.Component {
  constructor (props) {
    super(props);
    
    let {note, readOnly, noteReadOnly} = this.props;
    let isReadOnly = readOnly || noteReadOnly;
    const modules =  isReadOnly ?  {toolbar:false} : DtsEditor.modules;
    const formats = isReadOnly ?  [] : DtsEditor.formats;
    let initValue = cloneDeep(EMPTY_DELTA);
    
    if (note && note.clinicalnoteText ) {
      console.log("DtsEditor.props.text:" + note.clinicalnoteText);
      initValue = this.convert2Delta(note.clinicalnoteText);
    } 
    this.state = {
      theme: isReadOnly ? 'bubble' :  'snow',
      readOnly: isReadOnly,
      note: note,
      value: initValue,
      events: [],
      formats : formats,
      modules : modules
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if( prevProps.note !== this.props.note ) {
      this.setState({
        note: this.props.note,
        value: this.convert2Delta(this.props.note.clinicalnoteText)
      });
    }
  }

  convert2Delta = (text)=> {
    let tmpInput = this.convert2Json(text);
    if( typeof tmpInput==="string"){
      return {ops: [{"insert": tmpInput}]};
    }
    else {
      return tmpInput;
    }
  }

  convert2Json = (text) => {
    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
  }

  formatRange = (range) => {
    return range
      ? [range.index, range.index + range.length].join(',')
      : 'none';
  }

  onEditorChange = (value, delta, source, editor) => {
    const { encounterId, onChange, note }=this.props;

    // console.log("DtsEditor.onEditorChange.value: start ====> ");
    // console.log(value);
    // console.log("<==== end");
    this.setState({
      value: editor.getContents(),
      events: [`[${source}] text-change`, ...this.state.events]
    });
    onChange&&onChange(JSON.stringify(editor.getContents()), note, encounterId);
  }



  onEditorChangeSelection = (range, source) => {
    this.setState({
      selection: range,
      events: [
        `[${source}] selection-change(${this.formatRange(this.state.selection)} -> ${this.formatRange(range)})`,
        ...this.state.events
      ]
    });
  }

  onEditorFocus = (range, source) => {
    this.setState({
      events: [
        `[${source}] focus(${this.formatRange(range)})`
      ].concat(this.state.events)
    });
  }

  onEditorBlur = (previousRange, source) => {
    this.setState({
      events: [
        `[${source}] blur(${this.formatRange(previousRange)})`
      ].concat(this.state.events)
    });
  }



  onToggleReadOnly = () => {
    this.setState({ readOnly: !this.state.readOnly });
  }

  onSetContents = () => {
    this.setState({ value: 'This is some <b>fine</b> example content' });
  }


  // handleTextChange = e => {
  //   const { encounterId, noteId, onChange }=this.props;
  //   this.setState({ editorText: text });
  //   onChange&&onChange(value, noteId, encounterId);
  // }
  
  renderToolbar() {
    let state = this.state;

    let readOnly = state.readOnly;
    let selection = this.formatRange(state.selection);
    return (
      <div>

        <button onClick={this.onToggleReadOnly}>
          Set {readOnly? 'read/Write' : 'read-only'}
        </button>
        <button onClick={this.onSetContents}>
          Fill contents programmatically
        </button>
        <button disabled>
          Selection: ({selection})
        </button>
      </div>
    );
  }

  renderSidebar() {
    return (
      <div style={{ overflow:'hidden', float:'right' }}>
        <textarea
            style={{ display:'block', width:300, height:300 }}
            value={JSON.stringify(this.state.value, null, 2)}
            readOnly
        />
        <textarea
            style={{ display:'block', width:300, height:300 }}
            value={this.state.events.join('\n')}
            readOnly
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        {/* {this.renderToolbar()}
        <hr/>
        {this.renderSidebar()} */}
        <ReactQuill
            theme={this.state.theme}
            // value={this.state.value}
            defaultValue={this.state.value}
            readOnly={this.state.readOnly}
            onChange={this.onEditorChange}
            onChangeSelection={this.onEditorChangeSelection}
            onFocus={this.onEditorFocus}
            modules={this.state.modules}
            formats={this.state.formats}
            onBlur={this.onEditorBlur}
        />
      </div>
    );
  }


}

DtsEditor.modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4,5, false] }],
    ['bold', 'italic', 'underline'],//,'strike'],
    //[{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    //[{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
  // toolbar: [
  //   [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
  //   [{size: []}],
  //   ['bold', 'italic', 'underline', 'strike', 'blockquote'],
  //   [{'list': 'ordered'}, {'list': 'bullet'},
  //    {'indent': '-1'}, {'indent': '+1'}],
  //   ['link', 'image', 'video'],
  //   ['clean']
  // ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false
  }
};

/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
DtsEditor.formats = [
  'header',
  'bold', 'italic', 'underline', 'strike'
  // , 'blockquote',
  // 'list', 'bullet', 'indent'
  //'link', 'image'
];

/*
 * PropType validation
 */
// Editor.propTypes = {
//   placeholder: PropTypes.string,
// }

export default DtsEditor;
