import { Droppable, Draggable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ column, cards }) {
  return (
    <div className="flex min-w-[260px] flex-1 flex-col rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
      <h2 className="mb-3 px-1 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
        {column.label}
      </h2>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-3 min-h-[120px] rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
          >
            {cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={dragSnapshot.isDragging ? 'opacity-90 rotate-1' : ''}
                  >
                    <KanbanCard card={card} index={index} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
