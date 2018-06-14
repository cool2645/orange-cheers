import React, { Component } from 'react';

interface IUnreachableProps {
  retry(): void;
}

class Unreachable extends Component<IUnreachableProps> {
  public render() {
    const onRetry = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      this.props.retry();
    };
    const retry = this.props.retry ?
      <a href="" onClick={onRetry}>Retry</a> :
      <a href="">Refresh</a>;

    return <h1>000 Unreachable {retry}</h1>;
  }
}

export default Unreachable;
