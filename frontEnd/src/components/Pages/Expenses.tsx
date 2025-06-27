import FullFeaturedCrudGrid from "../smallComponents/ExepensesTable";
import { useEffect, useState } from "react";
import { sendGetRequest, sendRequest } from "../../util/axiosUtil";
import { getCurrentUser } from "../../util/cacheManager";

function ExpensesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(
    localStorage.getItem("isSubscribed") === "true"
  );

  const currentUser = getCurrentUser();
  const companyId = currentUser?.companyId || "1";
  
  // Filtros
  const [categoryId, setCategoryId] = useState("");
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Cargar todos los gastos inicialmente
  useEffect(() => {
    fetchExpenses();
  }, []);

  const toggleSubscription = async () => {
    try {
      const newSubscriptionStatus = !isSubscribed;
      const response = await sendRequest(
        "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/user/setUserSubscribe",
        {
          id: currentUser?.id,
          isSubscribed: newSubscriptionStatus
        }
      );

      if (response.status === 200) {
        setIsSubscribed(newSubscriptionStatus);
        localStorage.setItem("isSubscribed", String(newSubscriptionStatus));
      } else {
        throw new Error("Failed to update subscription");
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
      setError(error instanceof Error ? error : new Error("Subscription update failed"));
    }
  };
  
  const fetchExpenses = async (filters?: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ companyId });

      if (filters) {
        if (filters.categoryId) queryParams.append("categoryId", filters.categoryId);
        if (filters.userId) queryParams.append("userId", filters.userId);
        if (filters.startDate) queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);
      }

      const url = `https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/expenses/filter?${queryParams.toString()}`;
      const response = await sendGetRequest(url);

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("response", response.data);
      const responseData = Array.isArray(response.data.data) ? response.data.data : [];
      const cleanedData = responseData.map((item: any) => ({
        id: item.id,
        amount: item.amount,
        categoryId: item.categoryId || "",
        category: item.Category?.name || "",
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
        createdAt: item.registeredDate ? new Date(item.registeredDate) : null,
        createdBy: item.userId,
      }));

      setData(cleanedData);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExpenses({ categoryId, userId, startDate, endDate });
  };

  return (
    <div>
      <h1>Expenses</h1>
      
      {/* Subscription Toggle Button */}
      <div style={{ marginBottom: "20px" }}>
        <button 
          onClick={toggleSubscription}
          style={{
            padding: "8px 16px",
            backgroundColor: isSubscribed ? "#ff4444" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {isSubscribed ? "Unsubscribe" : "Subscribe"}
        </button>
        <span style={{ marginLeft: "10px" }}>
          Current status: {isSubscribed ? "Subscribed" : "Not subscribed"}
        </span>
      </div>

      {/* Formulario de filtros */}
      <form onSubmit={handleFilterSubmit} style={{ marginBottom: "20px" }}>
        <label>
          Category ID:
          <input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} />
        </label>
        <label>
          User ID:
          <input value={userId} onChange={(e) => setUserId(e.target.value)} />
        </label>
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button type="submit">Buscar</button>
      </form>

      {/* Mostrar mensajes según el estado */}
      {loading && <p>Loading...</p>}
      {error && <p>Error al cargar los gastos: {error.message}</p>}
      {!loading && !error && data.length === 0 && (
        <p>No existen gastos que coincidan con ese filtrado.</p>
      )}
      {!loading && !error && data.length > 0 && (
        <FullFeaturedCrudGrid data={data} />
      )}
    </div>
  );
}

export default ExpensesPage;
