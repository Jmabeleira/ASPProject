import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendGetRequest } from "../../util/axiosUtil";
import ApiKeyTable from "../smallComponents/ApiKeyTable";
import { getCurrentUser } from "../../util/cacheManager";

function ApiKey() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const companyId = getCurrentUser().id || "1";

  const navigate = useNavigate();

  useEffect(() => {
    let url = "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/Token/";
    url += companyId || "1";
    const fetchData = async () => {
      try {
        const response = await sendGetRequest(url);
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = response.data;
        console.log("API Keys fetched:", responseData);
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
    return <p>Loading API Keys...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="container">
      <h1>API Keys</h1>
      <ApiKeyTable data={data} />
    </div>
  );
}

export default ApiKey
