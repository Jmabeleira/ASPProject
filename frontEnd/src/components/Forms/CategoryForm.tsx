import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import { sendRequest } from "../../util/axiosUtil";
import { getCurrentUser } from "../../util/cacheManager";
import { Alert } from "@mui/material";
import { useEffect } from "react";
import { sendGetRequest } from "../../util/axiosUtil";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";

type Company = { id: number; name: string };

function CategoryForm({ onAdd }: { onAdd: (newExpense: any) => void }) {
  const isAdmin = getCurrentUser().role === "Admin";
  const [error, setError] = useState("");
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState({
    userid: getCurrentUser()?.id || 1, 
    name: "",
    expenseLimit: 0,
    description: "",
    companyId: getCurrentUser()?.companyId || 0,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await sendGetRequest(
          "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/Company"
        );
        if (response.status != 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let responseData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        console.log("responseData", responseData);
        setData(responseData);
        setLoading(false);
      } catch (error: any) {
        console.error("Error creating category", error);
        const message =
          error?.response?.data?.error || error.message || "Unknown error occurred";
        setError("Error creating category: " + message);
      }
    };

    fetchData();
  }, []);
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (post.companyId === 0) {
      console.log("User is not logged cant send request");
      setError("User is not logged cant create Category");
    } else {
      sendRequest("https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/category", post)
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            console.log("Category created successfully:", response.data);
            onAdd(response.data);
          } else {
            console.error("Error creating category", response.statusText);
            setError("Error creating category." + response.statusText);
          }
        })
        .catch((err) => {
          console.error("Error creating category", err);
          const message =
            err?.response?.data?.error ||
            err.message ||
            "Unknown error occurred";
          setError("Error creating category: " + message);
        });
    }
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            id="categoryName"
            label="Category Name"
            variant="outlined"
            onChange={(e) => setPost({ ...post, name: e.target.value })}
          />
          <TextField
            id="categoryExpenseLimit"
            label="Category Expense Limit"
            variant="outlined"
            type="number"
            onChange={(e) =>
              setPost({ ...post, expenseLimit: Number(e.target.value) })
            }
          />
          {isAdmin && (
            <Autocomplete
              disablePortal
              options={data}
              getOptionLabel={(option) => option.name}
              sx={{ width: 300 }}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Company"
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
          )}
          <TextField
            multiline
            rows={4}
            id="categoryDescription"
            label="Category Description"
            variant="outlined"
            onChange={(e) => setPost({ ...post, description: e.target.value })}
          />
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Button variant="contained" type="submit">
            Confirm
          </Button>
        </Stack>
      </form>
    </div>
  );
}

export default CategoryForm;
