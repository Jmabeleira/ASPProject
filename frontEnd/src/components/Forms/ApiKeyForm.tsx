import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import { sendRequest } from "../../util/axiosUtil";
import { getCurrentUser } from "../../util/cacheManager";
import { Alert } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

function ApiKeyForm({ onCreate }: { onCreate?: (newKey: any) => void }) {
  const user = getCurrentUser();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setCreatedKey(null);

    if (!user?.id) {
      setError("User is not logged in.");
      return;
    }

    try {
      const response = await sendRequest("https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/Token", {
        name,
        userId: user.id,
      });

      if (response.status === 200 || response.status === 201) {
        setCreatedKey(response.data.key);
        if (onCreate) onCreate(response.data);
      } else {
        setError("Failed to create API key.");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err.message || "Unknown error occurred";
      setError("Error creating API key: " + message);
    }
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="API Key Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {createdKey && (
          <TextField
            label="Generated API Key"
            value={createdKey}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopy} edge="end">
                    <ContentCopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="Copy and store this key now. It will not be shown again."
          />
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Button variant="contained" type="submit">
          Generate API Key
        </Button>
      </Stack>
    </form>
  );
}

export default ApiKeyForm;
