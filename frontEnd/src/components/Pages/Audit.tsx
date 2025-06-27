import { useEffect } from "react";
import FullFeaturedAuditGrid from "../smallComponents/AuditTable";
import { sendGetRequest } from "../../util/axiosUtil";
import { useState } from "react";

function AuditPage() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await sendGetRequest(
          "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/audit"
        );
        if (response.status != 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let responseData = response.data;
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
    <div className="container">
      <h1>Audit</h1>
      <FullFeaturedAuditGrid data={data} />
    </div>
  );
}

export default AuditPage;