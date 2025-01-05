import { useCallback, useMemo, useState } from "react";
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
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { Button } from "./components/ui/button";

import "@xyflow/react/dist/style.css";
import MessageNode from "./components/nodes/message-node";

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

  const onConnect = useCallback(
    (params: Connection) => {
      console.log(params);
      setEdges((eds) => {
        const distinctedEdges = eds.filter(
          (edge) =>
            edge.source !== params.source ||
            edge.sourceHandle !== params.sourceHandle
        );
        return addEdge({ ...params, type: "smoothstep" }, distinctedEdges);
      });
    },
    [setEdges]
  );

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
    <>
      <div style={{ height: "100vh", width: "100vw" }}>
        <Button onClick={handleAddMessageNode}>Add Node</Button>
        <ReactFlow
          nodes={nodes}
          edges={edgesWithAnimated}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
    </>
  );
}

export default App;
