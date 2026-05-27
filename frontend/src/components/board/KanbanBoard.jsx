import { DragDropContext } from '@hello-pangea/dnd';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { moveCard, optimisticMove, fetchBoard, selectColumns, selectCardsByColumn } from '../../store/boardSlice';
import KanbanColumn from './KanbanColumn';
import CardDetailsModal from './CardDetailsModal';

export default function KanbanBoard() {
  const dispatch = useDispatch();
  const columns = useSelector(selectColumns);
  const [selectedCard, setSelectedCard] = useState(null);
  const movingRef = useRef(new Set());

  const openCardDetails = (card) => {
    setSelectedCard(card);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newColumnId = destination.droppableId;
    if (movingRef.current.has(draggableId)) return;
    movingRef.current.add(draggableId);
    dispatch(optimisticMove({ cardId: draggableId, newColumnId }));

    try {
      const moveResult = await dispatch(moveCard({ cardId: draggableId, newColumnId }));
      if (moveResult.meta.requestStatus === 'rejected') {
        dispatch(fetchBoard());
      }
    } finally {
      movingRef.current.delete(draggableId);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <ColumnWithCards key={column.id} column={column} onCardClick={openCardDetails} />
        ))}
        </div>
      </DragDropContext>
      <CardDetailsModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </>
  );
}

function ColumnWithCards({ column, onCardClick }) {
  const cards = useSelector(selectCardsByColumn(column.id));
  return <KanbanColumn column={column} cards={cards} onCardClick={onCardClick} />;
}
