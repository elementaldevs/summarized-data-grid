import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import joinClasses from 'classnames';
import ResizeHandle from './ResizeHandle';

class SummaryCell extends Component {
  static propTypes = {
    renderer: PropTypes.oneOfType([PropTypes.func, PropTypes.element]).isRequired,
    column: PropTypes.object.isRequired,
    onResize: PropTypes.func.isRequired,
    height: PropTypes.number.isRequired,
    onResizeEnd: PropTypes.func.isRequired,
    className: PropTypes.string
  };

  state = {
    resizing: false
  };

  getCell = () => {
    if (React.isValidElement(this.props.renderer)) {
      // if it is a string, it's an HTML element, and column is not a valid property, so only pass height
      if (typeof this.props.renderer.type === 'string') {
        return React.cloneElement(this.props.renderer, { height: this.props.height });
      }
      return React.cloneElement(this.props.renderer, { column: this.props.column, height: this.props.height });
    }
    return this.props.renderer({ column: this.props.column });
  };

  getStyle = () => {
    return {
      width: this.props.column.width,
      left: this.props.column.left,
      display: 'inline-block',
      position: 'absolute',
      height: this.props.height,
      margin: 0,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      backgroundColor: this.props.column.background_color || '#e0e0e0',
      color: this.props.column.color
    };
  };

  setScrollLeft = (scrollLeft) => {
    const node = ReactDOM.findDOMNode(this);
    node.style.webkitTransform = `translate3d(${scrollLeft}px, 0px, 0px)`;
    node.style.transform = `translate3d(${scrollLeft}px, 0px, 0px)`;
  };

  removeScroll = () => {
    const node = ReactDOM.findDOMNode(this);
    if (node) {
      const transform = 'none';
      node.style.webkitTransform = transform;
      node.style.transform = transform;
    }
  };

  render() {
    let resizeHandle;
    if (this.props.column.resizable) {
      resizeHandle = (<ResizeHandle />);
    }
    let className = joinClasses({
      'react-grid-HeaderCell': true,
      'react-grid-HeaderCell--resizing': this.state.resizing,
      'react-grid-HeaderCell--frozen': this.props.column.locked
    });
    className = joinClasses(className, this.props.className, this.props.column.cellClass);
    const cell = this.getCell();
    return (
      <div className={className} style={this.getStyle()}>
        {cell}
        {resizeHandle}
      </div>
    );
  }
}

export default SummaryCell;
