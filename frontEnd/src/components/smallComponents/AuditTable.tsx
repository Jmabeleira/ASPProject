import * as React from "react";
import Box from "@mui/material/Box";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
} from "@mui/x-data-grid";
import { getCurrentUser } from "../../util/cacheManager";

export default function FullFeaturedAuditGrid({ data }: { data: GridRowsProp }) {
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  const [filterEventType, setFilterEventType] = React.useState('');
  const [filterUserId, setFilterUserId] = React.useState('');
  const [filterStartDate, setFilterStartDate] = React.useState('');
  const [filterEndDate, setFilterEndDate] = React.useState('');

  let user = getCurrentUser();
  user = { role: "Admin" };

  React.useEffect(() => {
    if (data) {
      const transformedData = data.map((row) => ({
        ...row,
        timestamp: new Date(row.timestamp),
      }));
      setRows(transformedData);
    }
  }, [data]);

  const toLocalDateString = (date: Date): string => {
    return date.toLocaleDateString('en-CA'); 
  };

  const filteredRows = rows.filter((row) => {
    const matchesEventType =
      filterEventType === '' ||
      row.eventType?.toLowerCase().includes(filterEventType.toLowerCase());

    const matchesUserId =
      filterUserId === '' ||
      row.userId?.toString().includes(filterUserId);

    const rowDateStr = toLocalDateString(row.timestamp);

    const matchesStartDate =
      filterStartDate === '' || rowDateStr >= filterStartDate;

    const matchesEndDate =
      filterEndDate === '' || rowDateStr <= filterEndDate;

    return matchesEventType && matchesUserId && matchesStartDate && matchesEndDate;
  });

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Audit ID",
      width: 150,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "eventType",
      headerName: "EventType",
      width: 150,
      editable: true,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "details",
      headerName: "Details",
      width: 180,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "userId",
      headerName: "User or User ID",
      width: 150,
      renderCell: (params) => {
        return params.row.userId ?? "—";
      },
    },
    {
      field: "timestamp",
      headerName: "Timestamp",
      width: 200,
      renderCell: (params) => {
        const date = new Date(params.row.timestamp);
        return date.toLocaleString();
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 600,
        width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
        },
      }}
    >
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <input
          type="text"
          placeholder="Filtrar por EventType"
          value={filterEventType}
          onChange={(e) => setFilterEventType(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filtrar por User ID"
          value={filterUserId}
          onChange={(e) => setFilterUserId(e.target.value)}
        />
        <input
          type="date"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
        />
        <input
          type="date"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
        />
      </Box>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
      />
    </Box>
  );
}
