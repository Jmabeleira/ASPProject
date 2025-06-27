import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import sendRequest from "../../util/axiosUtil";
import { useState, useEffect } from "react";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import CircularProgress from "@mui/material/CircularProgress";
import Autocomplete from "@mui/material/Autocomplete";
import { getCurrentUser } from "../../util/cacheManager";

function AreaForm({ onAdd }: { onAdd: (newArea: any) => void }) {
  const [post, setPost] = useState({
    AreaName: "",
    AreaDescription: "",
    companyId: "",
    userId:getCurrentUser().id || 1, 
  });
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sendRequest.sendGetRequest("https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/Company")
      .then((response) => {
        if (response.status === 200) {
          setCompanies(response.data.data);
        } else {
          console.error("Error fetching companies", response.statusText);
        }
      })
      .catch((err) => {
        console.error("Error fetching companies", err);
        setError("Error loading companies list");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!post.AreaName || !post.companyId) {
      setError("Name and Company are required fields");
      return;
    }

    sendRequest.sendRequest("https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/area", post)
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          console.log("Area created successfully:", response.data);
          let responseData = response.data.data;
          onAdd(responseData);
        } else {
          console.error("Error creating area", response.statusText);
        }
      })
      .catch((err) => {
        console.error("Error creating area", err);
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "Unknown error occurred";
        setError("Error creating area: " + message);
      });
  };

  return (
    <div>
      <h1>Add Area</h1>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            id="areaName"
            label="Area Name"
            variant="outlined"
            required
            onChange={(e) => setPost({ ...post, AreaName: e.target.value })}
          />
          
          <TextField
            id="description"
            label="Description"
            variant="outlined"
            multiline
            rows={4}
            onChange={(e) => setPost({ ...post, AreaDescription: e.target.value })}
          />
          
          <Autocomplete
            disablePortal
            options={companies}
            getOptionLabel={(option) => option.name}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Company *"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            onChange={(e, value: any | null) =>
              setPost({ ...post, companyId: value ? value.id : 0 })
            }
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" type="submit">
              Confirm
            </Button>
          </div>
        </Stack>
      </form>
    </div>
  );
}

export default AreaForm;