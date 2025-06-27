import * as React from "react";
import { useState } from 'react';
import Box from "@mui/material/Box";
import dayjs, { Dayjs } from 'dayjs';
import {
  GridRowsProp,
  GridRowModesModel,
  DataGrid,
  GridColDef,
  GridFilterInputDateProps
} from "@mui/x-data-grid";
import { Typography } from "@mui/material";
import { 
    BarChart,
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer, 
    Cell 
} from 'recharts';
import { DatePicker, Space } from 'antd';

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

export default function LimitedCrudGrid({ data }: { data: GridRowsProp }) {
  const initialRows: GridRowsProp = data;
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const dateRangeFilterOperator = {
    label: 'Between',
    value: 'between',
    getApplyFilterFn: (filterItem: import("@mui/x-data-grid").GridFilterItem) => {
        

      if (!filterItem.field || !filterItem.value || !filterItem.operator) {
        return null;
      }
  
      return (params: import("@mui/x-data-grid").GridCellParams) => {
        const [startDate, endDate] = filterItem.value;
        
        if (!startDate && !endDate) {
          return true;
        }
        
        const cellDate = params.value ? new Date(params.value as string | number | Date) : null;
        if (!cellDate) return false;

        const start = startDate?.toDate?.() || startDate;
        const end = endDate?.toDate?.() || endDate;

        if (start && !end) {
          return cellDate >= start;
        } else if (!start && end) {
          return cellDate <= end;
        } else if (start && end) {
          return cellDate >= start && cellDate <= end;
        }
        
        return true;
      };
    },
    InputComponent: (props: GridFilterInputDateProps) => {
      const { item, applyValue } = props;
      
      const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>(
        item.value && Array.isArray(item.value) 
          ? [item.value[0] ? dayjs(item.value[0]) : null, item.value[1] ? dayjs(item.value[1]) : null] 
          : [null, null]
      );
  
      const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
        setDateRange(dates ?? [null, null]);
        applyValue({
          ...item,
          value: dates ?? [null, null],
        });
      };
  
      return (
        <div style={{ padding: 8 }}>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            allowEmpty={[true, true]}
          />
        </div>
      );
    },
  };

  const categoryTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    
    rows.forEach((row) => {
      const category = row.category || 'Uncategorized';
      totals[category] = (totals[category] || 0) + (row.amount || 0);
    });
    
    return Object.entries(totals).map(([category, total]) => ({
      name: category,
      total: parseFloat(total.toFixed(2))
    }));
  }, [rows]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const columns: GridColDef[] = [
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
      field: "category",
      headerName: "Category",
      width: 180,
      editable: true,
    },
    {
        field: "purchaseDate",
        headerName: "Date",
        type: "date",
        width: 180,
        filterOperators: [dateRangeFilterOperator],
    },
    {
      field: "createdBy",
      type: "number",
      headerName: "Created By",
      width: 180,
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
      <Box>
        <Typography variant="h6" gutterBottom>
          Expenses by Category
        </Typography>
        <Box sx={{ height: 400, width: '100%', mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryTotals}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={150} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Total Amount']}
              />
              <Legend />
              <Bar
                dataKey="total"
                name="Total Amount"
                label={{
                    position: 'right',
                    formatter: (value: number) => `$${value.toFixed(2)}`
                  }}
              >
                {categoryTotals.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>
          Expense Details
        </Typography>
        <Box sx={{ height: 500 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        showToolbar
      />
      </Box>
    </Box>
  </Box>
  );
}