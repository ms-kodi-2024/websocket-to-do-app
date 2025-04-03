import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState('');

  useEffect(() => {
    const socketInstance = io('ws://localhost:8000', { transports: ['websocket'] });
    setSocket(socketInstance);
    socketInstance.on('updateData', (data) => {
      setTasks(data);
    });
    socketInstance.on('addTask', (task) => {
      addTask(task, false);
    });
    socketInstance.on('removeTask', (id) => {
      removeTask(id, false);
    });
    socketInstance.on('editTask', (updatedTask) => {
      editTask(updatedTask, false);
    });
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const addTask = (task, emit = true) => {
    setTasks(prevTasks => [...prevTasks, task]);
    if (emit && socket) {
      socket.emit('addTask', task);
    }
  };

  const removeTask = (id, emit = true) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    if (emit && socket) {
      socket.emit('removeTask', id);
    }
  };

  const editTask = (updatedTask, emit = true) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    if (emit && socket) {
      socket.emit('editTask', updatedTask);
    }
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (taskName.trim() === '') return;
    const newTask = { id: uuidv4(), name: taskName.trim() };
    addTask(newTask);
    setTaskName('');
  };

  const submitEdit = (id) => {
    if (editingTaskName.trim() === '') return;
    const updatedTask = { id, name: editingTaskName.trim() };
    editTask(updatedTask);
    setEditingTaskId(null);
    setEditingTaskName('');
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskName('');
  };

  return (
    <div className="App">
      <header>
        <h1>ToDoList.app</h1>
      </header>
      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>
        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map(task => (
            <li key={task.id} className="task">
              {editingTaskId === task.id ? (
                <>
                  <input
                    type="text"
                    className="text-input"
                    value={editingTaskName}
                    onChange={(e) => setEditingTaskName(e.target.value)}
                  />
                  <button className="btn" onClick={() => submitEdit(task.id)}>Save</button>
                  <button className="btn btn--red" onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <span>{task.name}</span>
                  <div>
                    <button
                      className="btn"
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditingTaskName(task.name);
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn btn--red" onClick={() => removeTask(task.id)}>
                      Remove
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        <form id="add-task-form" onSubmit={submitForm}>
          <input
            className="text-input"
            autoComplete="off"
            type="text"
            placeholder="Type your description"
            id="task-name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <button className="btn" type="submit">Add</button>
        </form>
      </section>
    </div>
  );
};

export default App;
