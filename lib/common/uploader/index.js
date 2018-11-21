import React from 'react'
import PropTypes from 'prop-types'
import FlipMove from 'react-flip-move'
import t from 't-component'
import isEmpty from 'mout/lang/isEmpty'
import utils from './utils'

const styles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  width: '100%'
}

class ReactImageUploadComponent extends React.PureComponent {
  constructor (props) {
    super(props)
    this.inputElement = ''
    this.onDropFile = this.onDropFile.bind(this)
    this.triggerFileUpload = this.triggerFileUpload.bind(this)
  }

  setStateFromProps (props) {
    this.state = {
      pictures: props.pictures || [],
      notAcceptedFileType: [],
      notAcceptedFileSize: []
    }
  }

  componentWillMount () {
    this.setStateFromProps(this.props)
  }

  componentWillReceiveProps (props) {
    this.setStateFromProps(props)
  }

  /*
   On button click, trigger input file to open
   */
  triggerFileUpload (event) {
    event.preventDefault()
    this.inputElement.click()
  }

  /*
   Handle input url change
   */
  handleSingleUrlChange = (e) => {
    if (this.props.singleImage) {
      let url = e.target.value
      let update = []
      if (isEmpty(url)) {
        if (!isEmpty(this.state.pictures)) {
          this.removeImage(this.state.pictures[0].name ? this.state.pictures[0].name : this.imageName(this.state.pictures[0].url))
        } else {
          if (typeof this.props.onChange === 'function') {
            this.props.onChange(update)
          }
        }
      } else {
        update.push({
          name: utils.imageName(url),
          url
        })
        if (typeof this.props.onChange === 'function') {
          this.props.onChange(update)
        }
        this.setState({ pictures: update })
      }
    }
  }

