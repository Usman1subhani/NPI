'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';

const states = [
  { value: 'alabama', label: 'Alabama' },
  { value: 'new-york', label: 'New York' },
  { value: 'san-francisco', label: 'San Francisco' },
  { value: 'los-angeles', label: 'Los Angeles' },
] as const;

export function NewsCard(): React.JSX.Element {
  return (
    <Card>
      <CardHeader title="News" />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid
            size={{
              md: 6,
              xs: 12,
            }}
          >
            <FormControl fullWidth required>
              <InputLabel>Title</InputLabel>
              <OutlinedInput defaultValue="Latest Updates" label="Title" name="title" />
            </FormControl>
          </Grid>
          <Grid
            size={{
              md: 6,
              xs: 12,
            }}
          >
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select defaultValue="" label="Category" name="category">
                {states.map((state) => (
                  <MenuItem key={state.value} value={state.value}>
                    {state.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button variant="contained">Submit</Button>
      </CardActions>
    </Card>
  );
}
