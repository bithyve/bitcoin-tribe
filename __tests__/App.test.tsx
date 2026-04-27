/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../src/App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

jest.mock('../src/navigation/Navigator', () => {
  const React = require('react');
  return function MockNavigator() {
    return React.createElement('View', null, 'Navigator');
  };
});

jest.mock('../src/contexts/Contexts', () => {
  const React = require('react');
  return function MockContexts({children}: {children: React.ReactNode}) {
    return React.createElement(React.Fragment, null, children);
  };
});

jest.mock('react-native-root-siblings', () => {
  const React = require('react');
  return {
    RootSiblingParent: ({children}: {children: React.ReactNode}) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    GestureHandlerRootView: ({children}: {children: React.ReactNode}) =>
      React.createElement(React.Fragment, null, children),
  };
});

it('renders correctly', () => {
  let testRenderer: renderer.ReactTestRenderer;
  renderer.act(() => {
    testRenderer = renderer.create(<App />);
  });
  expect(testRenderer!.root).toBeDefined();
});
