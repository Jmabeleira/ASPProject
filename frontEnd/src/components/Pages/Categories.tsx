import { useEffect } from "react";
import FullFeaturedCrudGrid from "../smallComponents/CategoryTable";
import { sendGetRequest } from "../../util/axiosUtil";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CategroyPage() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await sendGetRequest(
          "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/category"
        );
        if (response.status != 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let responseData = response.data;
        console.log("responseData", responseData);
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
      <h1>Categories</h1>
      <FullFeaturedCrudGrid data={data} />
    </div>
  );
}

export default CategroyPage;
