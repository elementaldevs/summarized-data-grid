import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import joinClasses from 'classnames';
import shallowCloneObject from './shallowCloneObject';
import ColumnMetrics from'./ColumnMetrics';
import ColumnUtils from'./ColumnUtils';
import getScrollbarSize  from'./getScrollbarSize';
import createObjectWithProperties from'./createObjectWithProperties';
import cellMetaDataShape from 'common/prop-shapes/CellMetaDataShape';
import SummaryRow from './SummaryRow';

// The list of the propTypes that we want to include in the Summary div
const knownDivPropertyKeys = ['height', 'onScroll'];

class Summary extends Component {
  static propTypes = {
    columnMetrics: PropTypes.shape({  width: PropTypes.number.isRequired, columns: PropTypes.any }).isRequired,
    totalWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.number.isRequired,
    onColumnResize: PropTypes.func,
    onScroll: PropTypes.func,
    cellMetaData: PropTypes.shape(cellMetaDataShape),
    rowGetter: PropTypes.func,
    rowsCount: PropTypes.number,
    dataChanged: PropTypes.bool.isRequired
  };

  state = {
    resizing: null
  };

  componentDidUpdate(prevProps, prevState) {
    if (!(ColumnMetrics.sameColumns(prevProps.columnMetrics.columns, prevProps.columnMetrics.columns, ColumnMetrics.sameColumn))
    || prevProps.totalWidth !== this.props.totalWidth
    || (prevState.resizing !== this.state.resizing)
    || (prevProps.rowsCount !== this.props.rowsCount)
    /* || (prevProps.rowsCount === this.props.rowsCount && this.props.dataChanged)*/) {
      this.cleanResizeHandle();
    }
  }

  cleanResizeHandle = () => this.setState({ resizing: null })

  onColumnResize = (column, width) => {
    const state = this.state.resizing || this.props;

    const pos = this.getColumnPosition(column);

    if (pos != null) {
      const resizing = {
        columnMetrics: shallowCloneObject(state.columnMetrics)
      };
      resizing.columnMetrics = ColumnMetrics.resizeColumn(
          resizing.columnMetrics, pos, width);

      // we don't want to influence scrollLeft while resizing
      if (resizing.columnMetrics.totalWidth < state.columnMetrics.totalWidth) {
        resizing.columnMetrics.totalWidth = state.columnMetrics.totalWidth;
      }

      resizing.column = ColumnUtils.getColumn(resizing.columnMetrics.columns, pos);
      this.setState({ resizing });
    }
  };

  onColumnResizeEnd = (column, width) => {
    const pos = this.getColumnPosition(column);
    if (pos !== null && this.props.onColumnResize) {
      this.props.onColumnResize(pos, width || column.width);
    }
  };

  getSummaryRow = () => {
    const columnMetrics = this.getColumnMetrics();
    let resizeColumn;
    if (this.state.resizing) {
      resizeColumn = this.state.resizing.column;
    }
    const rowHeight = 'auto';
    const scrollbarSize = getScrollbarSize() > 0 ? getScrollbarSize() : 0;
    const updatedWidth = isNaN(this.props.totalWidth - scrollbarSize) ? this.props.totalWidth : this.props.totalWidth - scrollbarSize;
    const summaryRowStyle = {
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: updatedWidth,
      overflowX: 'hidden',
      minHeight: rowHeight
    };

    return (<SummaryRow
      ref={(node) => this.summaryRow = node}
      style={summaryRowStyle}
      onColumnResize={this.onColumnResize}
      onColumnResizeEnd={this.onColumnResizeEnd}
      width={columnMetrics.width}
      height={this.props.height}
      columns={columnMetrics.columns}
      resizing={resizeColumn}
      onScroll={this.props.onScroll}
      rowGetter={this.props.rowGetter}
      rowsCount={this.props.rowsCount}
      dataChanged={this.props.dataChanged}
    />);
  };

  getColumnMetrics = () => {
    let columnMetrics;
    if (this.state.resizing) {
      columnMetrics = this.state.resizing.columnMetrics;
    } else {
      columnMetrics = this.props.columnMetrics;
    }
    return columnMetrics;
  };

  getColumnPosition = (column) => {
    const columnMetrics = this.getColumnMetrics();
    let pos = -1;
    columnMetrics.columns.forEach((c, idx) => {
      if (c.key === column.key) {
        pos = idx;
      }
    });
    return pos === -1 ? null : pos;
  };

  getStyle = () => {
    return {
      position: 'relative',
      height: this.props.height
    };
  };

  setScrollLeft = (scrollLeft) => {
    const node = ReactDOM.findDOMNode(this.summaryRow);
    node.scrollLeft = scrollLeft;
    this.summaryRow.setScrollLeft(scrollLeft);
  };

  getKnownDivProps = () => {
    return createObjectWithProperties(this.props, knownDivPropertyKeys);
  };

  render() {
    const className = joinClasses({
      'react-grid-Header': true,
      'react-grid-Header--resizing': !!this.state.resizing
    });
    return (
      <div {...this.getKnownDivProps()} style={this.getStyle()} className={className}>
        {this.getSummaryRow()}
      </div>
    );
  }
}

export default Summary;
