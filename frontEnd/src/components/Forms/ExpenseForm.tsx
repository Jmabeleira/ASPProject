import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import { sendGetRequest, sendRequest } from "../../util/axiosUtil";
import { useState } from "react";
import CustomDatePicker from "../smallComponents/DatePickerAdapter";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { getCurrentUser } from "../../util/cacheManager";
import Alert from "@mui/material/Alert";

type Category = { id: number; name: string; companyId: number };
type Company = { id: number; name: string };
const currentUser = getCurrentUser();

function ExpenseForm({ onAdd }: { onAdd: (newExpense: any) => void }) {
  const isAdmin = getCurrentUser().role === "Admin";
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    isAdmin ? null : currentUser.companyId
  );
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, companyRes] = await Promise.all([
          sendGetRequest("https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/category"),
          sendGetRequest("https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/Company"),
        ]);
        if (categoryRes.status != 200 || companyRes.status != 200) {
          throw new Error(`HTTP error! status: ${categoryRes.status}`);
        }
        let compData = companyRes.data.data;
        let responseData = categoryRes.data;
        if (!isAdmin) {
          const userCompanyId = currentUser.companyId;
          responseData = responseData.filter(
            (cat: Category) => cat.companyId === userCompanyId
          );
          setSelectedCompanyId(userCompanyId);
        }
        setCategories(responseData);
        setCompanyData(compData);
        setLoading(false);
      } catch (e: any) {
        setError(e);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCategories = Array.isArray(categories)
    ? selectedCompanyId
      ? categories.filter((c) => c.companyId === selectedCompanyId)
      : categories
    : [];

  const [registeredDate, setRegisteredDate] = useState<Dayjs | null>(dayjs());
  const [purchaseDate, setPurchaseDate] = useState<Dayjs | null>(dayjs());
  const [post, setPost] = useState({
    amount: 0,
    registeredDate: new Date(),
    categoryId: 0,
    purchaseDate: new Date(),
    userId: getCurrentUser().id || 1,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      ...post,
      userId: localStorage.getItem("userId") || "1",
      registeredDate: registeredDate?.toISOString(),
      purchaseDate: purchaseDate?.toISOString(),
    };

    try {
      console.log(payload);
      const response = await sendRequest(
        "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/expenses",
        payload
      );
      
      if (response.status === 200 || response.status === 201) {
        let url: string = "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/user/getUserMailsByArea" + "?areaId=" + localStorage.getItem("areaId");
        const userMails = await sendGetRequest(url);
        if (userMails.status === 200 || userMails.status === 201) {
          const mailPayload = {
            emails: userMails.data.data,
            data: { 
              payload,
              status: 'created'
            }
          }
          const ok = await sendRequest(
            "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/notify",
            mailPayload
          );
        }
        const createdExpense = response.data.data;
        const cleanedData = {
          id: createdExpense.id,
          amount: createdExpense.amount,
          category:
            categories.find((c) => c.id === createdExpense.categoryId)?.name ||
            "",
          purchaseDate: createdExpense.purchaseDate
            ? new Date(createdExpense.purchaseDate)
            : null,
          createdAt: createdExpense.registeredDate
            ? new Date(createdExpense.registeredDate)
            : null,
          createdBy: createdExpense.userId,
        };
        onAdd(cleanedData);
      }
    } catch (error: any) {
      console.error("Failed to create expense:", error);
      const serverError = error?.response?.data;
      const errorMsg =
        (serverError?.error || serverError?.message) ??
        error.message ??
        "Unknown error";

      setError(new Error(errorMsg));
    }
  };
  return (
    <div>
      <h1>Expense Form</h1>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}
      <form action="handleSubmit" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            id="expenseAmount"
            label="Expense Amount"
            variant="outlined"
            type="number"
            onChange={(e) =>
              setPost({ ...post, amount: parseFloat(e.target.value) })
            }
          />
          {isAdmin && (
            <Autocomplete
              disablePortal
              options={companyData}
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
              onChange={(e, value: Company | null) => {
                setSelectedCompanyId(value ? value.id : null);
                setPost({ ...post, categoryId: 0 });
              }}
            />
          )}
          <Autocomplete
            disablePortal
            options={filteredCategories}
            getOptionLabel={(option) => option.name}
            sx={{ width: 300 }}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
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
              setPost({ ...post, categoryId: value ? value.id : 0 })
            }
          />

          <CustomDatePicker
            label="Purchase Date"
            value={purchaseDate}
            onChange={setPurchaseDate}
          />
          <Button variant="contained" type="submit">
            Confirm
          </Button>
        </Stack>
      </form>
    </div>
  );
}

export default ExpenseForm;
