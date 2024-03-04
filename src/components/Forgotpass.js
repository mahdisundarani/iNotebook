import React, { useState } from "react";

const Forgotpass = (props) => {
  const [credentials, setCredentials] = useState({ email: ""});

  const handlSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:5000/api/auth/forgotpass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
      }),
    });
    const json = await response.json();
    console.log(json);
    if (!json.success) {
      // save the auth token and redirect
      props.showAlert("Check you email ", "success");
    } else {
      console.log("error")
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
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={credentials.email}
            onChange={onChange}
            name="email"
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

export default Forgotpass;
