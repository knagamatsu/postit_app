import React, { useState, useMemo } from 'react';
import { X, Search, Grid, List } from 'lucide-react';

const colors = ['bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-red-200', 'bg-purple-200', 'bg-pink-200'];

const PostitApp = () => {
  const [postits, setPostits] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid');
  const [maxZIndex, setMaxZIndex] = useState(1);

  const addPostit = () => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    const newPostit = {
      id: Date.now(),
      text: '',
      color: colors[Math.floor(Math.random() * colors.length)],
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      createdAt: new Date(),
      updatedAt: new Date(),
      zIndex: newZIndex
    };
    setPostits([...postits, newPostit]);
  };

  const updatePostitText = (id, text) => {
    setPostits(postits.map(postit => 
      postit.id === id ? { ...postit, text, updatedAt: new Date() } : postit
    ));
  };

  const movePostit = (id, newPosition) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setPostits(postits.map(postit => 
      postit.id === id ? { ...postit, position: newPosition, zIndex: newZIndex } : postit
    ));
  };

  const deletePostit = (id) => {
    setPostits(postits.filter(postit => postit.id !== id));
  };

  const filteredAndSortedPostits = useMemo(() => {
    return postits
      .filter(postit => filter === 'all' || postit.color === filter)
      .filter(postit => postit.text.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b[sortBy]) - new Date(a[sortBy]));
  }, [postits, filter, sortBy, searchTerm]);

  const stats = useMemo(() => {
    const colorCounts = postits.reduce((acc, postit) => {
      acc[postit.color] = (acc[postit.color] || 0) + 1;
      return acc;
    }, {});
    return { total: postits.length, colorCounts };
  }, [postits]);

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-white shadow-lg p-4">
        <h2 className="text-xl font-bold mb-4">Postit App</h2>
        <button 
          onClick={addPostit}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Add Postit
        </button>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Filter by Color</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Colors</option>
            {colors.map(color => (
              <option key={color} value={color}>{color.replace('bg-', '').replace('-200', '')}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Sort by</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Search</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search postits..."
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">View</label>
          <div className="mt-2 flex justify-around">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-gray-200' : ''}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-gray-200' : ''}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Statistics</h3>
          <p>Total Postits: {stats.total}</p>
          {Object.entries(stats.colorCounts).map(([color, count]) => (
            <p key={color}>{color.replace('bg-', '').replace('-200', '')}: {count}</p>
          ))}
        </div>
      </nav>
      <main className="flex-1 p-4 overflow-auto">
        {view === 'grid' ? (
          <div className="relative h-full">
            {filteredAndSortedPostits.map(postit => (
              <Postit
                key={postit.id}
                postit={postit}
                updateText={updatePostitText}
                movePostit={movePostit}
                deletePostit={deletePostit}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedPostits.map(postit => (
              <ListPostit
                key={postit.id}
                postit={postit}
                updateText={updatePostitText}
                deletePostit={deletePostit}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const Postit = ({ postit, updateText, movePostit, deletePostit }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - postit.position.x,
      y: e.clientY - postit.position.y
    });
    movePostit(postit.id, postit.position); // This will update the zIndex
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      movePostit(postit.id, {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div
      className={`absolute ${postit.color} w-48 h-56 p-2 shadow-md cursor-move`}
      style={{
        left: `${postit.position.x}px`,
        top: `${postit.position.y}px`,
        zIndex: postit.zIndex
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <textarea
        className="w-full h-32 bg-transparent resize-none focus:outline-none"
        value={postit.text}
        onChange={(e) => updateText(postit.id, e.target.value)}
      />
      <div className="text-xs mt-2">
        <p>Created: {formatDate(postit.createdAt)}</p>
        <p>Updated: {formatDate(postit.updatedAt)}</p>
      </div>
      <button
        onClick={() => deletePostit(postit.id)}
        className="absolute top-1 right-1 text-red-500 hover:text-red-700"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const ListPostit = ({ postit, updateText, deletePostit }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className={`${postit.color} p-4 rounded-lg shadow`}>
      <textarea
        className="w-full bg-transparent resize-none focus:outline-none mb-2"
        value={postit.text}
        onChange={(e) => updateText(postit.id, e.target.value)}
      />
      <div className="text-xs">
        <p>Created: {formatDate(postit.createdAt)}</p>
        <p>Updated: {formatDate(postit.updatedAt)}</p>
      </div>
      <button
        onClick={() => deletePostit(postit.id)}
        className="mt-2 text-red-500 hover:text-red-700"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default PostitApp;