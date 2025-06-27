import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { sendRequest } from "../../util/axiosUtil";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@mui/material";
import { getCurrentUser } from "../../util/cacheManager";
import { setCurrentUser } from "../../util/cacheManager";



function LoginForm() {
  const [post, setPost] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    
    try {
        //let response = await sendRequest("http://companyuser-env.eba-83m8u3k6.us-east-1.elasticbeanstalk.com/Auth/login", post);
        let response = await sendRequest("https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/Auth", post);
        if (response.status === 200) {
          //console.log("Login successful", response.data);
          setCurrentUser(response.data);
          navigate('/home');
        } else {
          setError("Invalid credentials. Please try again.");
        }
    } catch (e) {
      console.log("Error in login form", e);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Login</h1>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            required
            id="user_email"
            label="Email"
            type="email"
            onChange={(e) => setPost({ ...post, email: e.target.value })}
            fullWidth
          />
          <TextField
            required
            id="user_password"
            label="Password"
            type="password"
            autoComplete="current-password"
            onChange={(e) => setPost({ ...post, password: e.target.value })}
            fullWidth
          />
          <Button variant="contained" type="submit" fullWidth>
            Login
          </Button>
        </Stack>
      </form>
    </div>
  );
}

export default LoginForm;