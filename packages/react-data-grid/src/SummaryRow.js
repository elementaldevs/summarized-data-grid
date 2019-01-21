import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BaseSummaryCell from './SummaryCell';
import createObjectWithProperties from './createObjectWithProperties';
import getScrollbarSize from './getScrollbarSize';
import { isFrozen } from './ColumnUtils';
const knownDivPropertyKeys = ['width', 'height', 'style', 'onScroll'];

class SummaryRow extends Component {
  componentWillMount() {
    this.cells = [];
  }

  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.number.isRequired,
    columns: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    onColumnResize: PropTypes.func,
    onColumnResizeEnd: PropTypes.func,
    filterable: PropTypes.bool,
    onFilterChange: PropTypes.func,
    resizing: PropTypes.object,
    onScroll: PropTypes.func,
    rowsCount: PropTypes.number.isRequired,
    dataChanged: PropTypes.bool.isRequired
  };

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.width !== this.props.width
      || nextProps.height !== this.props.height
      || nextProps.columns !== this.props.columns
      || nextProps.rowsCount !== this.props.rowsCount
      || (nextProps.rowsCount === this.props.rowsCount && nextProps.dataChanged)
    );
  }

  getStyle = () => {
    return {
      overflow: 'hidden',
      width: '100%',
      height: this.props.height,
      position: 'absolute'
    };
  }

  getRenderer = (column) => {
    const Summary = column.summary;
    if (Summary) {
      return (
        <Summary {...this.props} column={column} />
      );
    }
    return <div />;
  }

  getCells = () => {
    const cells = [];
    const lockedCells = [];

    this.props.columns.forEach((column, idx) => {
      const renderer = this.getRenderer(column);

      const cell = (
        <BaseSummaryCell
          ref={(node) => this.cells[idx] = node}
          key={idx}
          height={this.props.height}
          column={column}
          renderer={renderer}
          resizing={this.props.resizing === column}
          onResize={this.props.onColumnResize}
          onResizeEnd={this.props.onColumnResizeEnd}
        />
      );
      if (isFrozen(column)) {
        lockedCells.push(cell);
      } else {
        cells.push(cell);
      }
    });
    return cells.concat(lockedCells);
  }

  setScrollLeft = (scrollLeft) => {
    this.props.columns.forEach( (column, i) => {
      if (isFrozen(column)) {
        this.cells[i].setScrollLeft(scrollLeft);
      } else {
        if (this.cells[i] && this.cells[i].removeScroll) {
          this.cells[i].removeScroll();
        }
      }
    });
  }

  getKnownDivProps = () => {
    return createObjectWithProperties(this.props, knownDivPropertyKeys);
  };

  render() {
    const cellsStyle = {
      width: this.props.width ? (this.props.width + getScrollbarSize()) : '100%',
      height: this.props.height,
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      overflowY: 'hidden'
    };

    const cells = this.getCells();
    return (
      <div
        {...this.getKnownDivProps()}
        className="react-grid-HeaderRow"
        onScroll={this.onScroll}
      >
        <div style={cellsStyle} >
          {cells}
        </div>
      </div>
    );
  }
}

export default SummaryRow;
