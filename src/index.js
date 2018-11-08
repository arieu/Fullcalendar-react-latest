import React, { useReducer, useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Load, Update } from "./apiFetch";
//import "./styles.css";
import { Calendar, formatDate } from "fullcalendar";
import "fullcalendar/dist/fullcalendar.css";

const URL = "https://5aacb25f3f108d00143a567b.mockapi.io/stim/api/v1/events";
const initialState = null;
const appReducer = (state, action) => {
  switch (action.type) {
    case "LOAD":
      console.log("loaded", action.payload);
      return [...action.payload];
    default:
      return state;
  }
};

const useStore = () => {
  //const [store, setStore] = useState({ name: "Initial " });
  const [state, dispatch] = useReducer(appReducer, initialState);
  useEffect(
    () => {
      if (!state) {
        Load(dispatch);
      }
    },
    [state]
  );
  console.log("USE_STORE", state);

  return [state, dispatch];
};
// I would need different states for loading and updating data.
const useFetch = request => {
  const [state, setState] = useState(null);
  const [calView, setCalView] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(null);

  //console.log('IN Fetch',calView)

  const URL = "https://5aacb25f3f108d00143a567b.mockapi.io/stim/api/v1/events";
  useEffect(
    () => {
      if (!state) {
        fetch(URL)
          .then(res => res.json())
          .then(data => {
            setState(data);
          });
      } else if (editEvent) {
        fetch(`${URL}/${editEvent.id}`, {
          method: "put",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(editEvent)
        })
          .then(res => res.json())
          .then(data => {
            console.log("API Returned ", data);
            const newStore = [
              ...state.filter(currEvents => {
                return currEvents.id !== data.id;
              }),
              data
            ];

            setState(newStore);
          })
          .catch(err => console.log("ERROR", err));
      } else if (newEvent) {
        fetch(URL, {
          method: "post",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(newEvent)
        })
          .then(res => res.json())
          .then(data => {
            const newStore = [
              ...state.filter(currEvents => {
                return currEvents.id !== data.id;
              }),
              data
            ];
            setState(newStore);
          })
          .catch(err => console.log("ERROR", err));
      }
    },
    [editEvent, newEvent]
  );
  return [state, setEditEvent, setNewEvent, calView, setCalView];
};

function CalendarApp() {
  const [events, setEditEvent, setNewEvent, calView, setCalView] = useFetch();

  const myRef = useRef();

  useEffect(
    () => {
      const calNode = myRef.current;
      //const cali = document.getElementById('calendar')
      const calendar = new Calendar(calNode, {
        // defaultView: calView.type,
        handleWindowResize: true,
        editable: true,
        height: 800,
        header: {
          left: "prev, next today",
          center: "title",
          right: "month, agendaWeek, agendaDay",
          eventLimit: true
        },
        //timeZone: "UTC",
        minTime: "07:00:00",
        maxTime: "21:00:00",
        slotDuration: "00:30:00",
        events,
        eventLimit: true, // for all non-agenda views
        views: {
          agenda: {
            eventLimit: 5 // adjust to 6 only for agendaWeek/agendaDay
          }
        },
        viewSkeletonRender: e => {
          const currentViewRange = {
            type: e.view.type,
            start: e.view.dateProfile.currentRange.start
              .toISOString()
              .split("T", 1)
              .toString(),
            end: e.view.dateProfile.currentRange.end
              .toISOString()
              .split("T", 1)
              .toString()
          };
          const viewCurrent = calendar.getView();
          console.log("View Current", e);
        },
        datesRender: e => {
          const call = calendar.getView();
          const currentViewRange = {
            type: e.view.type,
            start: e.view.dateProfile.currentRange.start
              .toISOString()
              .split("T", 1)
              .toString(),
            end: e.view.dateProfile.currentRange.end
              .toISOString()
              .split("T", 1)
              .toString()
          };
          if (!calView) {
            setCalView({ type: "agenda", start: currentViewRange.start });
          }
          console.log("not equal", e.view.type);
        },
        allDayMaintainDuration: false,
        forceEventDuration: true,
        defaultTimedEventDuration: "01:00",
        eventClick: current => {
          console.log(current.event.start);
          console.log(current.event.end);
          const id = current.event.id;
        },
        eventDragStart: current => {
          //console.log("DragStart", current);
        },
        eventDragStop: current => {
          //console.log("DragStop", current);
        },
        eventDrop: current => {
          const { id, start, end, allDay } = current.event;
          setEditEvent({ ...current.event.def, id, start, end });
        },
        eventResize: e => {
          const { id, start, end } = e.event;
          setEditEvent({ ...e.event.def, id, start, end });
        }
      });
      calendar.render();
      const cal = calendar.getView();
      console.log("Cal", cal);
      // calendar.changeView(calView.type, {
      //   start: calView.start,
      //   end: calView.end
      // });

      myRef.current.calRef = calendar;
      //console.log("fired");
      return () => {
        calendar.destroy(); //Cleanup calendar after code changes.
      };
    },
    [events]
  );

  function handleAdd(event) {
    myRef.current.calRef.addEvent({
      title: "Jean 6",
      start: "2018-11-07T12:30:00",
      end: "2018-11-07T013:30:00",
      editable: true,
      backgroundColor: "#BF75D6"
    });
    // setNewEvent({
    //   title: "Jean 5",
    //   start: "2018-11-15T12:30:00",
    //   end: "2018-11-15T013:30:00",
    //   editable: true,
    //   backgroundColor: "#BF75D6"
    // });
  }
  return (
    <div>
      <div id="calendar" />
      <div ref={myRef} />
      <button onClick={() => handleAdd()}>Click Me</button>
    </div>
  );
}

const App = () => {
  return (
    <>
      <CalendarApp />
    </>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
