import { Component, createElement } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import invariant from 'invariant';
import pubSubShape from '../utils/pubSubShape';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const createPubSubConnector = Composed => {
  class PubSubConnector extends Component {
    constructor(props, context) {
      super(props, context);
      this.pubSubCore = props.pubSubCore || context.pubSubCore;

      invariant(
        this.pubSubCore,
        `Could not find "pubSubCore" in either the context or `
        + `props of "${this.constructor.displayName}". `
        + `Either wrap the root component in a <PubSubProvider>, `
        + `or explicitly pass "pubSubCore" as a prop to "${this.constructor.displayName}".`
      );

      this.pubSub = this.pubSubCore.register(this);
    }

    componentWillUnmount() {
      this.pubSub.unsubscribe();
      delete this.pubSub;
      delete this.pubSubCore;
    }

    getWrappedInstance() {
      return this.refs.wrappedInstance;
    }

    render() {
      const { pubSub } = this;
      const ref = 'wrappedInstance';
      return createElement(Composed, Object.assign({ pubSub, ref }, this.props));
    }
  }

  PubSubConnector.contextTypes = {
    pubSubCore: pubSubShape,
  };

  PubSubConnector.propTypes = {
    pubSubCore: pubSubShape,
  };

  PubSubConnector.displayName = `PubSubConnector(${getDisplayName(Composed)})`;
  PubSubConnector.WrappedComponent = Composed;

  return hoistStatics(PubSubConnector, Composed);
};

export default createPubSubConnector;
