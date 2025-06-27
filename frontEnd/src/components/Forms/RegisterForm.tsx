import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import axios from "axios";
import Stack from "@mui/material/Stack";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

function RegisterForm() {
  const [searchParams] = useSearchParams();
  const [post, setPost] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    companyId: "",
    areaId: ""
  });
  const [status, setStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({
    loading: false,
    error: null,
    success: false
  });

  useEffect(() => {
    const token = searchParams.get('token');
    const emailUser = searchParams.get('email');
    const CompanyId = searchParams.get('id');
    const AreaId = searchParams.get('areaId')
  
    if (token) setPost(prev => ({ ...prev, id: token }));
    if (emailUser) setPost(prev => ({ ...prev, email: emailUser }));
    if (CompanyId) setPost(prev => ({ ...prev, companyId: CompanyId }));
    if (AreaId) setPost(prev => ({ ...prev, areaId: AreaId }));
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setStatus({ loading: true, error: null, success: false });
    
    try {
        const response = await axios.post("http://companyuser-env.eba-83m8u3k6.us-east-1.elasticbeanstalk.com/User/register", post);
      if (response.status === 200 || response.status === 201) {
            setStatus({
                loading: false,
                error: null,
                success: true
            });
        }
    } catch (error) {
        let errorMessage = "Failed to send invitation";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setStatus({
          loading: false,
          error: errorMessage,
          success: false
        });
      }
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Register
      </Typography>
      
      {status.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {status.error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            required
            id="name"
            label="Full Name"
            value={post.name}
            onChange={(e) => setPost({ ...post, name: e.target.value })}
          />
          
          <TextField
            required
            id="email"
            label="Email"
            type="email"
            value={post.email || ""}
            InputProps={{ readOnly: true }}
            fullWidth
          />
          
          <TextField
            required
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={post.password}
            onChange={(e) => setPost({ ...post, password: e.target.value })}
            inputProps={{ minLength: 8 }}
          />

          <TextField
            required
            id="companyId"
            label="Company"
            value={post.companyId || ""}
            InputProps={{ readOnly: true }}
            fullWidth
          />
          
          <input
            type="hidden"
            name="InviteId"
            value={post.id}
          />

          <Button 
            variant="contained" 
            type="submit"
            disabled={status.loading}
            startIcon={status.loading ? <CircularProgress size={20} /> : null}
          >
            {status.loading ? "Registering..." : "Register"}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

export default RegisterForm;