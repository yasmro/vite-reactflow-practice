import { useCallback, useMemo } from "react";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
  reconnectEdge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { Button } from "./components/ui/button";

import "@xyflow/react/dist/style.css";
import MessageNode from "./components/nodes/message-node";
import { useHandleStore } from "./stores/handleStore";

let id = 1;
const getId = () => `${id++}`;

const nodeTypes = {
  messageNode: MessageNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  const edgesWithAnimated = useMemo(() => {
    return edges.map((edge) => {
      return {
        ...edge,
        animated: edge.selected === true,
      };
    });
  }, [edges]);

  const { selectedHandles, resetHandles } = useHandleStore();

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        if (selectedHandles.length > 0) {
          // CMDキーで1個以上選択されている場合
          // 選択されているハンドルに基づいて複数エッジを作成
          const newEdges = selectedHandles.map((handleId) => ({
            id: `${params.source}-${handleId}-${params.target}`,
            source: params.source,
            sourceHandle: handleId,
            target: params.target,
            type: "smoothstep",
          }));
          // FIXME: 接続元からのエッジは1つしか設定できないので、すでにある場合は上書きする処理を書く。
          return [...eds, ...newEdges];
        } else {
          // CMDキーで1つも選択されていない場合（単純なハンドルからのエッジ作成の場合）
          // 接続元からのエッジは1つしか設定できないので、すでにある場合は上書きする
          const distinctedEdges = eds.filter(
            (edge) =>
              edge.source !== params.source ||
              edge.sourceHandle !== params.sourceHandle
          );
          return addEdge({ ...params, type: "smoothstep" }, distinctedEdges);
        }
      });

      // 接続後にハンドル選択状態をリセット
      resetHandles();
    },
    [selectedHandles, setEdges, resetHandles]
  );
  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) =>
      // TODO: 複数本のreconnectの実装
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [setEdges]
  );

  const onPaneClick = useCallback(() => {
    resetHandles(); // ノード外クリックでリセット
  }, [resetHandles]);

  const handleAddMessageNode = () => {
    const id = getId();
    const newNode = {
      id: `${id}`,
      type: "messageNode",
      position: {
        x: 200,
        y: 0,
      },
      data: { label: `${id}` },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <ReactFlowProvider>
      <div style={{ height: "95vh", width: "95vw" }}>
        <div className="flex justify-between">
          <Button onClick={handleAddMessageNode}>Add Node</Button>
          <p>
            CMDキー（Ctrlキー）で複数のハンドルを選択し、他のノードへまとめて引くことができます
          </p>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edgesWithAnimated}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          elevateEdgesOnSelect
          edgesReconnectable={true}
          onReconnect={onReconnect}
          fitView
          className="bg-teal-50"
          snapToGrid={true}
          snapGrid={[20, 20]}
        >
          <Background
            id="1"
            gap={10}
            color="#c0c0c0"
            variant={BackgroundVariant.Dots}
          />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
