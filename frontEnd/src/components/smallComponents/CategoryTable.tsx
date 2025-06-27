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
  GridSlotProps,
  Toolbar,
  ToolbarButton,
} from "@mui/x-data-grid";
import { sendDeleteRequest, sendPutRequest } from "../../util/axiosUtil";
import CategoryForm from "../Forms/CategoryForm";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { Grid } from "@mui/material";
import { getCurrentUser } from "../../util/cacheManager";
import { rowSelectionStateInitializer } from "@mui/x-data-grid/internals";



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
  const handleAddCategory = (newCategory: any) => {
    setRows((prevRows: GridRowsProp) => [
      ...prevRows,
      { ...newCategory, id: newCategory.categoryId || newCategory.id }, 
    ]);
    setOpen(false);
  };
  return (
    <div>
      <Toolbar>
        <Tooltip title="Add record">
          <ToolbarButton onClick={() => setOpen(true)}>
            <AddIcon fontSize="small" />
          </ToolbarButton>
        </Tooltip>
      </Toolbar>
      <Dialog  open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle id="alert-dialog-title">
          {"Add Category"}
        </DialogTitle>
        <DialogContent>
          <CategoryForm onAdd={handleAddCategory}/> 
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default function FullFeaturedCrudGrid({ data }: { data: GridRowsProp }) {
  let userComapnyId = getCurrentUser().companyId;
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
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    let rowToEdit = rows.find((row) => row.id === id);
    if (rowToEdit) {
      setRowModesModel({
        ...rowModesModel,
        [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
      });
    } 
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    const rowToDelete = rows.find((row) => row.id === id);
    const body = 
    {
      userId: user?.id || 1,
      companyId: rowToDelete?.companyId,
      name: rowToDelete?.name
    };
    console.log("body", body);
    if (rowToDelete) {
      sendDeleteRequest(`https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/category`, body)
        .then((response) => {
          if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          console.log("Row deleted successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error deleting row:", error);
        });
    }
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };

    const body = {
      userId: getCurrentUser().id || 1,
      companyId: newRow.companyId,
      name: newRow.name,
      description: newRow.description,
      expenseLimit: newRow.expenseLimit,
    };

    console.log("Updated body", body);

    try {
      const response = await sendPutRequest("https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/category", body);
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Row updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating row:", error);
    }

    setRows((prevRows) =>
      prevRows.map((row) => (row.id === newRow.id ? updatedRow : row))
    );

    return updatedRow;
  };

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
    {
      field: "expenseLimit",
      headerName: "Expense Limit",
      type: "number",
      width: 80,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              style={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
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
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        showToolbar
      />
    </Box>
  );
}
