import * as React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  Toolbar,
  ToolbarButton,
} from "@mui/x-data-grid";
import { sendPutRequest, sendDeleteRequest } from "../../util/axiosUtil";
import AreaForm from "../Forms/AreaForm";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { getCurrentUser } from "../../util/cacheManager";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (updater: (old: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (updater: (old: GridRowModesModel) => GridRowModesModel) => void;
  }
}

function EditToolbar({ setRows }: { setRows: any }) {
  const [open, setOpen] = React.useState(false);
  const user = getCurrentUser();

  const handleAddArea = (newArea: any) => {
    setRows((prev: GridRowsProp) => [
      ...prev,
      { ...newArea, id: newArea.areaId || newArea.id, isNew: true },
    ]);
    setOpen(false);
  };

  if (user?.role !== "Admin") return null;
  return (
    <>
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
    </>
  );
}

export default function FullFeaturedAreasGrid({ data }: { data: GridRowsProp }) {
  const user = getCurrentUser();
  const userCompanyId = user?.companyId;

  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  React.useEffect(() => {
    if (userCompanyId) {
      setRows(data.filter((r) => r.companyId === userCompanyId));
    } else {
      setRows(data);
    }
  }, [data, userCompanyId]);

  // Evita cerrar la edición al perder foco
  const handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  // Botones de acción
  const handleEditClick = (id: GridRowId) => () =>
    setRowModesModel((m) => ({
      ...m,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));

  const handleSaveClick = (id: GridRowId) => () =>
    setRowModesModel((m) => ({ ...m, [id]: { mode: GridRowModes.View } }));

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel((m) => ({
      ...m,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));
    // si era nuevo, lo quitamos
    setRows((r) => r.filter((row) => !(row.id === id && (row as any).isNew)));
  };

  const handleDeleteClick = (id: GridRowId) => async () => {
    // REEMPLAZA esta URL por tu endpoint de DELETE
    const DELETE_URL = "https://TU_BACKEND/api/areas";
    try {
      await sendDeleteRequest(DELETE_URL, { areaId: id });
      setRows((r) => r.filter((row) => row.id !== id));
    } catch (err) {
      console.error("Error borrando área:", err);
    }
  };

  // Al guardar edición, hace PUT
  const processRowUpdate = async (newRow: GridRowModel) => {
    // REEMPLAZA esta URL por tu endpoint de UPDATE
    const UPDATE_URL = "https://TU_BACKEND/api/areas";
    const body = {
      areaId: newRow.id,
      name: newRow.name,
      description: newRow.description,
      companyId: newRow.companyId,
    };
    try {
      await sendPutRequest(UPDATE_URL, body);
      return { ...newRow, isNew: false };
    } catch (err) {
      console.error("Error actualizando área:", err);
      throw err; // para que DataGrid muestre el error
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "companyId",
      headerName: "Company ID",
      width: 120,
      editable: false,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
      editable: true,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "description",
      headerName: "Description",
      width: 250,
      editable: true,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEdit = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEdit) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }
        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 600,
        width: "100%",
        "& .actions": { color: "text.secondary" },
        "& .textPrimary": { color: "text.primary" },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={setRowModesModel}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar }}
        slotProps={{ toolbar: { setRows, setRowModesModel } }}
        showToolbar
        experimentalFeatures={{ newEditingApi: true }}
      />
    </Box>
  );
}
