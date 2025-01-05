import { useCallback, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { Button } from "./components/ui/button";

import "@xyflow/react/dist/style.css";
import MessageNode from "./components/nodes/message-node";
import { useHandleStore } from "./stores/handleStore";

let id = 3;
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
        // 選択されているハンドルに基づいて複数エッジを作成
        const newEdges = [...selectedHandles, params.sourceHandle].map(
          (handleId) => ({
            id: `${params.source}-${handleId}-${params.target}`,
            source: params.source,
            sourceHandle: handleId,
            target: params.target,
            type: "smoothstep",
          })
        );

        // 接続元のエッジをフィルタリングして、新しいエッジで上書き
        const distinctedEdges = eds.filter(
          (edge) =>
            edge.source !== params.source ||
            !selectedHandles.includes(edge.sourceHandle || "")
        );

        return [...distinctedEdges, ...newEdges];
      });

      // 接続後にハンドル選択状態をリセット
      resetHandles();
    },
    [selectedHandles, setEdges, resetHandles]
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
      <div style={{ height: "100vh", width: "100vw" }}>
        <Button onClick={handleAddMessageNode}>Add Node</Button>

        <ReactFlow
          nodes={nodes}
          edges={edgesWithAnimated}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          elevateEdgesOnSelect
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
