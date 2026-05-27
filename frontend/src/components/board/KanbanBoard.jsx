import { DragDropContext } from '@hello-pangea/dnd';
import { useDispatch, useSelector } from 'react-redux';
import { moveCard, optimisticMove, fetchBoard, selectColumns, selectCardsByColumn } from '../../store/boardSlice';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard() {
  const dispatch = useDispatch();
  const columns = useSelector(selectColumns);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newColumnId = destination.droppableId;
    dispatch(optimisticMove({ cardId: draggableId, newColumnId }));

    const moveResult = await dispatch(moveCard({ cardId: draggableId, newColumnId }));
    if (moveResult.meta.requestStatus === 'rejected') {
      dispatch(fetchBoard());
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <ColumnWithCards key={column.id} column={column} />
        ))}
      </div>
    </DragDropContext>
  );
}

function ColumnWithCards({ column }) {
  const cards = useSelector(selectCardsByColumn(column.id));
  return <KanbanColumn column={column} cards={cards} />;
}
