import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import InputFile from "../smallComponents/InputFile";
import sendRequest from "../../util/axiosUtil";
import { useState } from "react";
import Alert from "@mui/material/Alert";

function CompanyForm({ onAdd }: { onAdd: (newExpense: any) => void }) {
  const [post, setPost] = useState({
    companyName: "",
    companyUrl: "",
    companyAddres: "",
    companyLogo: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendRequest
      .sendRequest("https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/Company", post)
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          console.log("Company created successfully:", response.data);
          let responseData = response.data.data;
          onAdd(responseData);
        } else {
          console.error("Error creating company", response.statusText);
        }
      })
      .catch((err) => {
        console.error("Error creating company", err);
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "Unknown error occurred";
        setError("Error creating company: " + message);
      });
  };

  return (
    <div>
      <h1>Add Company</h1>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form action="handleSubmit" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            id="companyName"
            label="Company Name"
            variant="outlined"
            onChange={(e) => setPost({ ...post, companyName: e.target.value })}
          />
          <TextField
            id="companyUrl"
            label="Company URL"
            variant="outlined"
            onChange={(e) => setPost({ ...post, companyUrl: e.target.value })}
          />
          <TextField
            id="companyAddress"
            label="Company Address"
            variant="outlined"
            onChange={(e) =>
              setPost({ ...post, companyAddres: e.target.value })
            }
          />
          <TextField
            id="companyLogo"
            label="Company Logo"
            variant="outlined"
            onChange={(e) => setPost({ ...post, companyLogo: e.target.value })}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <InputFile />
            <Button variant="contained" type="submit">
              Confirm
            </Button>
          </div>
        </Stack>
      </form>
    </div>
  );
}

export default CompanyForm;
