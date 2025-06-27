import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Alert,
  Typography,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { sendGetRequest, sendRequest } from "../../util/axiosUtil";

interface Company {
  id: string;
  name: string;
}

interface Area {
  id: string;
  name: string;
  companyId: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
}

function InviteForm() {
  const [formData, setFormData] = useState({
    email: '',
    companyId: '',
    areaId: ''
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [status, setStatus] = useState({
    loading: false,
    loadingCompanies: true,
    loadingAreas: false,
    error: null as string | null,
    success: false
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await sendGetRequest<ApiResponse<Company[]>>("https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/Company");
        
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setCompanies(response.data.data);
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to load companies"
        }));
      } finally {
        setStatus(prev => ({ ...prev, loadingCompanies: false }));
      }
    };

    fetchCompanies();
  }, []);

  // Fetch areas when company is selected
  useEffect(() => {
    const fetchAreas = async () => {
      if (!formData.companyId) {
        setAreas([]);
        return;
      }

      setStatus(prev => ({ ...prev, loadingAreas: true, error: null }));
      
      try {
        const response = await sendGetRequest<ApiResponse<Area[]>>(
          `https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/area/byid?companyId=${formData.companyId}`
        );
        
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setAreas(response.data.data);
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to load areas"
        }));
      } finally {
        setStatus(prev => ({ ...prev, loadingAreas: false }));
      }
    };

    // Add debounce to prevent rapid API calls
    const timer = setTimeout(() => {
      fetchAreas();
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.companyId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validations
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus(prev => ({ ...prev, error: "Please enter a valid email address" }));
      return;
    }

    if (!formData.companyId) {
      setStatus(prev => ({ ...prev, error: "Please select a company" }));
      return;
    }

    if (!formData.areaId) {
      setStatus(prev => ({ ...prev, error: "Please select an area" }));
      return;
    }

    setStatus(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await sendRequest(
        "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/invite",
        formData
      );
      
      if (response.status === 200 || response.status === 201) {
        setStatus(prev => ({
          ...prev,
          loading: false,
          success: true
        }));
        setOpenSnackbar(true);
        // Reset form
        setFormData({
          email: '',
          companyId: '',
          areaId: ''
        });
        setAreas([]);
      }
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error?.response?.data?.message || 
              error?.message || 
              "Failed to send invitation"
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    
    if (name === 'companyId') {
      // When company changes, reset area selection
      setFormData(prev => ({ 
        ...prev, 
        companyId: value,
        areaId: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (status.loadingCompanies) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      p={3}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          boxShadow: 3,
          borderRadius: 2,
          p: 4
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
          Send Invitation
        </Typography>

        {status.error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => setStatus(prev => ({ ...prev, error: null }))}
          >
            {status.error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              name="email"
              label="Recipient Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={Boolean(status.error && status.error.includes("email"))}
              required
            />

            <FormControl fullWidth error={Boolean(status.error && status.error.includes("company"))}>
              <InputLabel id="company-select-label">Select Company *</InputLabel>
              <Select
                labelId="company-select-label"
                name="companyId"
                label="Select Company *"
                value={formData.companyId}
                onChange={handleSelectChange}
                required
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl 
              fullWidth 
              error={Boolean(status.error && status.error.includes("area"))} 
              disabled={!formData.companyId}
            >
              <InputLabel id="area-select-label">Select Area *</InputLabel>
              <Select
                labelId="area-select-label"
                name="areaId"
                label="Select Area *"
                value={formData.areaId}
                onChange={handleSelectChange}
                required
              >
                {status.loadingAreas ? (
                  <MenuItem disabled>
                    <CircularProgress size={24} />
                  </MenuItem>
                ) : areas.length > 0 ? (
                  areas.map((area) => (
                    <MenuItem key={area.id} value={area.id}>
                      {area.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {formData.companyId ? "No areas available" : "Select a company first"}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={status.loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {status.loading ? <CircularProgress size={24} color="inherit" /> : 'Send Invitation'}
            </Button>
          </Stack>
        </form>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Invitation sent successfully!
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default InviteForm;