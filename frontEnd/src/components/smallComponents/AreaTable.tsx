import * as React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import {
  GridRowsProp,
  GridRowModesModel,
  DataGrid,
  GridColDef,
  Toolbar,
  ToolbarButton,
} from "@mui/x-data-grid";
import AreaForm from "../Forms/AreaForm";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { getCurrentUser } from "../../util/cacheManager";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

function EditToolbar({ setRows }: { setRows: any }) {
  const [open, setOpen] = React.useState(false);
  const user = getCurrentUser();

  const handleAddArea = (newArea: any) => {
    setRows((prevRows: GridRowsProp) => [
      ...prevRows,
      { ...newArea, id: newArea.areaId || newArea.id },
    ]);
    setOpen(false);
  };
  if (user?.role !== "Admin") return null;
  return (
    <div>
      <Toolbar>
        <Tooltip title="Add record">
          <ToolbarButton onClick={() => setOpen(true)}>
            <AddIcon fontSize="small" />
          </ToolbarButton>
        </Tooltip>
      </Toolbar>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Area</DialogTitle>
        <DialogContent>
          <AreaForm onAdd={handleAddArea} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default function FullFeaturedAreasGrid({ data }: { data: GridRowsProp }) {
  const user = getCurrentUser();
  const userCompanyId = user?.companyId;

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  React.useEffect(() => {
    if (userCompanyId) {
      const filtered = data.filter((row) => row.companyId === userCompanyId);
      setRows(filtered);
    } else {
      setRows(data);
    }
  }, [data, userCompanyId]);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "companyId",
      headerName: "Company ID",
      width: 50,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "name",
      headerName: "Name",
      width: 150,
      editable: true,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "description",
      headerName: "Description",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
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
        "& .textPrimary": {
          color: "text.primary",
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        slots={{ toolbar: EditToolbar }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        showToolbar
      />
    </Box>
  );
}