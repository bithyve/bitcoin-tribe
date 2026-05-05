import renderer from 'react-test-renderer';
import React from 'react';
import AppQueryClient from '../src/services/query/AppQueryClient';
import {
  predefinedMainnetNodes,
  predefinedRegtestNodes,
  predefinedTestnet4Nodes,
  predefinedTestnetNodes,
} from '../src/services/electrum/predefinedNodes';

describe('misc service entrypoints', () => {
  it('renders AppQueryClient children', () => {
    let tree;

    renderer.act(() => {
      tree = renderer.create(
        React.createElement(
          AppQueryClient,
          null,
          React.createElement('Text', null, 'child'),
        ),
      );
    });

    expect(tree.root.findByType('Text').props.children).toBe('child');
  });

  it('exports the expected predefined electrum nodes', () => {
    expect(predefinedTestnetNodes[0]).toEqual(
      expect.objectContaining({ host: 'testnet.qtornado.com', port: '51002' }),
    );
    expect(predefinedTestnet4Nodes[0]).toEqual(
      expect.objectContaining({ host: 'electrum.iriswallet.com', port: '50053' }),
    );
    expect(predefinedRegtestNodes[0]).toEqual(
      expect.objectContaining({ host: 'electrum.rgbtools.org', useSSL: false }),
    );
    expect(predefinedMainnetNodes).toHaveLength(6);
  });
});