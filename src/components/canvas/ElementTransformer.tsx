import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import useCanvasStore from '../../store/canvasStore';

export default function ElementTransformer({ selectedIds, elements, onChange }) {
  const transformerRef = useRef(null);
  const setIsTransforming = useCanvasStore(state => state.setIsTransforming);

  useEffect(() => {
    if (!transformerRef.current) return;

    const transformer = transformerRef.current;
    const stage = transformer.getStage();

    if (selectedIds.length === 0) {
      transformer.nodes([]);
      return;
    }

    // Find nodes by ID and exclude locked elements
    const selectedNodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((node) => {
        if (!node) return false;
        const elId = node.id();
        const elementData = elements[elId];
        return elementData && !elementData.locked;
      });

    // Attach transformer to nodes
    transformer.nodes(selectedNodes);
    transformer.getLayer().batchDraw();
  }, [selectedIds, elements]); // Re-run if elements change so transformer bounds update

  const isSingleStickyNote = selectedIds.length === 1 && elements[selectedIds[0]]?.type === 'sticky_note';

  return (
    <Transformer
      ref={transformerRef}
      keepRatio={isSingleStickyNote}
      enabledAnchors={isSingleStickyNote ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] : ['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left']}
      boundBoxFunc={(oldBox, newBox) => {
        // Minimum bounding box limits
        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
          return oldBox;
        }
        return newBox;
      }}
      onTransformStart={() => setIsTransforming(true)}
      onTransformEnd={() => {
        setIsTransforming(false);
        const transformer = transformerRef.current;
        const nodes = transformer.nodes();
        const updates = [];

        nodes.forEach(node => {
          const id = node.id();
        
        // We could just save scale, but saving actual width/height is usually 
        // better for downstream properties panels
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        // Bake the magnitude of scale into width/height, but preserve flips (negative scale)
        const signX = Math.sign(scaleX) || 1;
        const signY = Math.sign(scaleY) || 1;

        const newWidth = Math.max(5, node.width() * Math.abs(scaleX));
        const newHeight = Math.max(5, node.height() * Math.abs(scaleY));
          
        let newFontSize = elements[id]?.fontSize;
        if (elements[id]?.type === 'sticky_note' || elements[id]?.type === 'text') {
          const avgScale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2;
          newFontSize = Math.max(2, Math.round(elements[id].fontSize * avgScale));
        }
          
        node.scaleX(signX);
        node.scaleY(signY);

          updates.push({
            id,
            oldProps: {
              x: elements[id]?.x,
              y: elements[id]?.y,
              width: elements[id]?.width,
              height: elements[id]?.height,
              rotation: elements[id]?.rotation,
              scaleX: elements[id]?.scaleX,
              scaleY: elements[id]?.scaleY,
              fontSize: elements[id]?.fontSize,
            },
            newProps: {
              x: node.x(),
              y: node.y(),
              width: newWidth,
              height: newHeight,
              rotation: node.rotation(),
              scaleX: signX,
              scaleY: signY,
              fontSize: newFontSize,
            }
          });
        });

        if (updates.length > 0) {
          onChange(updates);
        }
      }}
    />
  );
}
