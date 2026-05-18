'use client';

import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { useDebounce } from 'use-debounce';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactNode;
  debounceMs?: number;
}

function VirtualizedList<T>({ 
  items, 
  itemHeight, 
  height, 
  renderItem,
  debounceMs = 300 
}: VirtualizedListProps<T>) {
  const [debouncedItems] = useDebounce(items, debounceMs);

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No items to display
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={debouncedItems.length}
      itemSize={itemHeight}
      itemData={debouncedItems}
      className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
    >
      {renderItem}
    </List>
  );
}

export default React.memo(VirtualizedList) as typeof VirtualizedList;