  /*
   Handle file validation
   */
  onDropFile (e) {
    const files = e.target.files
    const _this = this
    // If callback giving, fire.
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(files)
    }
    // Iterate over all uploaded files
    for (let i = 0; i < files.length; i++) {
      let f = files[i]
      // Check for file extension
      if (!this.hasExtension(f.name)) {
        const newArray = _this.state.notAcceptedFileType.slice()
        newArray.push(f.name)
        _this.setState({ notAcceptedFileType: newArray })
        continue
      }
      // Check for file size
      if (f.size > this.props.maxFileSize) {
        const newArray = _this.state.notAcceptedFileSize.slice()
        newArray.push(f.name)
        _this.setState({ notAcceptedFileSize: newArray })
        continue
      }

      const reader = new FileReader()
      // Read the image via FileReader API and save image result in state.
      reader.onload = (function () {
        return function (e) {
          let picture = {
            name: f.name,
            url: utils.buildUploadUrl(f.name),
            data: e.target.result
          }

          if (_this.props.singleImage && _this.props.withUrl) {
            _this.url.value = picture.url
          }

          if (_this.props.singleImage === true) {
            _this.setState({ pictures: [picture] })
          } else if (_this.state.pictures.indexOf(e.target.result) === -1) {
            const newArray = _this.state.pictures.slice()
            newArray.push(picture)
            _this.setState({ pictures: newArray })
          }
        }
      })(f)
      reader.readAsDataURL(f)
    }
  }

  /*
   Render the upload icon
   */
  renderIcon () {
    if (this.props.withIcon) {
      return <i className='fa fa-cloud-upload uploadIcon' />
    }
  }

  /*
   Render label
   */
  renderLabel () {
    if (this.props.withLabel) {
      return <p className={this.props.labelClass} style={this.props.labelStyles}>{this.props.label}</p>
    }
  }

  /*
   Check file extension (onDropFile)
   */
  hasExtension (fileName) {
    return (new RegExp('(' + this.props.imgExtension.join('|').replace(/\./g, '\\.') + ')$')).test(fileName)
  }

  /*
   Remove the image from state
   */
  removeImage (name) {
    const filteredAry = this.state.pictures.filter((e) => e.name !== name)
    if (typeof this.props.onDelete === 'function') {
      this.props.onDelete(name)
    }
    if (this.props.singleImage && this.props.withUrl) {
      this.url.value = filteredAry.length ? filteredAry[0].url : null
    }
    this.setState({ pictures: filteredAry })
  }

  /*
   Check if any errors && render
   */
  renderErrors () {
    let notAccepted = ''
    if (this.state.notAcceptedFileType.length > 0) {
      notAccepted = this.state.notAcceptedFileType.map((error, index) => {
        return (
          <div className={'errorMessage' + this.props.errorClass} key={index} style={this.props.errorStyle}>
  * {error} {this.props.fileTypeError}
          </div>
        )
      })
    }
    if (this.state.notAcceptedFileSize.length > 0) {
      notAccepted = this.state.notAcceptedFileSize.map((error, index) => {
        return (
          <div className={'errorMessage' + this.props.errorClass} key={index} style={this.props.errorStyle}>
  * {error} {this.props.fileSizeError}
          </div>
        )
      })
    }
    return notAccepted
  }

  /*
   Render preview images
   */
  renderPreview () {
    return (
      <div className='uploadPicturesWrapper'>
        <FlipMove enterAnimation='fade' leaveAnimation='fade' style={styles}>
          {this.renderPreviewPictures()}
        </FlipMove>
      </div>
    )
  }

  renderPreviewPictures () {
    return this.state.pictures.map((picture, index) => {
      return (
        <div key={index} className='uploadPictureContainer'>
          <div className='deleteImage' onClick={() => this.removeImage(picture.name)}>
            <i className='fa fa-times-circle' />
          </div>
          <img src={picture.data ? picture.data : picture.url} className='uploadPicture' alt='preview' />
        </div>
      )
    })
  }

  renderCoverPreview () {
    if (this.state.pictures.length >= 1) {
      const picture = this.state.pictures[0]
      const actualUrl = picture.data ? picture.data : (picture.url ? picture.url : utils.buildUploadUrl(picture.name))
      return (
        <div className='coverWrapper'>
          <div className='deleteImage' onClick={() => this.removeImage(picture.name)}>
            <i className='fa fa-times-circle' />
          </div>
          <div className='coverContainer' style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0, 0.2), rgba(0,0,0, 0.2)), url("' + actualUrl + '")'
          }} />
        </div>
      )
    }
  }

  render () {
    return (
      <div className={'fileUploader ' + this.props.className} style={this.props.style}>
        { this.props.withCover && this.props.singleImage && this.renderCoverPreview() }
        { this.props.withPreview && this.props.singleImage && this.renderPreview() }
        { this.props.singleImage && this.props.withUrl && (

          <div className='input-group'>
            <input type='text' id='url' className='form-control'
              onBlur={this.handleSingleUrlChange}
              ref={(url) => { this.url = url }}
              placeholder={utils.buildUploadUrl('...')}
              defaultValue={this.state.pictures.length >= 1 ? this.state.pictures[0].url : null} />
            <span className='input-group-btn'>
              <button className='btn btn-default' type='button' onClick={this.triggerFileUpload}>
                <i className='fa fa-upload' />
              </button>
            </span>
          </div>

        )}
        <div className={'fileContainer ' + (this.props.singleImage && 'singleImage')}>
          <div className='errorsContainer'>
            {this.renderErrors()}
          </div>
          {this.renderIcon()}
          {this.renderLabel()}
          { !(this.props.singleImage && this.props.withUrl) && (
            <button
              className={'chooseFileButton ' + this.props.buttonClassName}
              style={this.props.buttonStyles}
              onClick={this.triggerFileUpload}>
              { ((this.props.buttonText === t('common.upload.select.many')) && this.props.singleImage) ? t('common.upload.select.one') : this.props.buttonText}
            </button>
          )}
          <input
            type='file'
            id='file'
            className='inputfile'
            ref={(input) => { this.inputElement = input }}
            name={this.props.name}
            onChange={this.onDropFile}
            accept={this.props.accept}
            multiple={!this.props.singleImage} />
          {/* <label htmlFor='file' className='filelabel'>
            Choose image
            &emsp;
            <svg xmlns='http://www.w3.org/2000/svg' width='20' height='17' viewBox='0 0 20 17' >
              <path d='M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z' />
            </svg>
          </label> */}
          { this.props.withPreview && !(this.props.singleImage) && this.renderPreview() }
        </div>
      </div>
    )
  }
}

ReactImageUploadComponent.defaultProps = {
  className: '',
  pictures: [],
  buttonClassName: {},
  buttonStyles: {},
  withPreview: false,
  withCover: false,
  withUrl: false,
  accept: 'accept=image/*',
  name: '',
  withIcon: false,
  buttonText: t('common.upload.select.many'),
  withLabel: false,
  label: 'Max file size: 5mb, accepted: jpg|gif|png',
  labelStyles: {},
  labelClass: '',
  imgExtension: ['.jpg', '.gif', '.png'],
  maxFileSize: 5242880,
  fileSizeError: ' file size is too big',
  fileTypeError: ' is not supported file extension',
  errorClass: '',
  style: {},
  errorStyle: {},
  singleImage: false
}

ReactImageUploadComponent.propTypes = {
  style: PropTypes.object,
  pictures: PropTypes.array,
  className: PropTypes.string,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  buttonClassName: PropTypes.object,
  buttonStyles: PropTypes.object,
  withPreview: PropTypes.bool,
  withCover: PropTypes.bool,
  withUrl: PropTypes.bool,
  accept: PropTypes.string,
  name: PropTypes.string,
  withIcon: PropTypes.bool,
  buttonText: PropTypes.string,
  withLabel: PropTypes.bool,
  label: PropTypes.string,
  labelStyles: PropTypes.object,
  labelClass: PropTypes.string,
  imgExtension: PropTypes.array,
  maxFileSize: PropTypes.number,
  fileSizeError: PropTypes.string,
  fileTypeError: PropTypes.string,
  errorClass: PropTypes.string,
  errorStyle: PropTypes.object,
  singleImage: PropTypes.bool
}

export default ReactImageUploadComponent