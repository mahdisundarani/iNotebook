import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Resetpassword = (props) => {
  const [credentials, setCredentials] = useState({ password: ""});
  const navigate = useNavigate();
  const {id,token}= useParams()

  const handlSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:5000/api/auth/reset-password/${id}/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: credentials.password,
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
      
      <h2 className="my-3">Reset your password</h2>
      <form onSubmit={handlSubmit}>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
          password 
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={credentials.password}
            onChange={onChange}
            name="password"
            aria-describedby="emailHelp"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
};

export default Resetpassword;
