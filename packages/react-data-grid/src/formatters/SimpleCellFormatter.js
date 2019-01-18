import React from 'react';
import PropTypes from 'prop-types';

class SimpleCellFormatter extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object, PropTypes.bool])
  };

  shouldComponentUpdate(nextProps) {
    return nextProps.value !== this.props.value;
  }

  render() {
    return (
      <div
        className={this.props.className}
        style={{ width: 'max-content' }}
      >
        {this.props.value}
      </div>
    );
  }
}

export default SimpleCellFormatter;
