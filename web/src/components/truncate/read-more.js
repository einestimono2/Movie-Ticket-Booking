import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Truncate } from './truncate';

/**
 * @param {int} lines Chỉ định số dòng văn bản sẽ được giữ nguyên cho đến khi nó bị cắt bớt (default: 3)
 * @param {string | import('react').ReactNode} children Văn bản hoặc phần tử cần cắt ngắn
 * @param {string | import('react').ReactNode} more Phần tử cuối văn bản trong trường hợp đang bị cắt (default: 'Read more')
 * @param {string | import('react').ReactNode} less Phần tử cuối văn bản trong trường hợp đang hiển thị đầy đủ (default: 'Show less')
 */
export class ReadMore extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      expanded: false,
      truncated: false,
    };

    this.handleTruncate = this.handleTruncate.bind(this);
    this.toggleLines = this.toggleLines.bind(this);
  }

  handleTruncate(truncated) {
    if (this.state.truncated !== truncated) {
      this.setState({
        truncated,
      });
    }
  }

  toggleLines(event) {
    event.preventDefault();

    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { children, more, less, lines } = this.props;

    const { expanded, truncated } = this.state;

    return (
      <div>
        <Truncate
          lines={!expanded && lines}
          ellipsis={
            <span>
              ...{' '}
              <span className="cusor-pointer text-primary" onClick={this.toggleLines}>
                {more}
              </span>
            </span>
          }
          onTruncate={this.handleTruncate}
        >
          {children}
        </Truncate>
        {!truncated && expanded && (
          <span>
            {' '}
            <a href="#" onClick={this.toggleLines}>
              {less}
            </a>
          </span>
        )}
      </div>
    );
  }
}

ReadMore.defaultProps = {
  lines: 3,
  more: 'Read more',
  less: 'Show less',
};

ReadMore.propTypes = {
  children: PropTypes.node.isRequired,
  lines: PropTypes.number,
  less: PropTypes.string,
  more: PropTypes.string,
};
