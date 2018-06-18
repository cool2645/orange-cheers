import React, { Component } from 'react';

import '../styles/Alert.css';

interface IAlertProps {
  rootClassName?: string;
  className?: string;
  type?: string;
  content?: string;
  show?: boolean;
  dismiss?: number;
  handle?: IAlertHandle | IAlertHandle[];
}

interface IAlertHandle {
  title: string;

  callback(): void;
}

interface IAlertState {
  hide: boolean;

  className: string;
  content: string;
  dismiss?: number;
  handle?: IAlertHandle | IAlertHandle[];
}

class Alert extends Component<IAlertProps, IAlertState> {

  constructor(props: IAlertProps) {
    super(props);
    this.state = {
      hide: true,
      className: 'danger',
      content: '',
    };
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  public componentDidMount() {
    const state: IAlertState = this.state;
    if (this.props.className) state.className = this.props.className;
    if (this.props.content) state.content = this.props.content;
    if (this.props.dismiss) state.dismiss = this.props.dismiss;
    if (this.props.handle) state.handle = this.props.handle;
    this.setState(state);
    if (this.props.show === undefined || this.props.show) this.show();
  }

  public componentWillReceiveProps(nextProps: IAlertProps) {
    const state: IAlertState = this.state;
    if (nextProps.className) state.className = nextProps.className;
    if (nextProps.content) state.content = nextProps.content;
    state.dismiss = nextProps.dismiss;
    state.handle = nextProps.handle;
    this.setState(state);
  }

  public show(content?: string, className?: string, dismiss?: number, handle?: IAlertHandle | IAlertHandle[]) {
    const state: IAlertState = this.state;
    if (className) state.className = className;
    if (content) state.content = content;
    state.dismiss = dismiss;
    state.handle = handle;
    this.setState(state);
    setTimeout(() => {
      this.setState({ hide: false });
      if (typeof this.state.dismiss === 'number') setTimeout(this.hide, this.state.dismiss);
    }, 100);
  }

  public hide() {
    setTimeout(() => {
      this.setState({ hide: true });
    }, 100);
  }

  public render() {
    const shadow = this.props.type === 'shadow' ? 'alert-shadow' : '';
    const hide = this.state.hide ? 'alert-hide' : '';
    let next;
    if (this.state.handle) {
      if (this.state.handle instanceof Array) {
        next = this.state.handle.map(handle => {
          const callback = (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            this.setState({ hide: true }, handle.callback);
          };
          return <a key={handle.title} href="" onClick={callback}>{handle.title}</a>;
        });
      } else {
        const callback = (e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          this.setState({ hide: true }, (this.state.handle as IAlertHandle).callback);
        };
        next = <a key={(this.state.handle as IAlertHandle).title} href=""
                  onClick={callback}>{(this.state.handle as IAlertHandle).title}</a>;
      }
    }
    return (
      <div className={`${shadow} ${hide} ${this.props.rootClassName}`}>
        <div className={`alert ${this.state.className}`}>
          <p>{this.state.content} {next}</p>
        </div>
        <div className="alert-backdrop" />
      </div>
    );
  }
}

export default Alert;
