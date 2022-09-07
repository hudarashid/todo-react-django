import "./App.css";
import React, { Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItems: {
        id: null,
        title: "",
        completed: false,
      },
      editing: false,
    };
    //bind the state with the api
    this.fetchTasks = this.fetchTasks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getCookie = this.getCookie.bind(this);
    this.startEdit = this.startEdit.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.strikeUnstrike = this.strikeUnstrike.bind(this);
  }

  componentWillMount() {
    this.fetchTasks();
  }

  //fetch api here
  fetchTasks() {
    console.log("Fetching API..");
    fetch("http://127.0.0.1:8000/api/task-list/")
      //convert to json object
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          todoList: data,
        })
      );
  }

  //handle change in the task input
  handleChange(e) {
    //grab the input field by name prop = 'title'
    var name = e.target.name;
    // grab the value of the input field
    var value = e.target.value;

    console.log("Name: ", name);
    console.log("Value: ", value);

    //set the task with new value
    this.setState({
      activeItems: {
        ...this.state.activeItems,
        title: value,
      },
    });
  }

  //create cookies to send data in the api header to django
  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  //submit the form
  handleSubmit(e) {
    e.preventDefault();
    console.log("ITEM: ", this.state.activeItems);

    const csrftoken = this.getCookie("csrftoken");

    //fetch url
    var url = "http://127.0.0.1:8000/api/task-create/";

    //if 'edit' button is pressed, then change the url to /task-update/
    if (this.state.editing == true) {
      url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItems.id}`;
      this.setState({
        editing: false,
      });
    }

    //send the data
    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(this.state.activeItems),
    })
      .then((response) => {
        //if success, list out the item
        this.fetchTasks();
        //then, set the input field state to the inital item
        this.setState({
          activeItems: {
            id: null,
            title: "",
            completed: false,
          },
        });
      })
      .catch(function (error) {
        console.log("!ERROR: ", error);
      });
  }

  startEdit(task) {
    this.setState({
      activeItems: task,
      editing: true,
    });
  }

  deleteItem(task) {
    const csrftoken = this.getCookie("csrftoken");

    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
    })
      //after delete success, get the list of all task
      .then((response) => {
        this.fetchTasks();
      });
  }

  strikeUnstrike(task) {
    task.completed = !task.completed;
    const csrftoken = this.getCookie("csrftoken");
    var url = `http://127.0.0.1:8000/api/task-update/${task.id}`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({ completed: task.completed, title: task.title }),
    }).then(() => {
      this.fetchTasks();
    });

    console.log("TASK :", task);
  }

  render() {
    var tasks = this.state.todoList;
    //self is refering to this 'task' line 119
    var self = this;
    return (
      <div className="container">
        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div style={{ flex: 6 }}>
                  <input
                    onChange={this.handleChange}
                    className="form-control"
                    id="title"
                    type="text"
                    name="title"
                    value={this.state.activeItems.title}
                    placeholder="Add task.."
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <input
                    id="submit"
                    className="btn btn-warning"
                    type="submit"
                    name="Add"
                  />
                </div>
              </div>
            </form>
          </div>

          <div id="list-wrapper">
            {tasks.map((task, index) => (
              <div key={index} className="task-wrapper flex-wrapper">
                <div
                  onClick={() => self.strikeUnstrike(task)}
                  style={{ flex: 7 }}
                >
                  {task.completed == false ? (
                    <span>{task.title}</span>
                  ) : (
                    <strike>{task.title}</strike>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <button
                    onClick={() => self.startEdit(task)}
                    className="btn btn-sm btn-outline-info"
                  >
                    Edit
                  </button>
                </div>

                <div style={{ flex: 1 }}>
                  <button
                    onClick={() => self.deleteItem(task)}
                    className="btn btn-sm btn-outline-dark delete"
                  >
                    -
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
