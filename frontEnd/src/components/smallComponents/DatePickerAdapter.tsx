// components/CustomDatePicker.tsx
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";

interface CustomDatePickerProps {
  label: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
}

function CustomDatePicker({ label, value, onChange }: CustomDatePickerProps) {
  return (
    <DatePicker
      label={label}
      value={value}
      defaultValue={dayjs()}
      onChange={onChange}
    />
  );
}

export default CustomDatePicker;
