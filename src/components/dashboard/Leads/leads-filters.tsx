import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import type { Customer } from './leads-table';
// import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
interface LeadsFiltersProps {
  leads: Customer[];

  onFilter: (filteredLeads: Customer[]) => void;
}
export function LeadsFilters({ leads , onFilter}: LeadsFiltersProps) {
   const [searchTerm, setSearchTerm] = React.useState('');

  // Filter leads when search term changes
  React.useEffect(() => {
    const filtered = leads.filter((lead) =>
      lead.searchCategory?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    onFilter(filtered);
  }, [searchTerm, leads, onFilter]);
   const exportToCSV = () => {
    const csv = Papa.unparse(leads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(leads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, 'leads.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const columns = Object.keys(leads[0] || {});
    const rows = leads.map((lead) => columns.map((col) => lead[col as keyof Customer]));

    autoTable(doc, {
      head: [columns],
      body: rows,
    });

    doc.save('leads.pdf');
  };

  return (
    <Card sx={{ p: 2 }}>
  <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
      <OutlinedInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        placeholder="Search by Category"
        startAdornment={
          <InputAdornment position="start">
            <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
          </InputAdornment>
        }
        sx={{ maxWidth: '400px' }}
      />
    
                <Button onClick={exportToCSV}  className='sm:flex' variant="contained" sx={{ ml: 2 }}>
                  Export To CSV
                </Button>
                <Button onClick={exportToPDF} variant="contained" sx={{ ml: 2 }}>
                  Export To Pdf
                </Button>
               
                <Button onClick={exportToExcel} variant="contained" sx={{ ml: 2 }}>
                  Export To Excel
                </Button>
              </Stack>
    </Card>
  );
}
