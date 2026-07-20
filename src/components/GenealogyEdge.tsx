import { BaseEdge } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

/**
 * Genealogy connector:
 *   parent
 *     |
 *  ---+---   shared horizontal rail
 *  |  |  |
 * child child child
 *
 * Avoids React Flow smoothstep L-bends that drift sideways.
 */
export function GenealogyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  data,
  markerEnd
}: EdgeProps) {
  const preferredRailY =
    typeof data?.railY === 'number'
      ? data.railY
      : sourceY + Math.max(36, (targetY - sourceY) * 0.45);

  // Keep the shared bar strictly between parent and child handles
  const railY = Math.min(
    Math.max(preferredRailY, sourceY + 24),
    Math.max(sourceY + 24, targetY - 24)
  );

  const path = [
    `M ${sourceX} ${sourceY}`,
    `L ${sourceX} ${railY}`,
    `L ${targetX} ${railY}`,
    `L ${targetX} ${targetY}`
  ].join(' ');

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        stroke: '#10b981',
        strokeWidth: 2.5,
        fill: 'none',
        ...style
      }}
      markerEnd={markerEnd}
    />
  );
}
