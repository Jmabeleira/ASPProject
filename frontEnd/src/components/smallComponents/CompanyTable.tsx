import * as React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
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
} from '@mui/x-data-grid';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CompanyForm from '../Forms/CompanyForm';
import {getCurrentUser} from '../../util/cacheManager';

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
  }
}

function EditToolbar({ setRows }: { setRows: any }) {
  const [open, setOpen] = React.useState(false);
  const user = getCurrentUser();

  const handleAddCategory = (newCategory: any) => {
    setRows((prevRows: GridRowsProp) => [
      ...prevRows,
      { ...newCategory, id: newCategory.categoryId || newCategory.id }, // adapt to your backend response
    ]);
    setOpen(false);
  }
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
          <Dialog  open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle id="alert-dialog-title">
              {"Add Company"}
            </DialogTitle>
            <DialogContent>
              <CompanyForm onAdd={handleAddCategory}/> 
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
            </DialogActions>
          </Dialog>
        </div>
  );
}

export default function FullFeaturedCrudGrid({ data }: { data: GridRowsProp }) {
  const initialRows: GridRowsProp = data;
  console.log(data);
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  
  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {field:'id', headerName: 'ID', width: 90},
    { field: 'name', headerName: 'Name', width: 180},
    {
      field: 'address',
      headerName: 'Address',
      width: 180,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'url',
      headerName: 'URL',
      width: 180,
    },
    {
      field: 'picture',
      headerName: 'Logo',
      width: 180,
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
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
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
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

