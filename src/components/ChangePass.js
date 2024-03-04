import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChangePass = (props) => {
  const [credentials, setCredentials] = useState({ CurrentPassword: "",NewPassword:"",ConfirmPassword:""});
  const {CurrentPassword,NewPassword,ConfirmPassword} = credentials
  const navigate = useNavigate();
  const token = localStorage.getItem('token')
  const handlSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:5000/api/auth/change-pass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authentication": `${token}`
      },
      body: JSON.stringify({
        CurrentPassword,
        NewPassword,
        ConfirmPassword
      }),
    });
    const json = await response.json();
    console.log(json);
    if (!json.success) {
      // save the auth token and redirect
      props.showAlert("password changed successfully ", "success");
      navigate("/login");
    } 
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };
  
  return (
    <div className="mt-2">
      <h2 className="my-3">Change your password</h2>
      <form onSubmit={handlSubmit}>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
          Current password 
          </label>
          <input
            type="password"
            className="form-control"
            id="CurrentPassword"
            value={CurrentPassword}
            onChange={onChange}
            name="CurrentPassword"
            aria-describedby="emailHelp"
          />
          <label htmlFor="password" className="form-label">
          NewPassword 
          </label>
          <input
            type="password"
            className="form-control"
            id="NewPassword"
            value={NewPassword}
            onChange={onChange}
            name="NewPassword"
            aria-describedby="emailHelp"
          />
          <label htmlFor="password" className="form-label">
          ConfirmPassword 
          </label>
          <input
            type="password"
            className="form-control"
            id="ConfirmPassword"
            value={ConfirmPassword}
            onChange={onChange}
            name="ConfirmPassword"
            aria-describedby="emailHelp"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ChangePass;
