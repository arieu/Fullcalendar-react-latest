import React, { useEffect } from "react";

const URL = "https://5aacb25f3f108d00143a567b.mockapi.io/stim/api/v1/events";

export const Load = dispatch => {
  //useEffect(() => {
  return fetch(URL)
    .then(res => res.json())
    .then(data => {
      dispatch({ type: "LOAD", payload: data });
      console.log(dispatch);

      return data;
    });
  //}, []);
};

export const Update = dispatch => {
  console.log("UP");
  useEffect(() => {
    return dispatch => {
      return fetch(URL)
        .then(res => res.json())
        .then(data => {
          //dispatch(data);
          console.log(dispatch);
          console.log(data);
          return data;
        });
    };
  }, []);
};
