import {
  Handle,
  Position,
  useConnection,
  useInternalNode,
} from "@xyflow/react";

type MessageNodeType = {
  id: string;
};

const AREA_ACTIONS = [1, 2, 3, 4, 5];

export default function MessageNode({ id }: MessageNodeType) {
  const connection = useConnection();
  const node = useInternalNode(id);
  const isTarget = connection.inProgress && connection.fromNode.id !== id;

  const label = isTarget ? "Drop here" : "Drag to connect";

  return (
    <div
      className={
        "px-1 py-3 min-w-[150px] rounded-sm bg-white border border-slate-300 " +
        (connection.inProgress && isTarget ? "hover:border-blue-700 " : "") +
        (node?.selected ? "border-blue-700 " : "")
      }
    >
      <div>
        {label}
        {/* If handles are conditionally rendered and not present initially, you need to update the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/ */}
        {/* In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at the beginning and all handles are rendered initially. */}
        <div className="flex flex-col gap-1">
          {AREA_ACTIONS.map((action) => (
            <div className="relative px-1 py-0.5 bg-slate-800 text-white">
              <p>Action #{action}</p>
              <Handle
                className="customHandle"
                id={`${id}-${action}`}
                position={Position.Right}
                type="source"
              />
            </div>
          ))}
        </div>

        {/* We want to disable the target handle, if the connection was started from this node */}
        {(!connection.inProgress || isTarget) && (
          <div className=" w-100 h-100 bg-orange-200">
            <Handle
              className="customHandle w-100 h-100"
              position={Position.Left}
              type="target"
              isConnectableStart={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
