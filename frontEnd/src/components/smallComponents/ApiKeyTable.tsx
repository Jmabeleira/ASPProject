import * as React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowId,
  GridRowsProp,
  GridRowModesModel,
  GridEventListener,
  GridRowEditStopReasons,
  Toolbar,
  ToolbarButton,
} from "@mui/x-data-grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { getCurrentUser } from "../../util/cacheManager";
import { sendDeleteRequest } from "../../util/axiosUtil";
import ApiKeyForm from "../Forms/ApiKeyForm";

function EditToolbar({ setRows }: { setRows: any }) {
  const [open, setOpen] = React.useState(false);

  const handleAddApiKey = (newKey: any) => {
    setRows((prevRows: GridRowsProp) => [
      ...prevRows,
      { ...newKey, id: newKey.apiKeyId || newKey.id },
    ]);
    setOpen(open);
  };

  return (
    <div>
      <Toolbar>
        <Tooltip title="Add API Key">
          <ToolbarButton onClick={() => setOpen(true)}>
            <AddIcon fontSize="small" />
          </ToolbarButton>
        </Tooltip>
      </Toolbar>
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>{"Generate API Key"}</DialogTitle>
        <DialogContent>
          <ApiKeyForm onCreate={handleAddApiKey} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default function ApiKeyTable({ data }: { data: GridRowsProp }) {
  const user = getCurrentUser();
  const isAdmin = user?.role === "Admin";
  const userId = user?.id;

  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  React.useEffect(() => {
    if (isAdmin) {
      setRows(data);
    } else {
      setRows(data.filter((row) => row.userId === userId));
    }
  }, [data, isAdmin, userId]);

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    const rowToDelete = rows.find((row) => row.id === id);
    if (!rowToDelete) return;

    const body = {
      userId: userId,
      apiKeyId: rowToDelete.id,
    };
    
    sendDeleteRequest(`https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/Token/deactivate`, body)
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setRows((prev) => prev.filter((r) => r.id !== id));
        console.log("API Key deleted:", response.data);
      })
      .catch((err) => {
        console.error("Failed to delete API Key:", err);
      });
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "name",
      headerName: "Key Name",
      width: 200,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: ({ id }) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleDeleteClick(id)}
          color="inherit"
        />,
      ],
    },
  ];

  return (
    <Box
      sx={{
        height: 500,
        width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        rowModesModel={rowModesModel}
        onRowEditStop={handleRowEditStop}
        editMode="row"
        slots={{ toolbar: EditToolbar }}
        slotProps={{ toolbar: { setRows } }}
        showToolbar
      />
    </Box>
  );
}
