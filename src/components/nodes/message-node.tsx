import { useHandleStore } from "@/stores/handleStore";
import {
  Handle,
  Position,
  useConnection,
  useInternalNode,
} from "@xyflow/react";
import { MouseEvent, useCallback, useEffect, useRef } from "react";

type MessageNodeType = {
  id: string;
};

const AREA_ACTIONS = [1, 2, 3, 4, 5];

export default function MessageNode({ id }: MessageNodeType) {
  const connection = useConnection();
  const node = useInternalNode(id);
  const isTarget = connection.inProgress && connection.fromNode.id !== id;

  const { selectedHandles, addHandle, removeHandle, resetHandles } =
    useHandleStore();

  const nodeRef = useRef<HTMLDivElement | null>(null);

  // ハンドルのクリック処理
  const handleHandleClick = (
    event: MouseEvent<HTMLDivElement>,
    handleId: string
  ) => {
    event.stopPropagation(); // 他のクリックイベントとの干渉を防ぐ
    if (selectedHandles.includes(handleId)) {
      removeHandle(handleId);
    } else {
      addHandle(handleId);
    }
  };

  // ノード外クリック時のリセット処理
  const handleClickOutside = useCallback(
    (event: Event) => {
      if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
        resetHandles();
      }
    },
    [resetHandles]
  );

  // イベントリスナーの登録と解除
  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div
      ref={nodeRef}
      className={
        "px-1 py-3 min-w-[150px] rounded-sm bg-white border bg-gradient-to-b from-white to-blue-100  " +
        (connection.inProgress && isTarget
          ? "border-blue-300 hover:border-blue-700  hover:shadow-lg hover:shadow-blue-200 hover:to-blue-100   "
          : "") +
        (node?.selected || node?.dragging
          ? "border-blue-700 shadow-lg shadow-blue-200 to-blue-100  "
          : "border-slate-300 shadow-sm shadow-slate-200 to-white ")
      }
    >
      <div>
        <p className="text-sm mb-1">LINE Message Node</p>
        {/* If handles are conditionally rendered and not present initially, you need to update the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/ */}
        {/* In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at the beginning and all handles are rendered initially. */}
        <div className="flex flex-col gap-1">
          {AREA_ACTIONS.map((action) => {
            const handleId = `${id}-${action}`;
            return (
              <div
                key={handleId}
                className={
                  "relative px-1 py-0.5  text-white " +
                  (connection?.fromHandle?.id === handleId ||
                  selectedHandles.includes(handleId)
                    ? "bg-blue-600 "
                    : "bg-slate-900 ")
                }
                onClick={(e) => handleHandleClick(e, handleId)}
              >
                <p>Action #{handleId}</p>
                <Handle
                  className="customHandle"
                  id={handleId}
                  position={Position.Right}
                  type="source"
                />
              </div>
            );
          })}
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
