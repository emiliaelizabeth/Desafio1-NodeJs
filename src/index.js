const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user  = users.find( (user) => user.username === username);

  if( !user ) {
    return response.status(404).json({error: "User not found."});
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if ( userAlreadyExists ) {
    return response.status(201).json({error: "User already exists."});
  }

  const user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { user } = request;

  newTodo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json(user.todos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);
  if ( !todo ) {
    return response.status(404).json({erro: "Todo not found."})
  }
  todo.title = title;
  todo.deadline = deadline;

  return response.send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);
  if ( !todo ) {
    return response.status(404).json({erro: "Todo not found."})
  }
  todo.done = true;

  return response.send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { user } = request;

  const indexTodo = user.todos.findIndex((todo) => todo.id === id);
  if (indexTodo === -1 ) {
    return response.status(204).json({error: "Todo not found."});
  }

  user.todos.splice(indexTodo, 1);

  return response.json(user.todos);
});

module.exports = app;