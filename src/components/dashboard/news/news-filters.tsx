import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
const user = {
  name: 'Sofia Rivers',
  avatar: '/assets/avatar.png',
  jobTitle: 'Senior Developer',
  country: 'USA',
  city: 'Los Angeles',
  timezone: 'GTM-7',
} as const;

export function NewsFilters(): React.JSX.Element {
  return (
   <Card>
      <CardHeader title="News Filters" />
      <Divider />
      <CardContent>
        <Stack spacing={2} sx={{ maxWidth: 'sm' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={user.avatar} alt={user.name} />
            <Typography variant="h6">{user.name}</Typography>
          </Stack>
          <Typography variant="body2">Job Title: {user.jobTitle}</Typography>
          <Typography variant="body2">Location: {user.city}, {user.country}</Typography>
          <Typography variant="body2">Timezone: {user.timezone}</Typography>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button variant="contained">Apply Filters</Button>
      </CardActions>
   </Card>
  );
}
