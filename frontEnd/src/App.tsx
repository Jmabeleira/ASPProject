import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import InviteForm from './components/Forms/InviteForm';
import LoginForm from './components/Forms/Login';
import CompanyPage from './components/Pages/Companies';
import CategoryPage from './components/Pages/Categories';
import AreaPage from './components/Pages/Areas';
import PersistentDrawerLeft from './components/smallComponents/nav';
import './App.css';
import ExpensesPage from "./components/Pages/Expenses";
import HomePage from "./components/Pages/HomePage";
import ApiKey from "./components/Pages/ApiKey";
import RegisterForm from "./components/Forms/RegisterForm";
import AuditPage from "./components/Pages/Audit";


function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <BrowserRouter>
      <PersistentDrawerLeft />
      <Routes>
        {/* Rutas sin Layout */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/User/register" element={<RegisterForm />} />
        
        {/* Rutas con Layout */}
        <Route path="/categories-list" element={<CategoryPage />} />
        <Route path="/areas-list" element={<AreaPage />} />
        <Route path="/companies-list" element={<CompanyPage />} />
        <Route path="/invites" element={<InviteForm />} />
        <Route path="/expenses-list" element={<ExpensesPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/apikeys-list" element={<ApiKey />} />
        <Route path="/audit" element={<AuditPage />} />


        
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  </LocalizationProvider>
  );
}

export default App;