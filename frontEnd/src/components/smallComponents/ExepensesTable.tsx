import * as React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { sendPutRequest, sendDeleteRequest,sendRequest,sendGetRequest } from "../../util/axiosUtil";
import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import ExpenseForm from "../Forms/ExpenseForm";
import { useState } from "react";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridValueGetter,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridSlotProps,
  Toolbar,
  ToolbarButton,
  GridToolbarContainer,
  GridFilterInputDateProps,
} from "@mui/x-data-grid";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
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
  const [open, setOpen] = useState(false);
  const handleAddExpense = (newExpense: any) => {
    setRows((prevRows: GridRowsProp) => [
      ...prevRows,
      { ...newExpense, id: newExpense.expenseId || newExpense.id }, // adapt to your backend response
    ]);
    setOpen(false);
  };
  return (
    <>
      <Toolbar>
        <Tooltip title="Add record">
          <ToolbarButton onClick={() => setOpen(true)}>
            <AddIcon fontSize="small" />
          </ToolbarButton>
        </Tooltip>
      </Toolbar>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <ExpenseForm onAdd={handleAddExpense} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default function FullFeaturedCrudGrid({ data }: { data: GridRowsProp }) {
  const initialRows: GridRowsProp = data;
  const [rows, setRows] = React.useState(initialRows);
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
        [id]: { mode: GridRowModes.Edit, fieldToFocus: "amount" },
      });
    }
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => async () => {
    const rowToDelete = rows.find((row) => row.id === id);
    const body = {
      userId: getCurrentUser().id || 1,
      expenseId: rowToDelete?.id,
    };
    console.log("body", body);

    if (rowToDelete) {
      try {
        const response = await sendDeleteRequest(
          `https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/expenses`,
          body
        );

        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Row deleted successfully:", response.data);

        let url: string =
          "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/user/getUserMailsByArea" +
          "?areaId=" +
          localStorage.getItem("areaId");
        const userMails = await sendGetRequest(url);

        const payload = {
          expenseId: rowToDelete?.id,
          status: "deleted",
        };

        if (userMails.status === 200 || userMails.status === 201) {
          const mailPayload = {
            emails: userMails.data.data,
            data: payload,
          };
          const ok = await sendRequest(
            "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/notify",
            mailPayload
          );
        }
      } catch (error) {
        console.error("Error deleting row:", error);
      }
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
      expenseId: newRow.id,
      amount: newRow.amount,
      category: newRow.category,
      purchaseDate: newRow.purchaseDate,
      registeredDate: newRow.createdAt,
      userId: newRow.createdBy,
    };
    console.log("body", body);
    try {
      const response = await sendPutRequest(
        "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/expenses",
        body
      );
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Row updated successfully:", response.data);

      let url: string =
        "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/companyuser/user/getUserMailsByArea" +
        "?areaId=" +
        localStorage.getItem("areaId");
      const userMails = await sendGetRequest(url);

      const payload = {
        expenseId: newRow.id,
        amount: newRow.amount,
        categoryId: newRow.category,
        purchaseDate: newRow.purchaseDate,
        registeredDate: newRow.createdAt,
        userId: newRow.createdBy,
        status: "updated",
      };

      if (userMails.status === 200 || userMails.status === 201) {
        const mailPayload = {
          emails: userMails.data.data,
          data: payload,
        };
        const ok = await sendRequest(
          "https://go4oygm3zi.execute-api.us-east-1.amazonaws.com/test/notify",
          mailPayload
        );
      }
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
      field: "amount",
      headerName: "Amount",
      type: "number",
      width: 80,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "categoryId", headerName: "CategoryId", width: 90
    },
    {
      field: "category",
      headerName: "Category",
      width: 180,
      editable: true,
    },
    {
      field: "purchaseDate",
      headerName: "Purchase Date",
      type: "date",
      width: 180,
      editable: true,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      type: "date",
      width: 180,
      editable: true,
    },
    {
      field: "createdBy",
      type: "number",
      headerName: "Created By",
      width: 180,
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
