import React, { Component } from 'react';

import '../styles/Alert.css';

interface IAlertProps {
  className?: string;
  type?: string;
  content: string;
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
    if (nextProps.dismiss) state.dismiss = nextProps.dismiss;
    if (nextProps.handle) state.handle = nextProps.handle;
    this.setState(state);
  }

  public show(content?: string, className?: string, dismiss?: number, handle?: IAlertHandle | IAlertHandle[]) {
    const state: IAlertState = this.state;
    if (className) state.className = className;
    if (content) state.content = content;
    if (typeof dismiss === 'number') state.dismiss = dismiss;
    if (handle) state.handle = handle;
    this.setState(state);
    setTimeout(() => {
      this.setState({ hide: false });
      if (typeof this.props.dismiss === 'number') setTimeout(this.hide, this.props.dismiss);
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
          const callback = () => {
            handle.callback();
            this.setState({ hide: true });
          };
          return <a key={handle.title} href="" onClick={callback}>{handle.title}</a>;
        });
      } else {
        const callback = () => {
          (this.state.handle as IAlertHandle).callback();
          this.setState({ hide: true });
        };
        return <a key={(this.state.handle as IAlertHandle).title} href=""
                  onClick={callback}>{(this.state.handle as IAlertHandle).title}</a>;
      }
    }
    return (
      <div className={`${shadow} ${hide}`}>
        <div className={`alert ${this.state.className}`}>
          <p>{this.state.content} {next}</p>
        </div>
        <div className="alert-backdrop" />
      </div>
    );
  }
}

export default Alert;
