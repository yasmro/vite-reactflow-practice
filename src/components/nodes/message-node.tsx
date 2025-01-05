import { useHandleStore } from "@/stores/handleStore";
import {
  Handle,
  Position,
  useConnection,
  useInternalNode,
  useStore,
} from "@xyflow/react";
import clsx from "clsx";
import { MouseEvent, useCallback, useEffect, useRef } from "react";

type MessageNodeType = {
  id: string;
};

const AREA_ACTIONS = [1, 2, 3, 4, 5];
const zoomSelector = (s: { transform: number[] }) => s.transform[2] < 1.2;

export default function MessageNode({ id }: MessageNodeType) {
  const connection = useConnection();
  const node = useInternalNode(id);
  const showPlaceholder = useStore(zoomSelector);
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
    if (event.metaKey || event.ctrlKey) {
      if (selectedHandles.includes(handleId)) {
        removeHandle(handleId);
      } else {
        addHandle(handleId);
      }
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
      className={clsx(
        "relative",
        "px-1 py-3",
        "min-w-[150px] rounded-sm",
        "bg-gradient-to-b from-white to-blue-100",
        "transition-shadow duration-200",
        connection.inProgress &&
          isTarget &&
          "border border-blue-300 hover:border-blue-700  hover:shadow-lg hover:shadow-blue-200 hover:to-blue-100",
        node?.selected || node?.dragging
          ? "border border-blue-700 shadow-lg shadow-blue-200 to-blue-100"
          : "border border-slate-300 shadow-sm shadow-slate-200 to-white"
      )}
    >
      <div>
        <p className="mb-1 font-semibold text-[10px]">
          LINE Message Node #{id}
        </p>
        {/* If handles are conditionally rendered and not present initially, you need to update the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/ */}
        {/* In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at the beginning and all handles are rendered initially. */}
        <div className="flex flex-col gap-0.5">
          {AREA_ACTIONS.map((action, index) => {
            const handleId = `${id}-${action}`;
            return (
              <div
                key={handleId}
                className={clsx(
                  "relative px-1 py-0.25 text-white",
                  connection?.fromHandle?.id === handleId ||
                    selectedHandles.includes(handleId)
                    ? "bg-blue-600"
                    : "bg-slate-900",
                  index === 0 && "rounded-t-sm",
                  index === AREA_ACTIONS.length - 1 && "rounded-b-sm"
                )}
                onClick={(e) => handleHandleClick(e, handleId)}
              >
                <p className="font-semibold text-[10px]">Action #{handleId}</p>
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
          <div className=" w-100 h-100">
            <Handle
              className="customHandle w-100 h-100"
              position={Position.Left}
              type="target"
              isConnectableStart={false}
            />
          </div>
        )}
      </div>
      {showPlaceholder && (
        <div className="absolute top-0 left-0 flex flex-col w-full h-full text-center bg-white/90 backdrop-blur-sm">
          <p className="my-auto text-xl font-semibold">
            LINE Message Node #{id}
          </p>
        </div>
      )}
    </div>
  );
}
