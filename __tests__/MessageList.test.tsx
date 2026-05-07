import React from 'react';
import { FlatList } from 'react-native';
import renderer from 'react-test-renderer';
import MessageList from '../src/screens/community/components/MessageList';
import MessageItem from '../src/screens/community/components/MessageItem';

jest.mock('../src/screens/community/components/MessageItem', () => {
  const MockReact = require('react');
  return jest.fn(() => MockReact.createElement('View'));
});

const mockMessageItem = MessageItem as unknown as jest.Mock;

const baseMessages: HolepunchMessage[] = [
  {
    messageId: 'msg-1',
    roomId: 'room-1',
    senderId: 'peer-1',
    messageType: 'TEXT',
    content: 'one',
    timestamp: 1000,
  },
  {
    messageId: 'msg-2',
    roomId: 'room-1',
    senderId: 'peer-self',
    messageType: 'TEXT',
    content: 'two',
    timestamp: 2000,
  },
  {
    messageId: 'msg-3',
    roomId: 'room-1',
    senderId: 'peer-2',
    messageType: 'TEXT',
    content: 'three',
    timestamp: 3000,
  },
];

describe('MessageList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reverses messages and uses stable key extraction', () => {
    const flatListRef = React.createRef<FlatList>();

    let testRenderer: renderer.ReactTestRenderer;
    renderer.act(() => {
      testRenderer = renderer.create(
        <MessageList
          messages={baseMessages}
          sending={false}
          flatListRef={flatListRef}
          currentPeerPubKey="peer-self"
          peersMap={new Map()}
          onImagePress={jest.fn()}
          onPressReject={jest.fn()}
          onPressApprove={jest.fn()}
          viewTransaction={jest.fn()}
        />,
      );
    });

    const flatList = testRenderer!.root.findByType(FlatList);

    expect(flatList.props.data.map(({ messageId }) => messageId)).toEqual([
      'msg-3',
      'msg-2',
      'msg-1',
    ]);
    expect(flatList.props.keyExtractor(baseMessages[0], 0)).toBe('msg-1');

    const messageWithoutId = { ...baseMessages[0], messageId: '' };
    expect(flatList.props.keyExtractor(messageWithoutId, 4)).toBe('peer-1-1000-4');
  });

  it('passes the correct previousMessage and peer to MessageItem', () => {
    const flatListRef = React.createRef<FlatList>();
    const peer = { peerId: 'peer-2', peerName: 'Alice' };
    const peersMap = new Map([['peer-2', peer]]);

    let testRenderer: renderer.ReactTestRenderer;
    renderer.act(() => {
      testRenderer = renderer.create(
        <MessageList
          messages={baseMessages}
          sending={false}
          flatListRef={flatListRef}
          currentPeerPubKey="peer-self"
          peersMap={peersMap}
          onImagePress={jest.fn()}
          onPressReject={jest.fn()}
          onPressApprove={jest.fn()}
          viewTransaction={jest.fn()}
        />,
      );
    });

    const flatList = testRenderer!.root.findByType(FlatList);

    renderer.act(() => {
      flatList.props.renderItem({
        item: flatList.props.data[0],
        index: 0,
      });
    });

    expect(mockMessageItem).toHaveBeenCalled();
    const renderItemProps = mockMessageItem.mock.calls[0][0];

    expect(renderItemProps.message.messageId).toBe('msg-3');
    expect(renderItemProps.previousMessage.messageId).toBe('msg-2');
    expect(renderItemProps.peer).toBe(peer);
  });
});
type HolepunchMessage = {
  messageId: string;
  roomId: string;
  senderId: string;
  messageType: string;
  content: string;
  timestamp: number;
};
