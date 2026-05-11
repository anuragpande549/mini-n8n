import React, { memo } from "react";
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "reactflow";
import { X } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  selected,
}: EdgeProps) {
  const { deleteEdge } = useWorkflowStore();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Edge Path */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: selected ? "#3b82f6" : "#9ca3af",
          ...style,
        }}
      />

      {/* Delete Button */}
      <EdgeLabelRenderer>
        <div
          className="absolute nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteEdge(id);
            }}
            className={`
              flex items-center justify-center
              w-6 h-6
              rounded-full
              border
              border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-800
              shadow-md
              transition-all duration-200
              hover:scale-110
              hover:bg-red-500
              hover:text-white
              text-gray-500
            `}
            title="Delete Edge"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);