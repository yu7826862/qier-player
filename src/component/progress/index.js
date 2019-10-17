import React, { Component } from 'react';
import './style.less';
import {
  percentToMinutesAndSeconds,
  percentToSeconds
} from '../../utils/timeControl';

class Progress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMovingProgress: false,
      currentTime: '00:00',
      currentTimeSec: 0,
      positionX: 0,
      // 视频帧预览，未实现
      imgSrc: ''
    }
    this.progressSeekMaskRef = React.createRef();
    this.popCurrentVideoImgBox = this.popCurrentVideoImgBox.bind(this);
    this.hideCurrentVideoImgBox = this.hideCurrentVideoImgBox.bind(this);
    this.getCurrentClickTime = this.getCurrentClickTime.bind(this);
    this.changeCurrentTime = this.changeCurrentTime.bind(this);
    this.clearInterval = this.clearInterval.bind(this);
  }

  calculateProcessPercent() {
    const { videoCurrentTime, videoDuration } = this.props;
    return (videoCurrentTime / videoDuration * 100).toString();
  }

  calculateBufferedPercent() {
    const { videoBufferedTime, videoDuration } = this.props;
    return (videoBufferedTime / videoDuration * 100).toString();
  }

  componentDidMount() {
    window.onmousemove = (e) => {
      this.windowClientX = e.clientX;
    }
    window.onmouseup = () => {
      this.whenMouseUpDo();
    }
  }

  changeCurrentTime(e) {
    this.interval = setInterval(() => {
      this.seekPositionX = this.windowClientX - this.leftDis + 1;
      if (this.seekPositionX >= 0 && this.seekPositionX <= this.progressSeekMaskElem.offsetWidth) {
        this.progressPercent = this.seekPositionX / this.progressSeekMaskElem.offsetWidth;
        this.props.videoRef.current.currentTime = percentToSeconds(this.progressPercent, this.props.videoDuration);
        this.setState({
          isMovingProgress: true,
          currentTime: percentToMinutesAndSeconds(this.progressPercent, this.props.videoDuration),
          positionX: this.seekPositionX
        })
      }
      if (this.seekPositionX < 0) {
        this.props.videoRef.current.currentTime = 0;
      }
      if (this.seekPositionX > this.progressSeekMaskElem.offsetWidth) {
        this.props.videoRef.current.currentTime = this.props.videoDuration;
      }
    }, 1);
  }

  clearInterval() {
    this.whenMouseUpDo();
  }

  whenMouseUpDo() {
    this.interval && clearInterval(this.interval);
    if (this.props.videoRef.current.currentTime < this.props.videoDuration) {
      this.props.videoRef.current.play();
    }
    this.setState({
      isMovingProgress: false,
    })
  }

  popCurrentVideoImgBox(e) {
    this.progressSeekMaskElem = this.progressSeekMaskRef.current;
    // 当前元素离页面左边的距离
    this.leftDis = this.progressSeekMaskElem.getBoundingClientRect().left;
    // 当前所在进度条位置
    this.seekPositionX = e.clientX - this.leftDis + 1;
    // 进度条百分比
    this.progressPercent = this.seekPositionX / this.progressSeekMaskElem.offsetWidth;
    // console.log(e.clientX)
    this.setState({
      isMovingProgress: true,
      currentTime: percentToMinutesAndSeconds(this.progressPercent, this.props.videoDuration),
      positionX: this.seekPositionX,
    })
  }

  hideCurrentVideoImgBox() {
    this.setState({
      isMovingProgress: false
    })
  }

  getCurrentClickTime() {
    this.updateCurrentTime = percentToSeconds(this.progressPercent, this.props.videoDuration);
    this.props.videoRef.current.currentTime = this.updateCurrentTime;
  }

  render() {
    return (
      <div className="progress-container">
        <div className="progress-bg">
          <div className="progress-buffered" style={{ width: `${this.calculateBufferedPercent()}%` }}></div>
          <div className="progress-played" style={{ width: `${this.calculateProcessPercent()}%` }}>
            <i className="progress-scrubber"></i>
          </div>
          <div
            className="progress-seek-mask"
            ref={this.progressSeekMaskRef}
            onMouseDown={this.changeCurrentTime}
            onMouseUp={this.clearInterval}
            onMouseMove={this.popCurrentVideoImgBox}
            onMouseLeave={this.hideCurrentVideoImgBox}
            onClick={this.getCurrentClickTime}
          >
          </div>
          {
            this.state.isMovingProgress ?
              (
                <div>
                  <div className="pointer" style={{ left: `${this.state.positionX}px` }}></div>
                  <div className="video-img-box" style={{ left: `${this.state.positionX}px` }}>
                    <img className="video-current-img" src={this.state.imgSrc} alt="" />
                    <span className="current-time">{this.state.currentTime}</span>
                  </div>
                </div>
              ) : ''
          }
        </div>
      </div>
    );
  }
}

export default Progress;