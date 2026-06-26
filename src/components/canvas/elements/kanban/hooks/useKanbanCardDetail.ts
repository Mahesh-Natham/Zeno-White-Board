import { useState, useEffect } from 'react';
import { KanbanData, KanbanCard } from '../types';

interface UseKanbanCardDetailProps {
  card: KanbanCard | undefined;
  openCardId: string | null;
  setOpenCardId: (id: string | null) => void;
  data: KanbanData;
  onUpdateData: (updates: Partial<KanbanData>) => void;
}

export function useKanbanCardDetail({
  card,
  openCardId,
  setOpenCardId,
  data,
  onUpdateData,
}: UseKanbanCardDetailProps) {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<KanbanCard['priority']>('none');
  const [estimationPoints, setEstimationPoints] = useState<number | undefined>(undefined);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isMilestone, setIsMilestone] = useState(false);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [checklists, setChecklists] = useState<KanbanCard['checklists']>([]);
  const [coverColor, setCoverColor] = useState<string | undefined>(undefined);
  
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');

  // Sync state when card changes
  useEffect(() => {
    if (card) {
      setDescription(card.description || '');
      setTitle(card.title || '');
      setPriority(card.priority || 'none');
      setEstimationPoints(card.estimationPoints);
      setLabelIds(card.labelIds || []);
      setAssigneeIds(card.assigneeIds || []);
      setChecklists(card.checklists || []);
      setCoverColor(card.coverColor);
      setDueDate(card.dueDate ? card.dueDate.split('T')[0] : '');
      setStartDate(card.startDate ? card.startDate.split('T')[0] : '');
      setIsMilestone(!!card.isMilestone);
    }
  }, [card]);

  const saveCardChanges = () => {
    if (!openCardId) return;
    const updatedCards = data.cards.map(c => 
      c.id === openCardId ? { 
        ...c, 
        title, 
        description, 
        priority, 
        estimationPoints, 
        labelIds, 
        assigneeIds, 
        checklists, 
        coverColor, 
        isMilestone,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined 
      } : c
    );
    onUpdateData({ cards: updatedCards });
  };

  const handleClose = () => {
    saveCardChanges();
    setOpenCardId(null);
  };

  const handleDuplicate = () => {
    if (!card) return;
    saveCardChanges(); // Save current before duplicating
    
    const newCard = {
      ...card,
      id: `card-${Date.now()}`,
      title: `${title} (Copy)`,
      description,
      priority,
      estimationPoints,
      labelIds,
      assigneeIds,
      checklists,
      coverColor,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      number: data.nextCardNumber,
      position: card.position + 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdateData({ 
      cards: [...data.cards, newCard],
      nextCardNumber: data.nextCardNumber + 1
    });
    setOpenCardId(newCard.id);
  };

  const handleArchive = () => {
    if (!card) return;
    onUpdateData({ 
      cards: data.cards.map(c => c.id === card.id ? { ...c, isArchived: true } : c)
    });
    setOpenCardId(null);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      const updatedCards = data.cards.filter(c => c.id !== openCardId);
      onUpdateData({ cards: updatedCards });
      setOpenCardId(null);
    }
  };

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) return;
    const newLabel = {
      id: `label-${Date.now()}`,
      name: newLabelName.trim(),
      color: newLabelColor,
    };
    onUpdateData({ labels: [...(data.labels || []), newLabel] });
    setLabelIds([...labelIds, newLabel.id]);
    setNewLabelName('');
    setIsAddingLabel(false);
  };

  const toggleLabel = (labelId: string) => {
    setLabelIds(prev => prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]);
  };

  const toggleAssignee = (userId: string) => {
    setAssigneeIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleAddChecklist = () => {
    const newChecklist = {
      id: `checklist-${Date.now()}`,
      title: 'Checklist',
      items: [],
      position: checklists ? checklists.length * 1000 : 1000,
    };
    setChecklists([...(checklists || []), newChecklist]);
  };

  const handleAddChecklistItem = (checklistId: string, text: string) => {
    if (!text.trim()) return;
    const newItem = {
      id: `item-${Date.now()}`,
      text: text.trim(),
      isCompleted: false,
      position: Date.now(),
    };
    setChecklists((checklists || []).map(cl => 
      cl.id === checklistId ? { ...cl, items: [...cl.items, newItem] } : cl
    ));
  };

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists((checklists || []).map(cl => 
      cl.id === checklistId 
        ? { ...cl, items: cl.items.map(i => i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i) }
        : cl
    ));
  };

  // Optional: Auto-save on unmount or specific actions can be implemented using `saveCardChanges`

  return {
    formState: {
      title,
      description,
      priority,
      estimationPoints,
      labelIds,
      dueDate,
      startDate,
      isMilestone,
      assigneeIds,
      checklists,
      coverColor,
    },
    setters: {
      setTitle,
      setDescription,
      setPriority,
      setEstimationPoints,
      setDueDate,
      setStartDate,
      setIsMilestone,
      setCoverColor,
    },
    uiState: {
      isAddingLabel,
      newLabelName,
      newLabelColor,
    },
    uiSetters: {
      setIsAddingLabel,
      setNewLabelName,
      setNewLabelColor,
    },
    actions: {
      handleClose,
      handleDuplicate,
      handleArchive,
      handleDelete,
      handleCreateLabel,
      toggleLabel,
      toggleAssignee,
      handleAddChecklist,
      handleAddChecklistItem,
      toggleChecklistItem,
      saveCardChanges,
    }
  };
}
