import FullFeaturedCrudGrid from "../smallComponents/CompanyTable";
import { useEffect } from "react";
import { sendGetRequest } from "../../util/axiosUtil";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CompanyPage() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await sendGetRequest(
          "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/Company"
        );
        if (response.status != 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let responseData = response.data.data;
        setData(responseData);
        setLoading(false);
      } catch (e: any) {
        setError(e);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h1>Company Page</h1>
      <p>This is the company page.</p>
      <FullFeaturedCrudGrid data={data} />
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => navigate("/company-form")}>
          Crear nueva compañia
        </button>
      </div>
    </div>
  );
}

export default CompanyPage;
