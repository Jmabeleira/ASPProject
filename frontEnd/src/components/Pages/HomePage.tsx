import { useState } from "react";
import { useEffect } from "react";
import { sendGetRequest } from "../../util/axiosUtil";
import LimitedCrudGrid from "../smallComponents/HomeTable";

function HomePage() {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let url = "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/expenses/";
        url += localStorage.getItem("companyId") || "1";
        const fetchData = async () => {
            try {
                const response = await sendGetRequest(url);
                if (response.status != 200) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                let responseData = response.data.data;
                const cleanedData = responseData.map((item: any) => ({
                    id: item.id,
                    amount: item.amount,
                    category: item.Category?.name || "",
                    purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
                    createdAt: item.registeredDate ? new Date(item.registeredDate) : null,
                    createdBy: item.userId,
                }));
                setData(cleanedData);
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
            <h1>Home</h1>
            <LimitedCrudGrid data={data} />
        </div>
    );
}

export default HomePage;