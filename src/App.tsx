import { FC, useMemo, useEffect, MouseEvent, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { endStroke } from 'modules/sharedActions';
import { beginStroke, updateStroke } from 'modules/currentStroke/slice';
import { currentStrokeSelector } from 'modules/currentStroke/selectors'
import { historyIndexSelector } from 'modules/historyIndex/selectors';
import { strokesSelector } from 'modules/strokes/selectors';

import { drawStroke, clearCanvas, setCanvasSize } from 'utils/canvas';

import useOnMount from 'hooks/useOnMount';

import { useCanvas } from 'contexts/canvas';

import FilePanel from 'components/FilePanel';
import EditPanel from 'components/EditPanel';
import ColorPanel from 'components/ColorPanel';
import BoardPanel from 'components/BoardPanel';
import ModalLayer from 'components/ModalLayer';

const WIDTH = 800;

const HEIGHT = 500;

const App: FC = () => {
  const canvasRef = useCanvas();

  const currentStroke = useSelector(currentStrokeSelector);
  
  const historyIndex = useSelector(historyIndexSelector);

  const strokes = useSelector(strokesSelector);

  const isDrawing = useMemo(() => !!currentStroke.points.length, [currentStroke]);

  const getCanvasAndContext = useCallback(() => ({
    canvas: canvasRef.current,
    context: canvasRef.current?.getContext('2d'),
  }), [canvasRef]);

  const dispatch = useDispatch();

  const startDrawing = ({ nativeEvent }: MouseEvent<HTMLCanvasElement>) => {
    dispatch(beginStroke({
      x: nativeEvent.offsetX,
      y: nativeEvent.offsetY,
    }));
  };

  const endDrawing = () => {
    if (isDrawing) {
      dispatch(endStroke({
        stroke: currentStroke,
        historyLimit: historyIndex,
      }));
    }
  };

  const draw = ({ nativeEvent }: MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      dispatch(updateStroke({
        x: nativeEvent.offsetX,
        y: nativeEvent.offsetY
      }));
    }
  };

  useEffect(() => {
    const { context } = getCanvasAndContext();

    if (!context)  return;

    requestAnimationFrame(() => {
      drawStroke(context, currentStroke.points, currentStroke.color, currentStroke.width);
    });
  }, [currentStroke, getCanvasAndContext]);

  useEffect(() => {
    const { canvas, context } = getCanvasAndContext();
    
    if (!context || !canvas) return;

    requestAnimationFrame(() => {
      clearCanvas(canvas);

      strokes
        .slice(0, strokes.length - historyIndex)
        .forEach((stroke) => {
          drawStroke(context, stroke.points, stroke.color, stroke.width);
        });
    });
  }, [historyIndex, strokes, getCanvasAndContext]);

  useOnMount(() => {
    const { canvas, context } = getCanvasAndContext();

    if (!canvas || !context) return;

    setCanvasSize(canvas, WIDTH, HEIGHT);

    context.lineJoin = "round";
    context.lineCap = "round";
    context.lineWidth = 5;
    context.strokeStyle = "black";

    clearCanvas(canvas);
  });

  return (
    <div className="app">
      <div className="board">
        <canvas
          onMouseDown={startDrawing}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          onMouseMove={draw}
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
        />
      </div>
      <div className="tools">
        <FilePanel />
        <EditPanel />
        <ColorPanel />
        <BoardPanel />
      </div>
      <ModalLayer />
    </div>
  );
};

export default App;
